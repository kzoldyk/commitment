import { eq, or, and, desc, lte, gte } from 'drizzle-orm';
import { DatabaseInstance, schema } from '../../db';
import { formatInTimezone, nowUtc } from '../../shared/time';

export class DashboardService {
  async getDashboardData(db: DatabaseInstance, userId: string) {
    const [currentUser] = await db.select().from(schema.users).where(eq(schema.users.id, userId));
    if (!currentUser) throw new Error('User not found');

    const todayDateStr = formatInTimezone(new Date(), currentUser.timezone || 'UTC');

    // 1. Fetch all commitments involving the user
    const commitments = await db
      .select()
      .from(schema.commitments)
      .where(or(eq(schema.commitments.creatorId, userId), eq(schema.commitments.partnerId, userId)))
      .orderBy(desc(schema.commitments.createdAt));

    const activeList = [];
    const pendingInvites = [];
    const completedOrFailed = [];

    let totalSuccessfulDays = 0;
    let highestStreak = 0;

    for (const c of commitments) {
      const isCreator = c.creatorId === userId;
      highestStreak = Math.max(highestStreak, c.longestStreak, c.currentStreak);

      const [rule] = await db
        .select()
        .from(schema.commitmentRules)
        .where(eq(schema.commitmentRules.commitmentId, c.id));

      const [otherUser] = await db
        .select({ id: schema.users.id, username: schema.users.username, displayName: schema.users.displayName })
        .from(schema.users)
        .where(eq(schema.users.id, isCreator ? c.partnerId : c.creatorId));

      if (c.status === 'PENDING_ACCEPTANCE') {
        pendingInvites.push({
          ...c,
          rule,
          isCreator,
          partner: isCreator ? otherUser : null,
          creator: isCreator ? null : otherUser,
        });
      } else if (c.status === 'ACTIVE') {
        // Fetch today's commitment day
        let [todayDay] = await db
          .select()
          .from(schema.commitmentDays)
          .where(and(eq(schema.commitmentDays.commitmentId, c.id), eq(schema.commitmentDays.periodKey, todayDateStr)));

        // If not today (e.g. contract starts tomorrow or in future), fetch the first upcoming period
        if (!todayDay) {
          const [upcomingDay] = await db
            .select()
            .from(schema.commitmentDays)
            .where(
              and(
                eq(schema.commitmentDays.commitmentId, c.id),
                gte(schema.commitmentDays.periodKey, todayDateStr)
              )
            )
            .orderBy(schema.commitmentDays.periodStart)
            .limit(1);
          todayDay = upcomingDay;
        }

        // Count successful days for this commitment
        const completedDays = await db
          .select()
          .from(schema.commitmentDays)
          .where(and(eq(schema.commitmentDays.commitmentId, c.id), eq(schema.commitmentDays.status, 'COMPLETED')));

        totalSuccessfulDays += completedDays.length;

        activeList.push({
          ...c,
          rule,
          isCreator,
          partner: otherUser,
          todayProgress: todayDay || null,
          successfulDaysCount: completedDays.length,
        });
      } else {
        completedOrFailed.push({
          ...c,
          rule,
          isCreator,
          partner: otherUser,
        });
      }
    }

    // Unread/recent notifications
    const recentNotifications = await db
      .select()
      .from(schema.notificationEvents)
      .where(eq(schema.notificationEvents.userId, userId))
      .orderBy(desc(schema.notificationEvents.createdAt))
      .limit(10);

    return {
      todayDate: todayDateStr,
      userTimezone: currentUser.timezone,
      stats: {
        activeCount: activeList.length,
        pendingInvitesCount: pendingInvites.filter((p) => !p.isCreator).length,
        highestStreak,
        totalSuccessfulDays,
      },
      activeCommitments: activeList,
      pendingInvitations: pendingInvites,
      recentHistory: completedOrFailed.slice(0, 5),
      recentNotifications: recentNotifications.map((n: any) => ({
        ...n,
        payload: JSON.parse(n.payload || '{}'),
      })),
    };
  }
}
