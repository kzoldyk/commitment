import React from 'react';
import { Check, X, Clock, CircleDot, Lock } from 'lucide-react';
import { CommitmentDay } from '../lib/api';

interface CalendarHeatmapProps {
  days: CommitmentDay[];
  targetUnit: string;
  onSelectDay?: (day: CommitmentDay) => void;
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ days, targetUnit, onSelectDay }) => {
  const nowSec = Math.floor(Date.now() / 1000);

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 text-xs text-neutral-500 dark:text-neutral-400">
        <span className="font-mono uppercase tracking-wider font-semibold text-neutral-700 dark:text-neutral-300">Contract Calendar Matrix</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500"></span> Done</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500/30 border border-rose-500"></span> Missed</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500/30 border border-amber-500"></span> In Progress</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-neutral-200 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800"></span> Pending</span>
        </div>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
        {days.map((day, idx) => {
          const isFuture = nowSec < day.periodStart;
          const isCompleted = day.status === 'COMPLETED';
          const isMissed = day.status === 'MISSED';
          const isInProgress = day.status === 'IN_PROGRESS';
          const dateNumber = day.periodKey.split('-').slice(1).join('/');

          let bgClass = 'bg-neutral-100 dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-500 hover:border-neutral-400 dark:hover:border-neutral-700';
          let icon = null;

          if (isCompleted) {
            bgClass = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600/60 text-emerald-700 dark:text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]';
            icon = <Check size={13} className="text-emerald-600 dark:text-emerald-400 stroke-[3]" />;
          } else if (isMissed) {
            bgClass = 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-600/60 text-rose-700 dark:text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.1)]';
            icon = <X size={13} className="text-rose-600 dark:text-rose-400 stroke-[3]" />;
          } else if (isInProgress) {
            bgClass = 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-500/80 text-amber-800 dark:text-amber-300 ring-1 ring-amber-400/50 dark:ring-amber-500/40 animate-pulse';
            icon = <CircleDot size={12} className="text-amber-600 dark:text-amber-400" />;
          } else if (isFuture) {
            bgClass = 'bg-neutral-100/50 dark:bg-neutral-900/40 border-neutral-200/50 dark:border-neutral-800/50 text-neutral-400 dark:text-neutral-600 cursor-not-allowed opacity-60';
            icon = <Lock size={11} className="text-neutral-400 dark:text-neutral-600" />;
          } else {
            icon = <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-600">D{idx + 1}</span>;
          }

          return (
            <button
              key={day.id}
              disabled={isFuture}
              onClick={() => !isFuture && onSelectDay?.(day)}
              className={`flex flex-col items-center justify-between p-2 rounded-lg border text-center transition-all select-none ${isFuture ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95 shadow-sm'} ${bgClass}`}
              title={isFuture ? `Locked: Starts on ${day.periodKey}` : `${day.periodKey}: ${day.completedValue}/${day.targetValue} ${targetUnit} (${day.status}) - Click to inspect`}
            >
              <span className="text-[10px] font-mono font-medium opacity-80">{dateNumber}</span>
              <div className="my-1 flex items-center justify-center h-4">
                {icon}
              </div>
              <span className="text-[9px] font-mono tracking-tighter opacity-70">
                {day.completedValue}/{day.targetValue}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
