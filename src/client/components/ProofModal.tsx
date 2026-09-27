import React, { useState } from 'react';
import { X, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { CommitmentDay, api } from '../lib/api';

interface ProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: CommitmentDay | null;
  commitmentId: string;
  commitmentTitle: string;
  targetUnit: string;
  onSuccess: () => void;
}

export const ProofModal: React.FC<ProofModalProps> = ({
  isOpen,
  onClose,
  day,
  commitmentId,
  commitmentTitle,
  targetUnit,
  onSuccess,
}) => {
  if (!isOpen || !day) return null;

  const remainingNeeded = Math.max(0, day.targetValue - day.completedValue);
  const [value, setValue] = useState(String(remainingNeeded || 1));
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid numeric progress value');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.submitProof(commitmentId, day.id, num, note.trim() || undefined);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit proof');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Log Progress & Proof</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">Date: {day.periodKey}</p>
          </div>
        </div>

        <div className="bg-neutral-100/80 dark:bg-neutral-950 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800/80 mb-5">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Commitment</p>
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-200">{commitmentTitle}</p>
          <div className="mt-2 flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-500 dark:text-neutral-400">Current Progress:</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              {day.completedValue} / {day.targetValue} {targetUnit}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase">
              Amount to Add ({targetUnit})
            </label>
            <input
              type="number"
              step="any"
              min="0.1"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-900 dark:text-white font-mono text-base focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-950 transition-all"
              placeholder={`e.g. ${remainingNeeded || 1}`}
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase">
              Proof Notes / Link (Optional)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-950 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600 resize-none"
              placeholder="e.g. Completed LeetCode #704 and #33. Solved with two-pointers."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="mac-btn-primary px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-lg disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <div className="mac-gloss" />
              <span>{submitting ? 'Submitting...' : 'Confirm Proof'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
