import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  Search,
  Check,
  AlertCircle,
  Send,
  Coins,
  Code2,
  Activity,
  BookOpen,
  PenTool,
  Sparkles,
  X,
  UserCheck,
  Shield,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { LivesIndicator } from '../components/LivesIndicator';

interface Preset {
  id: string;
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
  title: string;
  targetValue: string;
  targetUnit: string;
}

const PRESETS: Preset[] = [
  {
    id: 'leetcode',
    label: 'LeetCode',
    icon: Code2,
    title: 'Solve 2 LeetCode problems',
    targetValue: '2',
    targetUnit: 'problems',
  },
  {
    id: 'running',
    label: 'Running',
    icon: Activity,
    title: 'Run 5 kilometers',
    targetValue: '5',
    targetUnit: 'km',
  },
  {
    id: 'reading',
    label: 'Reading',
    icon: BookOpen,
    title: 'Read 20 pages',
    targetValue: '20',
    targetUnit: 'pages',
  },
  {
    id: 'writing',
    label: 'Writing',
    icon: PenTool,
    title: 'Write 500 words',
    targetValue: '500',
    targetUnit: 'words',
  },
  {
    id: 'custom',
    label: 'Custom',
    icon: Sparkles,
    title: '',
    targetValue: '1',
    targetUnit: 'units',
  },
];

