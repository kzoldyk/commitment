import React, { useState, useEffect } from 'react';
import {
  FileEdit,
  Lock,
  GitBranch,
  Terminal as TerminalIcon,
  Play,
  Pause,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Coins,
  Clock,
  Shield,
  Sparkles,
} from 'lucide-react';
import { Format, Vault, Branches, Terminal } from '@lucasmarkes/hairline/react';
import { LivesIndicator } from './LivesIndicator';
import { StreakBadge } from './StreakBadge';

interface CovenantStepInfo {
  step: number;
  id: 'forge' | 'seal' | 'execute' | 'verdict';
  shortTitle: string;
  name: string;
  badge: string;
  summary: string;
  actionText: string;
  telemetryDefault: string;
  figureCaption: string;
  highlightKey: string;
  highlightValue: string;
}

const STEPS: CovenantStepInfo[] = [
  {
    step: 1,
    id: 'forge',
    shortTitle: 'Forge Rules',
    name: 'Covenant Boundary Forge',
    badge: 'Step 01 · Pact Definition',
    summary: 'Define non-negotiable daily criteria, allocate 1–5 finite lives, and pledge penalty collateral.',
    actionText: 'Lock Parameters ➔',
    telemetryDefault: 'rules: 2 LeetCode · 3 lives · ₹500 stake',
    figureCaption: 'Format engine — drafting lines snap into rigid, immutable pact specifications',
    highlightKey: 'Parameters',
    highlightValue: '2 Problems / Day · ₹500 Stake',
  },
  {
    step: 2,
    id: 'seal',
    shortTitle: 'Witness Seal',
    name: 'Witness Escrow Vault',
    badge: 'Step 02 · Cryptographic Lock',
    summary: 'Designate a peer to hold the escrow keys. Eliminates self-forgiveness with direct debt routing.',
    actionText: 'Confirm Handshake ➔',
    telemetryDefault: 'witness: @alex_guardian · keys sealed',
    figureCaption: 'Vault dial — combination lock secures covenant with zero self-approval',
    highlightKey: 'Guardian',
    highlightValue: '@alex_guardian · Sealed',
  },
  {
    step: 3,
    id: 'execute',
    shortTitle: 'Daily Proof',
    name: 'Commit Tree & Streak Engine',
    badge: 'Step 03 · Execution Proof',
    summary: 'Submit proof before your local midnight cutoff. Automated API verification checks daily completion.',
    actionText: 'Submit Daily Proof ➔',
    telemetryDefault: 'branch: main@head · 14-day streak',
    figureCaption: 'Branches graph — commit nodes rise in real-time along your execution path',
    highlightKey: 'Adherence',
    highlightValue: '14 Days Verified · Asia/Kolkata',
  },
  {
    step: 4,
    id: 'verdict',
    shortTitle: 'Midnight Verdict',
    name: 'Autonomous Cutoff Daemon',
    badge: 'Step 04 · Scheduled Daemon',
    summary: 'At 00:00:00 local time, background workers evaluate results. Misses burn a life and post debt.',
    actionText: 'Trigger Midnight Cycle ➔',
    telemetryDefault: 'daemon: 00:00:00 · cron verdict ok',
    figureCaption: 'Terminal logs — scrolling evaluation audit recording immutable pass/fail outcomes',
    highlightKey: 'Next Evaluation',
    highlightValue: '00:00:00 Local Midnight',
  },
];

