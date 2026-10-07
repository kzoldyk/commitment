import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, Mail, Globe, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { MacWindow } from '../components/MacWindow';

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
    <div className="min-h-[calc(100vh-2.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <MacWindow title="create_account.app">
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-2.5 flex items-center justify-center drop-shadow-[0_4px_16px_rgba(225,29,72,0.45)]">
              <img src="/logo-mark.png" alt="Commitment Seal" className="w-12 h-12 object-contain" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">create account</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">join the digital accountability network</p>
          </div>

          {inviteId && (
            <div className="mb-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-amber-600 dark:text-amber-400" />
              <span>You have been invited to enforce an accountability contract. Create your account to review and accept it.</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                username (login identity)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
                  <User size={14} />
                </div>
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-950 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                  placeholder="e.g. hitesh"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                display name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-4 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-950 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                placeholder="e.g. Hitesh Prajapati"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                email (for notification outbox)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
                  <Mail size={14} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-950 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                  placeholder="hitesh@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                password (min 8 chars)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
                  <Lock size={14} />
                </div>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-950 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                timezone (for 1 AM evaluation)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
                  <Globe size={14} />
                </div>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-950 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mac-btn-primary w-full py-2.5 rounded-xl text-white font-semibold text-xs shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <div className="mac-gloss" />
              <span>{loading ? 'creating account...' : 'create account'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          <div className="mt-6 text-center border-t border-black/10 dark:border-white/10 pt-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              already have an account?{' '}
              <Link to="/login" className="text-rose-600 dark:text-rose-400 hover:text-rose-500 font-semibold transition-colors">
                sign in
              </Link>
            </p>
          </div>
        </MacWindow>
      </div>
    </div>
  );
};
