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
    <div className="relative min-h-[calc(100vh-3rem)] flex flex-col justify-between overflow-hidden bg-[#f7f8f9] dark:bg-[#0d0e12] text-[#111827] dark:text-[#f2f3f5] transition-colors duration-200">
      {/* Background Architectural Grid & Subtle Radial Highlights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-neutral-200/40 dark:bg-white/[0.02] blur-[140px] -z-10 pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10 opacity-30" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-24">
        {/* ================= HERO SECTION: EDITORIAL SPLIT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pb-20 border-b border-neutral-200 dark:border-white/[0.08]">
          {/* Left Column: Editorial Value Proposition */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-xs text-neutral-600 dark:text-[#8a8f98] shadow-xs backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Accountability covenant engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#111827] dark:text-[#f2f3f5] leading-[1.1]">
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

          {/* Right Column: Live Interactive Contract Simulator (T5.1) */}
          <div className="lg:col-span-6 w-full">
            <MacWindow
              title="Contract Simulator"
              showTrafficLights={true}
              icon={<Sparkles size={14} className="text-amber-500" />}
              rightAction={
                <span className="text-[10px] font-mono text-neutral-500">Interactive Sandbox</span>
              }
            >
              <div className="space-y-5">
                {/* Simulator Controls */}
                <div className="space-y-3 p-3.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-neutral-700 dark:text-neutral-300">
                      1. Select commitment discipline
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">Tap to test</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {(['leetcode', 'running', 'reading', 'writing'] as const).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setSimPreset(key);
                          handleSimReset();
                        }}
                        className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer text-center ${
                          simPreset === key
                            ? 'bg-[#111827] text-white dark:bg-white/[0.1] dark:text-[#f2f3f5] border border-neutral-900 dark:border-white/20 shadow-xs'
                            : 'bg-white dark:bg-white/[0.02] text-neutral-600 dark:text-[#8a8f98] border border-neutral-200 dark:border-white/[0.06] hover:text-[#111827] dark:hover:text-[#f2f3f5] hover:border-neutral-300 dark:hover:border-white/[0.12]'
                        }`}
                      >
                        {key === 'leetcode' ? 'LeetCode' : key.charAt(0).toUpperCase() + key.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Simulator Parameters */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-200 dark:border-white/[0.06]">
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-600 dark:text-[#8a8f98] mb-1">
                        Initial lives: <strong className="text-[#111827] dark:text-[#f2f3f5]">{simInitialLives}</strong>
                      </label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => {
                              setSimInitialLives(num);
                              setSimCurrentLives(num);
                              setSimDebt(0);
                            }}
                            className={`px-2.5 py-0.5 rounded text-xs font-mono font-medium cursor-pointer ${
                              simInitialLives === num
                                ? 'bg-[#111827] text-white dark:bg-white dark:text-[#0d0e12]'
                                : 'bg-white dark:bg-white/[0.04] text-neutral-600 dark:text-[#8a8f98] border border-neutral-200 dark:border-white/[0.06] hover:text-[#111827] dark:hover:text-[#f2f3f5]'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-neutral-600 dark:text-[#8a8f98] mb-1">
                        Penalty stake per miss:
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const next = simStakeAmount === 250 ? 500 : simStakeAmount === 500 ? 1000 : 250;
                          setSimStakeAmount(next);
                          setSimDebt(0);
                        }}
                        className="px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-xs font-mono font-medium text-amber-600 dark:text-amber-300 cursor-pointer hover:bg-amber-500/20 transition-colors"
                      >
                        ₹{simStakeAmount} / miss
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Real-Time Contract Preview */}
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] space-y-3.5 shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                        Live contract terms
                      </span>
                      <h3 className="text-sm font-semibold text-[#111827] dark:text-[#f2f3f5] mt-1">
                        {presets[simPreset].title}
                      </h3>
                    </div>
                    <StreakBadge streak={14} size="sm" />
                  </div>

                  {/* Vitals in simulator */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/[0.06]">
                    <div>
                      <span className="text-[11px] text-neutral-500 dark:text-[#8a8f98] font-mono block mb-1">Contract lives</span>
                      <LivesIndicator currentLives={simCurrentLives} maxLives={simInitialLives} size="sm" />
                      {simCurrentLives === 0 && (
                        <span className="text-[11px] text-rose-500 dark:text-rose-400 font-semibold block mt-1">
                          Contract terminated
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[11px] text-neutral-500 dark:text-[#8a8f98] font-mono block mb-1">Debt owed to witness</span>
                      <span
                        className={`text-base font-mono font-bold ${
                          simDebt > 0 ? 'text-rose-500 dark:text-rose-400' : 'text-[#111827] dark:text-[#f2f3f5]'
                        }`}
                      >
                        ₹{simDebt.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Rule Logic Statements */}
                  <div className="text-xs font-mono space-y-1.5 text-neutral-600 dark:text-[#8a8f98] pt-1">
                    <p className="flex items-center gap-1.5">
                      <span className="text-neutral-400 dark:text-white/40">→</span>
                      <span>Target: {presets[simPreset].target} before 00:00 midnight local cutoff.</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="text-neutral-400 dark:text-white/40">→</span>
                      <span>
                        Miss cutoff: deduct 1 life and add +₹{simStakeAmount} to partner debt counter.
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="text-emerald-600 dark:text-emerald-400">→</span>
                      <span>Maintain 5 consecutive days to restore +1 life (capped at {simInitialLives}).</span>
                    </p>
                  </div>
                </div>

                {/* Simulator Actions */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSimMiss}
                    disabled={simCurrentLives === 0}
                    className="mac-btn-primary !px-3.5 !py-1.5 !rounded-md !text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <AlertTriangle size={13} />
                    <span>Test a missed cutoff</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimReset}
                    className="mac-btn-secondary !px-3 !py-1.5 !rounded-md !text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Reset simulator</span>
                  </button>
                </div>
              </div>
            </MacWindow>
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
