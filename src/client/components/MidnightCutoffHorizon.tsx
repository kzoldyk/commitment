import React, { useState, useEffect } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Coins,
  ChevronRight,
  Flame,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react';
import { Slow } from '@lucasmarkes/hairline/react';
import { Commitment, CommitmentDay } from '../lib/api';

interface MidnightCutoffHorizonProps {
  commitments: Commitment[];
  todayDate: string;
  userTimezone: string;
  onOpenProofModal?: (day: CommitmentDay, commitment: Commitment) => void;
  onTriggerEvaluation?: () => void;
  isEvaluating?: boolean;
}

export const MidnightCutoffHorizon: React.FC<MidnightCutoffHorizonProps> = ({
  commitments,
  todayDate,
  userTimezone,
  onOpenProofModal,
  onTriggerEvaluation,
  isEvaluating = false,
}) => {
  // Live ticking countdown to local midnight
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [slowReadout, setSlowReadout] = useState<string>('rest');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Target midnight tonight
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);

      const diffMs = midnight.getTime() - now.getTime();
      if (diffMs > 0) {
        const totalSeconds = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        setTimeLeft({ hours, minutes, seconds });

        // Calculate fraction of day passed (0 to 100%)
        const secondsInDay = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        setProgressPercent(Math.min(100, Math.round((secondsInDay / 86400) * 100)));
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setProgressPercent(100);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute status for today across all active commitments
  const evaluatedToday = commitments.map((c) => {
    const todayDay = c.days?.find((d) => (d as any).date === todayDate || d.periodKey === todayDate);
    const isCompleted = todayDay?.status === 'COMPLETED';
    const isPending = !todayDay || todayDay.status === 'PENDING' || todayDay.status === 'IN_PROGRESS';
    return {
      commitment: c,
      todayDay,
      isCompleted,
      isPending,
    };
  });

  const totalActive = commitments.length;
  const completedCount = evaluatedToday.filter((e) => e.isCompleted).length;
  const pendingCount = evaluatedToday.filter((e) => e.isPending).length;

  // Financial risk tonight: sum of penalty stakes for all uncompleted commitments
  const stakeAtRiskTonight = evaluatedToday
    .filter((e) => e.isPending)
    .reduce((sum, e) => sum + (e.commitment.rule?.stakeAmount || (e.commitment as any).stakeAmount || 0), 0);

  // Check if cutoff is in danger zone (< 3 hours)
  const isUrgent = timeLeft.hours < 3 && pendingCount > 0;
  const allSecured = totalActive > 0 && pendingCount === 0;

  return (
    <div className="w-full rounded-3xl bg-white/95 dark:bg-[#0c0d12]/95 border border-neutral-200 dark:border-white/[0.08] shadow-sm dark:shadow-[0_20px_48px_-12px_rgba(0,0,0,0.7)] backdrop-blur-2xl transition-all duration-200 overflow-hidden select-none">
      {/* Top Protocol Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-neutral-200/80 dark:border-white/[0.06] bg-neutral-50/70 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-neutral-900 dark:bg-white/[0.08] text-amber-400 border border-neutral-800 dark:border-white/[0.1] flex items-center justify-center shadow-xs">
            <Clock size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
                Midnight Cutoff Horizon
              </h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                  allSecured
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : isUrgent
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 animate-pulse'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    allSecured ? 'bg-emerald-500' : isUrgent ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                />
                <span>
                  {allSecured
                    ? 'All Covenants Shielded'
                    : isUrgent
                    ? 'Critical Cutoff Imminent'
                    : 'Evaluator Active'}
                </span>
              </span>
            </div>
            <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              Zone: <strong className="text-neutral-700 dark:text-neutral-300 font-medium">{userTimezone || 'Local'}</strong> · Next Daemon Run: 00:00:00
            </p>
          </div>
        </div>

        {/* Evaluation Control Trigger */}
        <div className="flex items-center gap-2">
          {onTriggerEvaluation && (
            <button
              type="button"
              onClick={onTriggerEvaluation}
              disabled={isEvaluating}
              className="px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-white/[0.08] transition-all cursor-pointer shadow-xs disabled:opacity-50"
              title="Test evaluate closed cutoff periods"
            >
              <RefreshCw size={12} className={isEvaluating ? 'animate-spin text-amber-400' : ''} />
              <span>{isEvaluating ? 'Checking...' : 'Check Cutoffs'}</span>
            </button>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-black/60 border border-neutral-200 dark:border-white/[0.08] text-xs font-mono text-neutral-700 dark:text-neutral-300">
            <span className="text-[10px] text-neutral-400 uppercase">Rate</span>
            <span className="font-semibold">{slowReadout}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Ticking Horizon Counter on Left + Hairline "Slow" Instrument on Right */}
      <div className="p-6 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Live Ticking Countdown & Day Horizon */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {/* Large Live Countdown Digits */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 block">
              Time Remaining Until Midnight Cutoff
            </span>

            <div className="flex items-baseline gap-2">
              <span
                className={`text-4xl sm:text-5xl font-mono font-bold tracking-tight tabular-nums ${
                  isUrgent
                    ? 'text-rose-500 dark:text-rose-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                    : allSecured
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-neutral-900 dark:text-white'
                }`}
              >
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                (T-minus to verdict)
              </span>
            </div>

            {/* Daily Cycle Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-white/[0.06] overflow-hidden p-0.5 border border-neutral-200/80 dark:border-white/[0.06]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    allSecured
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : isUrgent
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                <span>00:00 (Day start)</span>
                <span>{progressPercent}% of cycle elapsed</span>
                <span>24:00 (Evaluation cutoff)</span>
              </div>
            </div>
          </div>

          {/* Vitals & Exposure Telemetry Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-neutral-100/70 dark:bg-black/40 border border-neutral-200/80 dark:border-white/[0.06]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block mb-1">
                Secured Today
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {completedCount}/{totalActive}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">covenants</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-100/70 dark:bg-black/40 border border-neutral-200/80 dark:border-white/[0.06]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block mb-1">
                Pending Proof
              </span>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-xl font-mono font-bold tabular-nums ${
                    pendingCount > 0 ? 'text-amber-500' : 'text-neutral-400'
                  }`}
                >
                  {pendingCount}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">due tonight</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-100/70 dark:bg-black/40 border border-neutral-200/80 dark:border-white/[0.06] col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block mb-1">
                Stake at Risk Tonight
              </span>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-xl font-mono font-bold tabular-nums ${
                    stakeAtRiskTonight > 0 ? 'text-rose-500 dark:text-rose-400' : 'text-neutral-900 dark:text-white'
                  }`}
                >
                  ₹{stakeAtRiskTonight.toLocaleString()}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">partner debt</span>
              </div>
            </div>
          </div>

          {/* Actionable Prompt based on state */}
          <div className="text-xs font-mono pt-1">
            {allSecured ? (
              <p className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>All covenants verified for today. No lives or stakes at risk tonight.</span>
              </p>
            ) : pendingCount > 0 ? (
              <p className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle size={14} className="shrink-0" />
                <span>
                  {pendingCount} {pendingCount === 1 ? 'contract needs' : 'contracts need'} verified proof before 00:00 to prevent life loss.
                </span>
              </p>
            ) : (
              <p className="text-neutral-500 dark:text-neutral-400">
                Create an accountability covenant to activate midnight cutoff monitoring.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Isometric Hairline "Slow" Instrument */}
        <div className="lg:col-span-5 w-full">
          <div className="rounded-2xl bg-neutral-100/80 dark:bg-[#07080b] border border-neutral-200 dark:border-white/[0.08] shadow-inner p-4 sm:p-5 flex flex-col items-center justify-center group/slow relative">
            <div className="w-full flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-white/[0.05] text-[10px] font-mono text-neutral-400">
              <span>TIME DILATION CHRONO</span>
              <span className="font-semibold text-neutral-700 dark:text-white">HOVER TO DILATE CLOCK</span>
            </div>

            {/* Hairline Slow Component: crates on a belt through a gate */}
            <div className="w-full max-w-[280px] sm:max-w-[320px] aspect-[5/4] relative flex items-center justify-center my-2">
              <Slow
                play
                intensity={0.7}
                onRead={setSlowReadout}
                aria-label="Crates riding a belt through a gate representing time dilation toward midnight"
                className="w-full h-auto cursor-crosshair transition-transform duration-300 group-hover/slow:scale-[1.02]"
              />
            </div>

            <p className="w-full text-center text-[11px] font-mono text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-200/60 dark:border-white/[0.05]">
              Slow instrument — hovering slows the conveyor clock before the midnight gate
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Pending Contracts Quick-Action Drawer (if any pending) */}
      {pendingCount > 0 && onOpenProofModal && (
        <div className="px-6 py-4 border-t border-neutral-200/80 dark:border-white/[0.06] bg-amber-500/[0.04] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-mono font-medium text-amber-800 dark:text-amber-300">
              Pending Today: {evaluatedToday.filter((e) => e.isPending).map((e) => e.commitment.title).join(', ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {evaluatedToday
              .filter((e) => e.isPending && e.todayDay)
              .map((e) => (
                <button
                  key={e.commitment.id}
                  type="button"
                  onClick={() => onOpenProofModal(e.todayDay!, e.commitment)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black transition-all cursor-pointer shadow-xs"
                >
                  <span>Submit Proof: {e.commitment.title.slice(0, 18)}...</span>
                  <ArrowUpRight size={13} />
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
