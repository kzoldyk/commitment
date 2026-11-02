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
      className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#131418] border border-neutral-200 dark:border-white/[0.08] rounded-xl shadow-2xl overflow-hidden text-[#111827] dark:text-[#f2f3f5]"
        role="dialog"
        aria-modal="true"
      >
        {/* Spotlight Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-200 dark:border-white/[0.06] gap-3">
          <Search size={16} className="text-neutral-400 dark:text-[#8a8f98] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search contracts..."
            className="w-full bg-transparent text-sm font-sans text-[#111827] dark:text-[#f2f3f5] focus:outline-none placeholder:text-neutral-400 dark:placeholder:text-[#626670]"
          />
          <kbd className="mac-keycap text-[9px]">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
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
                  className={`w-full px-3 py-2 rounded-md flex items-center justify-between text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-white/[0.08] text-[#111827] dark:text-[#f2f3f5]'
                      : 'hover:bg-neutral-50 dark:hover:bg-white/[0.04] text-neutral-600 dark:text-[#8a8f98]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-neutral-200 dark:bg-white/10 text-[#111827] dark:text-[#f2f3f5]'
                          : 'bg-neutral-100 dark:bg-white/[0.04] text-neutral-500 dark:text-[#626670]'
                      }`}
                    >
                      <Icon size={13} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#111827] dark:text-[#f2f3f5] leading-tight">{cmd.title}</p>
                      {cmd.subtitle && (
                        <p className="text-[11px] text-neutral-500 dark:text-[#626670] leading-tight mt-0.5 font-mono">
                          {cmd.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {cmd.shortcut && (
                      <kbd className="mac-keycap text-[9px]">{cmd.shortcut}</kbd>
                    )}
                    {isSelected && <ArrowRight size={12} className="text-neutral-500 dark:text-[#8a8f98]" />}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs font-mono text-neutral-400 dark:text-[#626670]">
              No matching commands or contracts
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 border-t border-neutral-200 dark:border-white/[0.06] bg-neutral-50 dark:bg-white/[0.02] flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-[#626670]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Dismiss</span>
          </div>
          <span className="flex items-center gap-1 text-neutral-600 dark:text-[#8a8f98]">
            <Command size={11} /> ⌘K Palette
          </span>
        </div>
      </div>
    </div>
  );
};
