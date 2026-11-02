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
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border transition-colors ${
        streak > 0
          ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
          : 'bg-white/[0.04] border-white/[0.06] text-[#626670]'
      }`}
    >
      <Flame
        size={iconSize}
        className={streak > 0 ? 'text-amber-400 fill-amber-400/20' : 'text-[#626670]'}
      />
      <span className={`font-mono tabular-nums ${textSize}`}>
        {streak} {streak === 1 ? 'day' : 'days'}
      </span>
    </div>
  );
};
