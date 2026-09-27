import { runMigrations } from './migrate';
import { getDb, schema } from './index';
import { hashPassword, generateId } from '../shared/crypto';
import { generatePeriods, nowUtc } from '../shared/time';

export async function seed() {
  runMigrations();
  const db = getDb();
  const now = nowUtc();

  console.log('Seeding development data...');

  // Create test user 1: hitesh
  const hiteshId = 'user_hitesh_seed_1';
  const hiteshPass = await hashPassword('password123');

  await db.insert(schema.users).values({
    id: hiteshId,
    username: 'hitesh',
    email: 'hitesh@example.com',
    passwordHash: hiteshPass,
    displayName: 'Hitesh Prajapati',
    timezone: 'Asia/Kolkata',
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  }).onConflictDoNothing();

  await db.insert(schema.notificationPreferences).values({
    id: generateId(),
    userId: hiteshId,
    remindersEnabled: true,
    missedAlertsEnabled: true,
    restorationAlertsEnabled: true,
    invitationAlertsEnabled: true,
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing();

  // Create test user 2: rahul
  const rahulId = 'user_rahul_seed_2';
  const rahulPass = await hashPassword('password123');

  await db.insert(schema.users).values({
    id: rahulId,
    username: 'rahul',
    email: 'rahul@example.com',
    passwordHash: rahulPass,
    displayName: 'Rahul Sharma',
    timezone: 'Asia/Kolkata',
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  }).onConflictDoNothing();

  await db.insert(schema.notificationPreferences).values({
    id: generateId(),
    userId: rahulId,
    remindersEnabled: true,
    missedAlertsEnabled: true,
    restorationAlertsEnabled: true,
    invitationAlertsEnabled: true,
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing();

  // Create active commitment from Hitesh to Rahul
  const commitmentId = 'commit_seed_dsa_1';
  const startDate = '2026-09-01';
  const endDate = '2026-09-30';

  await db.insert(schema.commitments).values({
    id: commitmentId,
    creatorId: hiteshId,
    partnerId: rahulId,
    title: 'Solve 2 LeetCode problems every day',
    description: 'Master binary search and dynamic programming questions before upcoming interviews.',
    status: 'ACTIVE',
    startDate,
    endDate,
    timezone: 'Asia/Kolkata',
    currentLives: 3,
    currentStreak: 12,
    longestStreak: 12,
    createdAt: now - 12 * 86400,
    updatedAt: now,
    acceptedAt: now - 12 * 86400,
  }).onConflictDoNothing();

  await db.insert(schema.commitmentRules).values({
    id: generateId(),
    commitmentId,
    frequencyType: 'DAILY',
    targetValue: 2,
    targetUnit: 'problems',
    cutoffTime: '00:00',
    evaluationDelayMinutes: 60,
    initialLives: 3,
    maxLives: 3,
    failureLives: 1,
    restoreEnabled: true,
    restoreAfterSuccessDays: 5,
    restoreLives: 1,
    graceDays: 0,
    proofType: 'MANUAL',
    createdAt: now,
    updatedAt: now,
  }).onConflictDoNothing();

  // Generate and insert days
  const periods = generatePeriods(startDate, endDate, 'Asia/Kolkata', 'DAILY', '00:00', 60);
  for (let i = 0; i < periods.length; i++) {
    const p = periods[i];
    const isPast = p.evaluationAt < now;
    const isToday = !isPast && (now >= p.periodStart && now <= p.periodEnd);

    await db.insert(schema.commitmentDays).values({
      id: generateId(),
      commitmentId,
      periodKey: p.periodKey,
      periodStart: p.periodStart,
      periodEnd: p.periodEnd,
      evaluationAt: p.evaluationAt,
      targetValue: 2,
      completedValue: isPast ? 2 : isToday ? 1 : 0,
      status: isPast ? 'COMPLETED' : isToday ? 'IN_PROGRESS' : 'PENDING',
      proofStatus: isPast ? 'VERIFIED' : isToday ? 'SUBMITTED' : 'NONE',
      evaluatedAt: isPast ? p.evaluationAt : null,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing();
  }

  // Initial life transaction
  await db.insert(schema.lifeTransactions).values({
    id: generateId(),
    commitmentId,
    amount: 3,
    type: 'INITIAL',
    reason: 'Contract initialized with 3 lives',
    createdAt: now - 12 * 86400,
  }).onConflictDoNothing();

  console.log('✅ Seed completed: Users "hitesh" (pass: password123) and "rahul" (pass: password123) created with active commitment.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed();
}
