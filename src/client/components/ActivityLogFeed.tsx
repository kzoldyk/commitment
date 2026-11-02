import React, { useState, useMemo } from 'react';
import {
  Search,
  ExternalLink,
  Clock,
  Calendar,
  Filter,
  CheckCircle2,
  X,
  FileText,
  Code2,
} from 'lucide-react';
import { CommitmentDay } from '../lib/api';

export interface FlattenedProofLog {
  id: string;
  dayId: string;
  periodKey: string;
  value: number;
  submittedAt: number;
  problems: Array<{
    id: number | string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard' | string;
    url: string;
    takeaway?: string;
  }>;
  note: string;
}

interface ActivityLogFeedProps {
  days: CommitmentDay[];
  targetUnit: string;
  filteredDate: string | null;
  onClearDateFilter: () => void;
  onOpenProofModal?: (day: CommitmentDay) => void;
}

export const ActivityLogFeed: React.FC<ActivityLogFeedProps> = ({
  days,
  targetUnit,
  filteredDate,
  onClearDateFilter,
  onOpenProofModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | 'Easy' | 'Medium' | 'Hard'>('ALL');

  // Flatten all proofs across all commitment days
  const allLogs = useMemo(() => {
    const list: FlattenedProofLog[] = [];

    for (const day of days) {
      if (!day.proofs || day.proofs.length === 0) continue;

      for (const proof of day.proofs) {
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

        list.push({
          id: proof.id,
          dayId: day.id,
          periodKey: day.periodKey,
          value: proof.value,
          submittedAt: proof.submittedAt,
          problems: parsedProblems,
          note: parsedNote,
        });
      }
    }

    // Sort descending by submission time
    return list.sort((a, b) => b.submittedAt - a.submittedAt);
  }, [days]);

  // Apply filters: Search query, difficulty filter chip, and heatmap date sync
  const filteredLogs = useMemo(() => {
    return allLogs.filter((log) => {
      // 1. Heatmap Date Filter Sync
      if (filteredDate && log.periodKey !== filteredDate) {
        return false;
      }

      // 2. Difficulty Filter
      if (difficultyFilter !== 'ALL') {
        const hasMatchingDifficulty = log.problems.some(
          (p) => p.difficulty?.toLowerCase() === difficultyFilter.toLowerCase()
        );
        if (!hasMatchingDifficulty) {
          return false;
        }
      }

      // 3. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesDate = log.periodKey.toLowerCase().includes(q);
        const matchesNote = log.note.toLowerCase().includes(q);
        const matchesProblem = log.problems.some(
          (p) =>
            String(p.id).includes(q) ||
            p.title?.toLowerCase().includes(q) ||
            p.takeaway?.toLowerCase().includes(q)
        );

        if (!matchesDate && !matchesNote && !matchesProblem) {
          return false;
        }
      }

      return true;
    });
  }, [allLogs, filteredDate, difficultyFilter, searchQuery]);

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return (
    <div className="space-y-3">
      {/* Search Bar & Difficulty Filter Chips */}
      <div className="bg-white dark:bg-white/[0.02] border border-neutral-200 dark:border-white/[0.06] rounded-lg p-3 space-y-2.5">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-2.5 text-neutral-400 dark:text-[#626670]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problem #, title, or keywords..."
            className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.06] rounded-md pl-8 pr-7 py-1.5 text-xs text-[#111827] dark:text-[#f2f3f5] font-sans placeholder:text-neutral-400 dark:placeholder:text-[#626670] focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 focus:ring-1 focus:ring-neutral-200 dark:focus:ring-white/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-neutral-400 dark:text-[#626670] hover:text-[#111827] dark:hover:text-[#f2f3f5]"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-200 dark:border-white/[0.06]">
          {/* Difficulty Filter Chips */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-neutral-500 dark:text-[#626670] mr-1 flex items-center gap-1">
              <Filter size={11} />
              Filter:
            </span>
            {(['ALL', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficultyFilter(diff)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
                  difficultyFilter === diff
                    ? diff === 'Easy'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-medium'
                      : diff === 'Medium'
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-medium'
                      : diff === 'Hard'
                      ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-medium'
                      : 'bg-neutral-900 dark:bg-white/[0.12] text-white dark:text-[#f2f3f5] border border-neutral-900 dark:border-white/[0.15] font-medium'
                    : 'bg-neutral-100 dark:bg-white/[0.04] text-neutral-600 dark:text-[#8a8f98] hover:bg-neutral-200/60 dark:hover:bg-white/[0.08]'
                }`}
              >
                {diff === 'ALL' ? 'All' : diff}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-mono text-neutral-500 dark:text-[#626670]">
            {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {/* Date Filter Sync Banner */}
        {filteredDate && (
          <div className="p-2 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs font-mono">
            <span className="text-amber-400 flex items-center gap-1.5">
              <Calendar size={12} />
              Filtered: <strong>{filteredDate}</strong>
            </span>
            <button
              onClick={onClearDateFilter}
              className="text-amber-400 hover:underline font-semibold text-[11px] cursor-pointer"
            >
              Show all
            </button>
          </div>
        )}
      </div>

      {/* Feed List */}
      <div className="space-y-2.5">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-lg border border-[var(--fc-border-faint)] bg-[var(--fc-surface)] space-y-2.5 transition-colors hover:border-[var(--fc-border-loud)]"
            >
              {/* Top Meta Bar */}
              <div className="flex items-center justify-between text-xs font-mono border-b border-neutral-100 dark:border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-white/5 font-semibold text-neutral-800 dark:text-neutral-200">
                    {log.periodKey}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    +{log.value} {targetUnit}
                  </span>
                </div>

                <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                  <Clock size={11} />
                  {new Date(log.submittedAt * 1000).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Resolved Problems Cards */}
              {log.problems.length > 0 ? (
                <div className="space-y-2">
                  {log.problems.map((prob, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/70 dark:border-white/5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={prob.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-xs text-neutral-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 inline-flex items-center gap-1.5 transition-colors"
                        >
                          <span>#{prob.id} {prob.title}</span>
                          <ExternalLink size={12} className="text-neutral-400" />
                        </a>

                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
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
                        <p className="text-xs font-sans text-neutral-600 dark:text-neutral-300 leading-relaxed pt-0.5">
                          "{prob.takeaway}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}

              {/* General Note / Commentary */}
              {log.note && (
                <div className="text-xs font-sans text-neutral-700 dark:text-neutral-300 bg-neutral-50/50 dark:bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-100 dark:border-white/5 leading-relaxed whitespace-pre-wrap break-words">
                  {log.note.split(urlRegex).map((part, i) =>
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
          ))
        ) : (
          <div className="p-8 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 text-center space-y-2">
            <FileText size={24} className="text-neutral-400 mx-auto" />
            <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              No activity logs match your filter
            </h4>
            <p className="text-xs text-neutral-500 font-mono">
              Try adjusting your search query, difficulty chip, or date filter.
            </p>
            {(searchQuery || difficultyFilter !== 'ALL' || filteredDate) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setDifficultyFilter('ALL');
                  onClearDateFilter();
                }}
                className="mt-2 text-xs font-mono text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                Reset all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
