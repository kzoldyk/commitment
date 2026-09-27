import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wifi, Battery, Plus, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { useTheme } from '../lib/theme-context';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-black/10 dark:border-white/10 select-none text-[13px] font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 h-10 flex items-center justify-between">
        {/* Left: macOS Brand & Menus */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            {/* Apple / Commitment Icon */}
            <div className="w-5 h-5 rounded-md bg-rose-600 flex items-center justify-center text-white font-black text-xs shadow-[0_0_10px_rgba(225,29,72,0.5)] group-hover:scale-105 transition-transform">
              C
            </div>
            <span className="font-bold text-neutral-900 dark:text-white tracking-tight">commitment</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-4 text-neutral-500 dark:text-neutral-400 font-medium">
            <Link
              to={user ? "/dashboard" : "/"}
              className={`hover:text-neutral-900 dark:hover:text-white transition-colors ${
                location.pathname === '/' || location.pathname === '/dashboard' ? 'text-neutral-900 dark:text-white font-semibold' : ''
              }`}
            >
              overview
            </Link>
            {user && (
              <>
                <Link
                  to="/create"
                  className={`hover:text-neutral-900 dark:hover:text-white transition-colors ${
                    location.pathname === '/create' ? 'text-neutral-900 dark:text-white font-semibold' : ''
                  }`}
                >
                  new contract
                </Link>
                <Link
                  to="/settings"
                  className={`hover:text-neutral-900 dark:hover:text-white transition-colors ${
                    location.pathname === '/settings' ? 'text-neutral-900 dark:text-white font-semibold' : ''
                  }`}
                >
                  settings
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right: macOS Status Bar Icons & Profile */}
        <div className="flex items-center gap-3 sm:gap-4 text-neutral-700 dark:text-neutral-300">
          {/* Status Icons */}
          <div className="flex items-center gap-2.5 text-neutral-500 dark:text-neutral-400">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-neutral-700" />}
            </button>

            <Wifi size={13} className="hover:text-neutral-900 dark:hover:text-white cursor-pointer transition-colors" />

            {/* Battery Indicator */}
            <div className="flex items-center gap-1">
              <div className="w-5 h-2.5 rounded-sm border border-neutral-400 dark:border-neutral-500 p-0.5 flex items-center">
                <div className="w-3.5 h-full bg-emerald-500 rounded-[1px]" />
              </div>
            </div>

            {/* Clock */}
            <span className="text-xs font-mono font-medium text-neutral-800 dark:text-neutral-200 pl-1">{timeStr || '1:43 PM'}</span>
          </div>

          {/* User Profile / Action */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-black/10 dark:border-white/10">
              <Link
                to="/create"
                className="mac-btn-primary px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <div className="mac-gloss" />
                <Plus size={13} />
                <span className="hidden md:inline">contract</span>
              </Link>

              <Link
                to="/settings"
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 transition-colors"
                title={user.email}
              >
                <div className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-mono hidden sm:inline">@{user.username}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-1 rounded-md hover:bg-rose-500/20 text-neutral-500 hover:text-rose-500 transition-colors cursor-pointer"
                title="Log out"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white px-2.5 py-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                sign in
              </Link>
              <Link
                to="/register"
                className="mac-btn-primary px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1"
              >
                <div className="mac-gloss" />
                <span>start free</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
