import React from 'react';
import { Heart } from 'lucide-react';

interface LivesIndicatorProps {
  currentLives: number;
  maxLives: number;
  size?: 'sm' | 'md' | 'lg';
}

export const LivesIndicator: React.FC<LivesIndicatorProps> = ({ currentLives, maxLives, size = 'md' }) => {
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 22 : 18;

  return (
    <div className="flex items-center gap-1.5" title={`${currentLives} of ${maxLives} lives remaining`}>
      {Array.from({ length: maxLives }).map((_, idx) => {
        const isAlive = idx < currentLives;
        return (
          <div
            key={idx}
            className={`transition-all duration-300 ${
              isAlive
                ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.45)] scale-100'
                : 'text-neutral-300 dark:text-neutral-700 opacity-70 dark:opacity-40 scale-90'
            }`}
          >
            <Heart
              size={iconSize}
              fill={isAlive ? 'currentColor' : 'none'}
              strokeWidth={isAlive ? 0 : 2}
            />
          </div>
        );
      })}
    </div>
  );
};
