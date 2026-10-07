import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Flame, Shield, Check, Terminal, Sparkles, Clock, Users, Lock, LayoutDashboard, Plus } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { MacWindow } from '../components/MacWindow';
import { LivesIndicator } from '../components/LivesIndicator';
import { StreakBadge } from '../components/StreakBadge';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="relative min-h-[calc(100vh-2.5rem)] flex flex-col justify-between overflow-hidden bg-[#f5f5f7] dark:bg-neutral-950 transition-colors duration-200">
      {/* Background Ambient Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-rose-500/10 blur-[150px] -z-10 pointer-events-none rounded-full" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-24 flex flex-col items-center text-center">
        {/* Wax Seal Logo Emblem */}
        <div className="mb-6 relative group">
          <div className="absolute inset-0 bg-rose-500/20 blur-2xl rounded-full scale-125 pointer-events-none group-hover:scale-150 transition-transform" />
          <img
            src="/logo-mark.png"
            alt="Commitment Wax Seal"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain relative drop-shadow-[0_8px_24px_rgba(225,29,72,0.5)] transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* macOS Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/90 text-xs font-mono text-neutral-600 dark:text-neutral-300 mb-6 shadow-sm backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span>commitment v1.0 · digital accountability engine</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-neutral-900 dark:text-white max-w-3xl leading-[1.08] mb-5">
          commitment
        </h1>
        <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mb-10 leading-relaxed font-normal">
          {user ? (
            <span>Welcome back, <strong className="text-neutral-900 dark:text-white">@{user.username}</strong>. Check your commitments and track your streaks.</span>
          ) : (
            <span>an accountability contract system where one user makes a measurable promise to another.</span>
          )}
        </p>

        {/* macOS Glossy CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="mac-btn-primary px-8 py-3.5 rounded-full text-white font-semibold text-sm flex items-center gap-2.5 shadow-xl transition-all"
              >
                <div className="mac-gloss" />
                <LayoutDashboard size={16} />
                <span>go to dashboard</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/create"
                className="mac-btn-secondary px-8 py-3.5 rounded-full font-semibold text-sm flex items-center gap-2 transition-all"
              >
                <div className="mac-gloss" />
                <Plus size={16} className="text-rose-500" />
                <span>new contract</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="mac-btn-primary px-8 py-3.5 rounded-full text-white font-semibold text-sm flex items-center gap-2.5 shadow-xl transition-all"
              >
                <div className="mac-gloss" />
                <span>create contract</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/login"
                className="mac-btn-secondary px-8 py-3.5 rounded-full font-semibold text-sm flex items-center gap-2 transition-all"
              >
                <div className="mac-gloss" />
                <span>sign in to dashboard</span>
              </Link>
            </>
          )}
        </div>

        {/* Main macOS Contract Window */}
        <div className="w-full max-w-2xl text-left">
          <MacWindow title="active_contract.app" icon={<Flame size={13} className="text-rose-500" />}>
            <div className="space-y-6">
              {/* Header row */}
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
                      ENFORCEABLE CONTRACT
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
                    Solve 2 LeetCode problems every day
                  </h3>
                </div>
                <StreakBadge streak={16} size="md" />
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-100/80 dark:bg-black/40 border border-black/5 dark:border-white/5">
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Lives Health
                  </span>
                  <LivesIndicator currentLives={3} maxLives={3} size="md" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                    Today's Target (Cutoff: 00:00)
                  </span>
                  <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400">2 / 2 problems (Completed ✓)</span>
                </div>
              </div>

              {/* Details & Rules */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono text-neutral-600 dark:text-neutral-400">
                <div className="p-3 rounded-lg bg-neutral-100 dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                  <span className="text-[10px] text-neutral-500 block mb-0.5">PARTNER</span>
                  <strong className="text-neutral-900 dark:text-white font-sans">@rahul</strong>
                </div>
                <div className="p-3 rounded-lg bg-neutral-100 dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                  <span className="text-[10px] text-neutral-500 block mb-0.5">PENALTY</span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">-1 Life on miss</span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-100 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-neutral-500 block mb-0.5">RECOVERY</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">+1 Life / 5 days</span>
                </div>
              </div>
            </div>
          </MacWindow>
        </div>

        {/* macOS Notes / Manifesto Window */}
        <div className="w-full max-w-2xl text-left mt-16">
          <MacWindow title="notes.txt" icon={<Terminal size={13} className="text-amber-500" />}>
            <div className="space-y-4 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
              <p className="font-semibold text-neutral-900 dark:text-white text-base">
                make a promise. define the rules. give someone visibility. prove your progress. face the consequence.
              </p>
              <p className="text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed">
                most habit apps fail because nothing happens when you give up. commitment creates genuine digital accountability between two people with deterministic penalties, automated timezone evaluation, and transactional notifications.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs font-mono text-neutral-500 border-t border-black/10 dark:border-white/10">
                <span>written in code · enforced by schedule</span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold">1:00 AM daily cutoff evaluation</span>
              </div>
            </div>
          </MacWindow>
        </div>

        {/* 3 Core Principles as Mac Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mt-16 text-left">
          <MacWindow title="lives.sys" icon={<Heart size={12} className="text-rose-500" />}>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-1.5">Finite Contract Lives</h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Every contract has 1 to 5 lives. Miss a daily cutoff and you lose a life. Reach zero and your contract terminates in failure.
            </p>
          </MacWindow>

          <MacWindow title="partner.net" icon={<Users size={12} className="text-amber-500" />}>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-1.5">No Self-Approval</h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Your designated accountability partner must accept the contract. They receive real-time email alerts whenever you miss.
            </p>
          </MacWindow>

          <MacWindow title="cron.worker" icon={<Clock size={12} className="text-emerald-500" />}>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-1.5">Automated Evaluation</h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              No manual honor checking. Scheduled workers evaluate daily targets at 1:00 AM in your local timezone automatically.
            </p>
          </MacWindow>
        </div>
      </main>

      <footer className="w-full border-t border-black/10 dark:border-white/10 py-6 text-center text-xs text-neutral-500 font-mono">
        commitment © 2026. a promise with consequences.
      </footer>
    </div>
  );
};
