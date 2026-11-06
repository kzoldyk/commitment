import React, { useState } from 'react';
import {
  Check,
  X,
  CircleDot,
  Lock,
  RotateCcw,
  Sparkles,
  Flame,
  Shield,
  Activity,
  Layers,
  Radio,
  Zap,
} from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'stream' | 'lattice'>('stream');

  // Derived telemetry metrics
  const completedCount = days.filter((d) => d.status === 'COMPLETED').length;
  const missedCount = days.filter((d) => d.status === 'MISSED').length;
  const inProgressCount = days.filter((d) => d.status === 'IN_PROGRESS').length;
  const pastDays = days.filter((d) => d.periodStart <= nowSec);
  const completionRate = pastDays.length > 0 ? Math.round((completedCount / pastDays.length) * 100) : 0;

  // Active unbroken streak calculation
  let activeStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].status === 'COMPLETED') activeStreak++;
    else if (days[i].status === 'IN_PROGRESS') continue;
    else break;
  }

  // SVG Radial Dial coordinates
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  const isCompact = variant === 'compact';

  return (
    <div className="w-full select-none relative antigravity-capsule p-5 sm:p-6 space-y-6 overflow-hidden">
      {/* Top Ambient Glow Horizon */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-indigo-500/[0.08] via-emerald-500/[0.03] to-transparent pointer-events-none blur-2xl" />

      {/* ================= TELEMETRY COCKPIT HEADER ================= */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-white/[0.06] pb-5">
        {/* Left: Cyclotron Velocity Dial & Covenant Identity */}
        <div className="flex items-center gap-4">
          <div className="relative w-15 h-15 shrink-0 flex items-center justify-center">
            {/* SVG Velocity Arc */}
            <svg className="w-15 h-15 transform -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-neutral-200 dark:stroke-white/[0.06]"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-emerald-400 transition-all duration-1000 ease-out"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(52, 211, 153, 0.6))',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-mono font-bold tracking-tight text-[#111827] dark:text-[#f9fafb]">
                {completionRate}%
              </span>
            </div>
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
                <span>Chrono-Velocity Matrix</span>
              </span>
              {selectedDate && onClearDateFilter && (
                <button
                  type="button"
                  onClick={onClearDateFilter}
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-rose-400 hover:underline cursor-pointer"
                  title="Reset date filter"
                >
                  <RotateCcw size={10} />
                  <span>Reset filter ({selectedDate})</span>
                </button>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-semibold tracking-tight text-[#111827] dark:text-[#f9fafb] truncate">
              {commitmentTitle || 'Telemetry Performance Horizon'}
            </h3>
            <p className="text-[11px] font-mono text-neutral-500 dark:text-[#8a8f98] flex items-center gap-2">
              <span>{completedCount} of {days.length} days verified</span>
              <span>·</span>
              <span className="text-amber-400 font-medium flex items-center gap-1">
                <Flame size={11} className="fill-amber-400/20" />
                <span>{activeStreak}d streak</span>
              </span>
            </p>
          </div>
        </div>

        {/* Right: View Switcher & Telemetry Status Badges */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Stream vs Lattice Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-neutral-200/60 dark:bg-black/50 border border-neutral-300 dark:border-white/[0.08] text-xs">
            <button
              type="button"
              onClick={() => setViewMode('stream')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'stream'
                  ? 'bg-white dark:bg-white/15 text-[#111827] dark:text-white font-medium shadow-xs'
                  : 'text-neutral-500 dark:text-[#8a8f98] hover:text-white'
              }`}
            >
              <Activity size={12} />
              <span>Chrono-Wave</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('lattice')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'lattice'
                  ? 'bg-white dark:bg-white/15 text-[#111827] dark:text-white font-medium shadow-xs'
                  : 'text-neutral-500 dark:text-[#8a8f98] hover:text-white'
              }`}
            >
              <Layers size={12} />
              <span>Lattice Grid</span>
            </button>
          </div>

          {/* Status Badges */}
          {showLegend && (
            <div className="flex items-center gap-2.5 text-[11px] font-mono text-neutral-500 dark:text-[#8a8f98]">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span>{completedCount} Verified</span>
              </span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)] animate-ping" />
                <span>{inProgressCount} Active</span>
              </span>
              {missedCount > 0 && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                  <span>{missedCount} Missed</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= TELEMETRY VIEW MODES ================= */}
      {viewMode === 'stream' ? (
        /* MODE 1: CHRONO-WAVE STREAM (Panoramic Photonic Pillars on a Laser Conduit Rail) */
        <div className="relative pt-2 pb-4">
          {/* Laser Timeline Rail Running Across the Baseline */}
          <div className="absolute bottom-6 left-0 right-0 h-0.5 laser-timeline-rail pointer-events-none opacity-40 z-0" />

          {/* Panoramic Scrollable Waveform Strip */}
          <div className="flex items-end gap-2.5 overflow-x-auto pb-4 pt-6 px-1 no-scrollbar relative z-10">
            {days.map((day, idx) => {
              const isFuture = nowSec < day.periodStart;
              const isCompleted = day.status === 'COMPLETED';
              const isMissed = day.status === 'MISSED';
              const isInProgress = day.status === 'IN_PROGRESS';
              const isSelected = selectedDate === day.periodKey;
              const fillRatio = Math.min(100, Math.round((day.completedValue / (day.targetValue || 1)) * 100));

              // Height calculated dynamically based on target/completion
              const minHeightPx = 80;
              const maxHeightPx = 130;
              const heightPx = isCompleted
                ? maxHeightPx
                : isInProgress
                ? Math.max(minHeightPx, Math.round(minHeightPx + (fillRatio / 100) * 35))
                : minHeightPx;

              let pillarTheme = 'bg-white/[0.03] border-white/[0.06] text-neutral-500';
              let glowEffect = '';
              let badgeGlyph = <span className="text-[10px] font-mono text-neutral-400">D{idx + 1}</span>;
              let liquidFillColor = 'bg-white/10';

              if (isCompleted) {
                pillarTheme = 'bg-emerald-500/[0.08] border-emerald-400/40 text-emerald-300';
                glowEffect = 'shadow-[0_0_18px_rgba(16,185,129,0.22)]';
                badgeGlyph = <Check size={13} className="text-emerald-400 stroke-[3]" />;
                liquidFillColor = 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]';
              } else if (isMissed) {
                pillarTheme = 'bg-rose-950/20 border-rose-500/40 text-rose-400';
                glowEffect = 'shadow-[0_0_12px_rgba(239,68,68,0.2)]';
                badgeGlyph = <X size={13} className="text-rose-400 stroke-[3]" />;
                liquidFillColor = 'bg-gradient-to-t from-rose-700 to-rose-500';
              } else if (isInProgress) {
                pillarTheme = 'bg-amber-500/[0.12] border-amber-400/50 text-amber-200';
                glowEffect = 'shadow-[0_0_20px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/40';
                badgeGlyph = <CircleDot size={13} className="animate-spin text-amber-400 stroke-[2.5]" />;
                liquidFillColor = 'bg-gradient-to-t from-amber-500 to-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.8)]';
              } else if (isFuture) {
                pillarTheme = 'bg-white/[0.015] border-white/[0.03] opacity-35 cursor-not-allowed';
                badgeGlyph = <Lock size={10} className="text-neutral-500" />;
              }

              const selectedClass = isSelected
                ? 'ring-2 ring-white scale-105 z-30 border-white shadow-2xl'
                : '';

              return (
                <button
                  key={day.id}
                  type="button"
                  disabled={isFuture}
                  style={{ height: `${heightPx}px` }}
                  onClick={() => {
                    if (isFuture) return;
                    if (onDateClick) onDateClick(day.periodKey);
                    else if (onSelectDay) onSelectDay(day);
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredDay({ day, rect });
                  }}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`chrono-waveguide group relative flex flex-col items-center justify-between p-2 min-w-[58px] border rounded-2xl transition-all duration-200 overflow-hidden cursor-pointer ${pillarTheme} ${glowEffect} ${selectedClass}`}
                  aria-label={`Day ${idx + 1} (${day.periodKey})`}
                >
                  {/* Top Micro-Date Stamp */}
                  <div className="flex flex-col items-center relative z-10">
                    <span className="text-[9px] font-mono tracking-tight text-neutral-400 group-hover:text-white">
                      {day.periodKey.split('-').slice(1).join('/')}
                    </span>
                    <span className="text-[8px] font-mono text-neutral-500">D{idx + 1}</span>
                  </div>

                  {/* Central Photonic Core Glyph */}
                  <div className="my-auto flex items-center justify-center relative z-10 transition-transform group-hover:scale-125">
                    {badgeGlyph}
                  </div>

                  {/* Bottom Metric Readout */}
                  <span className="text-[9px] font-mono font-semibold tabular-nums text-neutral-300 relative z-10">
                    {day.completedValue}/{day.targetValue}
                  </span>

                  {/* Liquid Internal Energy Bar */}
                  <div className="absolute inset-x-0 bottom-0 overflow-hidden pointer-events-none opacity-85" style={{ height: `${fillRatio}%` }}>
                    <div className={`w-full h-full ${liquidFillColor} transition-all duration-500`} />
                  </div>

                  {/* Sub-pixel Specular Glass Highlight */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* MODE 2: CRYSTALLINE LATTICE (Precision Beveled Hexa-Matrix Grid) */
        <div
          className={
            isCompact
              ? 'grid grid-cols-7 sm:grid-cols-10 md:grid-cols-14 gap-2'
              : 'grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2.5'
          }
        >
          {days.map((day, idx) => {
            const isFuture = nowSec < day.periodStart;
            const isCompleted = day.status === 'COMPLETED';
            const isMissed = day.status === 'MISSED';
            const isInProgress = day.status === 'IN_PROGRESS';
            const isSelected = selectedDate === day.periodKey;
            const fillRatio = Math.min(100, Math.round((day.completedValue / (day.targetValue || 1)) * 100));

            let cellBg = 'bg-white/[0.02] border-white/[0.06] text-neutral-500';
            let iconElement = <span className="text-[10px] font-mono text-neutral-500">D{idx + 1}</span>;
            let liquidColor = 'bg-white/10';

            if (isCompleted) {
              cellBg =
                'bg-emerald-500/[0.08] border-emerald-400/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.18)] hover:border-emerald-400';
              liquidColor = 'bg-gradient-to-t from-emerald-600 to-emerald-400';
              iconElement = <Check size={13} className="text-emerald-400 stroke-[3]" />;
            } else if (isMissed) {
              cellBg =
                'bg-rose-950/20 border-rose-500/40 text-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.15)] hover:border-rose-400';
              liquidColor = 'bg-gradient-to-t from-rose-700 to-rose-500';
              iconElement = <X size={13} className="text-rose-400 stroke-[3]" />;
            } else if (isInProgress) {
              cellBg =
                'bg-amber-500/[0.12] border-amber-400/50 text-amber-200 shadow-[0_0_14px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/30';
              liquidColor = 'bg-gradient-to-t from-amber-500 to-amber-300';
              iconElement = <CircleDot size={13} className="animate-spin text-amber-400 stroke-[2.5]" />;
            } else if (isFuture) {
              cellBg = 'bg-white/[0.01] border-white/[0.03] opacity-35 cursor-not-allowed';
              iconElement = <Lock size={10} className="text-neutral-500" />;
            }

            const selectedClass = isSelected ? 'ring-2 ring-white scale-105 z-20 border-white' : '';

            return (
              <button
                key={day.id}
                type="button"
                disabled={isFuture}
                onClick={() => {
                  if (isFuture) return;
                  if (onDateClick) onDateClick(day.periodKey);
                  else if (onSelectDay) onSelectDay(day);
                }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredDay({ day, rect });
                }}
                onMouseLeave={() => setHoveredDay(null)}
                className={`photonic-cell group relative flex flex-col items-center justify-between border rounded-xl transition-all duration-150 overflow-hidden ${
                  isCompact ? 'p-1.5 h-15' : 'p-2 h-18'
                } ${isFuture ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-[1.05]'} ${cellBg} ${selectedClass}`}
                aria-label={`Day ${idx + 1} (${day.periodKey}): ${day.status}`}
              >
                <span className="text-[9px] font-mono font-medium tracking-tight text-neutral-400 relative z-10">
                  {day.periodKey.split('-').slice(1).join('/')}
                </span>

                <div className="flex items-center justify-center my-auto relative z-10">
                  {iconElement}
                </div>

                <span className="text-[9px] font-mono tabular-nums tracking-tight font-medium text-neutral-300 relative z-10">
                  {day.completedValue}/{day.targetValue}
                </span>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${liquidColor}`}
                    style={{ width: `${fillRatio}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ================= FLOATING VISIONOS INSPECTOR HOLOGRAM ================= */}
      {hoveredDay && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 antigravity-spotlight p-4 text-xs font-sans min-w-[240px] shadow-2xl animate-in fade-in zoom-in-95 duration-120"
          style={{
            top: `${hoveredDay.rect.top - 8}px`,
            left: `${hoveredDay.rect.left + hoveredDay.rect.width / 2}px`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-2.5 font-mono">
            <span className="font-semibold text-neutral-200 tracking-tight">{hoveredDay.day.periodKey}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wider uppercase ${
                hoveredDay.day.status === 'COMPLETED'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(52,211,153,0.4)]'
                  : hoveredDay.day.status === 'MISSED'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : hoveredDay.day.status === 'IN_PROGRESS'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                  : 'bg-white/[0.05] text-neutral-400 border border-white/[0.06]'
              }`}
            >
              {hoveredDay.day.status}
            </span>
          </div>

          {/* Telemetry Metrics Breakdown */}
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between text-neutral-400">
              <span>Required Target:</span>
              <span className="font-semibold text-neutral-100 tabular-nums">
                {hoveredDay.day.targetValue} {targetUnit}
              </span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Recorded Progress:</span>
              <span
                className={`font-semibold tabular-nums ${
                  hoveredDay.day.completedValue >= hoveredDay.day.targetValue
                    ? 'text-emerald-400'
                    : 'text-neutral-100'
                }`}
              >
                {hoveredDay.day.completedValue} {targetUnit}
              </span>
            </div>
            <div className="flex justify-between text-neutral-500 text-[10px] pt-1 border-t border-white/[0.05]">
              <span>Verification Protocol:</span>
              <span className="text-emerald-400 font-medium">Witness Signed</span>
            </div>
          </div>

          {(hoveredDay.day as any).proofNote && (
            <div className="mt-2.5 pt-2 border-t border-white/[0.06] text-[10px] text-neutral-300 italic line-clamp-2">
              "{(hoveredDay.day as any).proofNote}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
