/**
 * Timezone and period calculation utilities for the commitment engine.
 * Ensures local calendar days in any IANA timezone are accurately translated to UTC timestamps.
 */

export interface PeriodInfo {
  periodKey: string;
  periodStart: number; // Unix epoch seconds
  periodEnd: number;   // Unix epoch seconds
  evaluationAt: number; // Unix epoch seconds
}

/**
 * Formats a Date object to YYYY-MM-DD string in a specific timezone.
 */
export function formatInTimezone(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

/**
 * Calculates start, end, and evaluation UTC timestamps for a given calendar day (YYYY-MM-DD) in a timezone.
 */
export function getDailyPeriodInfo(
  dateStr: string, // YYYY-MM-DD
  timezone: string,
  cutoffTime: string = '00:00',
  evaluationDelayMinutes: number = 60
): PeriodInfo {
  // Parse cutoff hour and minute (defaults to 00:00)
  const [cutoffH, cutoffM] = cutoffTime.split(':').map(Number);
  const [year, month, day] = dateStr.split('-').map(Number);

  // We determine local day boundary in UTC
  // To avoid DST glitches, construct local midnight using Date.UTC offsets
  // Local start of day:
  const localStart = new Date(`${dateStr}T00:00:00`);
  // Use Intl to get accurate UTC offset for the given timezone at that local time
  const utcDate = new Date(localStart.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(localStart.toLocaleString('en-US', { timeZone: timezone }));
  const offsetMs = utcDate.getTime() - tzDate.getTime();

  const periodStartMs = new Date(Date.UTC(year, month - 1, day, cutoffH || 0, cutoffM || 0, 0)).getTime() + offsetMs;
  // Day duration is 24 hours (86400 seconds)
  const periodEndMs = periodStartMs + 24 * 60 * 60 * 1000;
  const evaluationAtMs = periodEndMs + evaluationDelayMinutes * 60 * 1000;

  return {
    periodKey: dateStr,
    periodStart: Math.floor(periodStartMs / 1000),
    periodEnd: Math.floor(periodEndMs / 1000),
    evaluationAt: Math.floor(evaluationAtMs / 1000),
  };
}

/**
 * Generates all period records between startDate and endDate (inclusive) for a commitment.
 */
export function generatePeriods(
  startDate: string, // YYYY-MM-DD
  endDate: string,   // YYYY-MM-DD
  timezone: string,
  frequency: 'DAILY' | 'WEEKLY' = 'DAILY',
  cutoffTime: string = '00:00',
  evaluationDelayMinutes: number = 60
): PeriodInfo[] {
  const periods: PeriodInfo[] = [];
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

  let current = new Date(Date.UTC(startYear, startMonth - 1, startDay));
  const end = new Date(Date.UTC(endYear, endMonth - 1, endDay));

  while (current <= end) {
    const y = current.getUTCFullYear();
    const m = String(current.getUTCMonth() + 1).padStart(2, '0');
    const d = String(current.getUTCDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    periods.push(getDailyPeriodInfo(dateStr, timezone, cutoffTime, evaluationDelayMinutes));

    // Next day
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return periods;
}

/**
 * Returns current timestamp in UTC seconds
 */
export function nowUtc(): number {
  return Math.floor(Date.now() / 1000);
}
