import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Shield, Flame, Heart, CheckCircle2, Clock, AlertTriangle, AlertCircle, ArrowLeft, PlusCircle, Check, X, History, Coins } from 'lucide-react';
import { api, Commitment, CommitmentDay } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { LivesIndicator } from '../components/LivesIndicator';
import { StreakBadge } from '../components/StreakBadge';
import { CalendarHeatmap } from '../components/CalendarHeatmap';
import { ProofModal } from '../components/ProofModal';
import { MacWindow } from '../components/MacWindow';

export const CommitmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [commitment, setCommitment] = useState<Commitment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Day for Proof Modal
  const [selectedDay, setSelectedDay] = useState<CommitmentDay | null>(null);

  const loadCommitment = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.getCommitment(id);
      setCommitment(res.commitment);
    } catch (err: any) {
      setError(err.message || 'Failed to load commitment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommitment();
  }, [id]);

  const handleAccept = async () => {
    if (!id) return;
    try {
      await api.acceptCommitment(id);
      loadCommitment();
    } catch (err: any) {
      alert(err.message || 'Failed to accept commitment');
    }
  };

  const handleDecline = async () => {
    if (!id || !confirm('Are you sure you want to decline this accountability contract?')) return;
    try {
      await api.declineCommitment(id);
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to decline commitment');
    }
  };

  const handleCancel = async () => {
    if (!id || !confirm('Are you sure you want to cancel this commitment?')) return;
    try {
      await api.cancelCommitment(id);
      loadCommitment();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel commitment');
    }
  };

  if (loading && !commitment) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-mono text-xs text-neutral-400">
        loading contract inspector...
      </div>
    );
  }

  if (error || !commitment) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <MacWindow title="error.log">
          <AlertTriangle size={32} className="text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-1">Contract Unavailable</h2>
          <p className="text-xs text-neutral-400 font-mono mb-5">{error || 'Commitment not found'}</p>
          <Link to="/dashboard" className="mac-btn-secondary px-4 py-2 rounded-xl text-xs font-semibold text-white inline-block">
            <div className="mac-gloss" />
            <span>back to dashboard</span>
          </Link>
        </MacWindow>
      </div>
    );
  }

  const isPartner = commitment.partnerId === user?.id;
  const isCreator = commitment.creatorId === user?.id;
  const isPending = commitment.status === 'PENDING_ACCEPTANCE';
  const isActive = commitment.status === 'ACTIVE';

  const currencySymbol = commitment.rule?.stakeCurrency === 'INR' ? '₹' : commitment.rule?.stakeCurrency === 'USD' ? '$' : commitment.rule?.stakeCurrency === 'EUR' ? '€' : commitment.rule?.stakeCurrency === 'GBP' ? '£' : (commitment.rule?.stakeCurrency || '₹');
  const stakeAmount = commitment.rule?.stakeAmount || 0;
  const accumulatedPenalty = commitment.accumulatedPenalty || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Back Button */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={13} />
        <span>back to dashboard</span>
      </Link>

      {/* Contract Banner Window */}
      <MacWindow
        title={`contract_${commitment.id.slice(0, 8)}.sol`}
        rightAction={
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
            {commitment.status}
          </span>
        }
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">{commitment.title}</h1>
            {commitment.description && (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl font-sans leading-relaxed">{commitment.description}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 block mb-1">HEALTH</span>
              <LivesIndicator currentLives={commitment.currentLives} maxLives={commitment.rule?.maxLives || 3} size="md" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 block mb-1">STREAK</span>
              <StreakBadge streak={commitment.currentStreak} size="sm" />
            </div>
          </div>
        </div>
      </MacWindow>

      {/* Financial Stakes & Real-Time Penalty Debt Ledger */}
      {stakeAmount > 0 && (
        <MacWindow title="financial_stakes_ledger.app" rightAction={<span className="text-[10px] font-mono text-amber-500">Live Money Counter</span>}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <Coins size={22} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                  {isCreator ? `Debt Owed to Partner (@${commitment.partner?.username})` : `Credit Owed to You by @${commitment.creator?.username}`}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${accumulatedPenalty > 0 ? (isCreator ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400') : 'text-neutral-900 dark:text-white'}`}>
                    {currencySymbol} {accumulatedPenalty.toLocaleString()}
                  </span>
                  {accumulatedPenalty > 0 && (
                    <span className="text-xs font-mono text-neutral-500">
                      ({accumulatedPenalty / stakeAmount} penalty deduction{accumulatedPenalty / stakeAmount !== 1 ? 's' : ''})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-black/10 dark:border-white/10 font-mono text-xs text-neutral-500">
              <p className="text-neutral-700 dark:text-neutral-300 font-semibold">
                Rate: <span className="text-amber-600 dark:text-amber-400">{currencySymbol} {stakeAmount.toLocaleString()}</span> / life lost
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {isCreator ? 'Direct settlement with accountability partner.' : 'Settled outside platform upon misses.'}
              </p>
            </div>
          </div>
        </MacWindow>
      )}

      {/* Partner Invitation Action Bar */}
      {isPending && isPartner && (
        <MacWindow title="action_required.app">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">Accountability Invitation</h4>
              <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                @{commitment.creator?.username} has designated you to enforce this contract.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAccept}
                className="mac-btn-primary px-4 py-2 rounded-xl text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <div className="mac-gloss" />
                <Check size={13} />
                <span>accept contract</span>
              </button>
              <button
                onClick={handleDecline}
                className="mac-btn-secondary px-4 py-2 rounded-xl text-neutral-700 dark:text-neutral-400 text-xs font-medium cursor-pointer"
              >
                <div className="mac-gloss" />
                <span>decline</span>
              </button>
            </div>
          </div>
        </MacWindow>
      )}

      {/* Contract Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MacWindow title="participants.plist">
          <div className="text-xs font-mono space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">Creator:</span>
              <span className="text-neutral-900 dark:text-white font-sans font-semibold">@{commitment.creator?.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">Partner:</span>
              <span className="text-neutral-900 dark:text-white font-sans font-semibold">@{commitment.partner?.username}</span>
            </div>
          </div>
        </MacWindow>

        <MacWindow title="target_rules.plist">
          <div className="text-xs font-mono space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">Target:</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">{commitment.rule?.targetValue} {commitment.rule?.targetUnit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">Cadence:</span>
              <span className="text-neutral-800 dark:text-neutral-200">{commitment.rule?.frequencyType} ({commitment.rule?.cutoffTime})</span>
            </div>
          </div>
        </MacWindow>

        <MacWindow title="recovery_rules.plist">
          <div className="text-xs font-mono space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">Penalty:</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">-{commitment.rule?.failureLives} Life / Miss</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">Recovery:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{commitment.rule?.restoreLives} Life / {commitment.rule?.restoreAfterSuccessDays}d</span>
            </div>
          </div>
        </MacWindow>
      </div>

      {/* Calendar Matrix Heatmap */}
      {commitment.days && commitment.days.length > 0 && (
        <MacWindow title="calendar_matrix.view">
          <CalendarHeatmap
            days={commitment.days}
            targetUnit={commitment.rule?.targetUnit || ''}
            onSelectDay={(day) => {
              const nowSec = Math.floor(Date.now() / 1000);
              if (nowSec < day.periodStart) {
                return;
              }
              if (isCreator && (day.status === 'IN_PROGRESS' || day.status === 'PENDING')) {
                setSelectedDay(day);
              }
            }}
          />
        </MacWindow>
      )}

      {/* Submitted Proofs */}
      {commitment.days && commitment.days.some(d => d.proofs && d.proofs.length > 0) && (
        <MacWindow title="submitted_proofs.log" icon={<CheckCircle2 size={13} className="text-emerald-500 dark:text-emerald-400" />}>
          <div className="divide-y divide-black/10 dark:divide-white/10">
            {commitment.days
              .filter(d => d.proofs && d.proofs.length > 0)
              .map(day => (
                <div key={day.id} className="py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white font-mono">{day.periodKey}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium tracking-tighter">
                      Progress: {day.completedValue} / {day.targetValue} {commitment.rule?.targetUnit}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {day.proofs?.map(proof => (
                      <div key={proof.id} className="bg-neutral-100 dark:bg-neutral-900/60 rounded-lg p-2.5 text-xs font-mono">
                        <div className="flex items-center justify-between mb-1.5 opacity-70 text-[10px]">
                          <span>Logged: {proof.value} {commitment.rule?.targetUnit}</span>
                          <span>{new Date(proof.submittedAt * 1000).toLocaleString()}</span>
                        </div>
                        {proof.metadata ? (
                          <p className="text-neutral-700 dark:text-neutral-300 break-words whitespace-pre-wrap">
                            {(() => {
                              try {
                                const parsed = JSON.parse(proof.metadata);
                                return parsed.note || proof.metadata;
                              } catch {
                                return proof.metadata;
                              }
                            })()}
                          </p>
                        ) : (
                          <p className="text-neutral-500 italic">No notes attached.</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </MacWindow>
      )}

      {/* Life Transactions Ledger */}
      {commitment.transactions && commitment.transactions.length > 0 && (
        <MacWindow title="life_transactions.log" icon={<History size={13} className="text-neutral-500 dark:text-neutral-400" />}>
          <div className="divide-y divide-black/10 dark:divide-white/10">
            {commitment.transactions.map((tx) => (
              <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-neutral-900 dark:text-white font-medium block">{tx.reason}</span>
                  <span className="text-neutral-500 text-[10px]">
                    {new Date(tx.createdAt * 1000).toLocaleString()}
                  </span>
                </div>
                <span
                  className={`font-bold text-sm ${
                    tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount} Life
                </span>
              </div>
            ))}
          </div>
        </MacWindow>
      )}

      {/* Edit Pending Contract Modal for Creator */}
      {isCreator && isPending && (
        <EditPendingModal
          commitment={commitment}
          onSuccess={loadCommitment}
        />
      )}

      {/* Danger Zone */}
      {isCreator && (isPending || isActive) && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleCancel}
            className="mac-btn-secondary px-4 py-1.5 rounded-lg text-rose-600 dark:text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 text-xs font-mono cursor-pointer"
          >
            <div className="mac-gloss" />
            <span>cancel contract</span>
          </button>
        </div>
      )}

      {/* Proof Modal */}
      {selectedDay && (
        <ProofModal
          isOpen={true}
          onClose={() => setSelectedDay(null)}
          day={selectedDay}
          commitmentId={commitment.id}
          commitmentTitle={commitment.title}
          targetUnit={commitment.rule?.targetUnit || ''}
          onSuccess={loadCommitment}
        />
      )}
    </div>
  );
};

const EditPendingModal: React.FC<{ commitment: Commitment; onSuccess: () => void }> = ({ commitment, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(commitment.title);
  const [partnerUsername, setPartnerUsername] = useState(commitment.partner?.username || '');
  const [targetValue, setTargetValue] = useState(String(commitment.rule?.targetValue || 1));
  const [targetUnit, setTargetUnit] = useState(commitment.rule?.targetUnit || 'problems');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerUsername.trim()) {
      setError('Please provide a partner username');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await api.updateCommitment(commitment.id, {
        title: title.trim(),
        partnerUsername: partnerUsername.trim(),
        targetValue: parseFloat(targetValue) || 1,
        targetUnit: targetUnit.trim(),
      });
      setIsOpen(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update contract');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider font-mono">Contract Awaiting Acceptance</h4>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans mt-0.5">
            Sent to <strong className="text-neutral-900 dark:text-neutral-200">@{commitment.partner?.username}</strong>. You can change the partner or edit rules before they accept.
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="mac-btn-secondary px-3.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white cursor-pointer"
        >
          <div className="mac-gloss" />
          <span>edit / change partner</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md">
        <MacWindow title="edit_pending_contract.app" onClose={() => setIsOpen(false)}>
          <div className="mb-4">
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">Edit Pending Contract</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">Update parameters or reassign partner</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-3.5">
            <div>
              <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 mb-1">Contract Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-950"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 mb-1">Accountability Partner (Username or Email)</label>
              <input
                type="text"
                required
                value={partnerUsername}
                onChange={(e) => setPartnerUsername(e.target.value)}
                className="w-full bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-950"
                placeholder="username (e.g. rahul) or email (e.g. friend@gmail.com)"
              />
              <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">
                If changed, a new contract invitation email will be dispatched to this recipient.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 mb-1">Target Value</label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  required
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-950"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 mb-1">Target Unit</label>
                <input
                  type="text"
                  required
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value)}
                  className="w-full bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-950"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="mac-btn-secondary px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="mac-btn-primary px-4 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer disabled:opacity-50"
              >
                <div className="mac-gloss" />
                <span>{saving ? 'saving...' : 'save changes'}</span>
              </button>
            </div>
          </form>
        </MacWindow>
      </div>
    </div>
  );
};
