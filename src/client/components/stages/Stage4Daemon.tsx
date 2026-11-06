import React, { useState } from 'react';
import { Terminal as TerminalIcon, Clock, AlertTriangle, Shield, Coins, CheckCircle2 } from 'lucide-react';
import { Terminal } from '@lucasmarkes/hairline/react';

export const Stage4Daemon: React.FC = () => {
  const [readout, setReadout] = useState<string>('rest');
  const [timezone] = useState<string>('Asia/Kolkata');

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-[#0c0d12] border border-neutral-200 dark:border-white/[0.08] p-5 sm:p-6 space-y-5 transition-all duration-200 hover:border-neutral-300 dark:hover:border-white/[0.14] shadow-sm select-none">
      {/* Product Stage Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-semibold uppercase tracking-wider">
              Stage 04 · Product
            </span>
            <span className="text-xs font-mono text-neutral-400">The Daemon</span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
            Midnight Cutoff Daemon
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm">
            Autonomous cron worker evaluating local midnight deadlines. Zero human bias; executes penalties instantly.
          </p>
        </div>

        {/* Live Readout Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-white/[0.06] border border-neutral-200 dark:border-white/[0.08] text-[11px] font-mono text-neutral-700 dark:text-neutral-300 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span>{readout}</span>
        </div>
      </div>

      {/* Hairline Interactive Viewport: Terminal */}
      <div className="rounded-xl overflow-hidden bg-neutral-50 dark:bg-[#07080b] border border-neutral-200/80 dark:border-white/[0.06] p-3 flex flex-col items-center justify-center group/fig shadow-inner">
        <div className="w-full max-w-[240px] aspect-[5/4] flex items-center justify-center">
          <Terminal
            play
            intensity={0.65}
            onRead={setReadout}
            aria-label="Terminal window with scrolling evaluation history"
            className="w-full h-auto cursor-crosshair transition-transform duration-300 group-hover/fig:scale-[1.03]"
          />
        </div>
        <p className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 pt-2 border-t border-neutral-200/60 dark:border-white/[0.05] w-full text-center">
          Terminal instrument — pointer height scrolls back through execution audit log
        </p>
      </div>

      {/* Product Feature Pillars */}
      <div className="space-y-2.5 text-xs">
        <div className="flex items-start gap-2.5">
          <Clock size={14} className="text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-neutral-900 dark:text-white block font-medium">Local Midnight Synchronization</strong>
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">
              Evaluates deadlines against your exact IANA timezone ({timezone}), never server UTC.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Shield size={14} className="text-rose-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-neutral-900 dark:text-white block font-medium">Automatic Life Deduction</strong>
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">
              Missed cutoff burns 1 life immediately. Reaching zero marks covenant permanently failed.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Coins size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-neutral-900 dark:text-white block font-medium">Immediate Debt Accrual</strong>
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">
              Automatically posts penalty collateral to the partner debt counter on each failure.
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Micro-Selector */}
      <div className="pt-2 border-t border-neutral-200/60 dark:border-white/[0.06] flex items-center justify-between text-xs font-mono">
        <span className="text-neutral-500 text-[11px]">Daemon: 00:00:00 Daily</span>
        <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] flex items-center gap-1">
          <TerminalIcon size={11} />
          <span>Audit Stream Active</span>
        </span>
      </div>
    </div>
  );
};
