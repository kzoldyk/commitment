import { eq, and, lte, inArray } from 'drizzle-orm';
import { DatabaseInstance, schema } from '../../db';
import { generateId } from '../../shared/crypto';
import { nowUtc } from '../../shared/time';
import { EmailService } from './email.service';

export interface CreateEventParams {
  userId: string;
  commitmentId?: string;
  type:
    | 'COMMITMENT_INVITATION'
    | 'COMMITMENT_ACCEPTED'
    | 'COMMITMENT_DECLINED'
    | 'COMMITMENT_REMINDER'
    | 'COMMITMENT_MISSED'
    | 'COMMITMENT_COMPLETED'
    | 'LIFE_RESTORED'
    | 'COMMITMENT_FAILED';
  payload: Record<string, any>;
  scheduledAt?: number;
}

export interface DispatchLog {
  eventId: string;
  recipient: string;
  from: string;
  subject: string;
  type: string;
  provider: string;
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: string;
}

export class NotificationService {
  private emailService: EmailService;

  constructor(emailServiceOrEnv?: EmailService | any) {
    if (emailServiceOrEnv instanceof EmailService) {
      this.emailService = emailServiceOrEnv;
    } else {
      this.emailService = new EmailService(emailServiceOrEnv);
    }
  }

  async queueEvent(db: DatabaseInstance, params: CreateEventParams): Promise<string> {
    const id = generateId();
    const scheduledAt = params.scheduledAt || nowUtc();

    await db.insert(schema.notificationEvents).values({
      id,
      userId: params.userId,
      commitmentId: params.commitmentId,
      type: params.type,
      payload: JSON.stringify(params.payload),
      status: 'PENDING',
      attemptCount: 0,
      scheduledAt,
      createdAt: nowUtc(),
    });

    return id;
  }

  async processOutbox(
    db: DatabaseInstance,
    limit: number = 20,
    env?: any
  ): Promise<{ processed: number; succeeded: number; failed: number; dispatches: DispatchLog[] }> {
    if (env && !(this.emailService as any).gmailUser) {
      this.emailService = new EmailService(env);
    }

    const now = nowUtc();
    const dispatches: DispatchLog[] = [];

    // Query pending events scheduled up to now
    const events = await db
      .select()
      .from(schema.notificationEvents)
      .where(
        and(
          eq(schema.notificationEvents.status, 'PENDING'),
          lte(schema.notificationEvents.scheduledAt, now)
        )
      )
      .limit(limit);

    let succeeded = 0;
    let failed = 0;

    for (const event of events) {
      // Mark as PROCESSING to prevent duplicate worker pickup
      await db
        .update(schema.notificationEvents)
        .set({ status: 'PROCESSING' })
        .where(eq(schema.notificationEvents.id, event.id));

      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, event.userId));

      if (!user) {
        await db
          .update(schema.notificationEvents)
          .set({ status: 'FAILED', lastError: 'User not found' })
          .where(eq(schema.notificationEvents.id, event.id));
        failed++;
        continue;
      }

      // Check notification preferences
      const [prefs] = await db
        .select()
        .from(schema.notificationPreferences)
        .where(eq(schema.notificationPreferences.userId, user.id));

      const isAllowed = this.checkPreferences(event.type, prefs);
      if (!isAllowed) {
        // Skipped by user preference - mark SENT so we don't reprocess
        await db
          .update(schema.notificationEvents)
          .set({ status: 'SENT', sentAt: nowUtc(), lastError: 'Skipped by user preference' })
          .where(eq(schema.notificationEvents.id, event.id));
        succeeded++;
        continue;
      }

      const payload = JSON.parse(event.payload || '{}');
      const emailContent = this.formatEmail(event.type, user.displayName, payload);

      const result = await this.emailService.sendEmail({
        to: user.email,
        subject: emailContent.subject,
        text: emailContent.body,
      });

      dispatches.push({
        eventId: event.id,
        recipient: user.email,
        from: this.emailService.getFromAddress(),
        subject: emailContent.subject,
        type: event.type,
        provider: this.emailService.getProviderName(),
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        timestamp: new Date().toISOString(),
      });

