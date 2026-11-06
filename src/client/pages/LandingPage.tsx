import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Users,
  Clock,
  Coins,
  Flame,
  CheckCircle2,
  AlertTriangle,
  LayoutDashboard,
  Plus,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { HairlineCovenantMachine } from '../components/HairlineCovenantMachine';
import { CovenantCommandCenter } from '../components/CovenantCommandCenter';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex flex-col justify-between overflow-x-hidden bg-[#f7f8f9] dark:bg-[#07080b] text-[#111827] dark:text-[#f9fafb] transition-colors duration-200">
      {/* Background Architectural Grid & Subtle Radial Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-[140px] -z-10 pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10 opacity-30" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-2 sm:pt-4 pb-16">
        {/* ================= HERO: FITS 100% IN ONE VIEWPORT (BORDER-FREE) ================= */}
        <div className="min-h-[calc(100vh-4.5rem)] flex items-center py-4">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left Column: Human Psychological Value Proposition */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-200/50 dark:bg-white/[0.06] text-xs text-neutral-600 dark:text-[#8a8f98] shadow-xs backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <span>Real accountability with people you know</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111827] dark:text-[#f9fafb] leading-[1.15]">
                Stop breaking promises to yourself.
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-neutral-600 dark:text-[#8a8f98] max-w-xl leading-relaxed">
                When nobody is watching, giving up at 11:30 PM is easy. Commitment puts your daily habit, a friend you respect, and real money on the line. If you don't submit proof before midnight, your friend gets a text—and your cash.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="mac-btn-primary px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2"
                    >
                      <LayoutDashboard size={14} />
                      <span>Open my dashboard</span>
                      <ArrowRight size={14} />
                    </Link>
                    <Link
                      to="/create"
                      className="mac-btn-secondary px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2"
                    >
                      <Plus size={14} className="text-neutral-500 dark:text-[#8a8f98]" />
                      <span>Create a pact</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="mac-btn-primary px-6 py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2"
                    >
                      <span>Start my first commitment</span>
                      <ArrowRight size={14} />
                    </Link>
                    <Link
                      to="/login"
                      className="mac-btn-secondary px-6 py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2"
                    >
                      <span>Sign in</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Human Proof Pillars (Border-free) */}
              <div className="pt-2 grid grid-cols-3 gap-3 p-3 rounded-2xl bg-white/40 dark:bg-white/[0.03] text-xs font-mono text-neutral-500 dark:text-neutral-400">
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white block font-sans text-sm">3 Lives</span>
                  <span>Terminates at 0</span>
                </div>
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white block font-sans text-sm">A Real Friend</span>
                  <span>Gets notified if you miss</span>
                </div>
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white block font-sans text-sm">Real Stakes</span>
                  <span>Owed directly to them</span>
                </div>
              </div>
            </div>

            {/* Right Column: Unified Borderless Animated Covenant Machine */}
            <div className="lg:col-span-6 w-full flex justify-center">
              <HairlineCovenantMachine />
            </div>
          </div>
        </div>

        {/* ================= SECTION 1: THE REAL HUMAN PSYCHOLOGY ================= */}
        <div className="py-20 max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-mono">
              The Psychology of Follow-Through
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Why willpower fails, but peer accountability works every time
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
              We don't fail because we lack ambition. We fail because nobody notices when we quit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* The Private Promise Card (Border-free) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white/70 dark:bg-neutral-900/60 shadow-xl shadow-black/20 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-500">
                  The Private Resolution
                </span>
                <span className="text-xs font-mono text-rose-500 font-medium">Silent excuses</span>
              </div>

              <h3 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                Made in secret. Broken in silence.
              </h3>

              <ul className="space-y-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>The 11:30 PM negotiation:</strong> You're tired in bed. You whisper "I'll do double tomorrow." Tomorrow never comes.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Zero embarrassment:</strong> When you skip a day, no alarm sounds. Nobody knows you quit except you.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Useless habit apps:</strong> Graphs that turn gray without penalizing abandonment.</span>
                </li>
              </ul>
            </div>

            {/* The Witnessed Pact Card (Border-free) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-emerald-50/30 dark:bg-emerald-500/[0.06] shadow-xl shadow-emerald-950/20 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  The Witnessed Pact
                </span>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  Real consequence
                </span>
              </div>

              <h3 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                Sealed with a friend. Enforced by code.
              </h3>

              <ul className="space-y-3 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                  <span><strong>Your friend is watching:</strong> A real peer holds the keys. You cannot quietly click "cancel" when you feel lazy.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                  <span><strong>Cash on the line:</strong> Miss the midnight deadline and your friend gets an instant notification—and your ₹500.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                  <span><strong>Finite life system:</strong> You start with 3 lives. Burn all 3 and the pact permanently dies in public failure.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ================= SECTION 2: COVENANT COMMAND CENTER ================= */}
        <div className="py-12 max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-mono">
              Live Contract OS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Covenant Command Center
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
              What an active commitment looks like: unbroken streak trajectory, real-time midnight countdown, and witness debt tracking in one panoramic card.
            </p>
          </div>

          <CovenantCommandCenter />
        </div>

        {/* ================= SECTION 3: 3 DEAD-SIMPLE STEPS ================= */}
        <div className="py-16 max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-mono">
              How It Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Three steps to keep a promise
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-5 rounded-3xl bg-white/70 dark:bg-[#0c0d12]/70 shadow-lg shadow-black/10 backdrop-blur-md space-y-2">
              <span className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold text-xs flex items-center justify-center">
                01
              </span>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Pick your daily habit</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Choose a concrete target: solve 2 LeetCode problems, run 5km, or write 500 words. Set 3 finite lives and a penalty (e.g. ₹500).
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white/70 dark:bg-[#0c0d12]/70 shadow-lg shadow-black/10 backdrop-blur-md space-y-2">
              <span className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                02
              </span>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Invite someone you respect</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Send a link to a friend or coworker. They accept and become your witness. No self-forgiveness or secret rollbacks allowed.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white/70 dark:bg-[#0c0d12]/70 shadow-lg shadow-black/10 backdrop-blur-md space-y-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                03
              </span>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Show up before midnight or pay</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                LeetCode syncs automatically via API. For other habits, upload proof. If you miss midnight, your friend gets an instant text and your cash.
              </p>
            </div>
          </div>
        </div>

        {/* ================= SECTION 4: HONEST HUMAN FAQ ================= */}
        <div className="py-12 max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Common questions
            </h2>
          </div>

          <div className="space-y-4 text-left text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#0c0d12]/70 shadow-md shadow-black/10 backdrop-blur-md space-y-1">
              <strong className="text-neutral-900 dark:text-white font-semibold block">
                Does Commitment take my money?
              </strong>
              <p className="text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed">
                No. Debts are owed directly between you and your witness via UPI or bank transfer. We never hold your funds or take a percentage.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#0c0d12]/70 shadow-md shadow-black/10 backdrop-blur-md space-y-1">
              <strong className="text-neutral-900 dark:text-white font-semibold block">
                What if an emergency happens and I miss a day?
              </strong>
              <p className="text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed">
                That's why you start with 3 lives. Missing a day costs one life. If you bounce back and maintain a 5-day continuous streak, you earn a life back.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#0c0d12]/70 shadow-md shadow-black/10 backdrop-blur-md space-y-1">
              <strong className="text-neutral-900 dark:text-white font-semibold block">
                How does LeetCode verification work?
              </strong>
              <p className="text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed">
                Fully automated. We check LeetCode's public API at your local midnight cutoff. You don't need to manually upload screenshots.
              </p>
            </div>
          </div>
        </div>

        {/* ================= FINAL CALL TO ACTION ================= */}
        <div className="py-16 text-center max-w-xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Ready to keep a promise for once?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            It takes 60 seconds to pick a goal and invite a friend.
          </p>
          <div className="pt-2">
            <Link
              to={user ? "/create" : "/register"}
              className="mac-btn-primary px-7 py-3 rounded-xl font-medium text-sm inline-flex items-center gap-2 shadow-sm"
            >
              <span>{user ? "Create a contract" : "Start with 3 free lives"}</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-neutral-200 dark:border-white/10 py-6 text-center text-xs text-neutral-500 font-mono">
        Commitment © 2026. A promise with consequences.
      </footer>
    </div>
  );
};
