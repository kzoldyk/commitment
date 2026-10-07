import { describe, it, expect, beforeEach } from 'vitest';
import { getDb, schema } from '../server/db';
import { runMigrations } from '../server/db/migrate';
import { AuthService } from '../server/modules/auth/auth.service';
import { CommitmentService } from '../server/modules/commitments/commitment.service';

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
});
