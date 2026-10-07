import { describe, it, expect, beforeEach } from 'vitest';
import { getDb, schema } from '../server/db';
import { runMigrations } from '../server/db/migrate';
import { AuthService } from '../server/modules/auth/auth.service';
import { CommitmentService } from '../server/modules/commitments/commitment.service';
import { EvaluationService } from '../server/modules/evaluation/evaluation.service';
import { eq } from 'drizzle-orm';
import { nowUtc } from '../server/shared/time';

describe('Commitment Engine & Rule Evaluation', () => {
  let db: any;
  let authService: AuthService;
  let commitmentService: CommitmentService;
  let evaluationService: EvaluationService;

  beforeEach(() => {
    process.env.DATABASE_URL = './test.db';
    db = getDb(undefined, true);
    runMigrations();

    // Clean tables before each test
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
    evaluationService = new EvaluationService();
  });

  it('should enforce the critical business rule for lives, streaks, and restoration capping', async () => {
    // 1. Register two test users
    const { user: userA } = await authService.register(db, {
      username: 'alice',
      email: 'alice@test.com',
      password: 'password123',
      displayName: 'Alice',
      timezone: 'UTC',
    });

    const { user: userB } = await authService.register(db, {
      username: 'bob',
      email: 'bob@test.com',
      password: 'password123',
      displayName: 'Bob',
      timezone: 'UTC',
    });

    // 2. Alice creates a 30-day future commitment for Bob with max 3 lives, restore after 5 days
    const created = await commitmentService.create(db, {
      creatorId: userA.id,
      partnerUsername: 'bob',
      title: 'Solve 2 LeetCode problems every day',
      startDate: '2099-10-01',
      endDate: '2099-10-30',
      timezone: 'UTC',
      targetValue: 2,
      targetUnit: 'problems',
      initialLives: 3,
      maxLives: 3,
      failureLives: 1,
      restoreEnabled: true,
      restoreAfterSuccessDays: 5,
      restoreLives: 1,
    });

    expect(created.status).toBe('PENDING_ACCEPTANCE');

    // 3. Bob accepts the contract
    const accepted = await commitmentService.accept(db, created.id, userB.id);
    expect(accepted.status).toBe('ACTIVE');
    expect(accepted.currentLives).toBe(3);
    expect(accepted.currentStreak).toBe(0);

    // Fetch generated days
    const days = await db
      .select()
      .from(schema.commitmentDays)
      .where(eq(schema.commitmentDays.commitmentId, created.id))
      .orderBy(schema.commitmentDays.periodStart);

    expect(days.length).toBe(30);

    // --- SIMULATE DAYS 1 to 4 SUCCESS ---
    for (let i = 0; i < 4; i++) {
      await db
        .update(schema.commitmentDays)
        .set({ periodStart: nowUtc() - 1000, evaluationAt: nowUtc() - 100 })
        .where(eq(schema.commitmentDays.id, days[i].id));

      await commitmentService.submitProof(db, {
        commitmentId: created.id,
        dayId: days[i].id,
        userId: userA.id,
        value: 2,
      });
    }

    let evalResult = await evaluationService.runEvaluation(db);
    expect(evalResult.evaluatedDays).toBe(4);
    expect(evalResult.successes).toBe(4);

    let state = await commitmentService.getById(db, created.id, userA.id);
    expect(state.currentStreak).toBe(4);
    expect(state.currentLives).toBe(3);

    // --- DAY 5 SUCCESS (Streak = 5, Lives = 3, capped at maxLives, no restoration beyond max) ---
    await db
      .update(schema.commitmentDays)
      .set({ periodStart: nowUtc() - 1000, evaluationAt: nowUtc() - 100 })
      .where(eq(schema.commitmentDays.id, days[4].id));

    await commitmentService.submitProof(db, {
      commitmentId: created.id,
      dayId: days[4].id,
      userId: userA.id,
      value: 2,
    });

    evalResult = await evaluationService.runEvaluation(db);
    expect(evalResult.successes).toBe(1);
    expect(evalResult.restorations).toBe(0); // Not restored because already max

    state = await commitmentService.getById(db, created.id, userA.id);
    expect(state.currentStreak).toBe(5);
    expect(state.currentLives).toBe(3);

    // --- DAY 6 FAIL (No proof submitted -> Lives = 2, Streak resets to 0) ---
    await db
      .update(schema.commitmentDays)
      .set({ periodStart: nowUtc() - 1000, evaluationAt: nowUtc() - 100 })
      .where(eq(schema.commitmentDays.id, days[5].id));

    evalResult = await evaluationService.runEvaluation(db);
    expect(evalResult.failures).toBe(1);

    state = await commitmentService.getById(db, created.id, userA.id);
    expect(state.currentStreak).toBe(0);
    expect(state.currentLives).toBe(2);

    // --- DAYS 7, 8, 9, 10, 11 SUCCESS (5 consecutive days -> Streak reaches 5, Life restores to 3) ---
    for (let i = 6; i <= 10; i++) {
      await db
        .update(schema.commitmentDays)
        .set({ periodStart: nowUtc() - 1000, evaluationAt: nowUtc() - 100 })
        .where(eq(schema.commitmentDays.id, days[i].id));

      await commitmentService.submitProof(db, {
        commitmentId: created.id,
        dayId: days[i].id,
        userId: userA.id,
        value: 2,
      });
    }

    evalResult = await evaluationService.runEvaluation(db);
    expect(evalResult.successes).toBe(5);
    expect(evalResult.restorations).toBe(1); // Restored on 5th consecutive day!

    state = await commitmentService.getById(db, created.id, userA.id);
    expect(state.currentStreak).toBe(5);
    expect(state.currentLives).toBe(3); // Successfully restored to 3!

    // Verify life transactions audit trail
    const transactions = state.transactions;
    expect(transactions.length).toBe(3); // INITIAL (+3), FAILURE (-1), RESTORE (+1)
    expect(transactions.some((t: any) => t.type === 'INITIAL' && t.amount === 3)).toBe(true);
    expect(transactions.some((t: any) => t.type === 'FAILURE' && t.amount === -1)).toBe(true);
    expect(transactions.some((t: any) => t.type === 'RESTORE' && t.amount === 1)).toBe(true);
  });

  it('should handle multiple failures down to 0 lives and terminate commitment with FAILED status', async () => {
    const { user: userA } = await authService.register(db, {
      username: 'sam',
      email: 'sam@test.com',
      password: 'password123',
    });
    const { user: userB } = await authService.register(db, {
      username: 'dan',
      email: 'dan@test.com',
      password: 'password123',
    });

    const created = await commitmentService.create(db, {
      creatorId: userA.id,
      partnerUsername: 'dan',
      title: 'Run 5 km every day',
      startDate: '2099-01-01',
      endDate: '2099-01-05',
      targetValue: 5,
      targetUnit: 'km',
      initialLives: 2,
      maxLives: 2,
      failureLives: 1,
    });

    await commitmentService.accept(db, created.id, userB.id);

    const days = await db
      .select()
      .from(schema.commitmentDays)
      .where(eq(schema.commitmentDays.commitmentId, created.id))
      .orderBy(schema.commitmentDays.periodStart);

    // Fail Day 1: lives 2 -> 1
    await db.update(schema.commitmentDays).set({ evaluationAt: nowUtc() - 100 }).where(eq(schema.commitmentDays.id, days[0].id));
    await evaluationService.runEvaluation(db);
    let state = await commitmentService.getById(db, created.id, userA.id);
    expect(state.currentLives).toBe(1);
    expect(state.status).toBe('ACTIVE');

    // Fail Day 2: lives 1 -> 0 -> FAILED
    await db.update(schema.commitmentDays).set({ evaluationAt: nowUtc() - 100 }).where(eq(schema.commitmentDays.id, days[1].id));
    await evaluationService.runEvaluation(db);
    state = await commitmentService.getById(db, created.id, userA.id);
    expect(state.currentLives).toBe(0);
    expect(state.status).toBe('FAILED');
    expect(state.failedAt).toBeDefined();

    // Idempotency: running evaluation again changes nothing
    const dupResult = await evaluationService.runEvaluation(db);
    expect(dupResult.evaluatedDays).toBe(0);
  });

  it('should accumulate financial penalty debt counter whenever lives are lost on missed cutoff', async () => {
    // 1. Register test users
    const { user: debtor } = await authService.register(db, {
      username: 'debtor_user',
      email: 'debtor@test.com',
      password: 'password123',
    });
    const { user: creditor } = await authService.register(db, {
      username: 'creditor_partner',
      email: 'creditor@test.com',
      password: 'password123',
    });

    // 2. Create commitment with ₹500 stake per life lost
    const created = await commitmentService.create(db, {
      creatorId: debtor.id,
      partnerUsername: 'creditor_partner',
      title: 'Daily 1 Hour Deep Work',
      startDate: '2099-01-01',
      endDate: '2099-01-05',
      targetValue: 1,
      targetUnit: 'hour',
      initialLives: 3,
      maxLives: 3,
      failureLives: 1,
      stakeAmount: 500,
      stakeCurrency: 'INR',
    });

    await commitmentService.accept(db, created.id, creditor.id);

    let state = await commitmentService.getById(db, created.id, debtor.id);
    expect(state.accumulatedPenalty).toBe(0);
    expect(state.rule?.stakeAmount).toBe(500);
    expect(state.rule?.stakeCurrency).toBe('INR');

    const days = await db
      .select()
      .from(schema.commitmentDays)
      .where(eq(schema.commitmentDays.commitmentId, created.id))
      .orderBy(schema.commitmentDays.periodStart);

    // 3. First miss: Lose 1 life -> penalty debt counter increases to ₹500
    await db.update(schema.commitmentDays).set({ evaluationAt: nowUtc() - 100 }).where(eq(schema.commitmentDays.id, days[0].id));
    await evaluationService.runEvaluation(db);

    state = await commitmentService.getById(db, created.id, debtor.id);
    expect(state.currentLives).toBe(2);
    expect(state.accumulatedPenalty).toBe(500);

    // 4. Second miss: Lose 1 life -> penalty debt counter increases to ₹1000
    await db.update(schema.commitmentDays).set({ evaluationAt: nowUtc() - 100 }).where(eq(schema.commitmentDays.id, days[1].id));
    await evaluationService.runEvaluation(db);

    state = await commitmentService.getById(db, created.id, debtor.id);
    expect(state.currentLives).toBe(1);
    expect(state.accumulatedPenalty).toBe(1000);

    // Verify life transactions audit trail contains penalty record
    const failureTx = state.transactions.filter((t: any) => t.type === 'FAILURE');
    expect(failureTx.length).toBe(2);
    expect(failureTx[0].reason).toContain('INR 500 penalty owed');
  });

  it('should NOT send reminders or evaluate failures if contract starts in the future (tomorrow)', async () => {
    const { user: userA } = await authService.register(db, {
      username: 'future_creator',
      email: 'future@test.com',
      password: 'password123',
    });
    const { user: userB } = await authService.register(db, {
      username: 'future_partner',
      email: 'fpartner@test.com',
      password: 'password123',
    });

    // Contract starting far in future (e.g. 2099-01-01)
    const created = await commitmentService.create(db, {
      creatorId: userA.id,
      partnerUsername: 'future_partner',
      title: 'Future Promise',
      startDate: '2099-01-01',
      endDate: '2099-01-30',
      targetValue: 2,
      targetUnit: 'problems',
      initialLives: 3,
    });

    await commitmentService.accept(db, created.id, userB.id);

    // 1. Run evaluation - should evaluate 0 days
    const evalResult = await evaluationService.runEvaluation(db);
    expect(evalResult.evaluatedDays).toBe(0);
    expect(evalResult.failures).toBe(0);

    // 2. Run daily reminders - should NOT send reminders for future days
    const reminderResult = await evaluationService.runReminders(db);
    expect(reminderResult.sent).toBe(0);

    // 3. Submitting proof for future day must be rejected
    const days = await db
      .select()
      .from(schema.commitmentDays)
      .where(eq(schema.commitmentDays.commitmentId, created.id));

    await expect(
      commitmentService.submitProof(db, {
        commitmentId: created.id,
        dayId: days[0].id,
        userId: userA.id,
        value: 1,
      })
    ).rejects.toThrow('Proof cannot be submitted in advance for future dates');
  });
});
