import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Sun,
  Moon,
  Clock,
  LogOut,
  ChevronDown,
  Target,
  Sliders,
  PlusCircle,
  PanelLeft,
  PanelLeftClose,
  Star,
  MoreHorizontal,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { useTheme } from '../lib/theme-context';
import { api } from '../lib/api';

interface MacOSWindowFrameProps {
  children: React.ReactNode;
  onOpenCommandPalette: () => void;
}

export const MacOSWindowFrame: React.FC<MacOSWindowFrameProps> = ({
  children,
  onOpenCommandPalette,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [cutoffCountdown, setCutoffCountdown] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      return localStorage.getItem('commitment:sidebar') !== 'closed';
    } catch {
      return true;
    }
  });

  const [sidebarContracts, setSidebarContracts] = useState<
    Array<{ id: string; title: string; isCompleted: boolean }>
  >([]);

  // Fetch real active contracts for the sidebar navigation
  useEffect(() => {
    if (!user) return;
    let active = true;
    api
      .getDashboard()
      .then((res) => {
        if (!active) return;
        setSidebarContracts(
          (res.activeCommitments || []).map((c) => ({
            id: c.id,
            title: c.title,
            isCompleted: c.todayProgress?.status === 'COMPLETED',
          }))
        );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user, location.pathname]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('commitment:sidebar', next ? 'open' : 'closed');
      } catch {}
      return next;
    });
  };

  // Live Cutoff Countdown Ticker
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tonight = new Date(now);
      tonight.setHours(24, 0, 0, 0);
      const diffMs = tonight.getTime() - now.getTime();
      const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      setCutoffCountdown(`${hours}h ${minutes}m`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 10000);
    return () => clearInterval(interval);
  }, []);

  // Global Keyboard shortcuts: ⌘K, ⌘N, ⌘,, ⌘[
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenCommandPalette();
      } else if (!isInput && (e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        navigate('/settings');
      } else if (!isInput && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        navigate('/create');
      } else if (!isInput && (e.metaKey || e.ctrlKey) && e.key === '[') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenCommandPalette, navigate]);

  // Authenticated View: Linear Layout with Closable Left Navigation Sidebar (Dual Theme)
  if (user) {
    return (
      <div className="w-full h-screen min-h-screen flex bg-[#f7f8f9] dark:bg-[#07080b] text-[#111827] dark:text-[#f9fafb] overflow-hidden font-sans select-none antialiased">
        {/* ================= CLOSABLE LINEAR LEFT SIDEBAR ================= */}
        <aside
          className={`shrink-0 h-screen bg-[#f4f5f6] dark:bg-[#08090d] border-r border-neutral-200 dark:border-white/[0.05] flex flex-col justify-between z-30 transition-all duration-200 ease-in-out ${
            sidebarOpen ? 'w-60 opacity-100' : 'w-0 opacity-0 -translate-x-full overflow-hidden border-none pointer-events-none'
          }`}
        >
          <div className="flex flex-col overflow-y-auto">
            {/* Workspace Header Switcher */}
            <div className="h-11 flex items-center justify-between px-3 border-b border-neutral-200 dark:border-white/[0.04]">
              <Link to="/dashboard" className="flex items-center gap-2 group min-w-0">
                <div className="w-5 h-5 rounded-[5px] bg-neutral-200/60 dark:bg-white/[0.06] border border-neutral-300 dark:border-white/[0.09] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  <img src="/logo-mark.png" alt="Seal" className="w-3.5 h-3.5 object-contain" />
                </div>
                <div className="flex items-center gap-1 min-w-0">
                  <span className="font-medium text-[13px] text-[#111827] dark:text-[#f9fafb] truncate">Commitment</span>
                  <ChevronDown size={12} className="text-neutral-400 dark:text-[#626670] shrink-0" />
                </div>
              </Link>

              <div className="flex items-center gap-0.5 text-neutral-500 dark:text-[#8a8f98]">
                <button
                  type="button"
                  onClick={onOpenCommandPalette}
                  className="p-1 rounded hover:bg-neutral-200/50 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-[#f9fafb] transition-colors cursor-pointer"
                  title="Search (⌘K)"
                >
                  <Search size={14} />
                </button>
                <Link
                  to="/create"
                  className="p-1 rounded hover:bg-neutral-200/50 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-[#f9fafb] transition-colors cursor-pointer"
                  title="New contract (⌘N)"
                >
                  <Plus size={15} />
                </Link>
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="p-1 rounded hover:bg-neutral-200/50 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-[#f9fafb] transition-colors cursor-pointer"
                  title="Close sidebar (⌘[)"
                  aria-label="Close sidebar"
                >
                  <PanelLeftClose size={14} />
                </button>
              </div>
            </div>

            {/* Main Navigation Links (Clean & Usable) */}
            <div className="p-2 space-y-0.5 text-[13px] font-medium text-neutral-600 dark:text-[#8a8f98]">
              <Link
                to="/dashboard"
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors ${
                  location.pathname === '/' || location.pathname === '/dashboard'
                    ? 'bg-neutral-200/70 dark:bg-white/[0.08] text-[#111827] dark:text-[#f9fafb] font-medium'
                    : 'hover:bg-neutral-200/40 dark:hover:bg-white/[0.04] hover:text-[#111827] dark:hover:text-[#f9fafb]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-neutral-400 dark:text-[#626670]" />
                  <span>Contracts</span>
                </div>
                {sidebarContracts.length > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-white/[0.06] text-neutral-600 dark:text-[#8a8f98]">
                    {sidebarContracts.length}
                  </span>
                )}
              </Link>

              <Link
                to="/create"
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-colors ${
                  location.pathname === '/create'
                    ? 'bg-neutral-200/70 dark:bg-white/[0.08] text-[#111827] dark:text-[#f9fafb] font-medium'
                    : 'hover:bg-neutral-200/40 dark:hover:bg-white/[0.04] hover:text-[#111827] dark:hover:text-[#f9fafb]'
                }`}
              >
                <PlusCircle size={14} className="text-neutral-400 dark:text-[#626670]" />
                <span>New Covenant</span>
              </Link>

              <Link
                to="/settings"
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-colors ${
                  location.pathname === '/settings'
                    ? 'bg-neutral-200/70 dark:bg-white/[0.08] text-[#111827] dark:text-[#f9fafb] font-medium'
                    : 'hover:bg-neutral-200/40 dark:hover:bg-white/[0.04] hover:text-[#111827] dark:hover:text-[#f9fafb]'
                }`}
              >
                <Sliders size={14} className="text-neutral-400 dark:text-[#626670]" />
                <span>Settings</span>
              </Link>
            </div>

            {/* Active Covenants List (Real User Contracts with Status Dots) */}
            <div className="px-2 pt-3 pb-2">
              <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-medium text-neutral-500 dark:text-[#626670] tracking-wider uppercase font-mono">
                <span>Active Covenants</span>
                {sidebarContracts.length > 0 && (
                  <span className="text-[10px] font-mono tabular-nums text-neutral-400 dark:text-[#626670]">
                    {sidebarContracts.length}
                  </span>
                )}
              </div>
              <div className="space-y-0.5 mt-1 text-[13px]">
                {sidebarContracts.length === 0 ? (
                  <Link
                    to="/create"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-neutral-400 dark:text-[#626670] hover:text-[#111827] dark:hover:text-[#f9fafb] hover:bg-neutral-200/40 dark:hover:bg-white/[0.04] transition-colors"
                  >
                    <Plus size={12} />
                    <span>Forge a covenant</span>
                  </Link>
                ) : (
                  sidebarContracts.map((c) => {
                    const isCurrent = location.pathname === `/commitments/${c.id}`;
                    return (
                      <Link
                        key={c.id}
                        to={`/commitments/${c.id}`}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-colors ${
                          isCurrent
                            ? 'bg-neutral-200/80 dark:bg-[#121318] text-[#111827] dark:text-[#f9fafb] font-medium border border-transparent dark:border-white/[0.08]'
                            : 'text-neutral-600 dark:text-[#8a8f98] hover:bg-neutral-200/40 dark:hover:bg-white/[0.04] hover:text-[#111827] dark:hover:text-[#f9fafb]'
                        }`}
                        title={c.title}
                      >
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            c.isCompleted
                              ? 'bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.4)]'
                              : 'border border-amber-500/80 bg-amber-500/20 shadow-[0_0_6px_rgba(245,158,11,0.25)]'
                          }`}
                        />
                        <span className="truncate">{c.title}</span>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Footer: User Account, Theme & Logout */}
          <div className="p-2 border-t border-neutral-200 dark:border-white/[0.05] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-white/[0.08] border border-neutral-300 dark:border-white/[0.1] flex items-center justify-center font-mono text-[11px] text-[#111827] dark:text-[#f9fafb] shrink-0 font-medium">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="font-mono text-neutral-600 dark:text-[#8a8f98] truncate max-w-[100px]">
                @{user.username}
              </span>
            </div>

            <div className="flex items-center gap-0.5 text-neutral-500 dark:text-[#8a8f98]">
              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-1.5 rounded hover:bg-neutral-200/50 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-[#f9fafb] transition-colors cursor-pointer"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
              </button>

              {/* Logout Button */}
              <button
                type="button"
                onClick={logout}
                className="p-1.5 rounded hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400 text-neutral-500 dark:text-[#8a8f98] transition-colors cursor-pointer"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </aside>

        {/* ================= MAIN APPLICATION CANVAS ================= */}
        <div className="flex-1 h-screen flex flex-col bg-[#f7f8f9] dark:bg-[#07080b] overflow-hidden">
          {/* Top Breadcrumb & Actions Bar (Linear Style) */}
          <header className="h-11 border-b border-neutral-200 dark:border-white/[0.05] flex items-center justify-between px-4 sm:px-5 bg-[#f7f8f9]/90 dark:bg-[#07080b]/85 backdrop-blur-xl select-none shrink-0 z-20">
            {/* Left: Sidebar Toggle + Issue / Context Breadcrumb */}
            <div className="flex items-center gap-2.5 text-xs text-neutral-500 dark:text-[#8a8f98]">
              <button
                type="button"
                onClick={toggleSidebar}
                className="p-1 -ml-1 rounded hover:bg-neutral-200/50 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-[#f9fafb] transition-colors cursor-pointer text-neutral-500 dark:text-[#8a8f98]"
                title={sidebarOpen ? 'Collapse sidebar (⌘[)' : 'Expand sidebar (⌘[)'}
                aria-label="Toggle sidebar"
              >
                <PanelLeft size={15} />
              </button>

              <div className="w-2 h-2 rounded-full border border-amber-500 bg-amber-500/20 shadow-[0_0_6px_rgba(245,158,11,0.3)] shrink-0" />
              <span className="font-medium text-[#111827] dark:text-[#f9fafb]">
                {location.pathname.startsWith('/commitments')
                  ? 'Commitment Inspector'
                  : location.pathname === '/create'
                  ? 'New Covenant'
                  : location.pathname === '/settings'
                  ? 'Settings'
                  : 'Contracts'}
              </span>
              <Star size={12} className="text-amber-500 fill-amber-500/20 cursor-pointer" />
              <MoreHorizontal size={13} className="text-neutral-400 dark:text-[#626670] hover:text-[#111827] dark:hover:text-[#f9fafb] cursor-pointer" />
            </div>

            {/* Right: Cutoff Countdown, Pagination & Action Button */}
            <div className="flex items-center gap-2.5 sm:gap-3 text-xs">
              <div
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.06] font-mono text-[11px] text-neutral-600 dark:text-[#8a8f98] shadow-xs backdrop-blur-sm"
                title="Time remaining until daily midnight evaluation cutoff"
              >
                <Clock size={11} className="text-amber-500" />
                <span>Cutoff: <strong className="text-[#111827] dark:text-[#f9fafb] font-medium tabular-nums">{cutoffCountdown || '...'}</strong></span>
              </div>

              <button
                type="button"
                onClick={onOpenCommandPalette}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-white/[0.03] hover:bg-neutral-100 dark:hover:bg-white/[0.07] text-neutral-600 dark:text-[#8a8f98] hover:text-[#111827] dark:hover:text-[#f9fafb] transition-colors border border-neutral-200 dark:border-white/[0.06] text-xs cursor-pointer shadow-xs"
                title="Command Palette (⌘K)"
              >
                <Search size={12} />
                <kbd className="mac-keycap text-[9px]">⌘K</kbd>
              </button>

              <Link
                to="/create"
                className="mac-btn-primary !py-1 !px-2.5 !text-xs !h-7 font-medium"
              >
                <Plus size={13} />
                <span>New contract</span>
              </Link>
            </div>
          </header>

          {/* Main Scrollable Workspace Body */}
          <main className="flex-1 w-full overflow-y-auto bg-[#f7f8f9] dark:bg-[#07080b] text-[#111827] dark:text-[#f9fafb]">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Guest View: Clean Top Navigation without Sidebar
  return (
    <div className="w-full h-screen min-h-screen flex flex-col bg-[#f7f8f9] dark:bg-[#07080b] text-[#111827] dark:text-[#f9fafb] overflow-hidden font-sans select-none antialiased">
      <header className="h-12 bg-[#f7f8f9]/90 dark:bg-[#07080b]/85 backdrop-blur-xl border-b border-neutral-200 dark:border-white/[0.05] flex items-center justify-between px-4 sm:px-6 select-none shrink-0 z-40">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-md bg-neutral-200/60 dark:bg-white/[0.06] border border-neutral-300 dark:border-white/[0.1] flex items-center justify-center overflow-hidden shadow-sm">
              <img src="/logo-mark.png" alt="Commitment Seal" className="w-4 h-4 object-contain" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#111827] dark:text-[#f9fafb] tracking-tight text-[13px]">
                Commitment
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-neutral-100 dark:bg-white/[0.04] text-neutral-600 dark:text-[#8a8f98] border border-neutral-200 dark:border-white/[0.06]">
                Contract OS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-[13px] font-medium text-neutral-600 dark:text-[#8a8f98]">
            <Link
              to="/"
              className={`px-2.5 py-1 rounded-md transition-colors ${
                location.pathname === '/'
                  ? 'bg-neutral-200/70 dark:bg-white/[0.08] text-[#111827] dark:text-[#f9fafb]'
                  : 'hover:text-[#111827] dark:hover:text-[#f9fafb] hover:bg-neutral-200/40 dark:hover:bg-white/[0.04]'
              }`}
            >
              Simulator
            </Link>
            <Link
              to="/login"
              className="px-2.5 py-1 rounded-md hover:text-[#111827] dark:hover:text-[#f9fafb] hover:bg-neutral-200/40 dark:hover:bg-white/[0.04] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-2.5 py-1 rounded-md hover:text-[#111827] dark:hover:text-[#f9fafb] hover:bg-neutral-200/40 dark:hover:bg-white/[0.04] transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white dark:bg-white/[0.03] hover:bg-neutral-100 dark:hover:bg-white/[0.07] text-xs text-neutral-600 dark:text-[#8a8f98] hover:text-[#111827] dark:hover:text-[#f9fafb] transition-colors cursor-pointer border border-neutral-200 dark:border-white/[0.06] shadow-xs"
            title="Search or execute command (⌘K)"
          >
            <Search size={13} />
            <span className="hidden md:inline">Search</span>
            <kbd className="mac-keycap text-[10px]">⌘K</kbd>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-md hover:bg-neutral-200/50 dark:hover:bg-white/[0.06] text-neutral-600 dark:text-[#8a8f98] hover:text-[#111827] dark:hover:text-[#f9fafb] transition-colors cursor-pointer border border-neutral-200 dark:border-white/[0.06]"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <Link
            to="/login"
            className="mac-btn-primary !py-1.5 !px-3 !text-xs !h-8 font-medium"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full overflow-y-auto bg-[#f7f8f9] dark:bg-[#07080b] text-[#111827] dark:text-[#f9fafb]">
        {children}
      </main>
    </div>
  );
};