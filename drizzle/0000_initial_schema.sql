-- Cloudflare D1 Migration for Commitment Application
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  last_login_at INTEGER
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS commitments (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES users(id),
  partner_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING_ACCEPTANCE',
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  timezone TEXT NOT NULL,
  current_lives INTEGER NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  accepted_at INTEGER,
  completed_at INTEGER,
  failed_at INTEGER
);

CREATE TABLE IF NOT EXISTS commitment_rules (
  id TEXT PRIMARY KEY,
  commitment_id TEXT NOT NULL UNIQUE REFERENCES commitments(id) ON DELETE CASCADE,
  frequency_type TEXT NOT NULL DEFAULT 'DAILY',
  target_value REAL NOT NULL,
  target_unit TEXT NOT NULL,
  cutoff_time TEXT NOT NULL DEFAULT '00:00',
  evaluation_delay_minutes INTEGER NOT NULL DEFAULT 60,
  initial_lives INTEGER NOT NULL DEFAULT 3,
  max_lives INTEGER NOT NULL DEFAULT 3,
  failure_lives INTEGER NOT NULL DEFAULT 1,
  restore_enabled INTEGER NOT NULL DEFAULT 1,
  restore_after_success_days INTEGER NOT NULL DEFAULT 5,
  restore_lives INTEGER NOT NULL DEFAULT 1,
  grace_days INTEGER NOT NULL DEFAULT 0,
  proof_type TEXT NOT NULL DEFAULT 'MANUAL',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS commitment_days (
  id TEXT PRIMARY KEY,
  commitment_id TEXT NOT NULL REFERENCES commitments(id) ON DELETE CASCADE,
  period_key TEXT NOT NULL,
  period_start INTEGER NOT NULL,
  period_end INTEGER NOT NULL,
  evaluation_at INTEGER NOT NULL,
  target_value REAL NOT NULL,
  completed_value REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING',
  proof_status TEXT NOT NULL DEFAULT 'NONE',
  evaluated_at INTEGER,
  failure_reason TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(commitment_id, period_key)
);

CREATE TABLE IF NOT EXISTS life_transactions (
  id TEXT PRIMARY KEY,
  commitment_id TEXT NOT NULL REFERENCES commitments(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS proofs (
  id TEXT PRIMARY KEY,
  commitment_day_id TEXT NOT NULL REFERENCES commitment_days(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'MANUAL',
  value REAL NOT NULL,
  metadata TEXT,
  submitted_by TEXT NOT NULL REFERENCES users(id),
  submitted_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'VERIFIED'
);

CREATE TABLE IF NOT EXISTS notification_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  commitment_id TEXT REFERENCES commitments(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  scheduled_at INTEGER NOT NULL,
  sent_at INTEGER,
  last_error TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  reminders_enabled INTEGER NOT NULL DEFAULT 1,
  missed_alerts_enabled INTEGER NOT NULL DEFAULT 1,
  restoration_alerts_enabled INTEGER NOT NULL DEFAULT 1,
  invitation_alerts_enabled INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  metadata TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_commitments_creator ON commitments(creator_id);
CREATE INDEX IF NOT EXISTS idx_commitments_partner ON commitments(partner_id);
CREATE INDEX IF NOT EXISTS idx_commitment_days_eval ON commitment_days(evaluation_at, status);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notification_events(status, scheduled_at);