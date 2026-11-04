import { describe, it, expect, beforeEach } from 'vitest';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '../server/db';
import { runMigrations } from '../server/db/migrate';
import { AuthService } from '../server/modules/auth/auth.service';
import { CommitmentService } from '../server/modules/commitments/commitment.service';
import { UserService } from '../server/modules/users/user.service';
import { timingSafeEqual } from '../server/shared/crypto';
import { app } from '../server/index';

describe('Auth, Security & Authorization Guardrails', () => {
  let db: any;
  let authService: AuthService;
  let commitmentService: CommitmentService;

  beforeEach(() => {
    process.env.DATABASE_URL = './test.db';
    db = getDb(undefined, true);
    runMigrations();

    db.delete(schema.auditLogs).run();
    db.delete(schema.notificationEvents).run();
    db.delete(schema.notificationPreferences).run();
    db.delete(schema.proofs).run();
    db.delete(schema.lifeTransactions).run();
    db.delete(schema.commitmentDays).run();
    db.delete(schema.commitmentRules).run();
    db.delete(schema.commitments).run();
    db.delete(schema.sessions).run();
    db.delete(schema.passwordResetTokens).run();
    db.delete(schema.users).run();

    authService = new AuthService();
    commitmentService = new CommitmentService();
  });

  it('should prevent self-assignment and self-approval of accountability contracts', async () => {
    const { user: userA } = await authService.register(db, {
      username: 'ron',
      email: 'ron@test.com',
      password: 'password123',
    });

    // Attempt to create commitment with self as partner
    await expect(
      commitmentService.create(db, {
        creatorId: userA.id,
        partnerUsername: 'ron',
        title: 'Do not allow self-partnership',
        startDate: '2026-10-01',
        endDate: '2026-10-30',
        targetValue: 1,
        targetUnit: 'task',
      })
    ).rejects.toThrow('You cannot assign yourself as the accountability partner');
  });

  it('should deny unauthorized third-party users from accessing or modifying commitments', async () => {
    const { user: creator } = await authService.register(db, {
      username: 'creator_user',
      email: 'creator@test.com',
      password: 'password123',
    });

    const { user: partner } = await authService.register(db, {
      username: 'partner_user',
      email: 'partner@test.com',
      password: 'password123',
    });

    const { user: intruder } = await authService.register(db, {
      username: 'intruder_user',
      email: 'intruder@test.com',
      password: 'password123',
    });

    const contract = await commitmentService.create(db, {
      creatorId: creator.id,
      partnerUsername: 'partner_user',
      title: 'Secret contract',
      startDate: '2026-10-01',
      endDate: '2026-10-30',
      targetValue: 1,
      targetUnit: 'hour',
    });

    // Intruder attempts to view
    await expect(
      commitmentService.getById(db, contract.id, intruder.id)
    ).rejects.toThrow('Unauthorized to view this commitment');

    // Creator attempts to accept their own contract (must be partner)
    await expect(
      commitmentService.accept(db, contract.id, creator.id)
    ).rejects.toThrow('Only the assigned accountability partner can accept this commitment');

    // Partner accepts successfully
    const accepted = await commitmentService.accept(db, contract.id, partner.id);
    expect(accepted.status).toBe('ACTIVE');

    // Partner or intruder attempts to submit proof (only creator can submit proof)
    await expect(
      commitmentService.submitProof(db, {
        commitmentId: contract.id,
        dayId: accepted.days[0].id,
        userId: partner.id,
        value: 1,
      })
    ).rejects.toThrow('Only the commitment creator can submit proof for their commitment');
  });

  it('should allow assigning an unregistered partner by email and link account on registration', async () => {
    const { user: creator } = await authService.register(db, {
      username: 'hitesh',
      email: 'hitesh@test.com',
      password: 'password123',
    });

    // Create commitment with unregistered email
    const contract = await commitmentService.create(db, {
      creatorId: creator.id,
      partnerUsername: 'unregistered_friend@example.com',
      title: 'Read 20 pages every day',
      startDate: '2026-10-01',
      endDate: '2026-10-30',
      targetValue: 20,
      targetUnit: 'pages',
    });

    expect(contract.status).toBe('PENDING_ACCEPTANCE');
    expect(contract.partner.email).toBe('unregistered_friend@example.com');

    // Unregistered partner signs up with that email
    const { user: newPartner } = await authService.register(db, {
      username: 'friend_account',
      email: 'unregistered_friend@example.com',
      password: 'password123',
      displayName: 'My Friend',
    });

    expect(newPartner.email).toBe('unregistered_friend@example.com');
    expect(newPartner.username).toBe('friend_account');

    // The new partner can now accept the pending contract
    const accepted = await commitmentService.accept(db, contract.id, newPartner.id);
    expect(accepted.status).toBe('ACTIVE');
    expect(accepted.partner.username).toBe('friend_account');

    // Calling accept again should be idempotent and return the active commitment without error
    const reaccepted = await commitmentService.accept(db, contract.id, newPartner.id);
    expect(reaccepted.status).toBe('ACTIVE');
    expect(reaccepted.id).toBe(contract.id);
  });

  it('should prevent invited account from claiming a username that is already taken by another active user', async () => {
    // 1. Existing user
    await authService.register(db, {
      username: 'taken_username',
      email: 'taken@test.com',
      password: 'password123',
    });

    const { user: creator } = await authService.register(db, {
      username: 'creator_user',
      email: 'creator@test.com',
      password: 'password123',
    });

    // 2. Invite user by email
    await commitmentService.create(db, {
      creatorId: creator.id,
      partnerUsername: 'invited_partner@example.com',
      title: 'Fitness habit',
      startDate: '2099-01-01',
      endDate: '2099-01-30',
      targetValue: 1,
      targetUnit: 'session',
    });

    // 3. Invited partner tries to register using the already taken username
    await expect(
      authService.register(db, {
        username: 'taken_username',
        email: 'invited_partner@example.com',
        password: 'password123',
      })
    ).rejects.toThrow('Username is already taken');
  });

  it('should allow authenticating with either username or email address', async () => {
    const { user } = await authService.register(db, {
      username: 'multi_login_user',
      email: 'multi_login@example.com',
      password: 'password123',
    });

    // 1. Login with username
    const loginByUsername = await authService.login(db, {
      username: 'multi_login_user',
      password: 'password123',
    });
    expect(loginByUsername.user.id).toBe(user.id);
    expect(loginByUsername.session.id).toBeDefined();

    // 2. Login with email
    const loginByEmail = await authService.login(db, {
      username: 'multi_login@example.com',
      password: 'password123',
    });
    expect(loginByEmail.user.id).toBe(user.id);
    expect(loginByEmail.session.id).toBeDefined();

    // 3. Login with case-insensitive email
    const loginByUpperEmail = await authService.login(db, {
      username: 'MULTI_LOGIN@EXAMPLE.COM',
      password: 'password123',
    });
    expect(loginByUpperEmail.user.id).toBe(user.id);
  });

  describe('Password Reset & Recovery Flow', () => {
    it('should generate a secure reset token and send reset instructions', async () => {
      const { user } = await authService.register(db, {
        username: 'reset_tester',
        email: 'reset_tester@test.com',
        password: 'old_password_123',
      });

      const res = await authService.requestPasswordReset(db, 'reset_tester@test.com');
      expect(res.success).toBe(true);
      expect(res.devResetUrl).toBeDefined();

      const tokens = await db.select().from(schema.passwordResetTokens);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].userId).toBe(user.id);
      expect(tokens[0].token.length).toBeGreaterThanOrEqual(32);
      expect(tokens[0].usedAt).toBeNull();
      expect(tokens[0].expiresAt).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it('should not leak account existence when requesting reset for non-existent email', async () => {
      const res = await authService.requestPasswordReset(db, 'ghost_user@test.com');
      expect(res.success).toBe(true);
      expect(res.message).toContain('If an account exists');

      const tokens = await db.select().from(schema.passwordResetTokens);
      expect(tokens).toHaveLength(0);
    });

    it('should accurately verify valid tokens and reject invalid or expired tokens', async () => {
      await authService.register(db, {
        username: 'verify_tester',
        email: 'verify_tester@test.com',
        password: 'password123',
      });

      const { devResetUrl } = await authService.requestPasswordReset(db, 'verify_tester@test.com');
      const token = new URL(devResetUrl!).searchParams.get('token')!;

      // 1. Valid token
      const validCheck = await authService.verifyResetToken(db, token);
      expect(validCheck.valid).toBe(true);
      expect(validCheck.email).toBe('verify_tester@test.com');

      // 2. Bogus token
      const bogusCheck = await authService.verifyResetToken(db, 'completely-invalid-token');
      expect(bogusCheck.valid).toBe(false);

      // 3. Expired token
      await db
        .update(schema.passwordResetTokens)
        .set({ expiresAt: Math.floor(Date.now() / 1000) - 100 })
        .where(eq(schema.passwordResetTokens.token, token));

      const expiredCheck = await authService.verifyResetToken(db, token);
      expect(expiredCheck.valid).toBe(false);
      expect(expiredCheck.message).toContain('expired');
    });

    it('should reset password, invalidate old sessions, and allow login with new password', async () => {
      const { user, session: oldSession } = await authService.register(db, {
        username: 'alice_reset',
        email: 'alice@test.com',
        password: 'initial_password_123',
      });

      // Verify old session is active
      const validOldSession = await authService.validateSession(db, oldSession.id);
      expect(validOldSession).not.toBeNull();

      // Request reset
      const { devResetUrl } = await authService.requestPasswordReset(db, 'alice@test.com');
      const token = new URL(devResetUrl!).searchParams.get('token')!;

      // Reset password
      const resetResult = await authService.resetPassword(db, token, 'brand_new_secret_password_123');
      expect(resetResult.success).toBe(true);

      // Old session must be purged/invalidated
      const invalidatedSession = await authService.validateSession(db, oldSession.id);
      expect(invalidatedSession).toBeNull();

      // Login with old password must fail
      await expect(
        authService.login(db, { username: 'alice_reset', password: 'initial_password_123' })
      ).rejects.toThrow('Invalid username or password');

      // Login with new password must succeed
      const newLogin = await authService.login(db, { username: 'alice_reset', password: 'brand_new_secret_password_123' });
      expect(newLogin.user.id).toBe(user.id);
      expect(newLogin.session.id).toBeDefined();

      // Attempting to reuse the same reset token must fail
      await expect(
        authService.resetPassword(db, token, 'another_password_123')
      ).rejects.toThrow();
    });
  });

  describe('Security Hardening & Breach Protection', () => {
    let userService: UserService;

    beforeEach(() => {
      userService = new UserService();
    });

    it('should perform timing-safe string comparisons without early exit leaks', () => {
      expect(timingSafeEqual('exactmatch', 'exactmatch')).toBe(true);
      expect(timingSafeEqual('exactmatch', 'exactmztch')).toBe(false);
      expect(timingSafeEqual('short', 'longerstring')).toBe(false);
      expect(timingSafeEqual('', '')).toBe(true);
      expect(timingSafeEqual('token_a', 'token_b')).toBe(false);
    });

    it('should reject malicious or invalid usernames during registration', async () => {
      // 1. Script tag injection
      await expect(
        authService.register(db, {
          username: '<script>alert(1)</script>',
          email: 'valid1@test.com',
          password: 'password123',
        })
      ).rejects.toThrow('Username must be between 3 and 30 characters and contain only letters, numbers, underscores, or hyphens');

      // 2. Spaces or path traversal
      await expect(
        authService.register(db, {
          username: '../admin',
          email: 'valid2@test.com',
          password: 'password123',
        })
      ).rejects.toThrow();

      // 3. Too short
      await expect(
        authService.register(db, {
          username: 'ab',
          email: 'valid3@test.com',
          password: 'password123',
        })
      ).rejects.toThrow();
    });

    it('should reject invalid email formats during registration and reset', async () => {
      await expect(
        authService.register(db, {
          username: 'validuser',
          email: 'not-an-email',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid email address');

      await expect(
        authService.requestPasswordReset(db, 'bad@email')
      ).rejects.toThrow('Please provide a valid email address');
    });

    it('should reject passwords exceeding maximum bounds to prevent PBKDF2 DoS', async () => {
      const hugePassword = 'a'.repeat(200);
      await expect(
        authService.register(db, {
          username: 'dos_target',
          email: 'dos@test.com',
          password: hugePassword,
        })
      ).rejects.toThrow('Password must not exceed 128 characters');
    });

    it('should protect user privacy by omitting email addresses in partner search', async () => {
      const { user: userA } = await authService.register(db, {
        username: 'searchable_a',
        email: 'secret_a@private.com',
        displayName: 'Alice Secret',
        password: 'password123',
      });

      const { user: userB } = await authService.register(db, {
        username: 'searchable_b',
        email: 'secret_b@private.com',
        displayName: 'Bob Private',
        password: 'password123',
      });

      const results = await userService.searchPartners(db, 'searchable', userA.id);
      expect(results).toHaveLength(1);
      expect(results[0].username).toBe('searchable_b');
      expect(results[0].displayName).toBe('Bob Private');
      // Critical check: email MUST NOT be exposed in search results
      expect((results[0] as any).email).toBeUndefined();
    });

    it('should reject non-positive or invalid proof values', async () => {
      const { user: creator } = await authService.register(db, {
        username: 'proof_creator',
        email: 'proof_creator@test.com',
        password: 'password123',
      });

      const contract = await commitmentService.create(db, {
        creatorId: creator.id,
        partnerUsername: 'test_partner@test.com',
        title: 'Daily pushups',
        startDate: '2026-10-01',
        endDate: '2026-10-30',
        targetValue: 50,
        targetUnit: 'pushups',
      });

      await expect(
        commitmentService.submitProof(db, {
          commitmentId: contract.id,
          dayId: 'some-day-id',
          userId: creator.id,
          value: -10, // Negative value
        })
      ).rejects.toThrow('Proof value must be a positive number');

      await expect(
        commitmentService.submitProof(db, {
          commitmentId: contract.id,
          dayId: 'some-day-id',
          userId: creator.id,
          value: NaN,
        })
      ).rejects.toThrow('Proof value must be a positive number');
    });

    it('should return security headers on API responses', async () => {
      const res = await app.request('/api/auth/me');
      expect(res.headers.get('x-content-type-options')).toBe('nosniff');
      expect(res.headers.get('x-frame-options')).toBe('SAMEORIGIN');
    });

    it('should prevent unauthorized execution of scheduled cron evaluation in production', async () => {
      // With CRON_SECRET configured
      const envWithSecret = { CRON_SECRET: 'super-secret-cron-key-123' };
      const resWithoutAuth = await app.request('/api/cron/evaluate', {
        method: 'POST',
      }, envWithSecret);
      expect(resWithoutAuth.status).toBe(401);

      const resWithWrongAuth = await app.request('/api/cron/evaluate', {
        method: 'POST',
        headers: { Authorization: 'Bearer wrong-key' },
      }, envWithSecret);
      expect(resWithWrongAuth.status).toBe(401);

      const resWithValidAuth = await app.request('/api/cron/evaluate', {
        method: 'POST',
        headers: { Authorization: 'Bearer super-secret-cron-key-123' },
      }, envWithSecret);
      expect(resWithValidAuth.status).toBe(200);
    });

    it('should reject unauthenticated calls to test-email endpoint', async () => {
      const res = await app.request('/api/notifications/test-email', {
        method: 'POST',
      });
      expect(res.status).toBe(401);
    });
  });
});
