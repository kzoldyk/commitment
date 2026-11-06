import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  FileEdit,
  Lock,
  GitBranch,
  Terminal as TerminalIcon,
  CheckCircle2,
  Play,
  Pause,
  Clock,
  Shield,
  Coins,
} from 'lucide-react';
import { Format, Padlock, Branches, Terminal } from '@lucasmarkes/hairline/react';

interface ProcessStep {
  step: number;
  id: string;
  badge: string;
  title: string;
  summary: string;
  details: {
    icon: typeof FileEdit;
    label: string;
    description: string;
  }[];
  telemetry: string;
  figureCaption: string;
}

const STEPS: ProcessStep[] = [
  {
    step: 1,
    id: 'forge',
    badge: 'Step 01 · Covenant Definition',
    title: 'Forge your covenant and set the stakes',
    summary:
      'Choose a non-negotiable discipline, allocate 1 to 5 finite lives, and designate a financial penalty for every missed cutoff.',
    details: [
      {
        icon: FileEdit,
        label: 'Discipline & Target',
        description: 'Define exact criteria (e.g., 2 LeetCode problems or 5 km run daily).',
      },
      {
        icon: Shield,
        label: 'Finite Lives (1–5)',
        description: 'Every failure burns one life. Reaching zero terminates the pact.',
      },
      {
        icon: Coins,
        label: 'Financial Collateral',
        description: 'Set a penalty per miss (e.g., ₹500) accumulated directly in partner debt.',
      },
    ],
    telemetry: 'rules: formatted · 3 lives · ₹500 stake',
    figureCaption: 'Format engine — drafting lines and parameters that snap into rigid rules',
  },
  {
    step: 2,
    id: 'seal',
    badge: 'Step 02 · Cryptographic Handshake',
    title: 'Designate a witness to lock the escrow',
    summary:
      'Self-accountability fails because you forgive yourself. Your designated partner receives an invite, verifies the terms, and holds the contract keys.',
    details: [
      {
        icon: Lock,
        label: 'Zero Self-Approval',
        description: 'You cannot unilaterally forgive missed days or delete active pacts.',
      },
      {
        icon: CheckCircle2,
        label: 'Peer Verification',
        description: 'Your witness receives real-time failure alerts and daily proof links.',
      },
      {
        icon: Coins,
        label: 'Direct Debt Obligation',
        description: 'All accumulated penalties are owed directly to your witness.',
      },
    ],
    telemetry: 'witness: locked · partner@covenant.io',
    figureCaption: 'Padlock shackle — springing into locked escrow with zero self-forgiveness',
  },
  {
    step: 3,
    id: 'execute',
    badge: 'Step 03 · Daily Proof & Streaks',
    title: 'Execute daily before your local midnight cutoff',
    summary:
      'Complete your objective each calendar day. LeetCode solutions sync via automated API resolvers, while other habits allow instant photo/link proof.',
    details: [
      {
        icon: GitBranch,
        label: 'Git-Style Commit Branch',
        description: 'Every completed day extends your unbroken execution history tree.',
      },
      {
        icon: Clock,
        label: 'Local Timezone Deadlines',
        description: 'Evaluated against your exact IANA local timezone, never server UTC.',
      },
      {
        icon: CheckCircle2,
        label: 'Streak Life Restoration',
        description: 'Maintaining a 5-day continuous streak restores +1 lost life to your pool.',
      },
    ],
    telemetry: 'branch: main · 14-day streak · verified',
    figureCaption: 'Branches graph — commit nodes rise in real-time along your execution path',
  },
  {
    step: 4,
    id: 'verdict',
    badge: 'Step 04 · Deterministic Daemon',
    title: 'Midnight background worker executes the verdict',
    summary:
      'At 00:00:00 local time, background workers evaluate submissions. No manual bureaucracy — failure triggers life deduction and partner notifications instantly.',
    details: [
      {
        icon: TerminalIcon,
        label: 'Automated 00:00 Cron',
        description: 'Scheduled daemon queries proofs against midnight cutoffs autonomously.',
      },
      {
        icon: Shield,
        label: 'Irreversible Termination',
        description: 'Reaching 0 lives marks the covenant permanently FAILED in public audit.',
      },
      {
        icon: Coins,
        label: 'Automated Ledger Accrual',
        description: 'Missed days automatically register +₹500 to your witness debt ledger.',
      },
    ],
    telemetry: 'daemon: 00:00 · cron pass/fail verdict ok',
    figureCaption: 'Terminal logs — scrolling evaluation stream recording immutable outcomes',
  },
];

