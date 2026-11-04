import React from 'react';

interface LivesIndicatorProps {
  currentLives: number;
  maxLives: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const LivesIndicator: React.FC<LivesIndicatorProps> = ({
  currentLives,
  maxLives,
  size = 'md',
  showLabel = false,
}) => {
  const cellHeight = size === 'sm' ? 'h-2 w-5' : size === 'lg' ? 'h-3 w-8' : 'h-2.5 w-6';

  return (
    <div
      className="inline-flex items-center gap-2 select-none"
      title={`${currentLives} of ${maxLives} lives remaining`}
    >
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-neutral-200/50 dark:bg-white/[0.03] border border-neutral-300/60 dark:border-white/[0.06] backdrop-blur-sm">
        {Array.from({ length: maxLives }).map((_, idx) => {
          const isAlive = idx < currentLives;
          return (
            <div
              key={idx}
              className={`rounded-full transition-all duration-300 relative overflow-hidden ${cellHeight} ${
                isAlive
                  ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.55)] border border-rose-300/50'
                  : 'bg-neutral-300/70 dark:bg-[#08090d] border border-neutral-400/40 dark:border-white/[0.05] shadow-inner opacity-40'
              }`}
            >
              {isAlive && (
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-full" />
              )}
            </div>
          );
        })}
      </div>
      {showLabel && (
        <span className="text-[11px] font-mono tabular-nums text-neutral-500 dark:text-[#8a8f98]">
          {currentLives}/{maxLives} lives
        </span>
      )}
    </div>
  );
};
