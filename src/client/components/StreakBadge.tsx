import React from 'react';
import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streak, size = 'md' }) => {
  const iconSize = size === 'sm' ? 13 : size === 'lg' ? 18 : 15;
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base font-bold' : 'text-sm font-semibold';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
        streak > 0
          ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.15)]'
          : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500'
      }`}
    >
      <Flame size={iconSize} className={streak > 0 ? 'text-amber-500 animate-pulse' : 'text-neutral-400 dark:text-neutral-600'} />
      <span className={`font-mono ${textSize}`}>
        {streak} {streak === 1 ? 'day' : 'days'}
      </span>
    </div>
  );
};
