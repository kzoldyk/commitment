import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Flame,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Shield,
  ChevronRight,
  Check,
  X,
  RefreshCw,
  Coins,
  Trash2,
  Calendar as CalendarIcon,
  Activity,
  Layers,
} from 'lucide-react';
import { api, DashboardData, Commitment, CommitmentDay } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { LivesIndicator } from '../components/LivesIndicator';
import { StreakBadge } from '../components/StreakBadge';
import { ProofModal } from '../components/ProofModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { MidnightCutoffHorizon } from '../components/MidnightCutoffHorizon';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [evalMessage, setEvalMessage] = useState<string | null>(null);

  // In-App Non-Blocking Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    isAlert?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Proof Modal state
  const [selectedProofDay, setSelectedProofDay] = useState<{ day: CommitmentDay; commitment: Commitment } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await api.acceptCommitment(id);
      setData((prev) => {
        if (!prev) return prev;
        const accepted = prev.pendingInvitations.find((p) => p.id === id);
        return {
          ...prev,
          pendingInvitations: prev.pendingInvitations.filter((p) => p.id !== id),
          activeCommitments: accepted ? [{ ...accepted, status: 'ACTIVE' }, ...prev.activeCommitments] : prev.activeCommitments,
        };
      });
      await loadData();
    } catch (err: any) {
      setConfirmModal({
        isOpen: true,
        title: 'Acceptance failed',
        message: err.message || 'Failed to accept commitment',
        isAlert: true,
        confirmText: 'Dismiss',
        onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
    }
  };

  const handleDecline = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Decline commitment',
      message: 'Are you sure you want to decline this accountability contract?',
      confirmText: 'Decline contract',
      isDestructive: true,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await api.declineCommitment(id);
          loadData();
        } catch (err: any) {
          setConfirmModal({
            isOpen: true,
            title: 'Decline failed',
            message: err.message || 'Failed to decline commitment',
            isAlert: true,
            confirmText: 'Dismiss',
            onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
          });
        }
      },
    });
  };

  const handleCancelPending = (id: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Cancel pending contract',
      message: `Are you sure you want to cancel and delete the pending contract "${title}"?`,
      confirmText: 'Cancel contract',
      isDestructive: true,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await api.cancelCommitment(id);
          loadData();
        } catch (err: any) {
          setConfirmModal({
            isOpen: true,
            title: 'Deletion failed',
            message: err.message || 'Failed to delete pending contract',
            isAlert: true,
            confirmText: 'Dismiss',
            onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
          });
        }
      },
    });
  };

  const handleRunEvaluation = async () => {
    try {
      setEvaluating(true);
      const res = await api.triggerEvaluation();
      setEvalMessage(`Evaluation completed: ${res.result.evaluatedDays} days evaluated (${res.result.successes} successes, ${res.result.failures} failures, ${res.result.restorations} restorations)`);
      setTimeout(() => setEvalMessage(null), 6000);
      loadData();
    } catch (err: any) {
      setConfirmModal({
        isOpen: true,
        title: 'Evaluation failed',
        message: err.message || 'Failed to run evaluation',
        isAlert: true,
        confirmText: 'Dismiss',
        onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
    } finally {
      setEvaluating(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-pulse">
        {/* Top Header Bar Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-6">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-neutral-200 dark:bg-white/[0.06] rounded-lg" />
            <div className="h-4 w-48 bg-neutral-200 dark:bg-white/[0.06] rounded-md" />
          </div>
          <div className="flex gap-3">
            <div className="h-9 w-28 bg-neutral-200 dark:bg-white/[0.06] rounded-xl" />
            <div className="h-9 w-32 bg-neutral-200 dark:bg-white/[0.06] rounded-xl" />
          </div>
        </div>

        {/* Stats Summary Bar Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.02] h-24 flex flex-col justify-between">
              <div className="h-3 w-16 bg-neutral-200 dark:bg-white/[0.06] rounded" />
              <div className="h-7 w-20 bg-neutral-200 dark:bg-white/[0.06] rounded" />
            </div>
          ))}
        </div>

        {/* Contracts List Skeleton */}
        <div className="space-y-4">
          <div className="h-5 w-40 bg-neutral-200 dark:bg-white/[0.06] rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.02] h-64 space-y-4">
                <div className="h-5 w-3/4 bg-neutral-200 dark:bg-white/[0.06] rounded" />
                <div className="h-4 w-1/2 bg-neutral-200 dark:bg-white/[0.06] rounded" />
                <div className="h-20 w-full bg-neutral-200 dark:bg-white/[0.06] rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pendingIncoming = data?.pendingInvitations.filter((p) => !p.isCreator) || [];
  const pendingSent = data?.pendingInvitations.filter((p) => p.isCreator) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-12 space-y-7 relative">
      {/* Top Subtle Ambient Glow Halo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-32 bg-gradient-to-b from-indigo-500/[0.07] via-white/[0.01] to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-white/[0.06] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-medium text-[#111827] dark:text-[#f9fafb] tracking-tight">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.displayName || user?.username}.
          </h1>
          <p className="text-xs text-neutral-500 dark:text-[#8a8f98] font-mono mt-1 flex flex-wrap items-center gap-2">
            <span>Account: <strong className="text-[#111827] dark:text-[#f9fafb] font-medium">@{user?.username}</strong></span>
            <span>·</span>
            <span>Date: <strong className="text-[#111827] dark:text-[#f9fafb] font-medium">{data?.todayDate}</strong></span>
            <span>·</span>
            <span>Zone: <strong className="text-[#111827] dark:text-[#f9fafb] font-medium">{data?.userTimezone}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRunEvaluation}
            disabled={evaluating}
            className="mac-btn-secondary !text-xs !py-1.5 !px-3 font-mono cursor-pointer"
            title="Trigger scheduled evaluation check for closed periods"
          >
            <RefreshCw size={13} className={evaluating ? 'animate-spin text-amber-500' : 'text-neutral-400 dark:text-[#626670]'} />
            <span>{evaluating ? 'Evaluating...' : 'Run evaluation'}</span>
          </button>

          <Link
            to="/create"
            className="mac-btn-primary !text-xs !py-1.5 !px-3.5 font-medium cursor-pointer shadow-sm"
          >
            <Plus size={14} />
            <span>New contract</span>
          </Link>
        </div>
      </div>

      {evalMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-mono flex items-center justify-between animate-in fade-in shadow-xs">
          <span>{evalMessage}</span>
          <button onClick={() => setEvalMessage(null)} className="text-emerald-600 dark:text-emerald-400 hover:opacity-75 cursor-pointer">✕</button>
        </div>
      )}

      {/* Unified Telemetry KPI Instrument Panel (No double-boxing or heavy cards) */}
      <div className="antigravity-capsule grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06] p-1.5 shadow-xl">
        <div className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-[#8a8f98] block mb-1">
            Active Contracts
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-semibold font-mono text-[#111827] dark:text-[#f9fafb] tabular-nums tracking-tight">
              {data?.stats.activeCount || 0}
            </span>
            <span className="text-[11px] font-mono text-emerald-400">Live</span>
          </div>
        </div>

        <div className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-[#8a8f98] block mb-1">
            Highest Streak
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-semibold font-mono text-amber-500 dark:text-amber-300 tabular-nums tracking-tight">
              {data?.stats.highestStreak || 0}
            </span>
            <Flame size={18} className="text-amber-400 fill-amber-400/20 icon-3d" />
          </div>
        </div>

        <div className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-[#8a8f98] block mb-1">
            Successful Days
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-semibold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
              {data?.stats.totalSuccessfulDays || 0}
            </span>
            <CheckCircle2 size={18} className="text-emerald-400 icon-3d" />
          </div>
        </div>

        <div className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-[#8a8f98] block mb-1">
            Pending Invites
          </span>
          <span className="text-2xl sm:text-3xl font-semibold font-mono text-neutral-500 dark:text-[#8a8f98] tabular-nums tracking-tight">
            {data?.stats.pendingInvitesCount || 0}
          </span>
        </div>
      </div>

      {/* Midnight Cutoff Horizon Instrument */}
      <MidnightCutoffHorizon
        commitments={data?.activeCommitments || []}
        todayDate={data?.todayDate || ''}
        userTimezone={data?.userTimezone || ''}
        onOpenProofModal={(day, commitment) => setSelectedProofDay({ day, commitment })}
        onTriggerEvaluation={handleRunEvaluation}
        isEvaluating={evaluating}
      />

      {/* Incoming Requests Section (if any) */}
      {pendingIncoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-amber-500 dark:text-amber-400 flex items-center gap-2 font-mono uppercase tracking-wider">
            <AlertTriangle size={13} />
            <span>Incoming Accountability Requests ({pendingIncoming.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingIncoming.map((invite) => (
              <div
                key={invite.id}
                className="rounded-xl border border-amber-500/30 bg-amber-500/[0.03] p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[11px] font-mono text-neutral-500 dark:text-[#8a8f98]">
                      Invitation from <strong className="text-[#111827] dark:text-[#f2f3f5] font-medium">@{invite.creator?.username}</strong>
                    </span>
                    <h3 className="text-sm font-semibold text-[#111827] dark:text-[#f2f3f5]">{invite.title}</h3>
                    <p className="text-xs text-neutral-500 dark:text-[#8a8f98] font-mono">
                      Target: {invite.rule?.targetValue} {invite.rule?.targetUnit} · {invite.currentLives} Lives
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-white/[0.04] text-neutral-600 dark:text-[#8a8f98] border border-neutral-200 dark:border-white/[0.06]">
                    {invite.rule?.frequencyType || 'DAILY'}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 pt-3 border-t border-neutral-200 dark:border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => handleAccept(invite.id)}
                    className="mac-btn-primary !text-xs !py-1.5 !flex-1 font-medium cursor-pointer"
                  >
                    <Check size={13} />
                    <span>Accept contract</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecline(invite.id)}
                    className="mac-btn-secondary !text-xs !py-1.5 !px-3.5 font-medium cursor-pointer"
                  >
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Contracts Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-neutral-600 dark:text-[#8a8f98]">
            Active Contracts ({data?.activeCommitments.length || 0})
          </h2>
          <span className="text-[11px] font-mono text-neutral-400 dark:text-[#626670]">
            Click any contract to inspect full heatmap & evidence logs
          </span>
        </div>

        {data?.activeCommitments.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-12 text-center">
            <ShieldCheck size={36} className="text-neutral-400 dark:text-[#626670] mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#111827] dark:text-[#f2f3f5] mb-1">No active commitments</h3>
            <p className="text-xs text-neutral-500 dark:text-[#8a8f98] max-w-sm mx-auto mb-5 font-mono">
              Forge a witnessed accountability covenant with finite lives and midnight cutoffs.
            </p>
            <Link
              to="/create"
              className="mac-btn-primary !py-2 !px-4 text-xs font-semibold"
            >
              <Plus size={14} />
              <span>Forge first covenant</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.activeCommitments.map((c) => {
              const today = c.todayProgress;
              const isTodayCompleted = today?.status === 'COMPLETED';
              const completedVal = today?.completedValue || 0;
              const targetVal = c.rule?.targetValue || 1;
              const progressPct = Math.min(100, Math.round((completedVal / targetVal) * 100));
              const isFuture = Boolean(data?.todayDate && today?.periodKey && today.periodKey > data.todayDate);
              const progressLabel = isFuture
                ? `Starts ${today?.periodKey} (Day 1)`
                : `Today's Progress (${today?.periodKey || data?.todayDate})`;

              return (
                <div
                  key={c.id}
                  className="group antigravity-capsule p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between gap-4.5 hover:border-white/[0.18]"
                >
                  {/* Card Header: Status Glyph, Title & Partner Pill */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isTodayCompleted
                              ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]'
                              : 'border border-amber-400/80 bg-amber-400/20 shadow-[0_0_8px_rgba(245,158,11,0.4)] animate-pulse'
                          }`}
                        />
                        <Link
                          to={`/commitments/${c.id}`}
                          className="text-sm sm:text-base font-semibold tracking-tight text-[#111827] dark:text-[#f9fafb] hover:text-emerald-400 truncate transition-colors"
                        >
                          {c.title}
                        </Link>
                      </div>
                      <p className="text-[11px] font-mono text-neutral-500 dark:text-[#8a8f98] pl-4">
                        {c.rule?.frequencyType || 'DAILY'} · Target: {c.rule?.targetValue} {c.rule?.targetUnit}
                      </p>
                    </div>

                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-white/[0.04] text-neutral-400 border border-white/[0.06] shrink-0">
                      {c.isCreator ? `@${c.partner?.username}` : `@${c.creator?.username}`}
                    </span>
                  </div>

                  {/* Middle: Integrated Progress Track (No double-boxing or heavy inner borders) */}
                  <div className="space-y-2 py-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-400">
                        {progressLabel}
                      </span>
                      <span className={`font-semibold tabular-nums ${isTodayCompleted ? 'text-emerald-400' : completedVal > 0 ? 'text-amber-400' : 'text-neutral-400'}`}>
                        {completedVal} / {targetVal} {c.rule?.targetUnit} {isTodayCompleted && '(Done ✓)'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isTodayCompleted
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                            : completedVal > 0
                            ? 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                            : 'bg-neutral-300 dark:bg-white/[0.1]'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    {isFuture && (
                      <p className="text-[10px] font-mono text-neutral-500 pt-0.5">
                        Contract begins on {today?.periodKey}. No penalty will be evaluated today.
                      </p>
                    )}
                  </div>

                  {/* Metrics: Lives, Streak & Stake */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-3">
                      <LivesIndicator currentLives={c.currentLives} maxLives={c.rule?.maxLives || 3} size="sm" />
                      <div className="w-px h-3.5 bg-neutral-200 dark:bg-white/[0.08]" />
                      <StreakBadge streak={c.currentStreak} size="sm" />
                      {Boolean(c.rule?.stakeAmount && c.rule.stakeAmount > 0) && (
                        <>
                          <div className="w-px h-3.5 bg-neutral-200 dark:bg-white/[0.08]" />
                          <span className="text-[11px] font-mono text-neutral-400">
                            {c.rule?.stakeCurrency === 'INR' ? '₹' : c.rule?.stakeCurrency}{c.rule?.stakeAmount}/miss
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Footer: Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-white/[0.06]">
                    <Link
                      to={`/commitments/${c.id}`}
                      className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <span>Inspect covenant</span>
                      <ChevronRight size={13} />
                    </Link>

                    {c.isCreator && today && !isFuture && !isTodayCompleted && (
                      <button
                        type="button"
                        onClick={() => setSelectedProofDay({ day: today, commitment: c })}
                        className="mac-btn-primary !text-xs !py-1 !px-3 font-medium cursor-pointer"
                      >
                        <CheckCircle2 size={12} />
                        <span>Log progress</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Outgoing Awaiting Acceptance */}
      {pendingSent.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-neutral-200 dark:border-white/[0.06]">
          <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-neutral-600 dark:text-[#8a8f98]">
            Awaiting Partner Acceptance ({pendingSent.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pendingSent.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-[#111827] dark:text-[#f2f3f5] truncate">{p.title}</h4>
                    <p className="text-[11px] font-mono text-neutral-500 dark:text-[#8a8f98] mt-0.5">
                      Waiting on <strong className="text-[#111827] dark:text-[#f2f3f5]">@{p.partner?.username}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCancelPending(p.id, p.title)}
                    className="text-neutral-400 dark:text-[#626670] hover:text-rose-500 transition-colors p-1 cursor-pointer"
                    title="Delete pending contract"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-white/[0.06] text-xs font-mono">
                  <Link
                    to={`/commitments/${p.id}`}
                    className="text-neutral-500 dark:text-[#8a8f98] hover:text-[#111827] dark:hover:text-[#f2f3f5] flex items-center gap-1 transition-colors"
                  >
                    <span>Inspect</span>
                    <ChevronRight size={12} />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleCancelPending(p.id, p.title)}
                    className="text-rose-500 dark:text-rose-400 hover:underline text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 size={12} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proof Modal */}
      {selectedProofDay && (
        <ProofModal
          isOpen={true}
          onClose={() => setSelectedProofDay(null)}
          day={selectedProofDay.day}
          commitmentId={selectedProofDay.commitment.id}
          commitmentTitle={selectedProofDay.commitment.title}
          targetUnit={selectedProofDay.commitment.rule?.targetUnit || ''}
          isCreator={selectedProofDay.commitment.isCreator}
          onSuccess={loadData}
        />
      )}

      {/* Non-blocking in-app confirmation & alert modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        isDestructive={confirmModal.isDestructive}
        isAlert={confirmModal.isAlert}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
