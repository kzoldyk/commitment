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
            className={`transition-all duration-200 ${
              isAlive
                ? 'text-[#eb3424] drop-shadow-[0_0_8px_rgba(235,52,36,0.4)] scale-100'
                : 'text-white/15 scale-90'
            }`}
          >
            <Heart
              size={iconSize}
              fill={isAlive ? 'currentColor' : 'none'}
              strokeWidth={isAlive ? 0 : 1.75}
            />
          </div>
        );
      })}
    </div>
  );
};
