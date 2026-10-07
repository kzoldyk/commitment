import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { MacWindow } from '../components/MacWindow';

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
    <div className="min-h-[calc(100vh-2.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <MacWindow title="login_session.app">
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-2.5 flex items-center justify-center drop-shadow-[0_4px_16px_rgba(225,29,72,0.45)]">
              <img src="/logo-mark.png" alt="Commitment Seal" className="w-12 h-12 object-contain" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">sign in</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">access your active contracts</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
                  <User size={14} />
                </div>
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-950 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                  placeholder="e.g. hitesh"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
                  <Lock size={14} />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-950 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mac-btn-primary w-full py-2.5 rounded-xl text-white font-semibold text-xs shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <div className="mac-gloss" />
              <span>{loading ? 'authenticating...' : 'sign in'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          <div className="mt-6 text-center border-t border-black/10 dark:border-white/10 pt-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              don't have an account?{' '}
              <Link to="/register" className="text-rose-600 dark:text-rose-400 hover:text-rose-500 font-semibold transition-colors">
                create one
              </Link>
            </p>
          </div>
        </MacWindow>
      </div>
    </div>
  );
};
