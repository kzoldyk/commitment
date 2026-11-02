import React, { useState } from 'react';
import { Check, X, CircleDot, Lock, RotateCcw, Calendar as CalendarIcon } from 'lucide-react';
import { CommitmentDay } from '../lib/api';

export interface CalendarHeatmapProps {
  days: CommitmentDay[];
  targetUnit?: string;
  selectedDate?: string | null;
  onDateClick?: (dateStr: string) => void;
  onSelectDay?: (day: CommitmentDay) => void;
  onClearDateFilter?: () => void;
  variant?: 'compact' | 'full';
  showLegend?: boolean;
  commitmentTitle?: string;
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({
  days = [],
  targetUnit = 'items',
  selectedDate,
  onDateClick,
  onSelectDay,
  onClearDateFilter,
  variant = 'full',
  showLegend = true,
  commitmentTitle,
}) => {
  const nowSec = Math.floor(Date.now() / 1000);
  const [hoveredDay, setHoveredDay] = useState<{ day: CommitmentDay; rect: DOMRect } | null>(null);

  // Derived stats
  const completedCount = days.filter((d) => d.status === 'COMPLETED').length;
  const missedCount = days.filter((d) => d.status === 'MISSED').length;
  const inProgressCount = days.filter((d) => d.status === 'IN_PROGRESS').length;
  const pastDays = days.filter((d) => d.periodStart <= nowSec);
  const completionRate = pastDays.length > 0 ? Math.round((completedCount / pastDays.length) * 100) : 0;

  const isCompact = variant === 'compact';

  return (
    <div className="w-full space-y-3 relative">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#111827] dark:text-[#f2f3f5] flex items-center gap-1.5">
            <CalendarIcon size={13} className="text-amber-500" />
            <span>{isCompact ? 'Daily heatmap' : 'Daily accountability matrix'}</span>
          </span>

          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-white/[0.04] text-neutral-600 dark:text-[#8a8f98] border border-neutral-200 dark:border-white/[0.06] tabular-nums">
            {completedCount}/{days.length} done ({completionRate}%)
          </span>

          {selectedDate && onClearDateFilter && (
            <button
              type="button"
              onClick={onClearDateFilter}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-500 dark:text-rose-400 hover:underline cursor-pointer ml-1"
              title="Reset day filter"
            >
              <RotateCcw size={10} />
              <span>Reset filter</span>
            </button>
          )}
        </div>

        {showLegend && (
          <div className="hidden sm:flex items-center gap-2.5 text-[10px] font-mono text-neutral-500 dark:text-[#8a8f98]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-[2px] bg-emerald-500" />
              <span>Done</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-[2px] bg-amber-500" />
              <span>Active</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-[2px] bg-rose-500" />
              <span>Missed</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-[2px] bg-white/[0.06] border border-white/[0.08]" />
              <span>Upcoming</span>
            </span>
          </div>
        )}
      </div>

      {/* Grid of Days */}
      <div
        className={
          isCompact
            ? 'grid grid-cols-7 sm:grid-cols-10 md:grid-cols-14 gap-1.5'
            : 'grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2'
        }
      >
        {days.map((day, idx) => {
          const isFuture = nowSec < day.periodStart;
          const isCompleted = day.status === 'COMPLETED';
          const isMissed = day.status === 'MISSED';
          const isInProgress = day.status === 'IN_PROGRESS';
          const isSelected = selectedDate === day.periodKey;
          const dateNumber = day.periodKey.split('-').slice(1).join('/');

          // Linear Restrained Cell Styling
          let cellStyle =
            'bg-neutral-100 dark:bg-white/[0.03] border-neutral-200 dark:border-white/[0.06] text-neutral-600 dark:text-[#8a8f98] hover:border-neutral-300 dark:hover:border-white/[0.15]';
          let icon = null;

          if (isCompleted) {
            cellStyle =
              'bg-emerald-500/15 border-emerald-500/35 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25';
            icon = <Check size={isCompact ? 11 : 13} className="stroke-[2.5]" />;
          } else if (isMissed) {
            cellStyle =
              'bg-rose-500/15 border-rose-500/35 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25';
            icon = <X size={isCompact ? 11 : 13} className="stroke-[2.5]" />;
          } else if (isInProgress) {
            cellStyle =
              'bg-amber-500/15 border-amber-500/50 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30 hover:bg-amber-500/25';
            icon = <CircleDot size={isCompact ? 10 : 12} className="animate-spin text-amber-500 dark:text-amber-400" />;
          } else if (isFuture) {
            cellStyle =
              'bg-neutral-50 dark:bg-white/[0.02] border-neutral-200/60 dark:border-white/[0.04] text-neutral-400 dark:text-[#626670] opacity-50 cursor-not-allowed';
            icon = <Lock size={isCompact ? 9 : 10} className="opacity-40" />;
          } else {
            icon = <span className="text-[10px] font-mono opacity-60">D{idx + 1}</span>;
          }

          const selectedClass = isSelected
            ? 'ring-2 ring-white/60 border-transparent shadow-lg scale-105 z-10'
            : '';

          return (
            <button
              key={day.id}
              type="button"
              disabled={isFuture}
              onClick={() => {
                if (isFuture) return;
                if (onDateClick) {
                  onDateClick(day.periodKey);
                } else if (onSelectDay) {
                  onSelectDay(day);
                }
              }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredDay({ day, rect });
              }}
              onMouseLeave={() => setHoveredDay(null)}
              className={`group relative flex flex-col items-center justify-between border rounded-[8px] transition-all duration-150 select-none ${
                isCompact ? 'p-1 h-12' : 'p-2 h-16'
              } ${isFuture ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-[1.04] active:scale-[0.97]'} ${cellStyle} ${selectedClass}`}
              aria-label={`Day ${idx + 1} (${day.periodKey}): ${day.status}`}
            >
              {/* Day Date Label */}
              <span className="text-[9px] font-mono font-medium tracking-tight opacity-75">
                {dateNumber}
              </span>

              {/* Status Icon */}
              <div className="flex items-center justify-center my-0.5">
                {icon}
              </div>

              {/* Target / Completed Metric */}
              <span className="text-[9px] font-mono tabular-nums tracking-tighter opacity-70">
                {day.completedValue}/{day.targetValue}
              </span>
            </button>
          );
        })}
      </div>

      {/* Floating Micro-Tooltip / Inspector for hovered day */}
      {hoveredDay && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-white dark:bg-[#131418] border border-neutral-200 dark:border-white/[0.1] text-[#111827] dark:text-[#f2f3f5] shadow-xl dark:shadow-2xl rounded-lg p-2.5 text-xs font-sans min-w-[190px] transition-opacity duration-150"
          style={{
            top: `${hoveredDay.rect.top - 8}px`,
            left: `${hoveredDay.rect.left + hoveredDay.rect.width / 2}px`,
          }}
        >
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/[0.08] pb-1 mb-1.5 font-mono text-[11px]">
            <span className="font-semibold text-amber-500 dark:text-amber-400">{hoveredDay.day.periodKey}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase ${
                hoveredDay.day.status === 'COMPLETED'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : hoveredDay.day.status === 'MISSED'
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                  : hoveredDay.day.status === 'IN_PROGRESS'
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'bg-neutral-100 dark:bg-white/[0.08] text-neutral-600 dark:text-[#8a8f98]'
              }`}
            >
              {hoveredDay.day.status}
            </span>
          </div>

          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between text-[var(--fc-accent-black)]/70">
              <span>Target requirement:</span>
              <span className="font-semibold text-[var(--fc-accent-black)] tabular-nums">
                {hoveredDay.day.targetValue} {targetUnit}
              </span>
            </div>
            <div className="flex justify-between text-[var(--fc-accent-black)]/70">
              <span>Completed count:</span>
              <span
                className={`font-semibold tabular-nums ${
                  hoveredDay.day.completedValue >= hoveredDay.day.targetValue
                    ? 'text-[#42c366]'
                    : 'text-[var(--fc-accent-black)]'
                }`}
              >
                {hoveredDay.day.completedValue} {targetUnit}
              </span>
            </div>
          </div>

          {hoveredDay.day.proofNote && (
            <div className="mt-2 pt-1.5 border-t border-[var(--fc-border-faint)] text-[10px] text-[var(--fc-accent-black)]/80 italic line-clamp-2">
              "{hoveredDay.day.proofNote}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
