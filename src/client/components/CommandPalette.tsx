import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  LayoutDashboard,
  Settings,
  Flame,
  RefreshCw,
  Sun,
  Moon,
  ArrowRight,
  Sparkles,
  Command,
} from 'lucide-react';
import { useTheme } from '../lib/theme-context';
import { useAuth } from '../lib/auth-context';
import { api } from '../lib/api';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.FC<{ size?: number; className?: string }>;
  category: 'Navigation' | 'Actions' | 'System';
  shortcut?: string;
  run: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [contracts, setContracts] = useState<{ id: string; title: string; currentLives: number; maxLives: number }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);

      if (user) {
        api
          .getDashboard()
          .then((res) => {
            if (res?.activeCommitments) {
              setContracts(
                res.activeCommitments.map((c) => ({
                  id: c.id,
                  title: c.title,
                  currentLives: c.currentLives,
                  maxLives: c.rule?.maxLives || 3,
                }))
              );
            }
          })
          .catch(() => {});
      }
    }
  }, [isOpen, user]);

  const commands: CommandItem[] = [
    ...contracts.map((c): CommandItem => ({
      id: `contract-${c.id}`,
      title: c.title,
      subtitle: `Open contract (${c.currentLives}/${c.maxLives} lives)`,
      icon: Flame,
      category: 'Actions',
      run: () => {
        navigate(`/commitments/${c.id}`);
        onClose();
      },
    })),
    {
      id: 'dashboard',
      title: 'Go to overview',
      subtitle: 'Open Mission Control and active contracts',
      icon: LayoutDashboard,
      category: 'Navigation',
      shortcut: '⌘1',
      run: () => {
        navigate(user ? '/dashboard' : '/');
        onClose();
      },
    },
    {
      id: 'create',
      title: 'New contract',
      subtitle: 'Forge a new accountability pact',
      icon: Plus,
      category: 'Actions',
      shortcut: '⌘N',
      run: () => {
        navigate('/create');
        onClose();
      },
    },
    {
      id: 'settings',
      title: 'System preferences',
      subtitle: 'Configure timezone and notification alerts',
      icon: Settings,
      category: 'Navigation',
      shortcut: '⌘,',
      run: () => {
        navigate('/settings');
        onClose();
      },
    },
    {
      id: 'simulator',
      title: 'Contract simulator',
      subtitle: 'Test pact rules and financial stakes live',
      icon: Sparkles,
      category: 'Navigation',
      run: () => {
        navigate('/');
        onClose();
      },
    },
    {
      id: 'eval',
      title: 'Run scheduled evaluation',
      subtitle: 'Trigger midnight cutoff checks for pending days',
      icon: RefreshCw,
      category: 'Actions',
      shortcut: '⌘R',
      run: async () => {
        try {
          await api.triggerEvaluation();
          if (window.location.pathname === '/dashboard') {
            window.location.reload();
          } else {
            navigate('/dashboard');
          }
        } catch (e) {
          console.error(e);
        }
        onClose();
      },
    },
    {
      id: 'theme',
      title: theme === 'dark' ? 'Switch to light appearance' : 'Switch to dark appearance',
      subtitle: 'Toggle macOS system interface appearance',
      icon: theme === 'dark' ? Sun : Moon,
      category: 'System',
      shortcut: '⇧⌘T',
      run: () => {
        toggleTheme();
        onClose();
      },
    },
  ];

  const filtered = commands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.subtitle?.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < filtered.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].run();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-24 sm:pt-28 px-4 bg-neutral-900/40 dark:bg-black/80 backdrop-blur-2xl animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-2xl antigravity-spotlight shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden text-[#111827] dark:text-[#f9fafb] select-none animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Ambient Top Glow Line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-300 dark:via-white/20 to-transparent" />

        {/* Seamless Antigravity Spotlight Search Header */}
        <div className="flex items-center px-5 py-4 border-b border-neutral-200 dark:border-white/[0.07] gap-3.5 bg-transparent">
          <Search size={20} className="text-neutral-400 dark:text-[#8a8f98] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search covenants..."
            className="w-full bg-transparent border-0 outline-none ring-0 focus:ring-0 focus:outline-none shadow-none text-base sm:text-[17px] font-sans text-[#111827] dark:text-[#f9fafb] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 tracking-tight p-0"
            style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-neutral-100 dark:bg-white/[0.05] border border-neutral-200 dark:border-white/[0.08] text-neutral-500 dark:text-[#8a8f98]">
              ESC
            </kbd>
          </div>
        </div>

        {/* Command List with Generous Spacing & Laser Alignment */}
        <div className="max-h-96 overflow-y-auto p-2.5 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = selectedIndex === idx;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => cmd.run()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full px-4 py-3 rounded-xl flex items-center justify-between text-left transition-all duration-120 cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-white/[0.08] text-[#111827] dark:text-[#f9fafb] border border-neutral-300 dark:border-white/[0.12] shadow-sm'
                      : 'hover:bg-neutral-50 dark:hover:bg-white/[0.03] text-neutral-600 dark:text-[#8a8f98] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all icon-badge-3d ${
                        isSelected
                          ? 'border-neutral-300 dark:border-white/[0.25] shadow-xs text-neutral-900 dark:text-white'
                          : 'text-neutral-500 dark:text-neutral-400'
                      }`}
                    >
                      <Icon size={16} className="icon-3d" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-medium text-[#111827] dark:text-[#f9fafb] leading-tight truncate">
                          {cmd.title}
                        </p>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-white/[0.04] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-white/[0.05]">
                          {cmd.category}
                        </span>
                      </div>
                      {cmd.subtitle && (
                        <p className="text-[11px] text-neutral-500 dark:text-[#8a8f98] leading-tight mt-1 font-mono truncate">
                          {cmd.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 ml-3">
                    {cmd.shortcut && (
                      <kbd className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-200/50 dark:bg-white/[0.05] border border-neutral-300 dark:border-white/[0.08] text-neutral-600 dark:text-[#8a8f98]">
                        {cmd.shortcut}
                      </kbd>
                    )}
                    {isSelected && <ArrowRight size={14} className="text-neutral-400 dark:text-[#f9fafb]" />}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs font-mono text-neutral-400 dark:text-[#626670]">
              No matching commands or contracts found
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-5 py-3 border-t border-neutral-200 dark:border-white/[0.06] bg-neutral-50/50 dark:bg-black/40 flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-[#626670]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><kbd className="text-[10px] text-neutral-400">↑↓</kbd> navigate</span>
            <span className="flex items-center gap-1.5"><kbd className="text-[10px] text-neutral-400">↵</kbd> execute</span>
            <span className="flex items-center gap-1.5"><kbd className="text-[10px] text-neutral-400">esc</kbd> close</span>
          </div>
          <span className="flex items-center gap-1.5 text-neutral-600 dark:text-[#8a8f98]">
            <Command size={11} /> Spotlight
          </span>
        </div>
      </div>
    </div>
  );
};
