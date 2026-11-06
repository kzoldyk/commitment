import React, { useState } from 'react';
import { GitBranch, Clock, Flame, CheckCircle2, RefreshCw } from 'lucide-react';
import { Branches } from '@lucasmarkes/hairline/react';

export const Stage3Proof: React.FC = () => {
  const [readout, setReadout] = useState<string>('rest');
  const [streak, setStreak] = useState<number>(14);

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-[#0c0d12] border border-neutral-200 dark:border-white/[0.08] p-5 sm:p-6 space-y-5 transition-all duration-200 hover:border-neutral-300 dark:hover:border-white/[0.14] shadow-sm select-none">
      {/* Product Stage Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold uppercase tracking-wider">
              Stage 03 · Product
            </span>
            <span className="text-xs font-mono text-neutral-400">The Proof</span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
            Daily Proof Engine
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm">
            Automated verification via LeetCode API, daily proof links, and uninterrupted commit streak telemetry.
          </p>
        </div>

        {/* Live Readout Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-white/[0.06] border border-neutral-200 dark:border-white/[0.08] text-[11px] font-mono text-neutral-700 dark:text-neutral-300 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>{readout}</span>
        </div>
      </div>

      {/* Hairline Interactive Viewport: Branches */}
      <div className="rounded-xl overflow-hidden bg-neutral-50 dark:bg-[#07080b] border border-neutral-200/80 dark:border-white/[0.06] p-3 flex flex-col items-center justify-center group/fig shadow-inner">
        <div className="w-full max-w-[240px] aspect-[5/4] flex items-center justify-center">
          <Branches
            play
            intensity={0.65}
            onRead={setReadout}
            aria-label="Commit graph with nodes lifting along execution streak"
            className="w-full h-auto cursor-crosshair transition-transform duration-300 group-hover/fig:scale-[1.03]"
          />
        </div>
        <p className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 pt-2 border-t border-neutral-200/60 dark:border-white/[0.05] w-full text-center">
          Branches instrument — commit nodes rise in real-time along execution tree
        </p>
      </div>

      {/* Product Feature Pillars */}
      <div className="space-y-2.5 text-xs">
        <div className="flex items-start gap-2.5">
          <GitBranch size={14} className="text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-neutral-900 dark:text-white block font-medium">Git-Style Commit Branch</strong>
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">
              Every verified day appends a permanent green node to your public commit record.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <RefreshCw size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-neutral-900 dark:text-white block font-medium">Automated LeetCode Resolver</strong>
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">
              Direct GraphQL sync automatically validates problem numbers, difficulty, and submission timing.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Flame size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-neutral-900 dark:text-white block font-medium">Streak Life Restorations</strong>
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">
              5 consecutive executed days automatically restores +1 lost life to your vitality pool.
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Micro-Selector */}
      <div className="pt-2 border-t border-neutral-200/60 dark:border-white/[0.06] flex items-center justify-between text-xs font-mono">
        <span className="text-neutral-500 text-[11px]">Trailing 14-day record</span>
        <span className="text-amber-500 font-semibold text-[11px] flex items-center gap-1">
          <Flame size={11} className="fill-amber-500/20" />
          <span>14 Days Continuous</span>
        </span>
      </div>
    </div>
  );
};
