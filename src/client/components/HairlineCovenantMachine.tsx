import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  Shield,
  Coins,
  Lock,
  Smartphone,
  Check,
  UserCheck,
} from 'lucide-react';
import { Format, Vault, Branches, Terminal } from '@lucasmarkes/hairline/react';

interface StageMeta {
  id: number;
  short: string;
  title: string;
  tagline: string;
}

const STAGES: StageMeta[] = [
  {
    id: 0,
    short: '01 Forge',
    title: 'Set your daily rule & stake',
    tagline: 'Finite lives · Real collateral',
  },
  {
    id: 1,
    short: '02 Witness',
    title: 'Your friend holds the key',
    tagline: '@alex_witness holds escrow',
  },
  {
    id: 2,
    short: '03 Proof',
    title: 'Show up before midnight',
    tagline: '14-day streak · API verified',
  },
  {
    id: 3,
    short: '04 Cutoff',
    title: 'Midnight cutoff. No excuses.',
    tagline: 'Code enforces consequences',
  },
];

export const HairlineCovenantMachine: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [readout, setReadout] = useState<string>('rest');

  // Simulated covenant state
  const [currentLives, setCurrentLives] = useState<number>(3);
  const maxLives = 3;
  const stakePerMiss = 500;
  const [accumulatedDebt, setAccumulatedDebt] = useState<number>(0);
  const [discipline, setDiscipline] = useState<'leetcode' | 'running'>('leetcode');

  // Notification state
  const [notification, setNotification] = useState<{
    recipient: string;
    message: string;
    time: string;
  } | null>(null);

  const stageIntervalMs = 3200;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-cycle through the 4 stages smoothly
  useEffect(() => {
    if (isHovered) return;

    timerRef.current = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % STAGES.length);
      setReadout('rest');
    }, stageIntervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered]);

  const handleSelectStage = (idx: number) => {
    setActiveStage(idx);
    setReadout('rest');
  };

  const handleSimulateMiss = () => {
    const nextLives = Math.max(0, currentLives - 1);
    const nextDebt = accumulatedDebt + stakePerMiss;
    setCurrentLives(nextLives);
    setAccumulatedDebt(nextDebt);
    setActiveStage(3); // Jump to Cutoff stage
    setReadout('daemon: cutoff penalty');

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setNotification({
      recipient: '@alex_witness',
      message:
        nextLives === 0
          ? `Final life lost! Covenant terminated. ₹${nextDebt.toLocaleString()} sent to Alex.`
          : `Cutoff missed! 1 life lost (2/3 left). ₹${stakePerMiss} sent to Alex's UPI.`,
      time: now,
    });
  };

  const handleReset = () => {
    setCurrentLives(3);
    setAccumulatedDebt(0);
    setNotification(null);
    setActiveStage(0);
    setReadout('rest');
  };

  const current = STAGES[activeStage];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full max-w-lg mx-auto rounded-3xl bg-white/80 dark:bg-[#0c0d12]/80 backdrop-blur-2xl p-4 sm:p-5 select-none shadow-2xl shadow-neutral-900/5 dark:shadow-black/50 transition-all duration-200"
    >
      {/* 1. TOP PROGRESS TRACK (Border-Free) */}
      <div className="grid grid-cols-4 gap-2 pb-2.5">
        {STAGES.map((st, idx) => {
          const isActive = idx === activeStage;
          const isPassed = idx < activeStage;

          return (
            <button
              key={st.id}
              type="button"
              onClick={() => handleSelectStage(idx)}
              className="text-left group cursor-pointer focus:outline-hidden"
            >
              {/* Animated Progress Bar */}
              <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-white/[0.08] overflow-hidden mb-1">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-600 dark:bg-blue-400 w-full animate-pulse'
                      : isPassed
                      ? 'bg-emerald-500 w-full'
                      : 'w-0'
                  }`}
                />
              </div>

              {/* Step Title */}
              <span
                className={`text-[10px] font-mono block truncate transition-colors ${
                  isActive
                    ? 'text-neutral-900 dark:text-white font-bold'
                    : isPassed
                    ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                    : 'text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'
                }`}
              >
                {st.short}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. COMPACT STAGE HEADLINE (Light & Dark Optimized) */}
      <div className="flex items-center justify-between gap-3 pt-0.5 pb-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <span>{current.title}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {current.tagline}
          </p>
        </div>

        {/* Status pill */}
        <div className="shrink-0 px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-white/[0.05] text-[10px] font-mono text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>{readout !== 'rest' ? readout : isHovered ? 'Paused' : 'Step ' + (activeStage + 1) + '/4'}</span>
        </div>
      </div>

      {/* 3. VISUAL STAGE HERO (Visual-First, Minimal Text) */}
      <div className="relative rounded-2xl bg-neutral-100/70 dark:bg-white/[0.03] p-3.5 my-2 overflow-hidden flex items-center justify-between gap-4 min-h-[125px]">
        {/* Left: Highly Visual Components & Indicators */}
        <div className="flex-1 space-y-2 text-xs">
          {activeStage === 0 && (
            <div className="space-y-2 animate-in fade-in duration-150">
              {/* Habit selector buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDiscipline('leetcode')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    discipline === 'leetcode'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60'
                  }`}
                >
                  LeetCode (2/day)
                </button>
                <button
                  type="button"
                  onClick={() => setDiscipline('running')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    discipline === 'running'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60'
                  }`}
                >
                  5km Run
                </button>
              </div>

              {/* Stake & Lives Badges */}
              <div className="flex items-center gap-2 pt-0.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono text-xs font-semibold">
                  <Coins size={13} />
                  <span>₹{stakePerMiss} stake</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-400 font-mono text-xs font-semibold">
                  <span>❤️ 3 Lives</span>
                </div>
              </div>
            </div>
          )}

          {activeStage === 1 && (
            <div className="space-y-2 animate-in fade-in duration-150">
              {/* Partner Card */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/80 dark:bg-white/[0.06]">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                  AW
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-neutral-900 dark:text-white text-xs">@alex_witness</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                      Witness
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                    Holds the escrow key · Zero excuses
                  </span>
                </div>
              </div>

              {/* Active notifications pill */}
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 dark:text-neutral-400 pl-1">
                <Smartphone size={11} className="text-emerald-500" />
                <span>SMS & WhatsApp auto-alerts connected</span>
              </div>
            </div>
          )}

          {activeStage === 2 && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-900 dark:text-white">
                  <Flame size={14} className="text-amber-500 fill-amber-500" />
                  <span>14 Days Streak</span>
                </span>
                <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                  04h 18m until cutoff
                </span>
              </div>

              {/* Sparkline curve */}
              <div className="h-9 w-full flex items-end">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 160 32" fill="none">
                  <defs>
                    <linearGradient id="curveGradientLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 28 Q 30 24, 50 18 T 90 12 T 130 6 T 160 3 L 160 32 L 0 32 Z"
                    fill="url(#curveGradientLight)"
                  />
                  <path
                    d="M 0 28 Q 30 24, 50 18 T 90 12 T 130 6 T 160 3"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="160" cy="3" r="3.5" fill="#2563eb" className="animate-ping" />
                  <circle cx="160" cy="3" r="3" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
                </svg>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                <span>Verified via API</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Today: Checked In ✓</span>
              </div>
            </div>
          )}

          {activeStage === 3 && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                  <AlertTriangle size={13} />
                  <span>Automatic Consequence</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-500">Midnight 00:00</span>
              </div>

              {/* Penalty Pill Row */}
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 font-mono text-xs font-semibold">
                  💔 -1 Life
                </span>
                <span className="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 font-mono text-xs font-semibold">
                  💸 ₹500 Owed
                </span>
              </div>

              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                Daemon automatically sends penalty to Alex
              </p>
            </div>
          )}
        </div>

        {/* Right: Hairline Isometric Visualizer (Pointer interactive!) */}
        <div className="w-[105px] h-[105px] shrink-0 flex items-center justify-center relative">
          {activeStage === 0 && (
            <Format
              play
              intensity={0.65}
              onRead={setReadout}
              aria-label="Format engine aligning covenant rules"
              className="w-full h-full cursor-crosshair transition-transform duration-200 hover:scale-105"
            />
          )}
          {activeStage === 1 && (
            <Vault
              play
              intensity={0.7}
              onRead={setReadout}
              aria-label="Witness escrow vault combination dial"
              className="w-full h-full cursor-crosshair transition-transform duration-200 hover:scale-105"
            />
          )}
          {activeStage === 2 && (
            <Branches
              play
              intensity={0.65}
              onRead={setReadout}
              aria-label="Commit streak branches"
              className="w-full h-full cursor-crosshair transition-transform duration-200 hover:scale-105"
            />
          )}
          {activeStage === 3 && (
            <Terminal
              play
              intensity={0.65}
              onRead={setReadout}
              aria-label="Cutoff daemon evaluation log"
              className="w-full h-full cursor-crosshair transition-transform duration-200 hover:scale-105"
            />
          )}
        </div>
      </div>

      {/* 4. VITALS SUMMARY (Light Mode Clear & Crisp) */}
      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-neutral-100/70 dark:bg-white/[0.03] text-xs">
        <div>
          <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 block mb-1">
            Contract Vitality
          </span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: maxLives }).map((_, idx) => {
              const isAlive = idx < currentLives;
              return (
                <div
                  key={idx}
                  className={`h-2.5 w-7 rounded-full transition-all duration-300 ${
                    isAlive
                      ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                      : 'bg-neutral-300 dark:bg-white/[0.08]'
                  }`}
                />
              );
            })}
            <span className="text-[11px] font-mono font-medium text-neutral-700 dark:text-neutral-300 ms-1">
              {currentLives === 0 ? 'Failed' : `${currentLives}/3`}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 block mb-0.5">
            Witness Stake Debt
          </span>
          <div className="flex items-center justify-end gap-1">
            <span
              className={`text-sm font-mono font-bold tabular-nums ${
                accumulatedDebt > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-900 dark:text-white'
              }`}
            >
              ₹{accumulatedDebt.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              (₹{stakePerMiss}/miss)
            </span>
          </div>
        </div>
      </div>

      {/* 5. SIMULATED NOTIFICATION ALERT (Appears when missed cutoff is clicked) */}
      {notification && (
        <div className="mt-2 p-2.5 rounded-2xl bg-rose-500/10 text-rose-800 dark:text-rose-200 text-xs font-mono space-y-0.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[11px] font-bold text-rose-700 dark:text-rose-300">
            <span className="flex items-center gap-1.5">
              <Smartphone size={12} className="animate-bounce" />
              <span>SMS Dispatched to {notification.recipient}</span>
            </span>
            <span className="text-[10px] font-normal text-rose-500">{notification.time}</span>
          </div>
          <p className="text-[10px] text-rose-600 dark:text-rose-200 leading-snug">
            "{notification.message}"
          </p>
        </div>
      )}

      {/* 6. ACTION CONTROLS: ALWAYS IN VIEW (Light & Dark Friendly) */}
      <div className="flex items-center justify-between gap-2 pt-2.5">
        <button
          type="button"
          onClick={handleSimulateMiss}
          disabled={currentLives === 0}
          className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500/15 via-rose-500/20 to-amber-500/15 hover:from-rose-500/25 hover:to-amber-500/25 text-rose-700 dark:text-rose-300 transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <AlertTriangle size={13} className="text-rose-600 dark:text-rose-400" />
          <span>Simulate Missed Cutoff</span>
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="py-2 px-3 rounded-xl text-xs font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0"
          title="Reset simulation"
        >
          <RotateCcw size={12} />
        </button>
      </div>
    </div>
  );
};
