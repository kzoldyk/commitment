import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.forgotPassword(cleanEmail);
      setSubmitted(true);
      if (res.devResetUrl) {
        setDevResetUrl(res.devResetUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link. Please try again.');
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
          <h2 className="text-lg font-semibold text-[#111827] dark:text-[#f2f3f5] tracking-tight">
            {submitted ? 'Check your email' : 'Reset your password'}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-[#8a8f98] font-mono">
            {submitted ? 'Security dispatch sent' : 'Enter your email to receive recovery instructions'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-rose-500 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Reset link dispatched</span>
              </div>
              <p className="text-neutral-600 dark:text-[#8a8f98] leading-relaxed">
                If an account exists for <span className="font-mono text-[#111827] dark:text-white font-medium">{email}</span>, we have sent instructions to reset your password. The link is valid for 60 minutes.
              </p>
            </div>

            {devResetUrl && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs space-y-1.5">
                <div className="font-mono font-medium text-[11px] text-amber-800 dark:text-amber-200 uppercase tracking-wider">
                  Dev Mode Quick Access
                </div>
                <p className="text-neutral-600 dark:text-[#8a8f98] text-[11px]">
                  SMTP is mocked in local environment. Use the direct link below:
                </p>
                <a
                  href={devResetUrl}
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] text-amber-600 dark:text-amber-400 hover:underline break-all"
                >
                  <span>Open Reset Password Page</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setDevResetUrl(null);
                }}
                className="w-full py-2 px-3 text-xs font-mono text-neutral-600 dark:text-[#8a8f98] hover:text-[#111827] dark:hover:text-white border border-neutral-200 dark:border-white/[0.08] rounded-md transition-colors cursor-pointer"
              >
                Try a different email
              </button>

              <Link
                to="/login"
                className="w-full mac-btn-primary !py-2 !w-full text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <span>Return to sign in</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1.5">
                Account Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 dark:text-[#626670]">
                  <Mail size={13} />
                </div>
                <input
                  type="email"
                  required
                  autoFocus
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md pl-9 pr-3.5 py-2 text-xs text-[#111827] dark:text-[#f2f3f5] font-mono placeholder:text-neutral-400 dark:placeholder:text-[#626670] focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 focus:ring-1 focus:ring-neutral-200 dark:focus:ring-white/20 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full mac-btn-primary !py-2 !w-full text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Sending link...' : 'Send reset link'}</span>
              <ArrowRight size={13} />
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-500 hover:text-neutral-900 dark:text-[#8a8f98] dark:hover:text-[#f2f3f5] transition-colors"
              >
                <ArrowLeft size={12} />
                <span>Back to sign in</span>
              </Link>
            </div>
          </form>
        )}

        <div className="pt-4 border-t border-neutral-200 dark:border-white/[0.06] text-center text-xs text-neutral-500 dark:text-[#8a8f98]">
          <p>
            Remember your credentials?{' '}
            <Link to="/login" className="text-[#111827] dark:text-[#f2f3f5] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
