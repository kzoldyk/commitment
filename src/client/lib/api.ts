export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  timezone: string;
  status: string;
}

export interface CommitmentRule {
  id: string;
  commitmentId: string;
  frequencyType: 'DAILY' | 'WEEKLY';
  targetValue: number;
  targetUnit: string;
  cutoffTime: string;
  evaluationDelayMinutes: number;
  initialLives: number;
  maxLives: number;
  failureLives: number;
  stakeAmount: number;
  stakeCurrency: string;
  restoreEnabled: boolean;
  restoreAfterSuccessDays: number;
  restoreLives: number;
  proofType: string;
}

export interface CommitmentDay {
  id: string;
  commitmentId: string;
  periodKey: string;
  periodStart: number;
  periodEnd: number;
  evaluationAt: number;
  targetValue: number;
  completedValue: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED' | 'GRACE' | 'DISPUTED';
  proofStatus: 'NONE' | 'SUBMITTED' | 'VERIFIED';
  evaluatedAt?: number | null;
  failureReason?: string | null;
  proofs?: Proof[];
}

export interface Proof {
  id: string;
  commitmentDayId: string;
  type: string;
  value: number;
  metadata: string | null;
  submittedBy: string;
  submittedAt: number;
  status: string;
}

export interface LifeTransaction {
  id: string;
  commitmentId: string;
  amount: number;
  type: 'INITIAL' | 'FAILURE' | 'RESTORE' | 'MANUAL_ADJUSTMENT';
  reason: string;
  createdAt: number;
}

export interface Commitment {
  id: string;
  creatorId: string;
  partnerId: string;
  title: string;
  description?: string;
  status: 'DRAFT' | 'PENDING_ACCEPTANCE' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
  startDate: string;
  endDate: string;
  timezone: string;
  currentLives: number;
  currentStreak: number;
  longestStreak: number;
  accumulatedPenalty: number;
  createdAt: number;
  rule?: CommitmentRule;
  creator?: { id: string; username: string; displayName: string };
  partner?: { id: string; username: string; displayName: string };
  days?: CommitmentDay[];
  transactions?: LifeTransaction[];
  isCreator?: boolean;
  todayProgress?: CommitmentDay | null;
  successfulDaysCount?: number;
}

export interface DashboardData {
  todayDate: string;
  userTimezone: string;
  stats: {
    activeCount: number;
    pendingInvitesCount: number;
    highestStreak: number;
    totalSuccessfulDays: number;
  };
  activeCommitments: Commitment[];
  pendingInvitations: Commitment[];
  recentHistory: Commitment[];
  recentNotifications: any[];
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  const data: any = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Request failed');
  }
  return data as T;
}

export const api = {
  // Auth
  register: (body: { username: string; email: string; password: string; displayName?: string; timezone?: string }) =>
    request<{ user: User }>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { username: string; password: string }) =>
    request<{ user: User }>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  logout: () =>
    request<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),

  getMe: () =>
    request<{ user: User | null }>('/api/auth/me'),

  // Dashboard
  getDashboard: () =>
    request<DashboardData>('/api/dashboard'),

  // Commitments
  createCommitment: (body: any) =>
    request<{ commitment: Commitment }>('/api/commitments', { method: 'POST', body: JSON.stringify(body) }),

  getCommitments: () =>
    request<{ commitments: Commitment[] }>('/api/commitments'),

  getCommitment: (id: string) =>
    request<{ commitment: Commitment }>(`/api/commitments/${id}`),

  updateCommitment: (id: string, body: any) =>
    request<{ commitment: Commitment }>(`/api/commitments/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  acceptCommitment: (id: string) =>
    request<{ commitment: Commitment }>(`/api/commitments/${id}/accept`, { method: 'POST' }),

  declineCommitment: (id: string) =>
    request<{ success: boolean }>(`/api/commitments/${id}/decline`, { method: 'POST' }),

  cancelCommitment: (id: string) =>
    request<{ success: boolean }>(`/api/commitments/${id}/cancel`, { method: 'POST' }),

  submitProof: (commitmentId: string, dayId: string, value: number, note?: string) =>
    request<{ success: boolean; completedValue: number; isCompleted: boolean }>(
      `/api/commitments/${commitmentId}/days/${dayId}/proof`,
      { method: 'POST', body: JSON.stringify({ value, note }) }
    ),

  // Users
  searchPartners: (q: string) =>
    request<{ users: { id: string; username: string; displayName: string }[] }>(`/api/users/search?q=${encodeURIComponent(q)}`),

  getPreferences: () =>
    request<{ preferences: any }>('/api/users/preferences'),

  updatePreferences: (body: any) =>
    request<{ preferences: any }>('/api/users/preferences', { method: 'PATCH', body: JSON.stringify(body) }),

  updateProfile: (body: any) =>
    request<{ user: User }>('/api/users/profile', { method: 'PATCH', body: JSON.stringify(body) }),

  triggerEvaluation: () =>
    request<{ success: boolean; result: any }>('/api/cron/evaluate', { method: 'POST' }),
};
