import { eq, and, lte, gte, or, inArray, isNull, sql } from 'drizzle-orm';
import { DatabaseInstance, schema } from '../../db';
import { generateId } from '../../shared/crypto';
import { nowUtc } from '../../shared/time';
import { NotificationService, DispatchLog } from '../notifications/notification.service';

export interface EvaluationResult {
  evaluatedDays: number;
  successes: number;
  failures: number;
  restorations: number;
  completedCommitments: number;
  failedCommitments: number;
  dispatches: DispatchLog[];
}

export class EvaluationService {
  constructor(private notificationService: NotificationService = new NotificationService()) {}

  async runEvaluation(db: DatabaseInstance, env?: any): Promise<EvaluationResult> {
    const now = nowUtc();
    const result: EvaluationResult = {
      evaluatedDays: 0,
      successes: 0,
      failures: 0,
      restorations: 0,
      completedCommitments: 0,
      failedCommitments: 0,
      dispatches: [],
    };

    // Find all days ready for evaluation where evaluationAt <= now and evaluatedAt is null
    const pendingDays = await db
      .select()
      .from(schema.commitmentDays)
      .where(
        and(
          lte(schema.commitmentDays.evaluationAt, now),
          isNull(schema.commitmentDays.evaluatedAt)
        )
      )
      .orderBy(schema.commitmentDays.periodStart);

    for (const day of pendingDays) {
      const [commitment] = await db
        .select()
        .from(schema.commitments)
        .where(eq(schema.commitments.id, day.commitmentId));

      if (!commitment || commitment.status !== 'ACTIVE') {
        // Mark evaluated without life penalty if commitment is not active
        await db
          .update(schema.commitmentDays)
          .set({ evaluatedAt: now, updatedAt: now })
          .where(eq(schema.commitmentDays.id, day.id));
        continue;
      }

      const [rule] = await db
        .select()
        .from(schema.commitmentRules)
        .where(eq(schema.commitmentRules.commitmentId, commitment.id));

      if (!rule) continue;

      const [creator] = await db.select().from(schema.users).where(eq(schema.users.id, commitment.creatorId));
      const [partner] = await db.select().from(schema.users).where(eq(schema.users.id, commitment.partnerId));

      result.evaluatedDays++;

      const isSuccess = day.completedValue >= day.targetValue || day.status === 'COMPLETED';

      if (isSuccess) {
        // --- SUCCESS EVALUATION ---
        result.successes++;
        const newStreak = commitment.currentStreak + 1;
        const newLongestStreak = Math.max(commitment.longestStreak, newStreak);
        let newLives = commitment.currentLives;

        // Mark day completed
        await db
          .update(schema.commitmentDays)
          .set({
            status: 'COMPLETED',
            evaluatedAt: now,
            updatedAt: now,
          })
          .where(eq(schema.commitmentDays.id, day.id));

        // Check life restoration
        if (rule.restoreEnabled && newStreak >= rule.restoreAfterSuccessDays && commitment.currentLives < rule.maxLives) {
          const restoreAmount = Math.min(rule.maxLives - commitment.currentLives, rule.restoreLives);
          if (restoreAmount > 0) {
            newLives = commitment.currentLives + restoreAmount;
            result.restorations++;

            await db.insert(schema.lifeTransactions).values({
              id: generateId(),
              commitmentId: commitment.id,
              amount: restoreAmount,
              type: 'RESTORE',
              reason: `Streak restoration: ${newStreak} consecutive successful days reached threshold (${rule.restoreAfterSuccessDays} days)`,
              createdAt: now,
            });

            await this.notificationService.queueEvent(db, {
              userId: commitment.creatorId,
              commitmentId: commitment.id,
              type: 'LIFE_RESTORED',
              payload: {
                title: commitment.title,
                restoredAmount: restoreAmount,
                currentLives: newLives,
                maxLives: rule.maxLives,
                streak: newStreak,
              },
            });
          }
        }

        // Update commitment state
        await db
          .update(schema.commitments)
          .set({
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
            currentLives: newLives,
            updatedAt: now,
          })
          .where(eq(schema.commitments.id, commitment.id));

      } else {
        // --- FAILURE EVALUATION ---
        result.failures++;
        const livesLost = Math.min(commitment.currentLives, rule.failureLives);
        const newLives = Math.max(0, commitment.currentLives - rule.failureLives);
        const isTerminated = newLives <= 0;

        // Mark day MISSED
        await db
          .update(schema.commitmentDays)
          .set({
            status: 'MISSED',
            failureReason: `Target of ${day.targetValue} ${rule.targetUnit} was not met (completed: ${day.completedValue})`,
            evaluatedAt: now,
            updatedAt: now,
          })
          .where(eq(schema.commitmentDays.id, day.id));

        const penaltyIncrement = (rule.stakeAmount || 0) * livesLost;
        const newAccumulatedPenalty = ((commitment as any).accumulatedPenalty || 0) + penaltyIncrement;

        // Record life deduction transaction
        const penaltyNote = penaltyIncrement > 0 ? ` (+${rule.stakeCurrency || 'INR'} ${penaltyIncrement} penalty owed)` : '';
        await db.insert(schema.lifeTransactions).values({
          id: generateId(),
          commitmentId: commitment.id,
          amount: -livesLost,
          type: 'FAILURE',
          reason: `Missed commitment target for period ${day.periodKey}${penaltyNote}`,
          createdAt: now,
        });

        // Update commitment (reset streak and accumulate penalty counter)
        await db
          .update(schema.commitments)
          .set({
            currentStreak: 0,
            currentLives: newLives,
            accumulatedPenalty: newAccumulatedPenalty,
            status: isTerminated ? 'FAILED' : 'ACTIVE',
            failedAt: isTerminated ? now : null,
            updatedAt: now,
          })
          .where(eq(schema.commitments.id, commitment.id));

        // Audit log
        await db.insert(schema.auditLogs).values({
          id: generateId(),
          actorUserId: null,
          entityType: 'COMMITMENT',
          entityId: commitment.id,
          action: isTerminated ? 'COMMITMENT_FAILED' : 'LIFE_LOST',
          metadata: JSON.stringify({ livesLost, remainingLives: newLives, penaltyIncrement, totalPenaltyOwed: newAccumulatedPenalty, periodKey: day.periodKey }),
          createdAt: now,
        });

        // Queue missed alert to Creator
        await this.notificationService.queueEvent(db, {
          userId: commitment.creatorId,
          commitmentId: commitment.id,
          type: 'COMMITMENT_MISSED',
          payload: {
            title: commitment.title,
            date: day.periodKey,
            completed: day.completedValue,
            target: day.targetValue,
            unit: rule.targetUnit,
            livesLost,
            livesRemaining: newLives,
            maxLives: rule.maxLives,
            stakeAmount: rule.stakeAmount || 0,
            stakeCurrency: rule.stakeCurrency || 'INR',
            penaltyIncrement,
            accumulatedPenalty: newAccumulatedPenalty,
            partnerUsername: partner?.username,
          },
        });

        // Queue missed alert to Partner
        await this.notificationService.queueEvent(db, {
          userId: commitment.partnerId,
          commitmentId: commitment.id,
          type: 'COMMITMENT_MISSED',
          payload: {
            title: commitment.title,
            date: day.periodKey,
            completed: day.completedValue,
            target: day.targetValue,
            unit: rule.targetUnit,
            livesLost,
            livesRemaining: newLives,
            maxLives: rule.maxLives,
            creatorName: creator?.displayName || 'Creator',
            creatorUsername: creator?.username,
            stakeAmount: rule.stakeAmount || 0,
            stakeCurrency: rule.stakeCurrency || 'INR',
            penaltyIncrement,
            accumulatedPenalty: newAccumulatedPenalty,
          },
        });

        if (isTerminated) {
          result.failedCommitments++;
          await this.notificationService.queueEvent(db, {
            userId: commitment.creatorId,
            commitmentId: commitment.id,
            type: 'COMMITMENT_FAILED',
            payload: { title: commitment.title },
          });
          await this.notificationService.queueEvent(db, {
            userId: commitment.partnerId,
            commitmentId: commitment.id,
            type: 'COMMITMENT_FAILED',
            payload: { title: commitment.title },
          });
        }
      }

      // Check if all days in contract have been evaluated
      const allDays = await db
        .select()
        .from(schema.commitmentDays)
        .where(eq(schema.commitmentDays.commitmentId, commitment.id));

      const allEvaluated = allDays.every((d: any) => d.evaluatedAt !== null);
      if (allEvaluated && commitment.currentLives > 0 && commitment.status === 'ACTIVE') {
        await db
          .update(schema.commitments)
          .set({ status: 'COMPLETED', completedAt: now, updatedAt: now })
          .where(eq(schema.commitments.id, commitment.id));

        result.completedCommitments++;

        await this.notificationService.queueEvent(db, {
          userId: commitment.creatorId,
          commitmentId: commitment.id,
          type: 'COMMITMENT_COMPLETED',
          payload: {
            title: commitment.title,
            finalStreak: commitment.currentStreak,
            successfulDays: allDays.filter((d: any) => d.status === 'COMPLETED').length,
          },
        });
      }
    }

    // Process outbox emails
    const outboxResult = await this.notificationService.processOutbox(db, 20, env);
    result.dispatches = outboxResult.dispatches;

    return result;
  }