      if (result.success) {
        await db
          .update(schema.notificationEvents)
          .set({
            status: 'SENT',
            sentAt: nowUtc(),
            lastError: null,
          })
          .where(eq(schema.notificationEvents.id, event.id));
        succeeded++;
      } else {
        const nextAttempt = event.attemptCount + 1;
        if (nextAttempt >= 4) {
          await db
            .update(schema.notificationEvents)
            .set({
              status: 'FAILED',
              attemptCount: nextAttempt,
              lastError: result.error,
            })
            .where(eq(schema.notificationEvents.id, event.id));
          failed++;
        } else {
          // Exponential backoff: 1 min, 5 min, 30 min
          const backoffSeconds = nextAttempt === 1 ? 60 : nextAttempt === 2 ? 300 : 1800;
          await db
            .update(schema.notificationEvents)
            .set({
              status: 'PENDING',
              attemptCount: nextAttempt,
              scheduledAt: nowUtc() + backoffSeconds,
              lastError: result.error,
            })
            .where(eq(schema.notificationEvents.id, event.id));
          failed++;
        }
      }
    }

    return { processed: events.length, succeeded, failed, dispatches };
  }

  private checkPreferences(type: string, prefs?: typeof schema.notificationPreferences.$inferSelect): boolean {
    if (!prefs) return true;
    if (type === 'COMMITMENT_REMINDER' && !prefs.remindersEnabled) return false;
    if (type === 'COMMITMENT_MISSED' && !prefs.missedAlertsEnabled) return false;
    if (type === 'LIFE_RESTORED' && !prefs.restorationAlertsEnabled) return false;
    if (type === 'COMMITMENT_INVITATION' && !prefs.invitationAlertsEnabled) return false;
    return true;
  }

  private formatEmail(type: string, name: string, payload: Record<string, any>, recipientEmail: string = ''): { subject: string; body: string; html?: string } {
    const baseUrl = 'https://commitment.kzoldyk.workers.dev';

    switch (type) {
      case 'COMMITMENT_INVITATION':
        const stakeInfo = payload.stakeAmount > 0 ? `\nFinancial Stake: ${payload.stakeCurrency} ${payload.stakeAmount} per life lost (Paid to partner on miss)` : '';
        const inviteUrl = payload.isInvitedUser
          ? `${baseUrl}/register?email=${encodeURIComponent(recipientEmail || payload.partnerEmail || '')}&invite=${payload.commitmentId || ''}`
          : `${baseUrl}/commitments/${payload.commitmentId || ''}`;

        const ctaText = payload.isInvitedUser ? 'Create Account & Review Contract' : 'Review & Accept Contract';

        return {
          subject: `Contract Invitation: ${payload.creatorName} wants you as their accountability partner`,
          body: `Hi ${name},\n\n${payload.creatorName} (@${payload.creatorUsername || 'creator'}) has invited you to be their accountability partner for:\n"${payload.title}"\n\nGoal: ${payload.targetValue} ${payload.targetUnit} (${payload.frequency})\nLives: ${payload.lives}${stakeInfo}\nDuration: ${payload.durationDays} days\n\nClick the link below to review and accept the contract:\n${inviteUrl}\n\nMake a promise. Prove your progress. Face the consequence.`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
              <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="background-color: #e11d48; width: 32px; height: 32px; border-radius: 8px; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; text-align: center; line-height: 32px;">C</div>
                <span style="margin-left: 10px; font-weight: 700; font-size: 16px; color: #0f172a; letter-spacing: -0.5px;">Commitment</span>
              </div>
              
              <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin-top: 0; letter-spacing: -0.5px;">Accountability Invitation</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                <strong>${payload.creatorName}</strong> (@${payload.creatorUsername || 'creator'}) has designated you to enforce their digital accountability contract.
              </p>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #0f172a;">${payload.title}</p>
                <div style="font-size: 13px; color: #64748b; font-family: monospace; line-height: 1.8;">
                  <div>🎯 <strong>Target:</strong> ${payload.targetValue} ${payload.targetUnit} (${payload.frequency})</div>
                  <div>💖 <strong>Finite Health:</strong> ${payload.lives} Lives Total</div>
                  ${payload.stakeAmount > 0 ? `<div style="color: #d97706; font-weight: 700;">💸 <strong>Financial Stake:</strong> ${payload.stakeCurrency} ${payload.stakeAmount} / life lost</div>` : ''}
                </div>
              </div>

              <div style="margin: 28px 0 20px 0; text-align: center;">
                <a href="${inviteUrl}" style="display: inline-block; background-color: #e11d48; color: #ffffff; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3);">
                  ${ctaText} →
                </a>
              </div>

              <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; text-align: center; margin-top: 24px;">
                Direct link: <a href="${inviteUrl}" style="color: #e11d48; word-break: break-all;">${inviteUrl}</a>
              </p>
            </div>
          `,
        };
      case 'COMMITMENT_ACCEPTED':
        return {
          subject: `Contract Active: ${payload.partnerName} accepted your commitment!`,
          body: `Hi ${name},\n\n${payload.partnerName} has officially accepted your accountability contract for "${payload.title}".\n\nYour rules are now locked in and active. Every day counts.\n\nMake a promise. Prove your progress. Face the consequence.`,
        };
      case 'COMMITMENT_REMINDER':
        return {
          subject: `Reminder: Incomplete commitment for today — "${payload.title}"`,
          body: `Hi ${name},\n\nYour daily commitment "${payload.title}" is still incomplete.\n\nCurrent progress: ${payload.progress} / ${payload.target} ${payload.unit}\n\nDeadline is closing soon. Submit your proof before the daily cutoff to protect your streak and lives.`,
        };
      case 'COMMITMENT_MISSED':
        const penaltyLine = payload.stakeAmount > 0
          ? `\n💸 FINANCIAL PENALTY:\nPenalty for this miss: +${payload.stakeCurrency} ${payload.penaltyIncrement}\nTotal Debt Owed to ${payload.partnerUsername ? `@${payload.partnerUsername}` : 'Partner'}: ${payload.stakeCurrency} ${payload.accumulatedPenalty}\n`
          : '';
        return {
          subject: `⚠️ Commitment Missed: "${payload.title}"`,
          body: `Hi ${name},\n\nCommitment: ${payload.title}\nDate: ${payload.date}\nResult: ${payload.completed} / ${payload.target} ${payload.unit}\n\nLives Lost: -${payload.livesLost}\nLives Remaining: ${payload.livesRemaining} / ${payload.maxLives}\nCurrent Streak: 0 days\n${penaltyLine}\nStay focused and get back on track tomorrow.`,
        };
      case 'LIFE_RESTORED':
        return {
          subject: `❤️ Life Restored: "${payload.title}" (+${payload.restoredAmount} Life)`,
          body: `Hi ${name},\n\nCongratulations! You maintained a ${payload.streak}-day streak on "${payload.title}".\n\nLife Restored: +${payload.restoredAmount}\nCurrent Lives: ${payload.currentLives} / ${payload.maxLives}\n\nKeep up the consistency!`,
        };
      case 'COMMITMENT_FAILED':
        return {
          subject: `💀 Contract Terminated: "${payload.title}" has failed`,
          body: `Hi ${name},\n\nAll lives have been depleted for the commitment "${payload.title}". The contract is now marked as FAILED.\n\nLearn from this cycle, adjust your rules, and forge a new commitment.`,
        };
      case 'COMMITMENT_COMPLETED':
        return {
          subject: `🏆 Contract Completed: "${payload.title}"!`,
          body: `Hi ${name},\n\nYou have successfully reached the end date for your commitment "${payload.title}" with an active contract!\n\nFinal Streak: ${payload.finalStreak} days\nTotal Successful Days: ${payload.successfulDays}\n\nOutstanding discipline.`,
        };
      default:
        return {
          subject: `Commitment Notification: ${type}`,
          body: `Hi ${name},\n\nYou have a new update regarding your commitment contract.`,
        };
    }
  }
}