export const CreateCommitmentPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected Preset
  const [activePreset, setActivePreset] = useState<string>('custom');

  // Form State - Step 1: The Promise
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState('1');
  const [targetUnit, setTargetUnit] = useState('units');
  const [frequencyType, setFrequencyType] = useState<'DAILY' | 'WEEKLY'>('DAILY');

  // Dates
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultEnd = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEnd);

  // Form State - Step 2: The Witness & Stakes
  const [partnerQuery, setPartnerQuery] = useState('');
  const [partnerUsername, setPartnerUsername] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; username: string; displayName: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [showPartnerDropdown, setShowPartnerDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const partnerInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Apply Preset
  const applyPreset = (preset: Preset) => {
    setActivePreset(preset.id);
    if (preset.id !== 'custom') {
      setTitle(preset.title);
      setTargetValue(preset.targetValue);
      setTargetUnit(preset.targetUnit);
    } else {
      setTitle('');
      setTargetValue('1');
      setTargetUnit('units');
    }
  };

  // Partner Search
  const handlePartnerQueryChange = async (val: string) => {
    setPartnerQuery(val);
    setHighlightedIndex(-1);
    if (val.trim().length >= 2) {
      try {
        setSearching(true);
        setShowPartnerDropdown(true);
        const res = await api.searchPartners(val);
        setSearchResults(res.users);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowPartnerDropdown(false);
    }
  };

  // Keyboard navigation for partner dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showPartnerDropdown) return;
    const isEmailEligible = partnerQuery.includes('@') && partnerQuery.includes('.');
    const totalItems = searchResults.length + (isEmailEligible ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1 < totalItems ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
        selectPartner(searchResults[highlightedIndex].username);
      } else if (isEmailEligible && highlightedIndex === searchResults.length) {
        selectPartner(partnerQuery.trim());
      } else if (searchResults.length > 0) {
        selectPartner(searchResults[0].username);
      } else if (isEmailEligible) {
        selectPartner(partnerQuery.trim());
      }
    } else if (e.key === 'Escape') {
      setShowPartnerDropdown(false);
    }
  };

  const selectPartner = (usernameOrEmail: string) => {
    setPartnerUsername(usernameOrEmail);
    setPartnerQuery('');
    setSearchResults([]);
    setShowPartnerDropdown(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (ev: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(ev.target as Node) &&
        partnerInputRef.current &&
        !partnerInputRef.current.contains(ev.target as Node)
      ) {
        setShowPartnerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async () => {
    if (!partnerUsername) {
      setError('Please designate an accountability witness');
      setStep(2);
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
        stakeAmount: stakeEnabled ? parseFloat(stakeAmount) || 0 : 0,
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

  // Reset scroll position on step navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const scrollContainer = document.querySelector('main');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [step]);

  const stepTitles = [
    { number: 1, name: 'Promise', desc: 'Measurable target & cadence' },
    { number: 2, name: 'Witness & Stakes', desc: 'Partner & guardrails' },
    { number: 3, name: 'Review & Seal', desc: 'Immutable terms verification' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* ================= REFINED LINEAR SEGMENTED STEPPER ================= */}
      <div className="grid grid-cols-3 p-1 rounded-lg bg-neutral-200/50 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.06] mb-6 select-none">
        {stepTitles.map((s) => {
          const isCurrent = step === s.number;
          const isDone = step > s.number;
          return (
            <button
              key={s.number}
              type="button"
              disabled={!isDone && !isCurrent}
              onClick={() => isDone && setStep(s.number)}
              className={`flex items-center justify-center gap-2 py-2 px-2 sm:px-3 rounded-md text-xs transition-all ${
                isCurrent
                  ? 'bg-white dark:bg-white/[0.08] text-[#111827] dark:text-[#f2f3f5] font-medium border border-neutral-300 dark:border-white/[0.1] shadow-xs'
                  : isDone
                  ? 'text-neutral-600 dark:text-[#8a8f98] hover:text-[#111827] dark:hover:text-[#f2f3f5] hover:bg-neutral-200/40 dark:hover:bg-white/[0.04] cursor-pointer'
                  : 'text-neutral-400 dark:text-[#626670] opacity-50 cursor-not-allowed'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-semibold shrink-0 ${
                  isCurrent
                    ? 'bg-[#111827] text-white dark:bg-[#f2f3f5] dark:text-[#0d0e12]'
                    : isDone
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-neutral-200 dark:bg-white/[0.06] text-neutral-500 dark:text-[#626670]'
                }`}
              >
                {isDone ? <Check size={10} className="stroke-[3]" /> : s.number}
              </span>
              <span className="truncate">{s.name}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-6 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0 text-rose-500 dark:text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* ================= MAIN WIZARD CANVAS (CLEAN UNBOXED CARD) ================= */}
      <div className="rounded-xl border border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-5 sm:p-7 space-y-6 shadow-xs">
        {/* Step Header */}
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-semibold text-[#111827] dark:text-[#f2f3f5] tracking-tight">
            {step === 1 && 'What are you committing to?'}
            {step === 2 && 'Who witnesses this pact?'}
            {step === 3 && 'Review and seal covenant terms'}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-[#8a8f98] font-sans">
            {stepTitles[step - 1].desc}
          </p>
        </div>

        {/* ================= STEP 1: THE PROMISE ================= */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Quick Presets Segmented Row */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-neutral-500 dark:text-[#8a8f98]">
                Category Presets
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                {PRESETS.map((p) => {
                  const Icon = p.icon;
                  const isSelected = activePreset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className={`px-3 py-1.5 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-neutral-400 dark:border-white/20 bg-neutral-100 dark:bg-white/[0.1] text-[#111827] dark:text-[#f2f3f5] shadow-xs'
                          : 'border-neutral-200 dark:border-white/[0.06] bg-neutral-50 dark:bg-white/[0.02] text-neutral-600 dark:text-[#8a8f98] hover:border-neutral-300 dark:hover:border-white/[0.12] hover:text-[#111827] dark:hover:text-[#f2f3f5]'
                      }`}
                    >
                      <Icon size={13} className={isSelected ? 'text-[#111827] dark:text-[#f2f3f5]' : 'text-neutral-400 dark:text-[#626670]'} />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title & Target Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1.5">
                  Commitment Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (activePreset !== 'custom') setActivePreset('custom');
                  }}
                  className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md px-3.5 py-2 text-sm text-[#111827] dark:text-[#f2f3f5] placeholder:text-neutral-400 dark:placeholder:text-[#626670] focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 focus:ring-1 focus:ring-neutral-200 dark:focus:ring-white/20 transition-all"
                  placeholder="e.g. Solve 2 LeetCode problems or Run 5 kilometers"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1.5">
                    Target Value
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md px-3.5 py-2 text-sm text-[#111827] dark:text-[#f2f3f5] font-mono focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 focus:ring-1 focus:ring-neutral-200 dark:focus:ring-white/20 transition-all"
                    placeholder="2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1.5">
                    Target Unit
                  </label>
                  <input
                    type="text"
                    value={targetUnit}
                    onChange={(e) => setTargetUnit(e.target.value)}
                    className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md px-3.5 py-2 text-sm text-[#111827] dark:text-[#f2f3f5] font-mono focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 focus:ring-1 focus:ring-neutral-200 dark:focus:ring-white/20 transition-all"
                    placeholder="problems / km / pages / words"
                  />
                </div>
              </div>

              {/* Cadence & Frequency */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98]">
                  Evaluation Cadence
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFrequencyType('DAILY')}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      frequencyType === 'DAILY'
                        ? 'border-neutral-400 dark:border-white/20 bg-neutral-100 dark:bg-white/[0.06] text-[#111827] dark:text-[#f2f3f5]'
                        : 'border-neutral-200 dark:border-white/[0.06] bg-neutral-50 dark:bg-white/[0.02] text-neutral-600 dark:text-[#8a8f98] hover:border-neutral-300 dark:hover:border-white/[0.1]'
                    }`}
                  >
                    <h4 className="font-medium text-xs text-[#111827] dark:text-[#f2f3f5] mb-0.5">Daily Target</h4>
                    <p className="text-[11px] font-mono text-neutral-500 dark:text-[#626670]">{targetValue} {targetUnit} evaluated midnight</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFrequencyType('WEEKLY')}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      frequencyType === 'WEEKLY'
                        ? 'border-neutral-400 dark:border-white/20 bg-neutral-100 dark:bg-white/[0.06] text-[#111827] dark:text-[#f2f3f5]'
                        : 'border-neutral-200 dark:border-white/[0.06] bg-neutral-50 dark:bg-white/[0.02] text-neutral-600 dark:text-[#8a8f98] hover:border-neutral-300 dark:hover:border-white/[0.1]'
                    }`}
                  >
                    <h4 className="font-medium text-xs text-[#111827] dark:text-[#f2f3f5] mb-0.5">Weekly Target</h4>
                    <p className="text-[11px] font-mono text-neutral-500 dark:text-[#626670]">{targetValue} {targetUnit} evaluated weekly</p>
                  </button>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md px-3 py-1.5 text-[#111827] dark:text-[#f2f3f5] font-mono text-xs focus:outline-none focus:border-neutral-400 dark:focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md px-3 py-1.5 text-[#111827] dark:text-[#f2f3f5] font-mono text-xs focus:outline-none focus:border-neutral-400 dark:focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1.5">
                  Optional Context
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md px-3.5 py-2 text-[#111827] dark:text-[#f2f3f5] text-xs focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 focus:ring-1 focus:ring-neutral-200 dark:focus:ring-white/20 transition-all resize-none placeholder:text-neutral-400 dark:placeholder:text-[#626670]"
                  placeholder="Context, motivations, or rules of engagement..."
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: THE WITNESS & STAKES ================= */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Anchored Partner Search */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98]">
                Accountability Witness (Partner)
              </label>

              {partnerUsername ? (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <UserCheck size={15} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <span className="text-emerald-700 dark:text-emerald-300">
                      Designated Witness:{' '}
                      <strong className="text-[#111827] dark:text-[#f2f3f5] font-medium font-sans">
                        {partnerUsername.includes('@') ? partnerUsername : `@${partnerUsername}`}
                      </strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPartnerUsername('');
                      setPartnerQuery('');
                    }}
                    className="p-1 rounded hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 cursor-pointer"
                    title="Change partner"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 dark:text-[#626670]">
                      <Search size={14} />
                    </div>
                    <input
                      ref={partnerInputRef}
                      type="text"
                      value={partnerQuery}
                      onChange={(e) => handlePartnerQueryChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => {
                        if (partnerQuery.trim().length >= 2 || partnerQuery.includes('@')) {
                          setShowPartnerDropdown(true);
                        }
                      }}
                      className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md pl-9 pr-4 py-2 text-[#111827] dark:text-[#f2f3f5] font-mono text-xs focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 focus:ring-1 focus:ring-neutral-200 dark:focus:ring-white/20 transition-all placeholder:text-neutral-400 dark:placeholder:text-[#626670]"
                      placeholder="Search username (e.g. rahul) or enter email (e.g. friend@gmail.com)..."
                    />
                  </div>

                  {/* Absolute floating popover anchored under search input */}
                  {showPartnerDropdown && (
                    <div
                      ref={dropdownRef}
                      className="absolute left-0 right-0 top-full z-40 mt-1 bg-white dark:bg-[#131418] border border-neutral-200 dark:border-white/[0.08] rounded-lg shadow-xl dark:shadow-2xl max-h-56 overflow-y-auto p-1.5 space-y-1"
                    >
                      {searching && (
                        <div className="p-3 text-center text-xs font-mono text-neutral-400 dark:text-[#626670]">
                          Searching partners...
                        </div>
                      )}

                      {!searching && searchResults.length > 0 && (
                        <div className="space-y-0.5">
                          {searchResults.map((u, idx) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => selectPartner(u.username)}
                              className={`w-full p-2 rounded-md text-left flex items-center justify-between transition-colors cursor-pointer ${
                                highlightedIndex === idx
                                  ? 'bg-neutral-100 dark:bg-white/[0.08] text-[#111827] dark:text-[#f2f3f5]'
                                  : 'hover:bg-neutral-50 dark:hover:bg-white/[0.04] text-neutral-600 dark:text-[#8a8f98]'
                              }`}
                            >
                              <div>
                                <p className="text-xs font-medium text-[#111827] dark:text-[#f2f3f5]">{u.displayName}</p>
                                <p className="text-[10px] font-mono text-neutral-400 dark:text-[#626670]">@{u.username}</p>
                              </div>
                              <span className="text-xs font-mono text-amber-500 dark:text-amber-400">Select</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {!searching && searchResults.length === 0 && !partnerQuery.includes('@') && (
                        <div className="p-3 text-center text-xs font-mono text-neutral-400 dark:text-[#626670]">
                          No users found with "{partnerQuery}". Type full email to invite via email.
                        </div>
                      )}

                      {/* Non-registered email option */}
                      {partnerQuery.includes('@') && partnerQuery.includes('.') && (
                        <button
                          type="button"
                          onClick={() => selectPartner(partnerQuery.trim())}
                          className="w-full p-2 rounded-md border border-dashed border-neutral-300 dark:border-white/[0.12] bg-neutral-50 dark:bg-white/[0.02] text-left flex items-center justify-between transition-colors cursor-pointer hover:bg-neutral-100 dark:hover:bg-white/[0.04]"
                        >
                          <div>
                            <p className="text-xs font-medium text-[#111827] dark:text-[#f2f3f5] flex items-center gap-1.5">
                              <Send size={12} className="text-amber-500 dark:text-amber-400" />
                              <span>Invite non-registered partner via email</span>
                            </p>
                            <p className="text-[10px] font-mono text-neutral-400 dark:text-[#626670]">
                              Dispatch to <strong className="text-[#111827] dark:text-[#f2f3f5]">{partnerQuery.trim()}</strong>
                            </p>
                          </div>
                          <span className="text-xs font-mono text-amber-500 dark:text-amber-400">Use Email</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Lives & Guardrails */}
            {/* Unified Guardrails & Stakes Panel (Linear Properties Style) */}
            <div className="rounded-lg bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/[0.06] divide-y divide-neutral-200 dark:divide-white/[0.06]">
              {/* Row 1: Initial Lives */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-medium text-[#111827] dark:text-[#f2f3f5] text-xs">Contract Lives</h4>
                  <p className="text-[11px] font-mono text-neutral-500 dark:text-[#626670]">
                    Contract terminates in failure if lives reach 0.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <LivesIndicator currentLives={initialLives} maxLives={initialLives} size="md" />
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setInitialLives(num);
                          setMaxLives(num);
                        }}
                        className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
                          initialLives === num
                            ? 'bg-[#111827] text-white dark:bg-white dark:text-[#0d0e12]'
                            : 'bg-neutral-200/70 dark:bg-white/[0.04] text-neutral-600 dark:text-[#8a8f98] hover:text-[#111827] dark:hover:text-[#f2f3f5]'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Lives Lost per Missed Day */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-[#111827] dark:text-[#f2f3f5] text-xs">Lives Lost per Missed Day</h4>
                  <p className="text-[11px] font-mono text-neutral-500 dark:text-[#626670]">
                    Deducted immediately on failed cutoff evaluation.
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFailureLives(num)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-medium cursor-pointer ${
                        failureLives === num
                          ? 'bg-[#111827] text-white dark:bg-white dark:text-[#0d0e12]'
                          : 'bg-neutral-200/70 dark:bg-white/[0.04] text-neutral-600 dark:text-[#8a8f98] hover:text-[#111827] dark:hover:text-[#f2f3f5]'
                      }`}
                    >
                      -{num} {num === 1 ? 'Life' : 'Lives'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: Financial Consequence */}
              <div className="p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
                      <Coins size={13} />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#111827] dark:text-[#f2f3f5] text-xs">Financial Consequence (Skin in the Game)</h4>
                      <p className="text-[11px] font-mono text-neutral-500 dark:text-[#626670]">Accumulate real debt counter whenever a life is lost</p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stakeEnabled}
                      onChange={(e) => setStakeEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-neutral-300 dark:bg-white/[0.1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {stakeEnabled && (
                  <div className="pt-3 border-t border-neutral-200 dark:border-white/[0.06] space-y-3 animate-in fade-in duration-150">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1">Currency</label>
                        <select
                          value={stakeCurrency}
                          onChange={(e) => setStakeCurrency(e.target.value)}
                          className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md px-3 py-1.5 text-[#111827] dark:text-[#f2f3f5] font-mono text-xs focus:outline-none focus:border-neutral-400 dark:focus:border-white/30"
                        >
                          <option value="INR">INR (₹) - Indian Rupee</option>
                          <option value="USD">USD ($) - US Dollar</option>
                          <option value="EUR">EUR (€) - Euro</option>
                          <option value="GBP">GBP (£) - British Pound</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1">Amount per Life Lost</label>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                          className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md px-3 py-1.5 text-[#111827] dark:text-[#f2f3f5] font-mono text-xs focus:outline-none focus:border-neutral-400 dark:focus:border-white/30"
                          placeholder="500"
                        />
                      </div>
                    </div>

                    {/* Preset Quick Chips */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-mono text-neutral-400 dark:text-[#626670]">Presets:</span>
                      {(stakeCurrency === 'INR' ? [100, 250, 500, 1000] : [5, 10, 25, 50]).map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setStakeAmount(String(amt))}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                            stakeAmount === String(amt)
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 font-semibold'
                              : 'bg-neutral-200/60 dark:bg-white/[0.04] text-neutral-600 dark:text-[#8a8f98] hover:bg-neutral-200 dark:hover:bg-white/[0.08]'
                          }`}
                        >
                          {stakeCurrency === 'INR' ? `₹${amt}` : `$${amt}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Row 4: Recovery Mechanics */}
              <div className="p-4 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={restoreEnabled}
                    onChange={(e) => setRestoreEnabled(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-neutral-100 dark:bg-white/[0.04] border-neutral-300 dark:border-white/[0.1] accent-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-[#111827] dark:text-[#f2f3f5]">Enable Life Restoration via Consistency Streaks</span>
                </label>

                {restoreEnabled && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-200 dark:border-white/[0.06]">
                    <div>
                      <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1">Restore Amount</label>
                      <select
                        value={restoreLives}
                        onChange={(e) => setRestoreLives(Number(e.target.value))}
                        className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md px-3 py-1.5 text-[#111827] dark:text-[#f2f3f5] font-mono text-xs focus:outline-none focus:border-neutral-400 dark:focus:border-white/30"
                      >
                        <option value={1}>+1 Life</option>
                        <option value={2}>+2 Lives</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1">After Consecutive Days</label>
                      <select
                        value={restoreAfterSuccessDays}
                        onChange={(e) => setRestoreAfterSuccessDays(Number(e.target.value))}
                        className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md px-3 py-1.5 text-[#111827] dark:text-[#f2f3f5] font-mono text-xs focus:outline-none focus:border-neutral-400 dark:focus:border-white/30"
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
          </div>
        )}

        {/* ================= STEP 3: THE SEAL & DISPATCH ================= */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="rounded-lg bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/[0.06] divide-y divide-neutral-200 dark:divide-white/[0.04] text-xs font-mono">
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-neutral-400 dark:text-[#626670] uppercase tracking-wider text-[11px]">Promise</span>
                <span className="text-[#111827] dark:text-[#f2f3f5] font-medium font-sans text-right max-w-[65%] truncate">{title}</span>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-neutral-400 dark:text-[#626670] uppercase tracking-wider text-[11px]">Target & Cadence</span>
                <span className="text-amber-500 dark:text-amber-400 font-medium">
                  {targetValue} {targetUnit} <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 ml-1">{frequencyType}</span>
                </span>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-neutral-400 dark:text-[#626670] uppercase tracking-wider text-[11px]">Accountability Witness</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {partnerUsername.includes('@') ? partnerUsername : `@${partnerUsername || 'none'}`}
                </span>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-neutral-400 dark:text-[#626670] uppercase tracking-wider text-[11px]">Initial Lives</span>
                <div className="flex items-center gap-2">
                  <LivesIndicator currentLives={initialLives} maxLives={maxLives} size="sm" />
                  <span className="text-[#111827] dark:text-[#f2f3f5] text-[11px]">({initialLives} {initialLives === 1 ? 'Life' : 'Lives'})</span>
                </div>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-neutral-400 dark:text-[#626670] uppercase tracking-wider text-[11px]">Financial Consequence</span>
                <span className="font-medium text-[#111827] dark:text-[#f2f3f5]">
                  {stakeEnabled && parseFloat(stakeAmount) > 0
                    ? `${stakeCurrency === 'INR' ? '₹' : stakeCurrency} ${stakeAmount} per life lost`
                    : 'None (Honor system)'}
                </span>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-neutral-400 dark:text-[#626670] uppercase tracking-wider text-[11px]">Consistency Grace</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {restoreEnabled ? `+${restoreLives} life after ${restoreAfterSuccessDays} successful days` : 'Disabled'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/[0.06] flex items-start gap-2.5 text-xs text-neutral-600 dark:text-[#8a8f98] leading-relaxed font-sans">
              <Shield size={15} className="text-neutral-400 dark:text-[#8a8f98] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#111827] dark:text-[#f2f3f5] font-medium">Immutable Covenant Notice:</strong> Once dispatched and accepted by your partner, contract rules cannot be tampered with. Evaluation is enforced automatically against midnight local cutoff.
              </div>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-white/[0.06]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="mac-btn-secondary !text-xs !py-1.5 !px-3 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !title.trim()) {
                  setError('Please enter a commitment title');
                  return;
                }
                if (step === 2 && !partnerUsername) {
                  setError('Please designate an accountability witness');
                  return;
                }
                setError(null);
                setStep((s) => s + 1);
              }}
              className="mac-btn-primary !text-xs !py-1.5 !px-4 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight size={13} />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="mac-btn-primary !text-xs !py-1.5 !px-4 font-medium flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send size={13} />
              <span>{loading ? 'Dispatching...' : 'Seal & dispatch contract'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};