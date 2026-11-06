import React, { useState } from 'react';
import { Lock, Users, Coins, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Vault } from '@lucasmarkes/hairline/react';

export const Stage2Vault: React.FC = () => {
  const [readout, setReadout] = useState<string>('rest');
  const [isLocked, setIsLocked] = useState<boolean>(true);

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-[#0c0d12] border border-neutral-200 dark:border-white/[0.08] p-5 sm:p-6 space-y-5 transition-all duration-200 hover:border-neutral-300 dark:hover:border-white/[0.14] shadow-sm select-none">
      {/* Product Stage Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold uppercase tracking-wider">
              Stage 02 · Product
            </span>
            <span className="text-xs font-mono text-neutral-400">The Vault</span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
            Witness Escrow Vault
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm">
            Delegate contract keys to an accountability partner. Eliminates self-forgiveness and secures stakes.
          </p>
        </div>

        {/* Live Readout Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-white/[0.06] border border-neutral-200 dark:border-white/[0.08] text-[11px] font-mono text-neutral-700 dark:text-neutral-300 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>{readout}</span>
        </div>
      </div>

      {/* Hairline Interactive Viewport: Vault */}
      <div className="rounded-xl overflow-hidden bg-neutral-50 dark:bg-[#07080b] border border-neutral-200/80 dark:border-white/[0.06] p-3 flex flex-col items-center justify-center group/fig shadow-inner">
        <div className="w-full max-w-[240px] aspect-[5/4] flex items-center justify-center">
          <Vault
            play
            intensity={0.7}
            onRead={setReadout}
            aria-label="Vault door with combination dial and locking bolts"
            className="w-full h-auto cursor-crosshair transition-transform duration-300 group-hover/fig:scale-[1.03]"
          />
        </div>
        <p className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 pt-2 border-t border-neutral-200/60 dark:border-white/[0.05] w-full text-center">
          Vault instrument — circling dial coasts and draws bolts only on valid combination
        </p>
      </div>

      {/* Product Feature Pillars */}
      <div className="space-y-2.5 text-xs">
        <div className="flex items-start gap-2.5">
          <Lock size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-neutral-900 dark:text-white block font-medium">Zero Self-Approval</strong>
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">
              You cannot unilaterally forgive missed days or delete active covenants.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Users size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-neutral-900 dark:text-white block font-medium">Designated Peer Guardian</strong>
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">
              Invited witness receives real-time failure alerts and daily proof links.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Coins size={14} className="text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-neutral-900 dark:text-white block font-medium">Direct Partner Ledger</strong>
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">
              Failed days accumulate debt payable directly to your witness's account.
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Micro-Selector */}
      <div className="pt-2 border-t border-neutral-200/60 dark:border-white/[0.06] flex items-center justify-between text-xs font-mono">
        <span className="text-neutral-500 text-[11px]">Witness: @alex_guardian</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
          <CheckCircle2 size={11} />
          <span>Handshake Sealed</span>
        </span>
      </div>
    </div>
  );
};
