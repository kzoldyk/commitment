import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/auth-context';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(window.location.search);
  const inviteId = searchParams.get('invite') || '';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    try {
      setLoading(true);
      setError(null);
      await login(username.trim(), password);
      if (inviteId) {
        navigate(`/commitments/${inviteId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
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
          <h2 className="text-lg font-semibold text-[#111827] dark:text-[#f2f3f5] tracking-tight">Sign in to Commitment</h2>
          <p className="text-xs text-neutral-500 dark:text-[#8a8f98] font-mono">Access your active contracts</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-rose-500 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 dark:text-[#626670]">
                <User size={13} />
              </div>
              <input
                type="text"
                required
                autoCapitalize="none"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md pl-9 pr-3.5 py-2 text-xs text-[#111827] dark:text-[#f2f3f5] font-mono placeholder:text-neutral-400 dark:placeholder:text-[#626670] focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 focus:ring-1 focus:ring-neutral-200 dark:focus:ring-white/20 transition-all"
                placeholder="e.g. hitesh"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 dark:text-[#626670]">
                <Lock size={13} />
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md pl-9 pr-3.5 py-2 text-xs text-[#111827] dark:text-[#f2f3f5] font-mono placeholder:text-neutral-400 dark:placeholder:text-[#626670] focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 focus:ring-1 focus:ring-neutral-200 dark:focus:ring-white/20 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mac-btn-primary !py-2 !w-full text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign in'}</span>
            <ArrowRight size={13} />
          </button>
        </form>

        <div className="pt-4 border-t border-neutral-200 dark:border-white/[0.06] text-center text-xs text-neutral-500 dark:text-[#8a8f98]">
          <p>
            Don't have an identity yet?{' '}
            <Link to="/register" className="text-[#111827] dark:text-[#f2f3f5] hover:underline font-medium">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
