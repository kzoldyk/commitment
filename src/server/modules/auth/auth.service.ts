import { eq, or, and, gt } from 'drizzle-orm';
import { DatabaseInstance, schema } from '../../db';
import { generateId, hashPassword, verifyPassword } from '../../shared/crypto';
import { nowUtc } from '../../shared/time';

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

export class AuthService {
  async register(
    db: DatabaseInstance,
    data: { username: string; email: string; password: string; displayName?: string; timezone?: string }
  ) {
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanEmail = data.email.trim().toLowerCase();

    if (!cleanUsername || cleanUsername.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    if (!cleanEmail.includes('@')) {
      throw new Error('Invalid email address');
    }
    if (!data.password || data.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Check existing user
    const existing = await db
      .select()
      .from(schema.users)
      .where(or(eq(schema.users.username, cleanUsername), eq(schema.users.email, cleanEmail)));

    if (existing.length > 0) {
      const match = existing.find((u: typeof schema.users.$inferSelect) => u.email === cleanEmail);
      if (match && match.status === 'INVITED') {
        if (existing.some((u: typeof schema.users.$inferSelect) => u.username === cleanUsername && u.id !== match.id)) {
          throw new Error('Username is already taken. Please choose another username.');
        }

        // Claim the invited account!
        const passwordHash = await hashPassword(data.password);
        const now = nowUtc();
        await db
          .update(schema.users)
          .set({
            username: cleanUsername,
            displayName: data.displayName?.trim() || cleanUsername,
            passwordHash,
            timezone: data.timezone || match.timezone || 'UTC',
            status: 'ACTIVE',
            updatedAt: now,
            lastLoginAt: now,
          })
          .where(eq(schema.users.id, match.id));

        const sessionId = generateId();
        const expiresAt = now + SESSION_TTL_SECONDS;
        await db.insert(schema.sessions).values({
          id: sessionId,
          userId: match.id,
          expiresAt,
          createdAt: now,
        });

        const [claimedUser] = await db.select().from(schema.users).where(eq(schema.users.id, match.id));
        return {
          user: this.sanitizeUser(claimedUser),
          session: { id: sessionId, userId: match.id, expiresAt, createdAt: now },
        };
      }

      if (existing.some((u: typeof schema.users.$inferSelect) => u.username === cleanUsername)) {
        throw new Error('Username is already taken');
      }
      throw new Error('Email is already registered');
    }

    const userId = generateId();
    const passwordHash = await hashPassword(data.password);
    const now = nowUtc();

    await db.insert(schema.users).values({
      id: userId,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      displayName: data.displayName?.trim() || cleanUsername,
      timezone: data.timezone || 'UTC',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    });

    // Create default notification preferences
    await db.insert(schema.notificationPreferences).values({
      id: generateId(),
      userId,
      remindersEnabled: true,
      missedAlertsEnabled: true,
      restorationAlertsEnabled: true,
      invitationAlertsEnabled: true,
      createdAt: now,
      updatedAt: now,
    });

    const session = await this.createSession(db, userId);
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId));
    return { user: this.sanitizeUser(user), session };
  }

  async login(db: DatabaseInstance, data: { username: string; password: string }) {
    const cleanUsername = data.username.trim().toLowerCase();
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, cleanUsername));

    if (!user) {
      throw new Error('Invalid username or password');
    }

    const isValid = await verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid username or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('Account is suspended or deactivated');
    }

    await db
      .update(schema.users)
      .set({ lastLoginAt: nowUtc() })
      .where(eq(schema.users.id, user.id));

    const session = await this.createSession(db, user.id);
    return { user: this.sanitizeUser(user), session };
  }

  async createSession(db: DatabaseInstance, userId: string) {
    const sessionId = generateId();
    const now = nowUtc();
    const expiresAt = now + SESSION_TTL_SECONDS;

    await db.insert(schema.sessions).values({
      id: sessionId,
      userId,
      expiresAt,
      createdAt: now,
    });

    return { id: sessionId, expiresAt };
  }

  async validateSession(db: DatabaseInstance, sessionId: string) {
    const now = nowUtc();
    const [session] = await db
      .select()
      .from(schema.sessions)
      .where(and(eq(schema.sessions.id, sessionId), gt(schema.sessions.expiresAt, now)));

    if (!session) {
      return null;
    }

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, session.userId));

    if (!user || user.status !== 'ACTIVE') {
      return null;
    }

    return this.sanitizeUser(user);
  }

  async logout(db: DatabaseInstance, sessionId: string) {
    await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
  }

  private sanitizeUser(user: typeof schema.users.$inferSelect) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
