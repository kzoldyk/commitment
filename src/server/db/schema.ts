import { sqliteTable, text, integer, real, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// --- Users ---
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name').notNull(),
  timezone: text('timezone').notNull().default('UTC'),
  status: text('status', { enum: ['ACTIVE', 'SUSPENDED', 'DEACTIVATED'] }).notNull().default('ACTIVE'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
  lastLoginAt: integer('last_login_at'),
});

// --- Sessions ---
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at').notNull(),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
}, (table) => [
  index('idx_sessions_user_id').on(table.userId),
  index('idx_sessions_expires_at').on(table.expiresAt),
]);

// --- Commitments ---
export const commitments = sqliteTable('commitments', {
  id: text('id').primaryKey(),
  creatorId: text('creator_id').notNull().references(() => users.id),
  partnerId: text('partner_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', {
    enum: ['DRAFT', 'PENDING_ACCEPTANCE', 'ACTIVE', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED']
  }).notNull().default('PENDING_ACCEPTANCE'),
  startDate: text('start_date').notNull(), // 'YYYY-MM-DD'
  endDate: text('end_date').notNull(),     // 'YYYY-MM-DD'
  timezone: text('timezone').notNull(),
  currentLives: integer('current_lives').notNull(),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  accumulatedPenalty: real('accumulated_penalty').notNull().default(0),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
  acceptedAt: integer('accepted_at'),
  completedAt: integer('completed_at'),
  failedAt: integer('failed_at'),
}, (table) => [
  index('idx_commitments_creator').on(table.creatorId),
  index('idx_commitments_partner').on(table.partnerId),
  index('idx_commitments_status').on(table.status),
]);

// --- Commitment Rules ---
export const commitmentRules = sqliteTable('commitment_rules', {
  id: text('id').primaryKey(),
  commitmentId: text('commitment_id').notNull().unique().references(() => commitments.id, { onDelete: 'cascade' }),
  frequencyType: text('frequency_type', { enum: ['DAILY', 'WEEKLY'] }).notNull().default('DAILY'),
  targetValue: real('target_value').notNull(),
  targetUnit: text('target_unit').notNull(),
  cutoffTime: text('cutoff_time').notNull().default('00:00'),
  evaluationDelayMinutes: integer('evaluation_delay_minutes').notNull().default(60),
  initialLives: integer('initial_lives').notNull().default(3),
  maxLives: integer('max_lives').notNull().default(3),
  failureLives: integer('failure_lives').notNull().default(1),
  stakeAmount: real('stake_amount').notNull().default(0),
  stakeCurrency: text('stake_currency').notNull().default('INR'),
  restoreEnabled: integer('restore_enabled', { mode: 'boolean' }).notNull().default(true),
  restoreAfterSuccessDays: integer('restore_after_success_days').notNull().default(5),
  restoreLives: integer('restore_lives').notNull().default(1),
  graceDays: integer('grace_days').notNull().default(0),
  proofType: text('proof_type', { enum: ['MANUAL', 'LEETCODE', 'GITHUB', 'STRAVA'] }).notNull().default('MANUAL'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
});

// --- Commitment Days (Evaluation Periods) ---
export const commitmentDays = sqliteTable('commitment_days', {
  id: text('id').primaryKey(),
  commitmentId: text('commitment_id').notNull().references(() => commitments.id, { onDelete: 'cascade' }),
  periodKey: text('period_key').notNull(), // 'YYYY-MM-DD' or 'YYYY-Wxx'
  periodStart: integer('period_start').notNull(), // UTC unix timestamp
  periodEnd: integer('period_end').notNull(),     // UTC unix timestamp
  evaluationAt: integer('evaluation_at').notNull(), // UTC unix timestamp when evaluation runs
  targetValue: real('target_value').notNull(),
  completedValue: real('completed_value').notNull().default(0),
  status: text('status', {
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'GRACE', 'DISPUTED']
  }).notNull().default('PENDING'),
  proofStatus: text('proof_status', {
    enum: ['NONE', 'SUBMITTED', 'VERIFIED']
  }).notNull().default('NONE'),
  evaluatedAt: integer('evaluated_at'),
  failureReason: text('failure_reason'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
}, (table) => [
  uniqueIndex('uniq_commitment_period').on(table.commitmentId, table.periodKey),
  index('idx_commitment_days_eval').on(table.evaluationAt, table.status),
]);

// --- Life Transactions ---
export const lifeTransactions = sqliteTable('life_transactions', {
  id: text('id').primaryKey(),
  commitmentId: text('commitment_id').notNull().references(() => commitments.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // e.g. +3, -1, +1
  type: text('type', { enum: ['INITIAL', 'FAILURE', 'RESTORE', 'MANUAL_ADJUSTMENT'] }).notNull(),
  reason: text('reason').notNull(),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
}, (table) => [
  index('idx_life_trans_commitment').on(table.commitmentId),
]);

// --- Proofs ---
export const proofs = sqliteTable('proofs', {
  id: text('id').primaryKey(),
  commitmentDayId: text('commitment_day_id').notNull().references(() => commitmentDays.id, { onDelete: 'cascade' }),
  type: text('type').notNull().default('MANUAL'),
  value: real('value').notNull(),
  metadata: text('metadata'), // JSON string notes / links
  submittedBy: text('submitted_by').notNull().references(() => users.id),
  submittedAt: integer('submitted_at').notNull().default(sql`(unixepoch())`),
  status: text('status', { enum: ['SUBMITTED', 'VERIFIED', 'REJECTED'] }).notNull().default('VERIFIED'),
}, (table) => [
  index('idx_proofs_day').on(table.commitmentDayId),
]);

// --- Notification Events (Transactional Outbox) ---
export const notificationEvents = sqliteTable('notification_events', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  commitmentId: text('commitment_id').references(() => commitments.id, { onDelete: 'set null' }),
  type: text('type', {
    enum: [
      'COMMITMENT_INVITATION',
      'COMMITMENT_ACCEPTED',
      'COMMITMENT_DECLINED',
      'COMMITMENT_REMINDER',
      'COMMITMENT_MISSED',
      'COMMITMENT_COMPLETED',
      'LIFE_RESTORED',
      'COMMITMENT_FAILED'
    ]
  }).notNull(),
  payload: text('payload').notNull(), // JSON string
  status: text('status', { enum: ['PENDING', 'PROCESSING', 'SENT', 'FAILED'] }).notNull().default('PENDING'),
  attemptCount: integer('attempt_count').notNull().default(0),
  scheduledAt: integer('scheduled_at').notNull(),
  sentAt: integer('sent_at'),
  lastError: text('last_error'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
}, (table) => [
  index('idx_notifications_status_scheduled').on(table.status, table.scheduledAt),
]);

// --- Notification Preferences ---
export const notificationPreferences = sqliteTable('notification_preferences', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  remindersEnabled: integer('reminders_enabled', { mode: 'boolean' }).notNull().default(true),
  missedAlertsEnabled: integer('missed_alerts_enabled', { mode: 'boolean' }).notNull().default(true),
  restorationAlertsEnabled: integer('restoration_alerts_enabled', { mode: 'boolean' }).notNull().default(true),
  invitationAlertsEnabled: integer('invitation_alerts_enabled', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
});

// --- Audit Logs ---
export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  actorUserId: text('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  action: text('action').notNull(),
  metadata: text('metadata'), // JSON
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
}, (table) => [
  index('idx_audit_entity').on(table.entityType, table.entityId),
]);
