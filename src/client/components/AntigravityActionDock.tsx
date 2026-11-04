import React, { useState } from 'react';
import { ArrowRight, Flame, Plus, ChevronDown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface ContractOption {
  id: string;
  title: string;
  currentLives: number;
  maxLives: number;
  currentStreak: number;
  todayProgress?: any;
  rule?: any;
}

interface AntigravityActionDockProps {
  contracts: ContractOption[];
  onLogProof?: (contract: ContractOption) => void;
  onOpenCommandPalette?: () => void;
}

export const AntigravityActionDock: React.FC<AntigravityActionDockProps> = ({
  contracts,
  onLogProof,
  onOpenCommandPalette,
}) => {
  const navigate = useNavigate();
  const [selectedContractId, setSelectedContractId] = useState<string>(() => {
    return contracts[0]?.id || '';
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [inputText, setInputText] = useState('');

  // Auto-select first contract if state is blank but contracts exist
  const activeContract = contracts.find((c) => c.id === selectedContractId) || contracts[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContract) {
      if (onOpenCommandPalette) onOpenCommandPalette();
      return;
    }

    if (onLogProof) {
      onLogProof(activeContract);
    } else {
      navigate(`/commitments/${activeContract.id}`);
    }
  };

  if (contracts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-40 select-none animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="antigravity-capsule p-2.5 shadow-[0_30px_70px_rgba(0,0,0,0.9)] transition-all duration-150">
        {/* Top Context Row (Directly mirrors screenshot `commitment ▾` and `main ▾`) */}
        <div className="flex items-center justify-between px-2 pb-2 text-xs text-neutral-400">
          <div className="flex items-center gap-1.5 relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="antigravity-pill hover:text-white transition flex items-center gap-1.5 cursor-pointer py-1 px-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]"
              title="Select active contract"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span className="max-w-[220px] truncate font-medium text-neutral-200">
                {activeContract?.title || 'commitment'}
              </span>
              <ChevronDown size={11} className="opacity-60" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (activeContract) navigate(`/commitments/${activeContract.id}`);
              }}
              className="antigravity-pill hover:text-white transition flex items-center gap-1 cursor-pointer py-1 px-2 text-neutral-400 hover:bg-white/[0.04]"
              title="View contract details"
            >
              <span>pact view ▾</span>
            </button>

            {/* Contract Picker Dropdown */}
            {dropdownOpen && (
              <div
                className="absolute top-8 left-0 w-72 antigravity-spotlight p-1.5 z-50 shadow-2xl animate-in fade-in duration-100"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                  Switch Active Covenant
                </div>
                {contracts.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedContractId(c.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-2.5 py-2 rounded-lg text-left text-xs flex items-center justify-between transition cursor-pointer ${
                      c.id === activeContract?.id
                        ? 'bg-white/[0.08] text-white font-medium'
                        : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="truncate">{c.title}</span>
                    <span className="text-[10px] font-mono text-neutral-400 ml-2 shrink-0">
                      {c.currentLives}/{c.maxLives} ♥
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {activeContract && (
            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
              <span className="text-amber-400 flex items-center gap-1 font-medium">
                <Flame size={12} className="fill-amber-400/20" />
                <span>{activeContract.currentStreak}d streak</span>
              </span>
              <span>·</span>
              <span>{activeContract.currentLives}/{activeContract.maxLives} lives</span>
            </div>
          )}
        </div>

        {/* Recessed Input Well (Matches screenshot prompt input) */}
        <form
          onSubmit={handleSubmit}
          className="antigravity-well p-3 space-y-2.5 transition-all duration-150 focus-within:border-white/[0.18]"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything, @ to link covenant, / for actions..."
              className="w-full bg-transparent border-0 outline-none ring-0 focus:ring-0 focus:outline-none text-xs sm:text-[13px] text-neutral-100 placeholder-neutral-500 font-sans tracking-tight p-0"
              style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
            />
          </div>

          {/* Bottom Controls Strip */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (activeContract && onLogProof) {
                    onLogProof(activeContract);
                  } else if (onOpenCommandPalette) {
                    onOpenCommandPalette();
                  }
                }}
                className="antigravity-pill !py-0.5 !px-2 hover:text-white transition flex items-center gap-1.5 text-[11px] text-neutral-300 bg-white/[0.04] border border-white/[0.06] rounded-md cursor-pointer"
              >
                <Plus size={11} className="text-neutral-400" />
                <span>Log Evidence ▾</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenCommandPalette}
                className="antigravity-pill !py-0.5 !px-2 text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                title="Command Palette (⌘K)"
              >
                <span>Turbo ▾</span>
              </button>

              <button
                type="submit"
                className="w-6 h-6 rounded-full bg-white/[0.12] hover:bg-white text-white hover:text-black flex items-center justify-center transition-all font-medium border border-white/[0.1] shadow-xs cursor-pointer shrink-0"
                title="Submit or inspect"
              >
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
