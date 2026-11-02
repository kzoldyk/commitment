import React from 'react';
import { X } from 'lucide-react';

export interface CardFrameProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
  titleBarClassName?: string;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
  showTrafficLights?: boolean;
}

export const MacWindow: React.FC<CardFrameProps> = ({
  title,
  subtitle,
  className = '',
  titleBarClassName = '',
  children,
  rightAction,
  icon,
  onClose,
}) => {
  return (
    <div
      className={`rounded-xl bg-[var(--fc-surface)] text-[var(--fc-accent-black)] border border-[var(--fc-border-muted)] shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-150 hover:border-[var(--fc-border-loud)] ${className}`}
    >
      {/* Header Bar */}
      {(title || rightAction || onClose) && (
        <div
          className={`flex items-center justify-between px-5 py-3.5 bg-[var(--fc-alpha-4)] border-b border-[var(--fc-border-faint)] select-none ${titleBarClassName}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="w-7 h-7 rounded-md bg-[var(--fc-alpha-4)] border border-[var(--fc-border-muted)] flex items-center justify-center shrink-0 text-[var(--fc-accent-black)]">
                {icon}
              </div>
            )}
            <div className="truncate">
              {title && (
                <div className="text-sm font-semibold tracking-tight text-[var(--fc-accent-black)] flex items-center gap-2">
                  {title}
                </div>
              )}
              {subtitle && (
                <div className="text-[11px] font-mono text-[var(--fc-accent-black)]/60">
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {rightAction}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-md hover:bg-[var(--fc-alpha-8)] text-[var(--fc-accent-black)]/60 hover:text-[var(--fc-accent-black)] transition-colors cursor-pointer"
                title="Close"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="p-5 sm:p-6">
        {children}
      </div>
    </div>
  );
};
