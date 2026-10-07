import React, { useState } from 'react';
import { X, CheckCircle2, FileText, AlertCircle, ExternalLink, Calendar, ShieldCheck, Check, Clock } from 'lucide-react';
import { CommitmentDay, api } from '../lib/api';

interface ProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: CommitmentDay | null;
  commitmentId: string;
  commitmentTitle: string;
  targetUnit: string;
  isCreator?: boolean;
  onSuccess: () => void;
}

export const ProofModal: React.FC<ProofModalProps> = ({
  isOpen,
  onClose,
  day,
  commitmentId,
  commitmentTitle,
  targetUnit,
  isCreator = false,
  onSuccess,
}) => {
  if (!isOpen || !day) return null;

  const isCompleted = day.status === 'COMPLETED';
  const isMissed = day.status === 'MISSED';
  const isInProgress = day.status === 'IN_PROGRESS';
  const canSubmit = isCreator && (isInProgress || day.status === 'PENDING');

  const remainingNeeded = Math.max(0, day.targetValue - day.completedValue);
  const [value, setValue] = useState(String(remainingNeeded > 0 ? remainingNeeded : 1));
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
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden relative">
        {/* macOS Style Window Bar */}
        <div className="px-4 py-3 bg-neutral-100/90 dark:bg-neutral-800/80 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 text-xs font-mono text-neutral-600 dark:text-neutral-400 font-medium">
              day_evidence_inspector.app
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer p-1 rounded-md"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 max-h-[85vh] overflow-y-auto">
          {/* Day Status Header */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className="text-neutral-500 dark:text-neutral-400" />
                <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                  {day.periodKey}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                    isCompleted
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : isMissed
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      : isInProgress
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/30'
                  }`}
                >
                  {day.status}
                </span>
              </div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white">{commitmentTitle}</h3>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 block">Progress</span>
              <span className="text-sm font-mono font-bold text-neutral-900 dark:text-white">
                <span className={day.completedValue >= day.targetValue ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                  {day.completedValue}
                </span>{' '}
                / {day.targetValue} {targetUnit}
              </span>
            </div>
          </div>

          {/* Submitted Proofs List (Seen by BOTH Creator and Partner) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-rose-500" />
                Recorded Proofs & Evidence ({day.proofs?.length || 0})
              </span>
            </div>

            {day.proofs && day.proofs.length > 0 ? (
              <div className="space-y-2.5">
                {day.proofs.map((proof) => {
                  let parsedNote = proof.metadata || '';
                  try {
                    const parsed = JSON.parse(proof.metadata || '');
                    if (parsed && typeof parsed.note === 'string') {
                      parsedNote = parsed.note;
                    }
                  } catch {
                    // plain text fallback
                  }

                  const urlRegex = /(https?:\/\/[^\s]+)/g;
                  const parts = parsedNote.split(urlRegex);

                  return (
                    <div
                      key={proof.id}
                      className="bg-neutral-100/90 dark:bg-neutral-950/80 border border-black/5 dark:border-white/10 rounded-xl p-3 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between mb-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          +{proof.value} {targetUnit}
                        </span>
                        <span className="flex items-center gap-1 opacity-80">
                          <Clock size={11} />
                          {new Date(proof.submittedAt * 1000).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {parsedNote ? (
                        <div className="text-neutral-800 dark:text-neutral-200 break-words whitespace-pre-wrap leading-relaxed font-sans text-xs bg-white/60 dark:bg-neutral-900/60 p-2.5 rounded-lg border border-black/5 dark:border-white/5">
                          {parts.map((part, i) =>
                            part.match(urlRegex) ? (
                              <a
                                key={i}
                                href={part}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-rose-600 dark:text-rose-400 underline font-mono text-[11px] inline-flex items-center gap-1 hover:opacity-80"
                              >
                                {part} <ExternalLink size={10} />
                              </a>
                            ) : (
                              <span key={i}>{part}</span>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-neutral-400 dark:text-neutral-500 italic text-xs">No commentary submitted.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 text-center font-mono text-xs text-neutral-500">
                No proofs recorded for this day yet.
              </div>
            )}
          </div>

          {/* Submission Form for Creator on Active/Pending Day */}
          {canSubmit ? (
            <div className="border-t border-black/10 dark:border-white/10 pt-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={15} className="text-rose-500" />
                <h4 className="text-xs font-mono uppercase font-bold text-neutral-800 dark:text-neutral-200">
                  Submit New Evidence
                </h4>
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
                    Proof Notes, Verification Link, or PR URL (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-900 dark:text-white text-xs focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-950 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600 resize-none font-sans"
                    placeholder="e.g. Completed LeetCode #704. https://github.com/user/project/pull/42"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mac-btn-primary px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-lg disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <div className="mac-gloss" />
                    <span>{submitting ? 'Submitting...' : 'Log Proof'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="border-t border-black/10 dark:border-white/10 pt-4 flex items-center justify-between">
              <span className="text-[11px] font-mono text-neutral-500">
                {!isCreator
                  ? 'Inspection mode (Accountability Partner)'
                  : day.status === 'COMPLETED'
                  ? 'Day completed successfully.'
                  : 'Day closed.'}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="mac-btn-secondary px-4 py-1.5 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer"
              >
                <div className="mac-gloss" />
                <span>Close</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