export const UnifiedCovenantStation: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isAutoCycling, setIsAutoCycling] = useState<boolean>(false);
  const [hairlineReadout, setHairlineReadout] = useState<string>('rest');

  // Live Simulated Vitals
  const [currentLives, setCurrentLives] = useState<number>(3);
  const [maxLives] = useState<number>(3);
  const [streakDays, setStreakDays] = useState<number>(14);
  const [witnessDebt, setWitnessDebt] = useState<number>(0);
  const [stakePerMiss] = useState<number>(500);
  const [eventNotice, setEventNotice] = useState<string | null>(null);

  const current = STEPS[activeStep];
  const isTerminated = currentLives === 0;

  // Auto-tour progression
  useEffect(() => {
    if (!isAutoCycling) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
      setHairlineReadout('rest');
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoCycling]);

  const handleStepSelect = (idx: number) => {
    setActiveStep(idx);
    setIsAutoCycling(false);
    setHairlineReadout('rest');
  };

  const handleNextStep = () => {
    setActiveStep((prev) => (prev + 1) % STEPS.length);
    setHairlineReadout('rest');
  };

  // Simulate a breach during the loop
  const handleSimulateBreach = () => {
    if (currentLives > 0) {
      const nextLives = currentLives - 1;
      const nextDebt = witnessDebt + stakePerMiss;
      setCurrentLives(nextLives);
      setWitnessDebt(nextDebt);
      setActiveStep(3); // Jump to Verdict step to show consequences
      setHairlineReadout('rest');

      if (nextLives === 0) {
        setEventNotice('⚠ Breach: Final life lost. Covenant irreversibly terminated at midnight cutoff.');
      } else {
        setEventNotice(`Missed Cutoff: -1 life deducted (${nextLives}/3 remaining). +₹${stakePerMiss} added to witness ledger.`);
      }
    }
  };

  const handleReset = () => {
    setCurrentLives(3);
    setWitnessDebt(0);
    setStreakDays(14);
    setActiveStep(0);
    setHairlineReadout('rest');
    setEventNotice(null);
  };

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-[#0c0d12] border border-neutral-200 dark:border-white/[0.08] shadow-sm dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-200 overflow-hidden select-none">
      {/* Top Protocol Bar: Status + Live Loop Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-neutral-200/80 dark:border-white/[0.06] bg-neutral-50/70 dark:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-neutral-900 dark:bg-white/[0.08] text-amber-400 border border-neutral-800 dark:border-white/[0.1] flex items-center justify-center shadow-xs">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
                Covenant Unified Station
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>4-Step Loop Online</span>
              </span>
            </div>
            <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              One Component · The Entire Accountability Lifecycle
            </p>
          </div>
        </div>

        {/* Loop Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAutoCycling(!isAutoCycling)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isAutoCycling
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/[0.08]'
            }`}
            title={isAutoCycling ? 'Pause automated loop cycle' : 'Auto-cycle through all 4 steps'}
          >
            {isAutoCycling ? <Pause size={12} /> : <Play size={12} />}
            <span>{isAutoCycling ? 'Looping' : 'Auto-Cycle'}</span>
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-black/60 border border-neutral-200 dark:border-white/[0.08] text-xs font-mono text-neutral-700 dark:text-neutral-300">
            <span className="text-[10px] text-neutral-400 uppercase">Readout</span>
            <span className="font-semibold text-neutral-900 dark:text-white">
              {hairlineReadout !== 'rest' ? hairlineReadout : current.telemetryDefault}
            </span>
          </div>
        </div>
      </div>

      {/* Connected 4-Step Cycle Ribbon Track */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-neutral-200/80 dark:border-white/[0.06] bg-neutral-100/50 dark:bg-black/40">
        {STEPS.map((st, idx) => {
          const isActive = idx === activeStep;
          const isPassed = idx < activeStep;

          return (
            <button
              key={st.id}
              type="button"
              onClick={() => handleStepSelect(idx)}
              className={`p-3.5 sm:p-4 text-left transition-all duration-200 cursor-pointer relative border-b-2 ${
                isActive
                  ? 'bg-white dark:bg-white/[0.04] border-blue-500 shadow-xs'
                  : 'border-transparent hover:bg-neutral-200/40 dark:hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : isPassed
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-neutral-400'
                  }`}
                >
                  Step 0{st.step}
                </span>
                {isPassed && <CheckCircle2 size={12} className="text-emerald-500" />}
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
              </div>
              <h4
                className={`text-xs font-semibold tracking-tight truncate ${
                  isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {st.shortTitle}
              </h4>
            </button>
          );
        })}
      </div>

      {/* Main Dual-Console View: Step Inspector (Left) + Hairline Isometric Engine (Right) */}
      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Console: Step Narrative, Mechanical Guarantees & Step Progression */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>{current.badge}</span>
            </span>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {current.name}
            </h3>

            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-xl">
              {current.summary}
            </p>
          </div>

          {/* Real-time Hardware Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-neutral-100/70 dark:bg-black/40 border border-neutral-200/80 dark:border-white/[0.06] space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                {current.highlightKey}
              </span>
              <span className="text-xs font-semibold text-neutral-900 dark:text-white font-mono block">
                {current.highlightValue}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-100/70 dark:bg-black/40 border border-neutral-200/80 dark:border-white/[0.06] space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                Enforcement Guarantee
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono block">
                {activeStep === 0 && 'Deterministic Terms'}
                {activeStep === 1 && 'No Unilateral Bailouts'}
                {activeStep === 2 && 'Automatic LeetCode Sync'}
                {activeStep === 3 && 'Zero Human Discretion'}
              </span>
            </div>
          </div>

          {/* Interactive Navigation Trigger */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleNextStep}
              className="px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black transition-all cursor-pointer shadow-xs"
            >
              <span>{activeStep === 3 ? 'Loop Back to Step 01' : current.actionText}</span>
              <ArrowRight size={13} />
            </button>

            <span className="text-xs font-mono text-neutral-400">
              Interactive isometric viewport on right ➔
            </span>
          </div>
        </div>

        {/* Right Viewport: The Hairline Isometric Engine that adapts per step */}
        <div className="lg:col-span-5 w-full">
          <div className="rounded-2xl bg-neutral-100/80 dark:bg-[#07080b] border border-neutral-200 dark:border-white/[0.08] shadow-inner p-4 sm:p-5 flex flex-col items-center justify-center group/viewport relative">
            {/* Viewport Top Telemetry Header */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-white/[0.05] text-[10px] font-mono text-neutral-400">
              <span className="uppercase tracking-wider">INSTRUMENT VIEWPORT</span>
              <span className="font-semibold text-neutral-800 dark:text-white uppercase">
                {current.id}
              </span>
            </div>

            {/* The Hairline Figure dynamically mounted per step */}
            <div className="w-full max-w-[280px] sm:max-w-[320px] aspect-[5/4] relative flex items-center justify-center my-2">
              {current.id === 'forge' && (
                <Format
                  key="forge"
                  play
                  intensity={0.65}
                  onRead={setHairlineReadout}
                  aria-label="Format engine snapping lines into rigid pact parameters"
                  className="w-full h-auto cursor-crosshair transition-transform duration-300 group-hover/viewport:scale-[1.02]"
                />
              )}
              {current.id === 'seal' && (
                <Vault
                  key="seal"
                  play
                  intensity={0.7}
                  onRead={setHairlineReadout}
                  aria-label="Vault door combination lock securing witness escrow"
                  className="w-full h-auto cursor-crosshair transition-transform duration-300 group-hover/viewport:scale-[1.02]"
                />
              )}
              {current.id === 'execute' && (
                <Branches
                  key="execute"
                  play
                  intensity={0.65}
                  onRead={setHairlineReadout}
                  aria-label="Commit graph with nodes lifting along execution path"
                  className="w-full h-auto cursor-crosshair transition-transform duration-300 group-hover/viewport:scale-[1.02]"
                />
              )}
              {current.id === 'verdict' && (
                <Terminal
                  key="verdict"
                  play
                  intensity={0.65}
                  onRead={setHairlineReadout}
                  aria-label="Terminal evaluator daemon logging midnight outcomes"
                  className="w-full h-auto cursor-crosshair transition-transform duration-300 group-hover/viewport:scale-[1.02]"
                />
              )}
            </div>

            {/* Viewport Bottom Caption */}
            <p className="w-full text-center text-[11px] font-mono text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-200/60 dark:border-white/[0.05]">
              {current.figureCaption}
            </p>
          </div>
        </div>
      </div>

      {/* Notification Banner if Breach Triggered */}
      {eventNotice && (
        <div
          className={`px-6 py-2.5 text-xs font-mono flex items-center justify-between border-t border-b ${
            isTerminated
              ? 'bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-300'
              : 'bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{eventNotice}</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="underline hover:no-underline cursor-pointer font-semibold"
          >
            Reset Station
          </button>
        </div>
      )}

      {/* Bottom Global Vitals & Tactical Testing Strip */}
      <div className="px-6 py-4 bg-neutral-50/70 dark:bg-white/[0.02] border-t border-neutral-200/80 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        {/* Global Covenant Vitals */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-400 uppercase">Vitality:</span>
            <LivesIndicator currentLives={currentLives} maxLives={maxLives} size="sm" showLabel />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-400 uppercase">Streak:</span>
            <StreakBadge streak={streakDays} size="sm" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-400 uppercase">Witness Debt:</span>
            <span
              className={`font-mono font-bold tabular-nums ${
                witnessDebt > 0 ? 'text-rose-500' : 'text-neutral-900 dark:text-white'
              }`}
            >
              ₹{witnessDebt.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Tactical Breach Simulation Trigger */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSimulateBreach}
            disabled={isTerminated}
            className="px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 bg-gradient-to-b from-rose-500/15 to-rose-600/10 hover:from-rose-500/25 hover:to-rose-600/15 text-rose-700 dark:text-rose-300 border border-rose-400/30 transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <AlertTriangle size={12} className="text-rose-500" />
            <span>Simulate Step 4 Breach</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl text-xs font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
