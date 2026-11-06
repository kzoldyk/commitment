import React, { useState } from 'react';
import { FileEdit, Shield, Coins, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Format } from '@lucasmarkes/hairline/react';

export const Stage1Forge: React.FC = () => {
  const [readout, setReadout] = useState<string>('rest');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('LeetCode');
  const [lives, setLives] = useState<number>(3);
  const [stake, setStake] = useState<number>(500);

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-[#0c0d12] border border-neutral-200 dark:border-white/[0.08] p-5 sm:p-6 space-y-5 transition-all duration-200 hover:border-neutral-300 dark:hover:border-white/[0.14] shadow-sm select-none">
      {/* Product Stage Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold uppercase tracking-wider">
              Stage 01 · Product
            </span>
            <span className="text-xs font-mono text-neutral-400">The Forge</span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
            Covenant Rule Forge
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm">
            Define boundary parameters, assign finite lives, and lock financial collateral before execution starts.
          </p>
        </div>

        {/* Live Readout Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-white/[0.06] border border-neutral-200 dark:border-white/[0.08] text-[11px] font-mono text-neutral-700 dark:text-neutral-300 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>{readout}</span>
        </div>
      </div>

      {/* Hairline Interactive Viewport: Format */}
      <div className="rounded-xl overflow-hidden bg-neutral-50 dark:bg-[#07080b] border border-neutral-200/80 dark:border-white/[0.06] p-3 flex flex-col items-center justify-center group/fig shadow-inner">
        <div className="w-full max-w-[240px] aspect-[5/4] flex items-center justify-center">
          <Format
            play
            intensity={0.65}
            onRead={setReadout}
            aria-label="Format engine snapping lines into rigid contract rules"
            className="w-full h-auto cursor-crosshair transition-transform duration-300 group-hover/fig:scale-[1.03]"
          />
        </div>
        <p className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 pt-2 border-t border-neutral-200/60 dark:border-white/[0.05] w-full text-center">
          Format instrument — pointer scrubs text into rigid, unbroken rule indentation
        </p>
      </div>

      {/* Product Feature Pillars */}
      <div className="space-y-2.5 text-xs">
        <div className="flex items-start gap-2.5">
          <FileEdit size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-neutral-900 dark:text-white block font-medium">Objective Specifications</strong>
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">
              Set precise criteria (e.g. 2 LeetCode problems or 5km run) evaluated every 24 hours.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Shield size={14} className="text-rose-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-neutral-900 dark:text-white block font-medium">1–5 Finite Lives Pool</strong>
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">
              Every missed deadline burns a life. Zero lives triggers permanent failure.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Coins size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-neutral-900 dark:text-white block font-medium">Escrow Penalty Stakes</strong>
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">
              Pledge ₹250–₹1,000 per miss, automatically owed to your witness upon failure.
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Micro-Selector */}
      <div className="pt-2 border-t border-neutral-200/60 dark:border-white/[0.06] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1">
          {['LeetCode', 'Running', 'Writing'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSelectedDiscipline(item)}
              className={`px-2 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
                selectedDiscipline === item
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <span className="text-neutral-400 text-[11px]">3 lives · ₹500/miss</span>
      </div>
    </div>
  );
};