export const CovenantProcessPipeline: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hairlineTelemetry, setHairlineTelemetry] = useState<string>('rest');

  const current = STEPS[activeStepIndex];

  // Auto-tour timer when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % STEPS.length);
      setHairlineTelemetry('rest');
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleStepSelect = (idx: number) => {
    setActiveStepIndex(idx);
    setIsPlaying(false);
    setHairlineTelemetry('rest');
  };

  const handleNext = () => {
    setActiveStepIndex((prev) => (prev + 1) % STEPS.length);
    setHairlineTelemetry('rest');
  };

  const handlePrev = () => {
    setActiveStepIndex((prev) => (prev - 1 + STEPS.length) % STEPS.length);
    setHairlineTelemetry('rest');
  };

  return (
    <div className="w-full rounded-3xl bg-white/95 dark:bg-[#0c0d12]/95 border border-neutral-200 dark:border-white/[0.08] shadow-sm dark:shadow-[0_24px_54px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-200 overflow-hidden select-none">
      {/* Top Header & Pipeline Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-neutral-200/80 dark:border-white/[0.06] bg-neutral-50/70 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-semibold">
            The Covenant Pipeline
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span className="text-xs font-mono text-neutral-600 dark:text-neutral-300 font-medium">
            Complete Lifecycle in One View
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Autoplay / Tour Toggle */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isPlaying
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/[0.08]'
            }`}
            title={isPlaying ? 'Pause automated walkthrough' : 'Auto-play walkthrough'}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span>{isPlaying ? 'Auto-playing' : 'Auto-tour'}</span>
          </button>

          {/* Step Indicators */}
          <div className="flex items-center gap-1 text-xs font-mono text-neutral-400">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1 rounded-md hover:bg-neutral-200/60 dark:hover:bg-white/[0.08] text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
              title="Previous step"
            >
              <ArrowLeft size={13} />
            </button>
            <span className="tabular-nums font-semibold text-neutral-900 dark:text-white px-1">
              0{current.step} / 04
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="p-1 rounded-md hover:bg-neutral-200/60 dark:hover:bg-white/[0.08] text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
              title="Next step"
            >
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Connected 4-Step Pipeline Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-neutral-200/80 dark:border-white/[0.06] bg-neutral-100/50 dark:bg-black/30">
        {STEPS.map((st, idx) => {
          const isActive = idx === activeStepIndex;
          const isPassed = idx < activeStepIndex;

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
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                )}
              </div>
              <h4
                className={`text-xs font-semibold tracking-tight truncate ${
                  isActive
                    ? 'text-neutral-900 dark:text-white'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {st.title.split(' ')[0]} {st.title.split(' ')[1]}
              </h4>
            </button>
          );
        })}
      </div>

      {/* Active Stage Body: Split Editorial & Interactive Hairline Viewport */}
      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Stage Explanation & Concrete Guarantees */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>{current.badge}</span>
            </span>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {current.title}
            </h3>

            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {current.summary}
            </p>
          </div>

          {/* Concrete Mechanism Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {current.details.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-neutral-100/70 dark:bg-black/40 border border-neutral-200/80 dark:border-white/[0.06] space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-white">
                    <Icon size={13} className="text-blue-500 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Action Trigger */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black transition-all cursor-pointer shadow-xs"
            >
              <span>{activeStepIndex === 3 ? 'Restart Pipeline Cycle' : `Proceed to Step 0${current.step + 1}`}</span>
              <ArrowRight size={13} />
            </button>
            <span className="text-xs font-mono text-neutral-400">
              Interactive Hardware Viewport ➔
            </span>
          </div>
        </div>

        {/* Right Column: Isometric Hairline Viewport for the Step */}
        <div className="lg:col-span-5 w-full">
          <div className="rounded-2xl bg-neutral-100/80 dark:bg-[#07080b] border border-neutral-200 dark:border-white/[0.08] shadow-inner p-4 sm:p-5 flex flex-col items-center justify-center group/stage relative">
            {/* Top Telemetry Tag */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-white/[0.05] text-[10px] font-mono text-neutral-400">
              <span>ACTIVE INSTRUMENT</span>
              <span className="font-semibold text-neutral-800 dark:text-white">
                {hairlineTelemetry !== 'rest' ? hairlineTelemetry : current.telemetry}
              </span>
            </div>

            {/* Hairline Isometric Figure Viewport */}
            <div className="w-full max-w-[280px] sm:max-w-[320px] aspect-[5/4] relative flex items-center justify-center my-2">
              {current.id === 'forge' && (
                <Format
                  play
                  intensity={0.65}
                  onRead={setHairlineTelemetry}
                  aria-label="Covenant format rules instrument"
                  className="w-full h-auto cursor-crosshair transition-transform duration-300 group-hover/stage:scale-[1.02]"
                />
              )}
              {current.id === 'seal' && (
                <Padlock
                  play
                  intensity={0.7}
                  onRead={setHairlineTelemetry}
                  aria-label="Witness escrow padlock seal"
                  className="w-full h-auto cursor-crosshair transition-transform duration-300 group-hover/stage:scale-[1.02]"
                />
              )}
              {current.id === 'execute' && (
                <Branches
                  play
                  intensity={0.65}
                  onRead={setHairlineTelemetry}
                  aria-label="Commit graph streak visualizer"
                  className="w-full h-auto cursor-crosshair transition-transform duration-300 group-hover/stage:scale-[1.02]"
                />
              )}
              {current.id === 'verdict' && (
                <Terminal
                  play
                  intensity={0.65}
                  onRead={setHairlineTelemetry}
                  aria-label="Automated midnight daemon terminal"
                  className="w-full h-auto cursor-crosshair transition-transform duration-300 group-hover/stage:scale-[1.02]"
                />
              )}
            </div>

            {/* Figure Caption */}
            <p className="w-full text-center text-[11px] font-mono text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-200/60 dark:border-white/[0.05]">
              {current.figureCaption}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
