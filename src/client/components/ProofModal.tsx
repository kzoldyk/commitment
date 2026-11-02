import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Calendar,
  ShieldCheck,
  Clock,
  Plus,
  Trash2,
  Code2,
  Sparkles,
} from 'lucide-react';
import { CommitmentDay, api } from '../lib/api';

export interface LeetCodeProblemItem {
  id: string; // user input number e.g. "704"
  resolved?: {
    id: number;
    title: string;
    titleSlug: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    url: string;
  } | null;
  resolving?: boolean;
  takeaway: string;
}

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

  // Multi-problem items state
  const isLeetCodeOrCoding =
    commitmentTitle.toLowerCase().includes('leetcode') ||
    commitmentTitle.toLowerCase().includes('problem') ||
    targetUnit.toLowerCase().includes('problem');

  const [problems, setProblems] = useState<LeetCodeProblemItem[]>([
    { id: '', resolved: null, resolving: false, takeaway: '' },
  ]);

  const [value, setValue] = useState(String(remainingNeeded > 0 ? remainingNeeded : 1));
  const [generalNote, setGeneralNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-sync value when problem count changes if problems are being used
  useEffect(() => {
    const validCount = problems.filter((p) => p.resolved || p.id.trim()).length;
    if (validCount > 0 && isLeetCodeOrCoding) {
      setValue(String(validCount));
    }
  }, [problems, isLeetCodeOrCoding]);

  // Handle resolving a problem by number
  const handleProblemNumberChange = async (index: number, inputVal: string) => {
    const updated = [...problems];
    updated[index].id = inputVal;
    setProblems(updated);

    const cleanNum = inputVal.trim();
    if (!cleanNum || isNaN(Number(cleanNum))) {
      updated[index].resolved = null;
      updated[index].resolving = false;
      setProblems([...updated]);
      return;
    }

    updated[index].resolving = true;
    setProblems([...updated]);

    try {
      const res = await api.resolveLeetCode(cleanNum);
      const latest = [...problems];
      if (latest[index]) {
        latest[index].resolved = res.problem;
        latest[index].resolving = false;
        setProblems([...latest]);
      }
    } catch {
      const latest = [...problems];
      if (latest[index]) {
        latest[index].resolved = null;
        latest[index].resolving = false;
        setProblems([...latest]);
      }
    }
  };

  const handleTakeawayChange = (index: number, text: string) => {
    const updated = [...problems];
    updated[index].takeaway = text;
    setProblems(updated);
  };

  const addProblemRow = () => {
    setProblems([...problems, { id: '', resolved: null, resolving: false, takeaway: '' }]);
  };

  const removeProblemRow = (index: number) => {
    if (problems.length <= 1) {
      setProblems([{ id: '', resolved: null, resolving: false, takeaway: '' }]);
      return;
    }
    setProblems(problems.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid numeric progress value');
      return;
    }

    // Prepare metadata package
    const validResolvedProblems = problems
      .filter((p) => p.resolved || p.id.trim())
      .map((p) => ({
        id: p.resolved?.id || Number(p.id) || p.id,
        title: p.resolved?.title || `Problem #${p.id}`,
        difficulty: p.resolved?.difficulty || 'Medium',
        url: p.resolved?.url || `https://leetcode.com/problemset/?search=${p.id}`,
        takeaway: p.takeaway.trim(),
      }));

    // Build plain text summary for backward compatibility and email viewing
    let plainSummary = '';
    if (validResolvedProblems.length > 0) {
      plainSummary = validResolvedProblems
        .map(
          (p) =>
            `#${p.id} ${p.title} (${p.difficulty})\nURL: ${p.url}${p.takeaway ? `\nTakeaway: ${p.takeaway}` : ''}`
        )
        .join('\n\n');
    }

    if (generalNote.trim()) {
      plainSummary = plainSummary ? `${plainSummary}\n\nNote: ${generalNote.trim()}` : generalNote.trim();
    }

    const payloadMetadata = JSON.stringify({
      note: plainSummary,
      problems: validResolvedProblems,
    });

    try {
      setSubmitting(true);
      setError(null);
      await api.submitProof(commitmentId, day.id, num, payloadMetadata);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit proof');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-[#131418] border border-neutral-200 dark:border-white/[0.08] rounded-xl shadow-2xl overflow-hidden relative text-[#111827] dark:text-[#f2f3f5]">
        {/* Sheet Header */}
        <div className="px-5 py-3.5 bg-neutral-50 dark:bg-white/[0.02] border-b border-neutral-200 dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Sparkles size={12} />
            </div>
            <span className="text-xs font-semibold text-[#111827] dark:text-[#f2f3f5] tracking-tight">
              Evidence & Activity Inspector
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 dark:text-[#8a8f98] hover:text-[#111827] dark:hover:text-[#f2f3f5] transition-colors cursor-pointer p-1 rounded-md"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 sm:p-6 max-h-[85vh] overflow-y-auto space-y-5">
          {/* Day Status Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={13} className="text-neutral-500 dark:text-[#8a8f98]" />
                <span className="text-xs font-mono font-medium text-[#111827] dark:text-[#f2f3f5]">
                  {day.periodKey}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                    isCompleted
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : isMissed
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      : isInProgress
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20'
                      : 'bg-neutral-100 dark:bg-white/[0.04] text-neutral-600 dark:text-[#8a8f98] border border-neutral-200 dark:border-white/[0.06]'
                  }`}
                >
                  {day.status}
                </span>
              </div>
              <h3 className="font-semibold text-base text-[#111827] dark:text-[#f2f3f5] tracking-tight">{commitmentTitle}</h3>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[11px] font-mono text-neutral-500 dark:text-[#8a8f98] block">Progress</span>
              <span className="text-sm font-mono font-bold text-[#111827] dark:text-[#f2f3f5]">
                <span
                  className={
                    day.completedValue >= day.targetValue
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-500 dark:text-amber-400'
                  }
                >
                  {day.completedValue}
                </span>{' '}
                / {day.targetValue} {targetUnit}
              </span>
            </div>
          </div>

          {/* Submitted Proofs List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#c81e28]" />
                Recorded evidence ({day.proofs?.length || 0})
              </span>
            </div>

            {day.proofs && day.proofs.length > 0 ? (
              <div className="space-y-3">
                {day.proofs.map((proof) => {
                  let parsedProblems: Array<{
                    id: number | string;
                    title: string;
                    difficulty: string;
                    url: string;
                    takeaway?: string;
                  }> = [];
                  let parsedNote = proof.metadata || '';

                  try {
                    const parsed = JSON.parse(proof.metadata || '');
                    if (parsed && typeof parsed.note === 'string') {
                      parsedNote = parsed.note;
                    }
                    if (parsed && Array.isArray(parsed.problems)) {
                      parsedProblems = parsed.problems;
                    }
                  } catch {
                    // plain text fallback
                  }

                  const urlRegex = /(https?:\/\/[^\s]+)/g;
                  const parts = parsedNote.split(urlRegex);

                  return (
                    <div
                      key={proof.id}
                      className="bg-neutral-50 dark:bg-neutral-950/80 border border-neutral-200 dark:border-white/10 rounded-xl p-3.5 text-xs font-mono space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
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

                      {/* Render Structured Problems if present */}
                      {parsedProblems.length > 0 && (
                        <div className="space-y-2 pt-1">
                          {parsedProblems.map((prob, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/5 space-y-1"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <a
                                  href={prob.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-bold text-neutral-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 inline-flex items-center gap-1 transition-colors"
                                >
                                  <span>#{prob.id} {prob.title}</span>
                                  <ExternalLink size={11} className="text-neutral-400" />
                                </a>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                    prob.difficulty === 'Easy'
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                      : prob.difficulty === 'Hard'
                                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                  }`}
                                >
                                  {prob.difficulty}
                                </span>
                              </div>
                              {prob.takeaway && (
                                <p className="text-[11px] font-sans text-neutral-600 dark:text-neutral-300 italic pt-0.5">
                                  "{prob.takeaway}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Plain text commentary fallback if no structured problems or additional note */}
                      {parsedProblems.length === 0 && parsedNote && (
                        <div className="text-neutral-800 dark:text-neutral-200 break-words whitespace-pre-wrap leading-relaxed font-sans text-xs bg-white dark:bg-neutral-900 p-2.5 rounded-lg border border-neutral-200/80 dark:border-white/5">
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
            <div className="border-t border-neutral-200 dark:border-white/[0.06] pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-amber-500 dark:text-amber-400" />
                  <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#111827] dark:text-[#f2f3f5]">
                    Log Progress Evidence
                  </h4>
                </div>

                {isLeetCodeOrCoding && (
                  <button
                    type="button"
                    onClick={addProblemRow}
                    className="inline-flex items-center gap-1 text-xs font-mono text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Add another problem</span>
                  </button>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0 text-rose-500 dark:text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1-Field Auto-Resolution & Multi-Problem Flow */}
                {isLeetCodeOrCoding && (
                  <div className="space-y-2.5">
                    <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98]">
                      LeetCode Problems Solved Today
                    </label>

                    {problems.map((prob, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-neutral-200 dark:border-white/[0.06] bg-neutral-50 dark:bg-white/[0.02] space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <div className="relative w-32 shrink-0">
                            <input
                              type="text"
                              value={prob.id}
                              onChange={(e) => handleProblemNumberChange(idx, e.target.value)}
                              placeholder="Problem # (e.g. 704)"
                              className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md px-2.5 py-1.5 text-xs font-mono text-[#111827] dark:text-[#f2f3f5] focus:outline-none focus:border-neutral-400 dark:focus:border-white/30"
                            />
                            {prob.resolving && (
                              <div className="absolute right-2 top-2 text-[10px] font-mono text-neutral-400 dark:text-[#626670] animate-pulse">
                                ...
                              </div>
                            )}
                          </div>

                          {/* Live interactive resolved problem chip */}
                          {prob.resolved ? (
                            <div className="flex-1 flex items-center justify-between gap-2 bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md px-2.5 py-1">
                              <a
                                href={prob.resolved.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-xs text-[#111827] dark:text-[#f2f3f5] hover:underline flex items-center gap-1.5 truncate"
                                title="Open on LeetCode"
                              >
                                <span className="truncate">#{prob.resolved.id} {prob.resolved.title}</span>
                                <ExternalLink size={11} className="shrink-0 text-neutral-400 dark:text-[#8a8f98]" />
                              </a>
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold shrink-0 ${
                                  prob.resolved.difficulty === 'Easy'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : prob.resolved.difficulty === 'Hard'
                                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                }`}
                              >
                                {prob.resolved.difficulty}
                              </span>
                            </div>
                          ) : (
                            <div className="flex-1 text-[11px] font-mono text-neutral-400 dark:text-[#626670] flex items-center gap-1.5">
                              <Code2 size={12} />
                              <span>Type problem number to auto-resolve</span>
                            </div>
                          )}

                          {problems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeProblemRow(idx)}
                              className="text-neutral-400 dark:text-[#626670] hover:text-rose-500 p-1 cursor-pointer"
                              title="Remove problem"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>

                        {/* Distinct takeaway input for this problem */}
                        <input
                          type="text"
                          value={prob.takeaway}
                          onChange={(e) => handleTakeawayChange(idx, e.target.value)}
                          placeholder="Personal takeaway / algorithm approach (e.g. Binary search low <= high boundary)..."
                          className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md px-3 py-1.5 text-xs text-[#111827] dark:text-[#f2f3f5] placeholder:text-neutral-400 dark:placeholder:text-[#626670] focus:outline-none focus:border-neutral-400 dark:focus:border-white/30"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Progress Value Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98]">
                      Amount to Add ({targetUnit})
                    </label>
                    <span className="text-[11px] font-mono text-neutral-400 dark:text-[#626670]">
                      Target: {day.targetValue} {targetUnit}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md px-3.5 py-2 text-[#111827] dark:text-[#f2f3f5] font-mono text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 focus:ring-1 focus:ring-neutral-200 dark:focus:ring-white/20 transition-all placeholder:text-neutral-400 dark:placeholder:text-[#626670]"
                    placeholder={`e.g. ${remainingNeeded || 1}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1.5">
                    General Session Notes or PR Links (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={generalNote}
                    onChange={(e) => setGeneralNote(e.target.value)}
                    className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md px-3.5 py-2 text-[#111827] dark:text-[#f2f3f5] text-xs focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 focus:ring-1 focus:ring-neutral-200 dark:focus:ring-white/20 transition-all placeholder:text-neutral-400 dark:placeholder:text-[#626670] resize-none font-sans"
                    placeholder="Completed LeetCode, additional context, or verification notes..."
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="mac-btn-secondary !px-3.5 !py-1.5 !rounded-md text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mac-btn-primary !px-4 !py-1.5 !rounded-md text-xs font-medium shadow-xs disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{submitting ? 'Submitting...' : 'Log proof'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="border-t border-neutral-200 dark:border-white/[0.06] pt-3.5 flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#626670]">
                {!isCreator
                  ? 'Inspection mode (Accountability Partner)'
                  : day.status === 'COMPLETED'
                  ? 'Day completed successfully.'
                  : 'Day closed.'}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="mac-btn-secondary !px-3.5 !py-1.5 !rounded-md text-xs font-medium cursor-pointer"
              >
                <span>Close</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
