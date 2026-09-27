import { eq, and, or, desc, gte, lte, sql, inArray } from 'drizzle-orm';
import { DatabaseInstance, schema } from '../../db';
import { generateId } from '../../shared/crypto';
import { generatePeriods, nowUtc } from '../../shared/time';
import { NotificationService } from '../notifications/notification.service';

export interface CreateCommitmentInput {
  creatorId: string;
  partnerUsername: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  timezone?: string;
  frequencyType?: 'DAILY' | 'WEEKLY';
  targetValue: number;
  targetUnit: string;
  cutoffTime?: string; // HH:MM
  initialLives?: number;
  maxLives?: number;
  failureLives?: number;
  stakeAmount?: number;
  stakeCurrency?: string;
  restoreEnabled?: boolean;
  restoreAfterSuccessDays?: number;
  restoreLives?: number;
}

export class CommitmentService {
  constructor(private notificationService: NotificationService = new NotificationService()) {}

  async create(db: DatabaseInstance, input: CreateCommitmentInput) {
    const [creator] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, input.creatorId));

    if (!creator) {
      throw new Error('Creator user not found');
    }

    const tz = input.timezone || creator.timezone || 'UTC';

    // 1. Resolve partner by username or email
    const partner = await this.resolvePartner(db, input.partnerUsername, input.creatorId, tz);
    const commitmentId = generateId();
    const ruleId = generateId();
    const now = nowUtc();

    const initialLives = input.initialLives ?? 3;
    const maxLives = input.maxLives ?? 3;
    const failureLives = input.failureLives ?? 1;
    const restoreEnabled = input.restoreEnabled ?? true;
    const restoreAfterSuccessDays = input.restoreAfterSuccessDays ?? 5;
    const restoreLives = input.restoreLives ?? 1;
    const stakeAmount = Math.max(0, input.stakeAmount ?? 0);
    const stakeCurrency = input.stakeCurrency?.trim().toUpperCase() || 'INR';

    // Create commitment record
    await db.insert(schema.commitments).values({
      id: commitmentId,
      creatorId: input.creatorId,
      partnerId: partner.id,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      status: 'PENDING_ACCEPTANCE',
      startDate: input.startDate,
      endDate: input.endDate,
      timezone: tz,
      currentLives: initialLives,
      currentStreak: 0,
      longestStreak: 0,
      accumulatedPenalty: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Create rules record
    await db.insert(schema.commitmentRules).values({
      id: ruleId,
      commitmentId,
      frequencyType: input.frequencyType || 'DAILY',
      targetValue: input.targetValue,
      targetUnit: input.targetUnit.trim(),
      cutoffTime: input.cutoffTime || '00:00',
      evaluationDelayMinutes: 60,
      initialLives,
      maxLives,
      failureLives,
      stakeAmount,
      stakeCurrency,
      restoreEnabled,
      restoreAfterSuccessDays,
      restoreLives,
      graceDays: 0,
      proofType: 'MANUAL',
      createdAt: now,
      updatedAt: now,
    });

    // Create audit log
    await db.insert(schema.auditLogs).values({
      id: generateId(),
      actorUserId: input.creatorId,
      entityType: 'COMMITMENT',
      entityId: commitmentId,
      action: 'COMMITMENT_CREATED',
      metadata: JSON.stringify({ title: input.title, partnerId: partner.id }),
      createdAt: now,
    });

    // Queue invitation notification to partner
    await this.notificationService.queueEvent(db, {
      userId: partner.id,
      commitmentId,
      type: 'COMMITMENT_INVITATION',
      payload: {
        creatorName: creator.displayName,
        creatorUsername: creator.username,
        title: input.title,
        targetValue: input.targetValue,
        targetUnit: input.targetUnit,
        frequency: input.frequencyType || 'DAILY',
        lives: initialLives,
        durationDays: 30,
        stakeAmount,
        stakeCurrency,
        commitmentId,
        isInvitedUser: partner.status === 'INVITED',
        partnerEmail: partner.email,
      },
    });

    // Immediately trigger outbox processing so email sends in real time
    await this.notificationService.processOutbox(db);

    return this.getById(db, commitmentId, input.creatorId);
  }

  async updatePending(
    db: DatabaseInstance,
    commitmentId: string,
    creatorUserId: string,
    updateData: {
      partnerUsername?: string;
      title?: string;
      description?: string;
      targetValue?: number;
      targetUnit?: string;
      frequencyType?: 'DAILY' | 'WEEKLY';
      startDate?: string;
      endDate?: string;
      initialLives?: number;
      maxLives?: number;
      failureLives?: number;
      restoreEnabled?: boolean;
      restoreAfterSuccessDays?: number;
      restoreLives?: number;
    }
  ) {
    const commitment = await this.getRawById(db, commitmentId);
    if (!commitment) throw new Error('Commitment not found');

    if (commitment.creatorId !== creatorUserId) {
      throw new Error('Only the creator can edit this commitment');
    }

    if (commitment.status !== 'PENDING_ACCEPTANCE' && commitment.status !== 'DRAFT') {
      throw new Error('Active or completed contracts cannot be modified');
    }

    const now = nowUtc();
    let newPartnerId = commitment.partnerId;

    if (updateData.partnerUsername) {
      const partner = await this.resolvePartner(db, updateData.partnerUsername, creatorUserId, commitment.timezone);
      newPartnerId = partner.id;

      // If partner changed, dispatch new invitation event
      if (newPartnerId !== commitment.partnerId) {
        const [creator] = await db.select().from(schema.users).where(eq(schema.users.id, creatorUserId));
        await this.notificationService.queueEvent(db, {
          userId: newPartnerId,
          commitmentId,
          type: 'COMMITMENT_INVITATION',
          payload: {
            creatorName: creator?.displayName || 'Creator',
            title: updateData.title || commitment.title,
            targetValue: updateData.targetValue || 1,
            targetUnit: updateData.targetUnit || 'units',
            frequency: updateData.frequencyType || 'DAILY',
            lives: updateData.initialLives || commitment.currentLives,
            durationDays: 30,
          },
        });
      }
    }

    // Update commitment record
    await db
      .update(schema.commitments)
      .set({
        partnerId: newPartnerId,
        title: updateData.title ? updateData.title.trim() : commitment.title,
        description: typeof updateData.description !== 'undefined' ? updateData.description?.trim() || null : commitment.description,
        startDate: updateData.startDate || commitment.startDate,
        endDate: updateData.endDate || commitment.endDate,
        currentLives: updateData.initialLives || commitment.currentLives,
        updatedAt: now,
      })
      .where(eq(schema.commitments.id, commitmentId));

    // Update rules record
    await db
      .update(schema.commitmentRules)
      .set({
        frequencyType: updateData.frequencyType || undefined,
        targetValue: typeof updateData.targetValue === 'number' ? updateData.targetValue : undefined,
        targetUnit: updateData.targetUnit ? updateData.targetUnit.trim() : undefined,
        initialLives: updateData.initialLives || undefined,
        maxLives: updateData.maxLives || updateData.initialLives || undefined,
        failureLives: updateData.failureLives || undefined,
        restoreEnabled: typeof updateData.restoreEnabled === 'boolean' ? updateData.restoreEnabled : undefined,
        restoreAfterSuccessDays: updateData.restoreAfterSuccessDays || undefined,
        restoreLives: updateData.restoreLives || undefined,
        updatedAt: now,
      })
      .where(eq(schema.commitmentRules.commitmentId, commitmentId));

    if (newPartnerId !== commitment.partnerId) {
      await this.notificationService.processOutbox(db);
    }

    return this.getById(db, commitmentId, creatorUserId);
  }

  async accept(db: DatabaseInstance, commitmentId: string, partnerUserId: string) {
    const commitment = await this.getRawById(db, commitmentId);
    if (!commitment) throw new Error('Commitment not found');

    if (commitment.partnerId !== partnerUserId) {
      throw new Error('Only the assigned accountability partner can accept this commitment');
    }

    if (commitment.status !== 'PENDING_ACCEPTANCE') {
      throw new Error(`Cannot accept commitment in ${commitment.status} status`);
    }

    const [rule] = await db
      .select()
      .from(schema.commitmentRules)
      .where(eq(schema.commitmentRules.commitmentId, commitmentId));

    if (!rule) throw new Error('Commitment rules not found');

    const now = nowUtc();

    // Generate daily periods
    const periods = generatePeriods(
      commitment.startDate,
      commitment.endDate,
      commitment.timezone,
      rule.frequencyType as any,
      rule.cutoffTime,
      rule.evaluationDelayMinutes
    );

    // Insert all commitment days
    for (const p of periods) {
      await db.insert(schema.commitmentDays).values({
        id: generateId(),
        commitmentId,
        periodKey: p.periodKey,
        periodStart: p.periodStart,
        periodEnd: p.periodEnd,
        evaluationAt: p.evaluationAt,
        targetValue: rule.targetValue,
        completedValue: 0,
        status: 'PENDING',
        proofStatus: 'NONE',
        createdAt: now,
        updatedAt: now,
      });
    }

    // Initial life transaction
    await db.insert(schema.lifeTransactions).values({
      id: generateId(),
      commitmentId,
      amount: rule.initialLives,
      type: 'INITIAL',
      reason: 'Contract initialized with starting lives',
      createdAt: now,
    });

    // Update commitment status to ACTIVE
    await db
      .update(schema.commitments)
      .set({
        status: 'ACTIVE',
        acceptedAt: now,
        currentLives: rule.initialLives,
        updatedAt: now,
      })
      .where(eq(schema.commitments.id, commitmentId));

    // Audit log
    await db.insert(schema.auditLogs).values({
      id: generateId(),
      actorUserId: partnerUserId,
      entityType: 'COMMITMENT',
      entityId: commitmentId,
      action: 'COMMITMENT_ACCEPTED',
      createdAt: now,
    });

    // Notify creator
    const [partner] = await db.select().from(schema.users).where(eq(schema.users.id, partnerUserId));
    await this.notificationService.queueEvent(db, {
      userId: commitment.creatorId,
      commitmentId,
      type: 'COMMITMENT_ACCEPTED',
      payload: {
        partnerName: partner?.displayName || 'Partner',
        title: commitment.title,
      },
    });

    await this.notificationService.processOutbox(db);

    return this.getById(db, commitmentId, partnerUserId);
  }

  async decline(db: DatabaseInstance, commitmentId: string, partnerUserId: string) {
    const commitment = await this.getRawById(db, commitmentId);
    if (!commitment) throw new Error('Commitment not found');

    if (commitment.partnerId !== partnerUserId) {
      throw new Error('Only the assigned accountability partner can decline this commitment');
    }

    if (commitment.status !== 'PENDING_ACCEPTANCE') {
      throw new Error('Commitment cannot be declined');
    }

    const now = nowUtc();
    await db
      .update(schema.commitments)
      .set({ status: 'CANCELLED', updatedAt: now })
      .where(eq(schema.commitments.id, commitmentId));

    await db.insert(schema.auditLogs).values({
      id: generateId(),
      actorUserId: partnerUserId,
      entityType: 'COMMITMENT',
      entityId: commitmentId,
      action: 'COMMITMENT_DECLINED',
      createdAt: now,
    });

    return { success: true };
  }

  async cancel(db: DatabaseInstance, commitmentId: string, creatorUserId: string) {
    const commitment = await this.getRawById(db, commitmentId);
    if (!commitment) throw new Error('Commitment not found');

    if (commitment.creatorId !== creatorUserId) {
      throw new Error('Only the creator can cancel this commitment');
    }

    const now = nowUtc();
    await db
      .update(schema.commitments)
      .set({ status: 'CANCELLED', updatedAt: now })
      .where(eq(schema.commitments.id, commitmentId));

    await db.insert(schema.auditLogs).values({
      id: generateId(),
      actorUserId: creatorUserId,
      entityType: 'COMMITMENT',
      entityId: commitmentId,
      action: 'COMMITMENT_CANCELLED',
      createdAt: now,
    });

    return { success: true };
  }

  async listForUser(db: DatabaseInstance, userId: string) {
    const results = await db
      .select({
        commitment: schema.commitments,
        creator: {
          id: schema.users.id,
          username: schema.users.username,
          displayName: schema.users.displayName,
        },
      })
      .from(schema.commitments)
      .leftJoin(schema.users, eq(schema.commitments.creatorId, schema.users.id))
      .where(or(eq(schema.commitments.creatorId, userId), eq(schema.commitments.partnerId, userId)))
      .orderBy(desc(schema.commitments.createdAt));

    // Also fetch rules & partner for each
    const fullList = await Promise.all(
      results.map(async (row: any) => {
        const [rule] = await db
          .select()
          .from(schema.commitmentRules)
          .where(eq(schema.commitmentRules.commitmentId, row.commitment.id));

        const [partner] = await db
          .select({
            id: schema.users.id,
            username: schema.users.username,
            displayName: schema.users.displayName,
            email: schema.users.email,
          })
          .from(schema.users)
          .where(eq(schema.users.id, row.commitment.partnerId));

        return {
          ...row.commitment,
          rule,
          creator: row.creator,
          partner,
          isCreator: row.commitment.creatorId === userId,
        };
      })
    );

    return fullList;
  }

  async getById(db: DatabaseInstance, commitmentId: string, currentUserId: string) {
    const commitment = await this.getRawById(db, commitmentId);
    if (!commitment) throw new Error('Commitment not found');

    if (commitment.creatorId !== currentUserId && commitment.partnerId !== currentUserId) {
      throw new Error('Unauthorized to view this commitment');
    }

    const [rule] = await db
      .select()
      .from(schema.commitmentRules)
      .where(eq(schema.commitmentRules.commitmentId, commitmentId));

    const [creator] = await db
      .select({ id: schema.users.id, username: schema.users.username, displayName: schema.users.displayName, email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.id, commitment.creatorId));

    const [partner] = await db
      .select({ id: schema.users.id, username: schema.users.username, displayName: schema.users.displayName, email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.id, commitment.partnerId));

    const days = await db
      .select()
      .from(schema.commitmentDays)
      .where(eq(schema.commitmentDays.commitmentId, commitmentId))
      .orderBy(schema.commitmentDays.periodStart);

    let daysWithProofs = days.map((day: any) => ({ ...day, proofs: [] as any[] }));
    if (days.length > 0) {
      const proofs = await db
        .select()
        .from(schema.proofs)
        .where(inArray(schema.proofs.commitmentDayId, days.map((d: any) => d.id)))
        .orderBy(schema.proofs.submittedAt);
        
      daysWithProofs = days.map((day: any) => ({
        ...day,
        proofs: proofs.filter((p: any) => p.commitmentDayId === day.id)
      }));
    }

    const transactions = await db
      .select()
      .from(schema.lifeTransactions)
      .where(eq(schema.lifeTransactions.commitmentId, commitmentId))
      .orderBy(desc(schema.lifeTransactions.createdAt));

    return {
      ...commitment,
      rule,
      creator,
      partner,
      days: daysWithProofs,
      transactions,
      isCreator: commitment.creatorId === currentUserId,
    };
  }

  async submitProof(
    db: DatabaseInstance,
    params: { commitmentId: string; dayId: string; userId: string; value: number; metadataText?: string }
  ) {
    const commitment = await this.getRawById(db, params.commitmentId);
    if (!commitment) throw new Error('Commitment not found');

    if (commitment.creatorId !== params.userId) {
      throw new Error('Only the commitment creator can submit proof for their commitment');
    }

    if (commitment.status !== 'ACTIVE') {
      throw new Error('Cannot submit proof for an inactive commitment');
    }

    const [day] = await db
      .select()
      .from(schema.commitmentDays)
      .where(and(eq(schema.commitmentDays.id, params.dayId), eq(schema.commitmentDays.commitmentId, params.commitmentId)));

    const now = nowUtc();

    if (now < day.periodStart) {
      throw new Error(`Proof cannot be submitted in advance for future dates (${day.periodKey}). You can only log progress during the active period.`);
    }

    if (day.status === 'MISSED' || day.status === 'COMPLETED') {
      // If already completed or missed, disallow further mutations unless in progress
      if (day.status === 'MISSED') {
        throw new Error('This day period has already closed and was evaluated as MISSED');
      }
    }

    const newCompletedValue = day.completedValue + params.value;
    const isCompleted = newCompletedValue >= day.targetValue;

    // Insert proof
    const proofId = generateId();
    await db.insert(schema.proofs).values({
      id: proofId,
      commitmentDayId: day.id,
      type: 'MANUAL',
      value: params.value,
      metadata: params.metadataText ? JSON.stringify({ note: params.metadataText }) : null,
      submittedBy: params.userId,
      submittedAt: now,
      status: 'VERIFIED',
    });

    // Update commitment day
    await db
      .update(schema.commitmentDays)
      .set({
        completedValue: newCompletedValue,
        status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
        proofStatus: 'SUBMITTED',
        updatedAt: now,
      })
      .where(eq(schema.commitmentDays.id, day.id));

    // Audit log
    await db.insert(schema.auditLogs).values({
      id: generateId(),
      actorUserId: params.userId,
      entityType: 'PROOF',
      entityId: proofId,
      action: 'PROOF_SUBMITTED',
      metadata: JSON.stringify({ value: params.value, isCompleted }),
      createdAt: now,
    });

    return { success: true, completedValue: newCompletedValue, isCompleted };
  }

  private async resolvePartner(db: DatabaseInstance, partnerInput: string, creatorId: string, timezone: string = 'UTC') {
    const cleanInput = partnerInput.trim().toLowerCase();
    if (!cleanInput) {
      throw new Error('Please provide a partner username or email address');
    }

    // 1. Search existing users by username or email
    const [existingUser] = await db
      .select()
      .from(schema.users)
      .where(or(eq(schema.users.username, cleanInput), eq(schema.users.email, cleanInput)));

    if (existingUser) {
      if (existingUser.id === creatorId) {
        throw new Error('You cannot assign yourself as the accountability partner');
      }
      return existingUser;
    }

    // 2. If it's a valid email, auto-create an invited user account
    const isEmail = cleanInput.includes('@') && cleanInput.includes('.');
    if (isEmail) {
      const invitedUserId = generateId();
      const baseName = cleanInput.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 15) || 'partner';
      const uniqueUsername = `${baseName}_${generateId().slice(0, 4)}`;
      const now = nowUtc();

      await db.insert(schema.users).values({
        id: invitedUserId,
        username: uniqueUsername,
        email: cleanInput,
        passwordHash: 'INVITED_PENDING',
        displayName: cleanInput.split('@')[0],
        timezone,
        status: 'INVITED',
        createdAt: now,
        updatedAt: now,
      });

      // Default notification preferences
      await db.insert(schema.notificationPreferences).values({
        id: generateId(),
        userId: invitedUserId,
        remindersEnabled: true,
        missedAlertsEnabled: true,
        restorationAlertsEnabled: true,
        invitationAlertsEnabled: true,
        createdAt: now,
        updatedAt: now,
      });

      const [created] = await db.select().from(schema.users).where(eq(schema.users.id, invitedUserId));
      return created;
    }

    throw new Error(`User "${partnerInput}" not found. Enter a registered username or enter an email address to invite them.`);
  }

  private async getRawById(db: DatabaseInstance, id: string) {
    const [c] = await db.select().from(schema.commitments).where(eq(schema.commitments.id, id));
    return c || null;
  }
}
