import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Heart, Flame, Search, Check, AlertCircle, Send, Plus, Coins, DollarSign } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { LivesIndicator } from '../components/LivesIndicator';
import { MacWindow } from '../components/MacWindow';

export const CreateCommitmentPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('Solve 2 LeetCode problems');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState('2');
  const [targetUnit, setTargetUnit] = useState('problems');
  const [frequencyType, setFrequencyType] = useState<'DAILY' | 'WEEKLY'>('DAILY');
  const [partnerQuery, setPartnerQuery] = useState('');
  const [partnerUsername, setPartnerUsername] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; username: string; displayName: string }[]>([]);
  const [searching, setSearching] = useState(false);

  // Rules
  const [initialLives, setInitialLives] = useState(3);
  const [maxLives, setMaxLives] = useState(3);
  const [failureLives, setFailureLives] = useState(1);
  const [stakeEnabled, setStakeEnabled] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('500');
  const [stakeCurrency, setStakeCurrency] = useState('INR');
  const [restoreEnabled, setRestoreEnabled] = useState(true);
  const [restoreAfterSuccessDays, setRestoreAfterSuccessDays] = useState(5);
  const [restoreLives, setRestoreLives] = useState(1);
  const [cutoffTime, setCutoffTime] = useState('00:00');

  // Dates
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultEnd = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEnd);

  // Partner Search
  const handleSearch = async (val: string) => {
    setPartnerQuery(val);
    if (val.trim().length >= 2) {
      try {
        setSearching(true);
        const res = await api.searchPartners(val);
        setSearchResults(res.users);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSubmit = async () => {
    if (!partnerUsername) {
      setError('Please select an accountability partner');
      setStep(3);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.createCommitment({
        partnerUsername,
        title,
        description: description.trim() || undefined,
        startDate,
        endDate,
        timezone: user?.timezone || 'UTC',
        frequencyType,
        targetValue: parseFloat(targetValue) || 1,
        targetUnit: targetUnit.trim() || 'units',
        cutoffTime,
        initialLives,
        maxLives,
        failureLives,
        stakeAmount: stakeEnabled ? (parseFloat(stakeAmount) || 0) : 0,
        stakeCurrency,
        restoreEnabled,
        restoreAfterSuccessDays,
        restoreLives,
      });

      navigate(`/commitments/${res.commitment.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create commitment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress Bar Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-2">
          <span>STEP {step} OF 8</span>
          <span>{Math.round((step / 8) * 100)}% COMPLETE</span>
        </div>
        <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-rose-600 transition-all duration-300 rounded-full"
            style={{ width: `${(step / 8) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Wizard Mac Window */}
      <MacWindow
        title={`contract_setup_step_${step}.app`}
        rightAction={<span className="text-[10px] font-mono text-neutral-500">macOS System Setup</span>}
      >
        {/* STEP 1: Goal & Target */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 uppercase tracking-wider font-semibold">Step 1</span>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">what are you committing to?</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">define your measurable promise</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 mb-1.5">Commitment Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-950 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                  placeholder="e.g. Solve 2 LeetCode problems"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 mb-1.5">Target Value</label>
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-900 dark:text-white font-mono text-sm focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-950 transition-all"
                    placeholder="2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 mb-1.5">Unit</label>
                  <input
                    type="text"
                    value={targetUnit}
                    onChange={(e) => setTargetUnit(e.target.value)}
                    className="w-full bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-900 dark:text-white font-mono text-sm focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-950 transition-all"
                    placeholder="problems / km / pages"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 mb-1.5">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-4 py-2 text-neutral-900 dark:text-white text-xs focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-950 transition-all resize-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                  placeholder="Context or motivations..."
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Frequency */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 uppercase tracking-wider font-semibold">Step 2</span>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">how often must this happen?</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">select cadence and dates</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFrequencyType('DAILY')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  frequencyType === 'DAILY'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-950 dark:text-white ring-1 ring-rose-500'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <h4 className="font-bold text-sm mb-1 text-neutral-900 dark:text-white">Daily Target</h4>
                <p className="text-xs font-mono opacity-75">{targetValue} {targetUnit} evaluated each night</p>
              </button>

              <button
                type="button"
                onClick={() => setFrequencyType('WEEKLY')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  frequencyType === 'WEEKLY'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-950 dark:text-white ring-1 ring-rose-500'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <h4 className="font-bold text-sm mb-1 text-neutral-900 dark:text-white">Weekly Target</h4>
                <p className="text-xs font-mono opacity-75">{targetValue} {targetUnit} evaluated weekly</p>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-900 dark:text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-900 dark:text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Partner Search & Email Invite */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 uppercase tracking-wider font-semibold">Step 3</span>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">who will hold you accountable?</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">enter their registered username or email address</p>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
                <Search size={15} />
              </div>
              <input
                type="text"
                value={partnerQuery}
                onChange={(e) => {
                  handleSearch(e.target.value);
                  if (e.target.value.includes('@')) {
                    setPartnerUsername(e.target.value.trim());
                  }
                }}
                className="w-full bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-neutral-900 dark:text-white font-mono text-xs focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-950 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                placeholder="username (e.g. rahul) or email (e.g. partner@gmail.com)..."
              />
            </div>

            {partnerUsername && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-800 dark:text-emerald-300">
                  selected partner:{' '}
                  <strong className="text-neutral-900 dark:text-white font-bold font-sans">
                    {partnerUsername.includes('@') ? partnerUsername : `@${partnerUsername}`}
                  </strong>
                  {partnerUsername.includes('@') && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-normal mt-0.5">
                      Invitation email will be dispatched to this inbox.
                    </span>
                  )}
                </span>
                <Check size={15} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            )}

            {/* If typed an email and not in search results, show Invite button */}
            {partnerQuery.includes('@') && partnerQuery.includes('.') && !searchResults.some(u => u.username === partnerQuery.trim()) && (
              <button
                type="button"
                onClick={() => {
                  setPartnerUsername(partnerQuery.trim());
                  setSearchResults([]);
                }}
                className="w-full p-3 rounded-xl border border-dashed border-rose-400/50 bg-rose-50/50 dark:bg-rose-950/20 text-left flex items-center justify-between transition-colors cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <Send size={13} className="text-rose-600 dark:text-rose-400" />
                    <span>Invite non-registered partner via email</span>
                  </p>
                  <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                    We'll email <strong className="text-neutral-900 dark:text-white">{partnerQuery.trim()}</strong> a contract invitation.
                  </p>
                </div>
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Use Email</span>
              </button>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-1.5 border border-neutral-200 dark:border-neutral-800 rounded-xl p-2 bg-white dark:bg-neutral-950 max-h-44 overflow-y-auto shadow-sm">
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setPartnerUsername(u.username);
                      setPartnerQuery(u.username);
                      setSearchResults([]);
                    }}
                    className="w-full p-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-left flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-semibold text-neutral-900 dark:text-white">{u.displayName}</p>
                      <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">@{u.username}</p>
                    </div>
                    <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400">Select</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Lives */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 uppercase tracking-wider font-semibold">Step 4</span>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">how many lives?</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">contract terminates if lives reach 0</p>
            </div>

            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-neutral-100/80 dark:bg-black/40 border border-black/5 dark:border-white/5 gap-3">
              <LivesIndicator currentLives={initialLives} maxLives={initialLives} size="lg" />
              <span className="text-base font-mono font-bold text-neutral-900 dark:text-white">{initialLives} Lives Total</span>

              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setInitialLives(num);
                      setMaxLives(num);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer ${
                      initialLives === num
                        ? 'mac-btn-primary text-white border-transparent'
                        : 'mac-btn-secondary text-neutral-700 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    <div className="mac-gloss" />
                    {num} {num === 1 ? 'Life' : 'Lives'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Failure Consequence */}
        {step === 5 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 uppercase tracking-wider font-semibold">Step 5</span>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">what happens when you miss?</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">penalty applied at 1 AM evaluation</p>
            </div>

            {/* Life Loss */}
            <div className="p-4 rounded-xl bg-neutral-100/80 dark:bg-black/40 border border-black/5 dark:border-white/5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Lose Lives on Miss</h4>
                <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">Deducted immediately on failed cutoff</p>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFailureLives(num)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold cursor-pointer ${
                      failureLives === num ? 'mac-btn-primary text-white' : 'mac-btn-secondary text-neutral-700 dark:text-neutral-400'
                    }`}
                  >
                    <div className="mac-gloss" />
                    -{num} {num === 1 ? 'Life' : 'Lives'}
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Penalty / Betting Stakes */}
            <div className="p-4 rounded-xl bg-neutral-100/80 dark:bg-black/40 border border-black/5 dark:border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Coins size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Financial Consequence (Money at Stake)</h4>
                    <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">Increase penalty counter whenever a life is lost</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stakeEnabled}
                    onChange={(e) => setStakeEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {stakeEnabled && (
                <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-3 animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 mb-1">Currency</label>
                      <select
                        value={stakeCurrency}
                        onChange={(e) => setStakeCurrency(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-900 dark:text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      >
                        <option value="INR">INR (₹) - Indian Rupee</option>
                        <option value="USD">USD ($) - US Dollar</option>
                        <option value="EUR">EUR (€) - Euro</option>
                        <option value="GBP">GBP (£) - British Pound</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 mb-1">Amount per Life Lost</label>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-900 dark:text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                        placeholder="500"
                      />
                    </div>
                  </div>

                  {/* Preset Quick Chips */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-mono text-neutral-500">Presets:</span>
                    {(stakeCurrency === 'INR' ? [100, 250, 500, 1000] : [5, 10, 25, 50]).map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setStakeAmount(String(amt))}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                          stakeAmount === String(amt)
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 font-bold'
                            : 'bg-neutral-200/60 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                        }`}
                      >
                        {stakeCurrency === 'INR' ? `₹${amt}` : `$${amt}`}
                      </button>
                    ))}
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] font-mono text-amber-800 dark:text-amber-300 leading-relaxed">
                    💡 <strong>Real Consequence:</strong> If you miss cutoff and lose a life, +{stakeCurrency === 'INR' ? '₹' : stakeCurrency} {stakeAmount} is automatically added to the debt counter owed to <strong className="text-neutral-900 dark:text-white">{partnerUsername ? `@${partnerUsername}` : 'your partner'}</strong>.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: Recovery Mechanics */}
        {step === 6 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 uppercase tracking-wider font-semibold">Step 6</span>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">can you recover lost lives?</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">reward streaks with life restoration</p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-100/80 dark:bg-black/40 border border-black/5 dark:border-white/5 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreEnabled}
                  onChange={(e) => setRestoreEnabled(e.target.checked)}
                  className="w-4 h-4 rounded bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs font-semibold text-neutral-900 dark:text-white">Enable Life Restoration</span>
              </label>

              {restoreEnabled && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-black/10 dark:border-white/10">
                  <div>
                    <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 mb-1">Restore Amount</label>
                    <select
                      value={restoreLives}
                      onChange={(e) => setRestoreLives(Number(e.target.value))}
                      className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl px-3 py-2 text-neutral-900 dark:text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                    >
                      <option value={1}>+1 Life</option>
                      <option value={2}>+2 Lives</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 mb-1">After Consecutive Days</label>
                    <select
                      value={restoreAfterSuccessDays}
                      onChange={(e) => setRestoreAfterSuccessDays(Number(e.target.value))}
                      className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl px-3 py-2 text-neutral-900 dark:text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                    >
                      <option value={3}>3 successful days</option>
                      <option value={5}>5 successful days</option>
                      <option value={7}>7 successful days</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 7: Proof Requirement */}
        {step === 7 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 uppercase tracking-wider font-semibold">Step 7</span>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">proof requirement</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">verification method</p>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30">
              <h4 className="font-bold text-rose-950 dark:text-white text-sm mb-1">Manual Proof Logging</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                You will log numeric progress and optional notes/links before the daily cutoff. Your partner has full real-time visibility into all entries.
              </p>
            </div>
          </div>
        )}

        {/* STEP 8: Contract Review & Send */}
        {step === 8 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 uppercase tracking-wider font-semibold">Step 8</span>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">review contract terms</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">rules become immutable once accepted</p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-100/80 dark:bg-black/40 border border-black/5 dark:border-white/5 space-y-3 text-xs font-mono">
              <div className="flex justify-between border-b border-black/10 dark:border-white/10 pb-2.5">
                <span className="text-neutral-500 dark:text-neutral-400">PROMISE</span>
                <span className="text-neutral-900 dark:text-white font-bold font-sans">{title}</span>
              </div>
              <div className="flex justify-between border-b border-black/10 dark:border-white/10 pb-2.5">
                <span className="text-neutral-500 dark:text-neutral-400">TARGET</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">{targetValue} {targetUnit} ({frequencyType})</span>
              </div>
              <div className="flex justify-between border-b border-black/10 dark:border-white/10 pb-2.5">
                <span className="text-neutral-500 dark:text-neutral-400">PARTNER</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">@{partnerUsername || 'none'}</span>
              </div>
              <div className="flex justify-between border-b border-black/10 dark:border-white/10 pb-2.5">
                <span className="text-neutral-500 dark:text-neutral-400">LIVES</span>
                <LivesIndicator currentLives={initialLives} maxLives={maxLives} size="sm" />
              </div>
              <div className="flex justify-between border-b border-black/10 dark:border-white/10 pb-2.5">
                <span className="text-neutral-500 dark:text-neutral-400">FINANCIAL STAKE</span>
                <span className={`font-bold ${stakeEnabled && parseFloat(stakeAmount) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-500'}`}>
                  {stakeEnabled && parseFloat(stakeAmount) > 0 ? `${stakeCurrency === 'INR' ? '₹' : stakeCurrency} ${stakeAmount} / life lost` : 'None (Honor system)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">RECOVERY</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {restoreEnabled ? `+${restoreLives} after ${restoreAfterSuccessDays} days` : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-6 mt-4 border-t border-black/10 dark:border-white/10">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="mac-btn-secondary px-4 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <div className="mac-gloss" />
              <ArrowLeft size={13} />
              <span>back</span>
            </button>
          ) : <div />}

          {step < 8 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !title.trim()) {
                  setError('Please enter a commitment title');
                  return;
                }
                if (step === 3 && !partnerUsername) {
                  setError('Please select an accountability partner');
                  return;
                }
                setError(null);
                setStep((s) => s + 1);
              }}
              className="mac-btn-primary px-5 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <div className="mac-gloss" />
              <span>next</span>
              <ArrowRight size={13} />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="mac-btn-primary px-6 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xl"
            >
              <div className="mac-gloss" />
              <Send size={13} />
              <span>{loading ? 'dispatching...' : 'send contract'}</span>
            </button>
          )}
        </div>
      </MacWindow>
    </div>
  );
};
