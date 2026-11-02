import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, Mail, Globe, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/auth-context';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(window.location.search);
  const queryEmail = searchParams.get('email') || '';
  const inviteId = searchParams.get('invite') || '';

  const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(queryEmail);
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [timezone, setTimezone] = useState(detectedTz);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) return;

    try {
      setLoading(true);
      setError(null);
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        displayName: displayName.trim() || username.trim(),
        timezone,
      });
      if (inviteId) {
        navigate(`/commitments/${inviteId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-2.75rem)] flex items-center justify-center px-4 py-12 bg-[#f7f8f9] dark:bg-[#0d0e12] text-[#111827] dark:text-[#f2f3f5]">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-[#101216] p-6 sm:p-7 shadow-xl dark:shadow-2xl space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/[0.08] flex items-center justify-center">
            <img src="/logo-mark.png" alt="Commitment Seal" className="w-6 h-6 object-contain" />
          </div>
          <h2 className="text-lg font-semibold text-[#111827] dark:text-[#f2f3f5] tracking-tight">Create account</h2>
          <p className="text-xs text-neutral-500 dark:text-[#8a8f98] font-mono">Join the digital accountability network</p>
        </div>

        {inviteId && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-amber-500 dark:text-amber-400" />
            <span>You have been invited to witness a covenant. Create your account to review and accept it.</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-rose-500 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1">
              Username (login identity)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 dark:text-[#626670]">
                <User size={13} />
              </div>
              <input
                type="text"
                required
                autoCapitalize="none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md pl-9 pr-3.5 py-2 text-xs text-[#111827] dark:text-[#f2f3f5] font-mono placeholder:text-neutral-400 dark:placeholder:text-[#626670] focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 focus:ring-1 focus:ring-neutral-200 dark:focus:ring-white/20 transition-all"
                placeholder="e.g. hitesh"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1">
              Display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md px-3.5 py-2 text-xs text-[#111827] dark:text-[#f2f3f5] placeholder:text-neutral-400 dark:placeholder:text-[#626670] focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 focus:ring-1 focus:ring-neutral-200 dark:focus:ring-white/20 transition-all"
              placeholder="e.g. Hitesh Prajapati"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1">
              Email (for notifications)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 dark:text-[#626670]">
                <Mail size={13} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md pl-9 pr-3.5 py-2 text-xs text-[#111827] dark:text-[#f2f3f5] font-mono placeholder:text-neutral-400 dark:placeholder:text-[#626670] focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 focus:ring-1 focus:ring-neutral-200 dark:focus:ring-white/20 transition-all"
                placeholder="hitesh@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1">
              Password (min 8 chars)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 dark:text-[#626670]">
                <Lock size={13} />
              </div>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md pl-9 pr-3.5 py-2 text-xs text-[#111827] dark:text-[#f2f3f5] font-mono placeholder:text-neutral-400 dark:placeholder:text-[#626670] focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 focus:ring-1 focus:ring-neutral-200 dark:focus:ring-white/20 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1">
              Timezone (midnight cutoff)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 dark:text-[#626670]">
                <Globe size={13} />
              </div>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md pl-9 pr-3.5 py-2 text-xs text-[#111827] dark:text-[#f2f3f5] font-mono focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 focus:ring-1 focus:ring-neutral-200 dark:focus:ring-white/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mac-btn-primary !py-2 !w-full text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Creating account...' : 'Create account'}</span>
            <ArrowRight size={13} />
          </button>
        </form>

        <div className="pt-4 border-t border-neutral-200 dark:border-white/[0.06] text-center text-xs text-neutral-500 dark:text-[#8a8f98]">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="text-[#111827] dark:text-[#f2f3f5] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
