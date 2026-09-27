import React from 'react';

interface MacWindowProps {
  title?: string;
  className?: string;
  titleBarClassName?: string;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
}

export const MacWindow: React.FC<MacWindowProps> = ({
  title,
  className = '',
  titleBarClassName = '',
  children,
  rightAction,
  icon,
  onClose,
}) => {
  return (
    <div
      className={`rounded-xl bg-white/95 dark:bg-neutral-900/90 text-neutral-900 dark:text-neutral-100 border border-neutral-200/80 dark:border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden transition-all duration-200 ${className}`}
    >
      {/* macOS Titlebar */}
      <div
        className={`flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-b from-[#f8f8fa] to-[#ececed] dark:from-[#282830] dark:to-[#1c1c22] border-b border-black/[0.08] dark:border-white/[0.08] select-none ${titleBarClassName}`}
      >
        <div className="flex items-center gap-2 group/dots">
          <button
            type="button"
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center text-[8px] text-black/60 font-black cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"
            title="Close"
          >
            <span className="opacity-0 group-hover/dots:opacity-100 transition-opacity">×</span>
          </button>
          <div
            className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] flex items-center justify-center text-[8px] text-black/60 font-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"
            title="Minimize"
          >
            <span className="opacity-0 group-hover/dots:opacity-100 transition-opacity">−</span>
          </div>
          <div
            className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] flex items-center justify-center text-[8px] text-black/60 font-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"
            title="Zoom"
          >
            <span className="opacity-0 group-hover/dots:opacity-100 transition-opacity">+</span>
          </div>
        </div>

        {title && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 font-mono tracking-tight">
            {icon && <span className="opacity-80">{icon}</span>}
            <span>{title}</span>
          </div>
        )}

        <div>
          {rightAction || <div className="w-12" />}
        </div>
      </div>

      {/* Window Body */}
      <div className="p-5 sm:p-6">
        {children}
      </div>
    </div>
  );
};
