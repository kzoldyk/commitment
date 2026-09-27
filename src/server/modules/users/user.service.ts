import { like, eq, and, ne, or } from 'drizzle-orm';
import { DatabaseInstance, schema } from '../../db';
import { nowUtc } from '../../shared/time';

export class UserService {
  async searchPartners(db: DatabaseInstance, query: string, currentUserId: string) {
    if (!query || query.trim().length < 2) return [];

    const cleanQuery = `%${query.trim().toLowerCase()}%`;
    const matchedUsers = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        email: schema.users.email,
        displayName: schema.users.displayName,
      })
      .from(schema.users)
      .where(
        and(
          ne(schema.users.id, currentUserId),
          eq(schema.users.status, 'ACTIVE'),
          or(
            like(schema.users.username, cleanQuery),
            like(schema.users.email, cleanQuery)
          )
        )
      )
      .limit(10);

    return matchedUsers;
  }

  async getPreferences(db: DatabaseInstance, userId: string) {
    const [prefs] = await db
      .select()
      .from(schema.notificationPreferences)
      .where(eq(schema.notificationPreferences.userId, userId));

    return prefs || null;
  }

  async updatePreferences(
    db: DatabaseInstance,
    userId: string,
    data: {
      remindersEnabled?: boolean;
      missedAlertsEnabled?: boolean;
      restorationAlertsEnabled?: boolean;
      invitationAlertsEnabled?: boolean;
    }
  ) {
    const now = nowUtc();
    await db
      .update(schema.notificationPreferences)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(eq(schema.notificationPreferences.userId, userId));

    return this.getPreferences(db, userId);
  }

  async updateProfile(db: DatabaseInstance, userId: string, data: { displayName?: string; timezone?: string }) {
    const now = nowUtc();
    await db
      .update(schema.users)
      .set({
        ...(data.displayName ? { displayName: data.displayName.trim() } : {}),
        ...(data.timezone ? { timezone: data.timezone } : {}),
        updatedAt: now,
      })
      .where(eq(schema.users.id, userId));

    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId));
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