  async runReminders(db: DatabaseInstance, env?: any): Promise<{ sent: number; dispatches: DispatchLog[] }> {
    const now = nowUtc();

    // Find all active commitments
    const activeCommitments = await db
      .select()
      .from(schema.commitments)
      .where(eq(schema.commitments.status, 'ACTIVE'));

    let sent = 0;

    for (const commitment of activeCommitments) {
      // Find pending/in_progress day for the CURRENT ACTIVE period
      const [dueDay] = await db
        .select()
        .from(schema.commitmentDays)
        .where(
          and(
            eq(schema.commitmentDays.commitmentId, commitment.id),
            lte(schema.commitmentDays.periodStart, now),
            gte(schema.commitmentDays.periodEnd, now),
            or(
              eq(schema.commitmentDays.status, 'PENDING'),
              eq(schema.commitmentDays.status, 'IN_PROGRESS')
            )
          )
        )
        .limit(1);

      if (!dueDay || dueDay.completedValue >= dueDay.targetValue) {
        continue;
      }

      // Check if reminder was already sent today for this commitment (past 20 hours)
      const existingReminder = await db
        .select()
        .from(schema.notificationEvents)
        .where(
          and(
            eq(schema.notificationEvents.commitmentId, commitment.id),
            eq(schema.notificationEvents.type, 'COMMITMENT_REMINDER'),
            gte(schema.notificationEvents.createdAt, now - 20 * 3600)
          )
        )
        .limit(1);

      if (existingReminder.length > 0) {
        continue;
      }

      const [rule] = await db
        .select()
        .from(schema.commitmentRules)
        .where(eq(schema.commitmentRules.commitmentId, commitment.id));

      await this.notificationService.queueEvent(db, {
        userId: commitment.creatorId,
        commitmentId: commitment.id,
        type: 'COMMITMENT_REMINDER',
        payload: {
          title: commitment.title,
          progress: dueDay.completedValue,
          target: dueDay.targetValue,
          unit: rule?.targetUnit || 'units',
        },
      });
      sent++;
    }

    const outboxResult = await this.notificationService.processOutbox(db, 20, env);
    return { sent, dispatches: outboxResult.dispatches };
  }
}
