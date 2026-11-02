import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isAlert?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isAlert = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-[#131418] border border-neutral-200 dark:border-white/[0.08] rounded-xl shadow-2xl p-6 text-[#111827] dark:text-[#f2f3f5]"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                isDestructive
                  ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20'
                  : 'bg-neutral-100 dark:bg-white/[0.04] text-[#111827] dark:text-[#f2f3f5] border border-neutral-200 dark:border-white/[0.08]'
              }`}
            >
              {isDestructive ? <AlertTriangle size={17} /> : <Info size={17} />}
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-[#111827] dark:text-[#f2f3f5]">{title}</h3>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="text-neutral-400 dark:text-[#8a8f98] hover:text-[#111827] dark:hover:text-[#f2f3f5] transition-colors cursor-pointer p-1"
            aria-label="Close modal"
          >
            <X size={15} />
          </button>
        </div>

        <p className="mt-3 text-xs text-neutral-600 dark:text-[#8a8f98] leading-relaxed font-sans">
          {message}
        </p>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          {!isAlert && (
            <button
              type="button"
              onClick={onCancel}
              className="mac-btn-secondary !text-xs !py-1.5 !px-3.5 !rounded-md"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`cursor-pointer transition-colors ${
              isDestructive
                ? 'px-3.5 py-1.5 rounded-md text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white shadow-xs'
                : 'mac-btn-primary !text-xs !py-1.5 !px-3.5 !rounded-md font-medium'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
