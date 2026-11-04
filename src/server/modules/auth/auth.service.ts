import { eq, or, and, gt, isNull } from 'drizzle-orm';
import { DatabaseInstance, schema } from '../../db';
import { generateId, generateSecureToken, hashPassword, verifyPassword } from '../../shared/crypto';
import { nowUtc } from '../../shared/time';
import { EmailService } from '../notifications/email.service';

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export class AuthService {
  async register(
    db: DatabaseInstance,
    data: { username: string; email: string; password: string; displayName?: string; timezone?: string }
  ) {
    const cleanUsername = (data.username || '').trim().toLowerCase();
    const cleanEmail = (data.email || '').trim().toLowerCase();

    if (!cleanUsername || !USERNAME_REGEX.test(cleanUsername)) {
      throw new Error('Username must be between 3 and 30 characters and contain only letters, numbers, underscores, or hyphens');
    }
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 254) {
      throw new Error('Invalid email address');
    }
    if (!data.password || data.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    if (data.password.length > 128) {
      throw new Error('Password must not exceed 128 characters');
    }

    const cleanDisplayName = (data.displayName?.trim() || cleanUsername).slice(0, 50);

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
            displayName: cleanDisplayName,
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
      displayName: cleanDisplayName,
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
    if (!data.username || !data.password || data.password.length > 128) {
      throw new Error('Invalid username or password');
    }

    const cleanUsername = data.username.trim().toLowerCase();
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, cleanUsername));

    if (!user) {
      throw new Error('Invalid username or password');
    }

    // Fail early on non-active accounts to prevent DoS via expensive PBKDF2 iterations
    if (user.status !== 'ACTIVE') {
      throw new Error('Account is suspended or deactivated');
    }

    const isValid = await verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid username or password');
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

  async requestPasswordReset(
    db: DatabaseInstance,
    email: string,
    originUrl?: string,
    env?: any
  ): Promise<{ success: boolean; message: string; devResetUrl?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 254) {
      throw new Error('Please provide a valid email address');
    }

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, cleanEmail));

    // To prevent user enumeration attacks, return identical generic response if user not found or not ACTIVE
    if (!user || user.status !== 'ACTIVE') {
      return {
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      };
    }

    // Invalidate existing unused reset tokens for this user
    await db
      .update(schema.passwordResetTokens)
      .set({ usedAt: nowUtc() })
      .where(and(eq(schema.passwordResetTokens.userId, user.id), isNull(schema.passwordResetTokens.usedAt)));

    const token = generateSecureToken();
    const now = nowUtc();
    const expiresAt = now + 3600; // 1 hour expiration

    await db.insert(schema.passwordResetTokens).values({
      id: generateId(),
      userId: user.id,
      token,
      expiresAt,
      createdAt: now,
    });

    const baseUrl = originUrl || (env?.ENVIRONMENT === 'production' ? 'https://commitment.kzoldyk.workers.dev' : 'http://localhost:5173');
    const resetUrl = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;

    const emailService = new EmailService(env);
    await emailService.sendEmail({
      to: user.email,
      subject: 'Reset your Commitment password',
      text: `Hi ${user.displayName || user.username},\n\nA password reset was requested for your Commitment account.\n\nClick the link below to set a new password:\n${resetUrl}\n\nThis link will expire in 1 hour. If you did not make this request, you can safely ignore this email.\n\nCommitment Security`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="background-color: #e11d48; width: 32px; height: 32px; border-radius: 8px; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; text-align: center; line-height: 32px;">C</div>
            <span style="margin-left: 10px; font-weight: 700; font-size: 16px; color: #0f172a; letter-spacing: -0.5px;">Commitment</span>
          </div>
          <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin-top: 0; letter-spacing: -0.5px;">Password Reset Request</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Hi <strong>${user.displayName || user.username}</strong>,<br/>
            We received a request to reset the password for your Commitment account. Click the button below to choose a new password:
          </p>
          <div style="margin: 28px 0; text-align: center;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
              Reset Password →
            </a>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
            This password reset link will expire in <strong>60 minutes</strong>. If you did not request a password reset, no action is required and your account remains secure.
          </p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; word-break: break-all;">
            If the button above does not work, paste this URL into your browser:<br/>
            <a href="${resetUrl}" style="color: #64748b;">${resetUrl}</a>
          </p>
        </div>
      `,
    });

    const isNonProd = process.env.NODE_ENV !== 'production' || (env && env.ENVIRONMENT !== 'production');
    return {
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
      devResetUrl: isNonProd ? resetUrl : undefined,
    };
  }

  async verifyResetToken(
    db: DatabaseInstance,
    token: string
  ): Promise<{ valid: boolean; email?: string; message?: string }> {
    if (!token || typeof token !== 'string') {
      return { valid: false, message: 'Password reset token is required' };
    }

    const cleanToken = token.trim();
    const [record] = await db
      .select()
      .from(schema.passwordResetTokens)
      .where(eq(schema.passwordResetTokens.token, cleanToken));

    if (!record) {
      return { valid: false, message: 'Invalid reset link. Please request a new password reset.' };
    }

    if (record.usedAt) {
      return { valid: false, message: 'This reset link has already been used. Please request a new one.' };
    }

    if (record.expiresAt <= nowUtc()) {
      return { valid: false, message: 'This reset link has expired. Please request a new one.' };
    }

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, record.userId));

    if (!user || user.status !== 'ACTIVE') {
      return { valid: false, message: 'The associated user account is inactive or not found.' };
    }

    return { valid: true, email: user.email };
  }

  async resetPassword(
    db: DatabaseInstance,
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    if (newPassword.length > 128) {
      throw new Error('Password must not exceed 128 characters');
    }

    const verification = await this.verifyResetToken(db, token);
    if (!verification.valid) {
      throw new Error(verification.message || 'Invalid or expired reset token');
    }

    const cleanToken = token.trim();
    const [record] = await db
      .select()
      .from(schema.passwordResetTokens)
      .where(eq(schema.passwordResetTokens.token, cleanToken));

    const now = nowUtc();
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await db
      .update(schema.users)
      .set({
        passwordHash,
        updatedAt: now,
      })
      .where(eq(schema.users.id, record.userId));

    // Mark token as used
    await db
      .update(schema.passwordResetTokens)
      .set({ usedAt: now })
      .where(eq(schema.passwordResetTokens.id, record.id));

    // Invalidate any other outstanding tokens for this user
    await db
      .update(schema.passwordResetTokens)
      .set({ usedAt: now })
      .where(and(eq(schema.passwordResetTokens.userId, record.userId), isNull(schema.passwordResetTokens.usedAt)));

    // Invalidate all existing sessions for this user for security
    await db
      .delete(schema.sessions)
      .where(eq(schema.sessions.userId, record.userId));

    return { success: true, message: 'Your password has been reset successfully. You can now log in.' };
  }

  private sanitizeUser(user: typeof schema.users.$inferSelect) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
