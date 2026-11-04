import React from 'react';
import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streak, size = 'md' }) => {
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;
  const textSize = size === 'sm' ? 'text-[11px]' : size === 'lg' ? 'text-sm font-semibold' : 'text-xs font-medium';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border transition-all duration-200 select-none ${
        streak > 0
          ? 'bg-amber-500/[0.08] border-amber-500/30 text-amber-400 dark:text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)] backdrop-blur-sm'
          : 'bg-neutral-200/60 dark:bg-white/[0.03] border-neutral-300 dark:border-white/[0.06] text-neutral-500 dark:text-[#626670]'
      }`}
    >
      <Flame
        size={iconSize}
        className={streak > 0 ? 'text-amber-500 dark:text-amber-400 fill-amber-500/20 animate-pulse' : 'text-neutral-400 dark:text-[#626670]'}
      />
      <span className={`font-mono tabular-nums ${textSize}`}>
        {streak} {streak === 1 ? 'day' : 'days'}
      </span>
    </div>
  );
};
