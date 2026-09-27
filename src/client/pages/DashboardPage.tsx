import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Flame, Heart, CheckCircle2, Clock, AlertTriangle, ShieldCheck, ChevronRight, Check, X, RefreshCw, Terminal, Coins, Trash2 } from 'lucide-react';
import { api, DashboardData, Commitment, CommitmentDay } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { LivesIndicator } from '../components/LivesIndicator';
import { StreakBadge } from '../components/StreakBadge';
import { ProofModal } from '../components/ProofModal';
import { MacWindow } from '../components/MacWindow';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [evalMessage, setEvalMessage] = useState<string | null>(null);

  // Proof Modal state
  const [selectedProofDay, setSelectedProofDay] = useState<{ day: CommitmentDay; commitment: Commitment } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await api.acceptCommitment(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to accept commitment');
    }
  };

  const handleDecline = async (id: string) => {
    if (!confirm('Are you sure you want to decline this accountability contract?')) return;
    try {
      await api.declineCommitment(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to decline commitment');
    }
  };

  const handleCancelPending = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to cancel and delete the pending contract "${title}"?`)) return;
    try {
      await api.cancelCommitment(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete pending contract');
    }
  };

  const handleRunEvaluation = async () => {
    try {
      setEvaluating(true);
      const res = await api.triggerEvaluation();
      setEvalMessage(`Evaluation completed: ${res.result.evaluatedDays} days evaluated (${res.result.successes} successes, ${res.result.failures} failures, ${res.result.restorations} restorations)`);
      setTimeout(() => setEvalMessage(null), 6000);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to run evaluation');
    } finally {
      setEvaluating(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-neutral-500 font-mono text-xs">
          <RefreshCw size={16} className="animate-spin text-rose-500" />
          <span>loading mission control...</span>
        </div>
      </div>
    );
  }

  const pendingIncoming = data?.pendingInvitations.filter((p) => !p.isCreator) || [];
  const pendingSent = data?.pendingInvitations.filter((p) => p.isCreator) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.displayName || user?.username}.
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-1">
            today: <span className="text-neutral-900 dark:text-neutral-200">{data?.todayDate}</span> · timezone: <span className="text-neutral-900 dark:text-neutral-200">{data?.userTimezone}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunEvaluation}
            disabled={evaluating}
            className="mac-btn-secondary px-3.5 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-2 cursor-pointer shadow-sm"
            title="Trigger scheduled evaluation check for closed periods"
          >
            <div className="mac-gloss" />
            <RefreshCw size={13} className={evaluating ? 'animate-spin text-amber-500' : 'text-neutral-500'} />
            <span>{evaluating ? 'evaluating...' : 'run evaluation'}</span>
          </button>

          <Link
            to="/create"
            className="mac-btn-primary px-4 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            <div className="mac-gloss" />
            <Plus size={14} />
            <span>new contract</span>
          </Link>
        </div>
      </div>

      {evalMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-mono flex items-center justify-between">
          <span>{evalMessage}</span>
          <button onClick={() => setEvalMessage(null)} className="text-emerald-600 dark:text-emerald-400 hover:opacity-75">✕</button>
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/60 backdrop-blur-md shadow-sm">
          <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
            Active Contracts
          </span>
          <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">{data?.stats.activeCount || 0}</span>
        </div>

        <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/60 backdrop-blur-md shadow-sm">
          <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
            Highest Streak
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">{data?.stats.highestStreak || 0}</span>
            <Flame size={16} className="text-amber-500" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/60 backdrop-blur-md shadow-sm">
          <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
            Successful Days
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{data?.stats.totalSuccessfulDays || 0}</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/60 backdrop-blur-md shadow-sm">
          <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
            Pending Invites
          </span>
          <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">{data?.stats.pendingInvitesCount || 0}</span>
        </div>
      </div>

      {/* Incoming Requests Section (if any) */}
      {pendingIncoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertTriangle size={14} />
            <span>incoming accountability requests ({pendingIncoming.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingIncoming.map((invite) => (
              <MacWindow key={invite.id} title="invitation_request.app">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                        from <strong className="text-neutral-900 dark:text-white">@{invite.creator?.username}</strong>
                      </span>
                      <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">{invite.rule?.frequencyType}</span>
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1">{invite.title}</h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 font-mono">
                      Target: {invite.rule?.targetValue} {invite.rule?.targetUnit} · {invite.currentLives} Lives
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-black/10 dark:border-white/10">
                    <button
                      onClick={() => handleAccept(invite.id)}
                      className="mac-btn-primary flex-1 py-2 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <div className="mac-gloss" />
                      <Check size={14} />
                      <span>accept contract</span>
                    </button>
                    <button
                      onClick={() => handleDecline(invite.id)}
                      className="mac-btn-secondary px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 font-medium text-xs cursor-pointer"
                    >
                      <div className="mac-gloss" />
                      <span>decline</span>
                    </button>
                  </div>
                </div>
              </MacWindow>
            ))}
          </div>
        </div>
      )}

      {/* Active Contracts Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-neutral-700 dark:text-neutral-300">
          active contracts ({data?.activeCommitments.length || 0})
        </h2>

        {data?.activeCommitments.length === 0 ? (
          <MacWindow title="empty_contracts.txt">
            <div className="py-10 text-center">
              <ShieldCheck size={36} className="text-neutral-400 dark:text-neutral-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1">no active commitments</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-5 font-mono">
                forge a new contract with measurable rules and designate an accountability partner.
              </p>
              <Link
                to="/create"
                className="mac-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-semibold"
              >
                <div className="mac-gloss" />
                <Plus size={14} />
                <span>create commitment</span>
              </Link>
            </div>
          </MacWindow>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data?.activeCommitments.map((c) => {
              const today = c.todayProgress;
              const isTodayCompleted = today?.status === 'COMPLETED';
              const completedVal = today?.completedValue || 0;
              const targetVal = c.rule?.targetValue || 1;
              const progressPct = Math.min(100, Math.round((completedVal / targetVal) * 100));
              const isFuture = Boolean(data?.todayDate && today?.periodKey && today.periodKey > data.todayDate);
              const progressLabel = isFuture
                ? `Starts ${today?.periodKey} (Day 1)`
                : `Today's Progress (${today?.periodKey || data?.todayDate})`;

              return (
                <MacWindow
                  key={c.id}
                  title={`${c.title.slice(0, 26)}...`}
                  rightAction={
                    <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                      {c.isCreator ? `@${c.partner?.username}` : `@${c.creator?.username}`}
                    </span>
                  }
                >
                  <div className="space-y-4">
                    {/* Header with Lives & Streak */}
                    <div className="flex items-center justify-between">
                      <LivesIndicator currentLives={c.currentLives} maxLives={c.rule?.maxLives || 3} size="md" />
                      <StreakBadge streak={c.currentStreak} size="sm" />
                    </div>

                    {/* Title */}
                    <Link to={`/commitments/${c.id}`} className="block group">
                      <h3 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        {c.title}
                      </h3>
                    </Link>

                    {/* Today's Target Box */}
                    <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-black/40 border border-black/5 dark:border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                          {isFuture && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-500 font-semibold border border-blue-500/20">
                              STARTS {today?.periodKey}
                            </span>
                          )}
                          <span>{progressLabel}</span>
                        </span>
                        <span className={`font-bold ${isTodayCompleted ? 'text-emerald-600 dark:text-emerald-400' : completedVal > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-600 dark:text-neutral-400'}`}>
                          {completedVal} / {targetVal} {c.rule?.targetUnit} {isTodayCompleted && '(Done ✓)'}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            isTodayCompleted ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : completedVal > 0 ? 'bg-amber-500' : 'bg-neutral-300 dark:bg-neutral-700'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      {isFuture && (
                        <p className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 pt-0.5">
                          Contract begins on {today?.periodKey}. No missed penalty will be evaluated today.
                        </p>
                      )}
                    </div>

                    {/* Financial Stake / Debt Counter Badge */}
                    {c.rule?.stakeAmount && c.rule.stakeAmount > 0 && (
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono">
                        <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1.5 font-semibold">
                          <Coins size={13} className="text-amber-500 shrink-0" />
                          <span>{c.isCreator ? 'Debt Owed to Partner:' : 'Debt Owed to You:'}</span>
                        </span>
                        <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                          {c.rule.stakeCurrency === 'INR' ? '₹' : c.rule.stakeCurrency} {(c.accumulatedPenalty || 0).toLocaleString()}
                          <span className="text-[10px] font-normal text-neutral-500 ml-1">
                            ({c.rule.stakeCurrency === 'INR' ? '₹' : c.rule.stakeCurrency}{c.rule.stakeAmount}/miss)
                          </span>
                        </span>
                      </div>
                    )}

                    {/* Action Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10">
                      <Link
                        to={`/commitments/${c.id}`}
                        className="text-xs font-mono text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <span>inspect contract</span>
                        <ChevronRight size={13} />
                      </Link>

                      {c.isCreator && today && !isFuture && !isTodayCompleted && (
                        <button
                          onClick={() => setSelectedProofDay({ day: today, commitment: c })}
                          className="mac-btn-primary px-3.5 py-1.5 rounded-lg text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <div className="mac-gloss" />
                          <CheckCircle2 size={13} />
                          <span>log proof</span>
                        </button>
                      )}
                    </div>
                  </div>
                </MacWindow>
              );
            })}
          </div>
        )}
      </div>

      {/* Outgoing Awaiting Acceptance */}
      {pendingSent.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-black/10 dark:border-white/10">
          <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-neutral-500">
            awaiting partner acceptance ({pendingSent.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pendingSent.map((p) => (
              <MacWindow
                key={p.id}
                title="pending.plist"
                rightAction={
                  <button
                    onClick={() => handleCancelPending(p.id, p.title)}
                    className="text-neutral-400 hover:text-rose-500 transition-colors p-0.5 cursor-pointer"
                    title="Delete pending contract"
                  >
                    <Trash2 size={13} />
                  </button>
                }
              >
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1 truncate">{p.title}</h4>
                    <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                      waiting on <strong className="text-neutral-700 dark:text-neutral-300">@{p.partner?.username}</strong>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10 text-xs font-mono">
                    <Link
                      to={`/commitments/${p.id}`}
                      className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <span>inspect / edit</span>
                      <ChevronRight size={12} />
                    </Link>

                    <button
                      onClick={() => handleCancelPending(p.id, p.title)}
                      className="text-rose-600 dark:text-rose-400 hover:text-rose-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 size={12} />
                      <span>delete</span>
                    </button>
                  </div>
                </div>
              </MacWindow>
            ))}
          </div>
        </div>
      )}

      {/* Proof Modal */}
      {selectedProofDay && (
        <ProofModal
          isOpen={true}
          onClose={() => setSelectedProofDay(null)}
          day={selectedProofDay.day}
          commitmentId={selectedProofDay.commitment.id}
          commitmentTitle={selectedProofDay.commitment.title}
          targetUnit={selectedProofDay.commitment.rule?.targetUnit || ''}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};
