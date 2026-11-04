import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Flame,
  Heart,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  ArrowLeft,
  PlusCircle,
  Check,
  X,
  History,
  Coins,
  Calendar,
  User,
  RotateCcw,
} from 'lucide-react';
import { api, Commitment, CommitmentDay } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { LivesIndicator } from '../components/LivesIndicator';
import { StreakBadge } from '../components/StreakBadge';
import { CalendarHeatmap } from '../components/CalendarHeatmap';
import { ProofModal } from '../components/ProofModal';
import { MacWindow } from '../components/MacWindow';
import { ConfirmModal } from '../components/ConfirmModal';
import { ActivityLogFeed } from '../components/ActivityLogFeed';

export const CommitmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [commitment, setCommitment] = useState<Commitment | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected Day for Proof Modal
  const [selectedDay, setSelectedDay] = useState<CommitmentDay | null>(null);

  // Date Filter Sync between CalendarHeatmap and ActivityLogFeed
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

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

  const loadCommitment = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.getCommitment(id);
      setCommitment(res.commitment);
    } catch (err: any) {
      setError(err.message || 'Failed to load commitment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommitment();
  }, [id]);

  const handleAccept = async () => {
    if (!id || accepting) return;
    try {
      setAccepting(true);
      await api.acceptCommitment(id);
      await loadCommitment();
    } catch (err: any) {
      setConfirmModal({
        isOpen: true,
        title: 'Acceptance failed',
        message: err.message || 'Failed to accept commitment',
        isAlert: true,
        confirmText: 'Dismiss',
        onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
      await loadCommitment();
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = () => {
    if (!id) return;
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
          navigate('/dashboard');
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

  const handleCancel = () => {
    if (!id) return;
    setConfirmModal({
      isOpen: true,
      title: 'Cancel commitment',
      message: 'Are you sure you want to cancel this commitment?',
      confirmText: 'Cancel contract',
      isDestructive: true,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await api.cancelCommitment(id);
          loadCommitment();
        } catch (err: any) {
          setConfirmModal({
            isOpen: true,
            title: 'Cancellation failed',
            message: err.message || 'Failed to cancel commitment',
            isAlert: true,
            confirmText: 'Dismiss',
            onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
          });
        }
      },
    });
  };

  if (loading && !commitment) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
        <div className="h-4 w-32 bg-neutral-200 dark:bg-white/[0.06] rounded" />
        <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.02] p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-white/[0.06]" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-1/3 bg-neutral-200 dark:bg-white/[0.06] rounded" />
              <div className="h-3 w-1/2 bg-neutral-200 dark:bg-white/[0.06] rounded" />
            </div>
            <div className="h-6 w-20 bg-neutral-200 dark:bg-white/[0.06] rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !commitment) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <MacWindow title="Error">
          <div className="py-8 text-center space-y-3">
            <AlertTriangle size={36} className="text-rose-500 mx-auto" />
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Contract unavailable</h2>
            <p className="text-xs text-neutral-500 font-mono">{error || 'Commitment not found'}</p>
            <div className="pt-3">
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 inline-block shadow-xs"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        </MacWindow>
      </div>
    );
  }

  const isPartner = commitment.partnerId === user?.id;
  const isCreator = commitment.creatorId === user?.id;
  const isPending = commitment.status === 'PENDING_ACCEPTANCE';
  const isActive = commitment.status === 'ACTIVE';

  const currencySymbol =
    commitment.rule?.stakeCurrency === 'INR'
      ? '₹'
      : commitment.rule?.stakeCurrency === 'USD'
      ? '$'
      : commitment.rule?.stakeCurrency === 'EUR'
      ? '€'
      : commitment.rule?.stakeCurrency === 'GBP'
      ? '£'
      : commitment.rule?.stakeCurrency || '₹';
  const stakeAmount = commitment.rule?.stakeAmount || 0;
  const accumulatedPenalty = commitment.accumulatedPenalty || 0;

  // Identify today's commitment day
  const todayKey = new Date().toISOString().split('T')[0];
  const todayDay =
    commitment.days?.find((d) => d.periodKey === todayKey) ||
    commitment.days?.find((d) => d.status === 'IN_PROGRESS' || d.status === 'PENDING');

  const completedDaysCount = commitment.days?.filter((d) => d.status === 'COMPLETED').length || 0;
  const totalDaysCount = commitment.days?.length || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Breadcrumb & Status Bar (Linear Style) */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-600 dark:text-[#8a8f98] hover:text-[#111827] dark:hover:text-[#f2f3f5] transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Contracts</span>
          </Link>
          <span className="text-xs text-neutral-400 dark:text-white/30 font-mono">/</span>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider ${
              isActive
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : isPending
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                : 'bg-neutral-100 dark:bg-white/[0.08] text-neutral-600 dark:text-[#8a8f98]'
            }`}
          >
            {commitment.status}
          </span>
        </div>

        {isCreator && (isPending || isActive) && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-2.5 py-1 rounded-md border border-neutral-200 dark:border-white/[0.08] text-neutral-600 dark:text-[#8a8f98] hover:text-rose-500 hover:bg-rose-500/10 text-xs font-mono cursor-pointer transition-colors"
          >
            Cancel contract
          </button>
        )}
      </div>

      {/* Contract Title & Description Header (Linear Unboxed Style) */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-medium text-[#111827] dark:text-[#f9fafb] tracking-tight">
          {commitment.title}
        </h1>
        {commitment.description && (
          <p className="text-sm text-neutral-600 dark:text-[#8a8f98] font-sans leading-relaxed max-w-3xl pt-1">
            {commitment.description}
          </p>
        )}
        <p className="text-[11px] font-mono text-neutral-400 dark:text-[#626670] pt-0.5">
          Period: {commitment.startDate} → {commitment.endDate} · Cutoff: Midnight ({commitment.timezone})
        </p>
      </div>

      {/* Pending Invitation Alert for Partner */}
      {isPending && isPartner && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-sm text-[#111827] dark:text-[#f2f3f5]">Accountability Invitation</h4>
              <p className="text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mt-0.5">
                @{commitment.creator?.username} has designated you as their accountability partner.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleAccept}
                disabled={accepting}
                className="mac-btn-primary !text-xs !py-1.5 !px-3 font-mono cursor-pointer"
              >
                <Check size={13} />
                <span>{accepting ? 'Accepting...' : 'Accept contract'}</span>
              </button>
              <button
                type="button"
                onClick={handleDecline}
                className="mac-btn-secondary !text-xs !py-1.5 !px-3 font-mono cursor-pointer"
              >
                <span>Decline</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Invitation Edit for Creator */}
      {isPending && isCreator && (
        <EditPendingModal commitment={commitment} onSuccess={loadCommitment} />
      )}

      {/* ================= TWO-COLUMN LINEAR INSPECTOR ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* MAIN COLUMN (8 cols): Today's Session, Heatmap Matrix & Activity Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {/* Quick-Log Session if active */}
          {isCreator && isActive && todayDay && (
            <div className="rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white/90 dark:bg-[#121318]/80 backdrop-blur-xl p-5 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-mono text-neutral-500 dark:text-[#8a8f98]">
                    Today's Session ({todayDay.periodKey})
                  </span>
                  <div className="text-base font-semibold font-mono text-[#111827] dark:text-[#f9fafb] tabular-nums">
                    {todayDay.completedValue} / {todayDay.targetValue} {commitment.rule?.targetUnit}
                  </div>
                </div>
                <span
                  className={`text-xs font-mono px-2.5 py-1 rounded-full font-semibold ${
                    todayDay.status === 'COMPLETED'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {todayDay.status === 'COMPLETED' ? 'Done ✓' : 'In Progress'}
                </span>
              </div>

              <div className="w-full h-1 bg-neutral-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    todayDay.status === 'COMPLETED' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-amber-500 dark:bg-amber-400'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.round((todayDay.completedValue / (todayDay.targetValue || 1)) * 100))}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-neutral-500 dark:text-[#8a8f98] font-mono">
                  {todayDay.status === 'COMPLETED'
                    ? 'Target completed for today.'
                    : 'Submit proof before midnight cutoff to protect lives.'}
                </p>

                <button
                  type="button"
                  onClick={() => setSelectedDay(todayDay)}
                  className="mac-btn-primary !text-xs !py-1.5 !px-3 font-medium cursor-pointer"
                >
                  <PlusCircle size={13} />
                  <span>Log today's evidence</span>
                </button>
              </div>
            </div>
          )}

          {/* Daily Accountability Heatmap Matrix */}
          {commitment.days && commitment.days.length > 0 && (
            <div className="rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white/90 dark:bg-[#121318]/80 backdrop-blur-xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-emerald-500 dark:text-emerald-400" />
                  <h3 className="text-sm font-semibold text-[#111827] dark:text-[#f9fafb]">Daily Heatmap Matrix</h3>
                </div>
                {selectedDateFilter && (
                  <button
                    type="button"
                    onClick={() => setSelectedDateFilter(null)}
                    className="text-xs font-mono text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={11} />
                    <span>Clear filter ({selectedDateFilter})</span>
                  </button>
                )}
              </div>

              <CalendarHeatmap
                days={commitment.days}
                targetUnit={commitment.rule?.targetUnit || ''}
                selectedDate={selectedDateFilter}
                variant="full"
                showLegend={true}
                onDateClick={(dateStr) => {
                  setSelectedDateFilter(selectedDateFilter === dateStr ? null : dateStr);
                }}
                onSelectDay={(day) => {
                  if (day.status === 'IN_PROGRESS' && isCreator) {
                    setSelectedDay(day);
                  }
                }}
                onClearDateFilter={() => setSelectedDateFilter(null)}
              />
            </div>
          )}

          {/* Activity Timeline (Exact Linear Style) */}
          <div className="rounded-xl border border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={14} className="text-neutral-500 dark:text-[#8a8f98]" />
                <h3 className="text-sm font-semibold text-[#111827] dark:text-[#f2f3f5]">Activity</h3>
              </div>
              <span className="text-[11px] font-mono text-neutral-400 dark:text-[#626670]">Verified timeline</span>
            </div>

            <ActivityLogFeed
              days={commitment.days || []}
              targetUnit={commitment.rule?.targetUnit || ''}
              filteredDate={selectedDateFilter}
              onClearDateFilter={() => setSelectedDateFilter(null)}
              onOpenProofModal={(day) => setSelectedDay(day)}
            />
          </div>
        </div>

        {/* SIDEBAR PROPERTIES INSPECTOR (4 cols - Linear Style) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white/90 dark:bg-[#121318]/80 backdrop-blur-xl p-5 space-y-3.5 shadow-sm">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-[#8a8f98] font-semibold pb-2 border-b border-neutral-200 dark:border-white/[0.05]">
              Properties
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between py-1 border-b border-neutral-200/60 dark:border-white/[0.04]">
                <span className="text-neutral-500 dark:text-[#8a8f98]">Witness</span>
                <span className="text-[#111827] dark:text-[#f9fafb] font-medium">
                  @{commitment.partner?.username}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-neutral-200/60 dark:border-white/[0.04]">
                <span className="text-neutral-500 dark:text-[#8a8f98]">Creator</span>
                <span className="text-[#111827] dark:text-[#f9fafb] font-medium">
                  @{commitment.creator?.username}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-neutral-200/60 dark:border-white/[0.04]">
                <span className="text-neutral-500 dark:text-[#626670]">Health</span>
                <LivesIndicator
                  currentLives={commitment.currentLives}
                  maxLives={commitment.rule?.maxLives || 3}
                  size="sm"
                />
              </div>

              <div className="flex items-center justify-between py-1 border-b border-neutral-200/60 dark:border-white/[0.04]">
                <span className="text-neutral-500 dark:text-[#626670]">Current Streak</span>
                <StreakBadge streak={commitment.currentStreak} size="sm" />
              </div>

              <div className="flex items-center justify-between py-1 border-b border-neutral-200/60 dark:border-white/[0.04]">
                <span className="text-neutral-500 dark:text-[#626670]">Daily Target</span>
                <span className="text-[#111827] dark:text-[#f2f3f5] font-semibold">
                  {commitment.rule?.targetValue} {commitment.rule?.targetUnit}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-neutral-200/60 dark:border-white/[0.04]">
                <span className="text-neutral-500 dark:text-[#626670]">Frequency</span>
                <span className="text-[#111827] dark:text-[#f2f3f5] font-medium">
                  {commitment.rule?.frequencyType || 'DAILY'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-neutral-200/60 dark:border-white/[0.04]">
                <span className="text-neutral-500 dark:text-[#626670]">Completion</span>
                <span className="text-[#111827] dark:text-[#f2f3f5] font-medium tabular-nums">
                  {completedDaysCount}/{totalDaysCount}d ({totalDaysCount > 0 ? Math.round((completedDaysCount / totalDaysCount) * 100) : 0}%)
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-neutral-200/60 dark:border-white/[0.04]">
                <span className="text-neutral-500 dark:text-[#626670]">Cutoff</span>
                <span className="text-[#111827] dark:text-[#f2f3f5] font-medium">
                  Midnight ({commitment.timezone})
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-neutral-200/60 dark:border-white/[0.04]">
                <span className="text-neutral-500 dark:text-[#626670]">Penalty</span>
                <span className="text-rose-500 dark:text-rose-400 font-semibold">
                  -{commitment.rule?.failureLives || 1} Life/miss
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-neutral-200/60 dark:border-white/[0.04]">
                <span className="text-neutral-500 dark:text-[#626670]">Restoration</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  +{commitment.rule?.restoreLives || 1} Life/{commitment.rule?.restoreAfterSuccessDays || 7}d
                </span>
              </div>

              {stakeAmount > 0 && (
                <>
                  <div className="flex items-center justify-between py-1 border-b border-neutral-200/60 dark:border-white/[0.04]">
                    <span className="text-neutral-500 dark:text-[#626670]">Stake Rate</span>
                    <span className="font-semibold text-[#111827] dark:text-[#f2f3f5]">
                      {currencySymbol}{stakeAmount}/miss
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-neutral-500 dark:text-[#626670]">Debt Owed</span>
                    <span
                      className={`font-bold tabular-nums ${
                        accumulatedPenalty > 0 ? 'text-rose-500 dark:text-rose-400' : 'text-[#111827] dark:text-[#f2f3f5]'
                      }`}
                    >
                      {currencySymbol}{accumulatedPenalty.toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Proof Modal */}
      {selectedDay && (
        <ProofModal
          isOpen={true}
          onClose={() => setSelectedDay(null)}
          day={commitment.days?.find((d) => d.id === selectedDay.id) || selectedDay}
          commitmentId={commitment.id}
          commitmentTitle={commitment.title}
          targetUnit={commitment.rule?.targetUnit || ''}
          isCreator={isCreator}
          onSuccess={loadCommitment}
        />
      )}

      {/* Non-blocking in-app confirmation modal */}
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

const EditPendingModal: React.FC<{ commitment: Commitment; onSuccess: () => void }> = ({
  commitment,
  onSuccess,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(commitment.title);
  const [partnerUsername, setPartnerUsername] = useState(commitment.partner?.username || '');
  const [targetValue, setTargetValue] = useState(String(commitment.rule?.targetValue || 1));
  const [targetUnit, setTargetUnit] = useState(commitment.rule?.targetUnit || 'problems');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerUsername.trim()) {
      setError('Please provide a partner username or email');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await api.updateCommitment(commitment.id, {
        title: title.trim(),
        partnerUsername: partnerUsername.trim(),
        targetValue: parseFloat(targetValue) || 1,
        targetUnit: targetUnit.trim(),
      });
      setIsOpen(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update contract');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-amber-600 dark:text-amber-500">
            Contract awaiting acceptance
          </h4>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans mt-0.5">
            Sent to <strong className="text-neutral-900 dark:text-neutral-200">@{commitment.partner?.username}</strong>. You can change the partner or edit rules before they accept.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white cursor-pointer"
        >
          <span>Edit / change partner</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-[#131418] p-6 shadow-2xl text-[#111827] dark:text-[#f2f3f5] space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-base text-[#111827] dark:text-[#f2f3f5] tracking-tight">Edit pending covenant</h3>
            <p className="text-xs text-neutral-500 dark:text-[#8a8f98] font-mono mt-0.5">
              Update parameters or reassign partner
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-neutral-400 dark:text-[#8a8f98] hover:text-[#111827] dark:hover:text-[#f2f3f5] p-1 rounded cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-rose-500 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1">
              Contract title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md px-3.5 py-2 text-xs text-[#111827] dark:text-[#f2f3f5] placeholder:text-neutral-400 dark:placeholder:text-[#626670] focus:outline-none focus:border-neutral-400 dark:focus:border-white/30"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1">
              Accountability partner (username or email)
            </label>
            <input
              type="text"
              required
              value={partnerUsername}
              onChange={(e) => setPartnerUsername(e.target.value)}
              className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md px-3.5 py-2 text-xs text-[#111827] dark:text-[#f2f3f5] font-mono placeholder:text-neutral-400 dark:placeholder:text-[#626670] focus:outline-none focus:border-neutral-400 dark:focus:border-white/30"
              placeholder="username (e.g. rahul) or email (e.g. friend@gmail.com)"
            />
            <span className="text-[10px] text-neutral-400 dark:text-[#626670] font-mono mt-1 block">
              If changed, a new contract invitation email will be dispatched.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1">
                Target value
              </label>
              <input
                type="number"
                step="any"
                min="0.1"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md px-3.5 py-2 text-xs text-[#111827] dark:text-[#f2f3f5] font-mono focus:outline-none focus:border-neutral-400 dark:focus:border-white/30"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1">
                Target unit
              </label>
              <input
                type="text"
                required
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md px-3.5 py-2 text-xs text-[#111827] dark:text-[#f2f3f5] font-mono focus:outline-none focus:border-neutral-400 dark:focus:border-white/30"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mac-btn-secondary !text-xs !py-1.5 !px-3.5 !rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="mac-btn-primary !text-xs !py-1.5 !px-4 !rounded-md font-medium disabled:opacity-50"
            >
              <span>{saving ? 'Saving...' : 'Save changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
