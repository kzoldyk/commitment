import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Flame,
  Shield,
  Coins,
  CheckCircle2,
  Users,
  Clock,
  Sparkles,
  LayoutDashboard,
  Plus,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { MacWindow } from '../components/MacWindow';
import { LivesIndicator } from '../components/LivesIndicator';
import { StreakBadge } from '../components/StreakBadge';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  // Interactive Contract Simulator State
  const [simPreset, setSimPreset] = useState<'leetcode' | 'running' | 'reading' | 'writing'>('leetcode');
  const [simInitialLives, setSimInitialLives] = useState(3);
  const [simCurrentLives, setSimCurrentLives] = useState(3);
  const [simStakeAmount, setSimStakeAmount] = useState(500);
  const [simStakeEnabled, setSimStakeEnabled] = useState(true);
  const [simDebt, setSimDebt] = useState(0);
  const [simMissedCount, setSimMissedCount] = useState(0);

  const presets = {
    leetcode: { title: 'Solve 2 LeetCode problems', target: '2 problems', cadence: 'Daily' },
    running: { title: 'Run 5 kilometers', target: '5 km', cadence: 'Daily' },
    reading: { title: 'Read 20 pages', target: '20 pages', cadence: 'Daily' },
    writing: { title: 'Write 500 words of engineering notes', target: '500 words', cadence: 'Daily' },
  };

  const handleSimMiss = () => {
    if (simCurrentLives > 0) {
      setSimCurrentLives((prev) => Math.max(0, prev - 1));
      if (simStakeEnabled) {
        setSimDebt((prev) => prev + simStakeAmount);
      }
      setSimMissedCount((prev) => prev + 1);
    }
  };

  const handleSimReset = () => {
    setSimCurrentLives(simInitialLives);
    setSimDebt(0);
    setSimMissedCount(0);
  };

  return (
    <div className="relative min-h-[calc(100vh-3rem)] flex flex-col justify-between overflow-hidden bg-[#f7f8f9] dark:bg-[#07080b] text-[#111827] dark:text-[#f9fafb] transition-colors duration-200">
      {/* Background Architectural Grid & Subtle Radial Atmospheric Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-[140px] -z-10 pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10 opacity-30" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-24">
        {/* ================= HERO SECTION: EDITORIAL SPLIT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pb-20 border-b border-neutral-200 dark:border-white/[0.08]">
          {/* Left Column: Editorial Value Proposition */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-xs text-neutral-600 dark:text-[#8a8f98] shadow-xs backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <span>Accountability covenant engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#111827] dark:text-[#f9fafb] leading-[1.1]">
              <span className="sr-only">commitment</span>Commitment: Promises broken in private. Sealed and kept in public.
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 dark:text-[#8a8f98] max-w-xl leading-relaxed">
              Most habit trackers fail because nothing happens when you quietly give up.
              Commitment binds your execution to a witnessed pact with finite lives, midnight local cutoffs, and real financial stakes.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="mac-btn-primary px-5 py-2.5 rounded-md font-medium text-sm flex items-center gap-2"
                  >
                    <LayoutDashboard size={15} />
                    <span>Go to dashboard</span>
                    <ArrowRight size={15} />
                  </Link>
                  <Link
                    to="/create"
                    className="mac-btn-secondary px-5 py-2.5 rounded-md font-medium text-sm flex items-center gap-2"
                  >
                    <Plus size={15} className="text-neutral-500 dark:text-[#8a8f98]" />
                    <span>New contract</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="mac-btn-primary px-6 py-2.5 rounded-md font-medium text-sm flex items-center gap-2"
                  >
                    <span>Create contract</span>
                    <ArrowRight size={15} />
                  </Link>
                  <Link
                    to="/login"
                    className="mac-btn-secondary px-6 py-2.5 rounded-md font-medium text-sm flex items-center gap-2"
                  >
                    <span>Sign in to dashboard</span>
                  </Link>
                </>
              )}
            </div>

            {/* Trust Signal Pillars */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-neutral-200 dark:border-white/10 text-xs font-mono text-neutral-500 dark:text-neutral-400">
              <div>
                <span className="font-bold text-neutral-900 dark:text-white block font-sans text-sm">Finite lives</span>
                <span>Terminates at 0</span>
              </div>
              <div>
                <span className="font-bold text-neutral-900 dark:text-white block font-sans text-sm">Midnight cutoff</span>
                <span>Automated evaluation</span>
              </div>
              <div>
                <span className="font-bold text-neutral-900 dark:text-white block font-sans text-sm">Real stakes</span>
                <span>Debt owed to witness</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Contract Simulator (Antigravity Glassmorphism) */}
          <div className="lg:col-span-6 w-full">
            <div className="antigravity-capsule rounded-3xl p-6 sm:p-7 relative overflow-hidden select-none">
              {/* Internal ambient illumination spot */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-gradient-to-b from-blue-500/15 via-indigo-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />

              {/* Capsule Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-white/[0.06] relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.25)]">
                    <Sparkles size={13} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-[#111827] dark:text-[#f9fafb]">
                      Contract Simulator
                    </h3>
                    <p className="text-[10px] font-mono text-neutral-400 dark:text-[#626670]">
                      Interactive Enforcement Sandbox
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/[0.06] text-[10px] font-mono text-neutral-500 dark:text-[#8a8f98]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                  <span>Real-time engine</span>
                </div>
              </div>

              <div className="space-y-6 pt-5 relative z-10">
                {/* 1. Discipline Segmented Control (Fluid Segment, No Heavy Double Boxing) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-400">
                      1. Select Commitment Discipline
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      Tap discipline to test
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 rounded-xl bg-black/40 border border-white/[0.06]">
                    {(['leetcode', 'running', 'reading', 'writing'] as const).map((key) => {
                      const isSelected = simPreset === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setSimPreset(key);
                            handleSimReset();
                          }}
                          className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer text-center ${
                            isSelected
                              ? 'bg-white/[0.12] text-white border border-white/[0.14] shadow-sm font-semibold'
                              : 'text-neutral-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                          }`}
                        >
                          {key === 'leetcode' ? 'LeetCode' : key.charAt(0).toUpperCase() + key.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Parameters (Lives & Penalty Stake) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-y border-white/[0.05]">
                  <div>
                    <span className="block text-[11px] font-mono text-neutral-400 mb-1.5">
                      Initial lives: <strong className="text-white font-semibold">{simInitialLives}</strong>
                    </span>
                    <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-black/40 border border-white/[0.06]">
                      {[1, 2, 3, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setSimInitialLives(num);
                            setSimCurrentLives(num);
                            setSimDebt(0);
                          }}
                          className={`w-7 h-6 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer flex items-center justify-center ${
                            simInitialLives === num
                              ? 'bg-white/[0.15] text-white shadow-xs border border-white/[0.15]'
                              : 'text-neutral-500 hover:text-white'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-mono text-neutral-400 mb-1.5">
                      Penalty stake per miss:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = simStakeAmount === 250 ? 500 : simStakeAmount === 500 ? 1000 : 250;
                        setSimStakeAmount(next);
                        setSimDebt(0);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs font-mono font-medium text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer shadow-[0_0_8px_rgba(245,158,11,0.15)]"
                    >
                      <Coins size={12} />
                      <span>₹{simStakeAmount} / miss ▾</span>
                    </button>
                  </div>
                </div>

                {/* 3. Live Real-Time Contract Preview (Integrated Fluid Glass) */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                        Live Covenant Terms
                      </span>
                      <h4 className="text-base font-semibold text-[#111827] dark:text-[#f9fafb] mt-0.5 tracking-tight">
                        {presets[simPreset].title}
                      </h4>
                    </div>
                    <StreakBadge streak={14} size="sm" />
                  </div>

                  {/* Vitals Telemetry Row */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-black/40 border border-white/[0.05]">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block mb-1">
                        Contract Vitality
                      </span>
                      <LivesIndicator currentLives={simCurrentLives} maxLives={simInitialLives} size="sm" />
                      {simCurrentLives === 0 && (
                        <span className="text-[10px] font-mono text-rose-400 font-semibold block mt-1">
                          ✖ Covenant Terminated
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block mb-0.5">
                        Witness Debt Counter
                      </span>
                      <span
                        className={`text-xl font-mono font-bold tabular-nums tracking-tight ${
                          simDebt > 0
                            ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                            : 'text-[#111827] dark:text-[#f9fafb]'
                        }`}
                      >
                        ₹{simDebt.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Rule Logic Telemetry Lines */}
                  <div className="text-[11px] font-mono space-y-1.5 text-neutral-400 pt-1">
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400/60 shrink-0" />
                      <span>Target: <strong className="text-neutral-200 font-medium">{presets[simPreset].target}</strong> before 00:00 midnight cutoff.</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400/60 shrink-0" />
                      <span>Miss cutoff: deduct 1 life & accumulate +₹{simStakeAmount} partner debt.</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 shrink-0" />
                      <span>Streak 5 consecutive days to restore +1 life (cap: {simInitialLives}).</span>
                    </p>
                  </div>
                </div>

                {/* 4. Action Buttons (Laser Cut Plasma Pill & Glass Capsule) */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSimMiss}
                    disabled={simCurrentLives === 0}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/35 shadow-[0_0_14px_rgba(244,63,94,0.25)] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <AlertTriangle size={13} className="text-rose-400" />
                    <span>Test Missed Cutoff</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimReset}
                    className="px-3.5 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white border border-white/[0.06]"
                  >
                    <RotateCcw size={12} />
                    <span>Reset Simulator</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= EDITORIAL MANIFESTO SECTION (T5.2) ================= */}
        <div className="py-24 max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              The architecture of follow-through
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Solo resolutions versus witnessed pacts
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Why 92% of personal resolutions evaporate by February, and how deterministic contracts change your psychology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Solo Resolutions Card */}
            <div className="p-6 sm:p-8 rounded-2xl border border-black/[0.08] dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-500">
                  Solo resolution
                </span>
                <span className="text-xs font-mono text-rose-500">Fragile willpower</span>
              </div>

              <h3 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
                Made in secret, broken in silence.
              </h3>

              <ul className="space-y-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Zero real consequence:</strong> When you skip a day, no alarm sounds and no one notices.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Silent rationalization:</strong> "I worked hard today, I'll do double tomorrow." Tomorrow never arrives.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Passive tracking apps:</strong> Graphs that turn gray without penalizing abandonment.</span>
                </li>
              </ul>
            </div>

            {/* Witnessed Pact Card */}
            <div className="p-6 sm:p-8 rounded-2xl border border-[#c81e28]/30 dark:border-[#c81e28]/40 bg-rose-50/20 dark:bg-[#c81e28]/5 backdrop-blur-md space-y-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#c81e28]">
                  Witnessed pact
                </span>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                  Deterministic system
                </span>
              </div>

              <h3 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
                Written in code, enforced by schedule.
              </h3>

              <ul className="space-y-3 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                  <span><strong>Designated witness:</strong> A real peer with full visibility into every proof submission.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                  <span><strong>Finite life system:</strong> Miss midnight cutoff and lose a life. Reach zero and the pact terminates.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                  <span><strong>Real skin in the game:</strong> Automatic financial debt ledger payable directly to your partner.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ================= 3 CORE PILLARS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto text-left pt-6">
          <MacWindow title="Finite lives" icon={<Shield size={14} className="text-rose-500" />}>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-1.5">Finite contract lives</h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Every contract holds 1 to 5 lives. Miss a daily cutoff and you lose a life. Reach zero and your contract terminates in irreversible failure.
            </p>
          </MacWindow>

          <MacWindow title="Witness verification" icon={<Users size={14} className="text-amber-500" />}>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-1.5">No self-approval</h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Your designated witness must accept the pact. They receive instant notifications when you miss, keeping you honest.
            </p>
          </MacWindow>

          <MacWindow title="Automated cutoff engine" icon={<Clock size={14} className="text-emerald-500" />}>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-1.5">Automated timezone evaluation</h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              No manual verification required. Scheduled background workers evaluate deadlines against your local timezone automatically.
            </p>
          </MacWindow>
        </div>
      </main>

      <footer className="w-full border-t border-neutral-200 dark:border-white/10 py-6 text-center text-xs text-neutral-500 font-mono">
        Commitment © 2026. A promise with consequences.
      </footer>
    </div>
  );
};
