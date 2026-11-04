import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import { api } from '../lib/api';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token') || '';

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setTokenValid(false);
        setTokenError('No reset token was provided. Please use the link sent to your email.');
        setVerifying(false);
        return;
      }

      try {
        const res = await api.verifyResetToken(token);
        if (res.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setTokenError(res.email ? 'This reset link has expired.' : 'Invalid or expired password reset link.');
        }
      } catch (err: any) {
        setTokenValid(false);
        setTokenError(err.message || 'Invalid or expired password reset link.');
      } finally {
        setVerifying(false);
      }
    }

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setFormError('Please enter a new password');
      return;
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setFormError(null);
      await api.resetPassword({ token, password });
      setSuccess(true);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update password. Please try again.');
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
            {success ? 'Password Updated' : 'Set New Password'}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-[#8a8f98] font-mono">
            {success ? 'Credentials successfully updated' : 'Create a secure new password for your account'}
          </p>
        </div>

        {verifying ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-neutral-500 dark:text-[#8a8f98] font-mono">
            <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
            <span>Verifying security token...</span>
          </div>
        ) : !tokenValid ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle size={14} className="shrink-0 text-rose-500 dark:text-rose-400" />
                <span>Link expired or invalid</span>
              </div>
              <p className="text-neutral-600 dark:text-[#8a8f98] leading-relaxed">
                {tokenError || 'This password reset link is invalid or has already expired.'}
              </p>
            </div>

            <Link
              to="/forgot-password"
              className="w-full mac-btn-primary !py-2 !w-full text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <span>Request new reset link</span>
              <ArrowRight size={13} />
            </Link>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs font-mono text-neutral-500 hover:text-neutral-900 dark:text-[#8a8f98] dark:hover:text-[#f2f3f5] transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        ) : success ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Password changed</span>
              </div>
              <p className="text-neutral-600 dark:text-[#8a8f98] leading-relaxed">
                Your password has been successfully reset. Any active sessions on other devices have been securely signed out.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full mac-btn-primary !py-2 !w-full text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Sign in with new password</span>
              <ArrowRight size={13} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0 text-rose-500 dark:text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1.5">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 dark:text-[#626670]">
                  <Lock size={13} />
                </div>
                <input
                  type="password"
                  required
                  autoFocus
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md pl-9 pr-3.5 py-2 text-xs text-[#111827] dark:text-[#f2f3f5] font-mono placeholder:text-neutral-400 dark:placeholder:text-[#626670] focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 focus:ring-1 focus:ring-neutral-200 dark:focus:ring-white/20 transition-all"
                  placeholder="At least 8 characters"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 dark:text-[#626670]">
                  <KeyRound size={13} />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md pl-9 pr-3.5 py-2 text-xs text-[#111827] dark:text-[#f2f3f5] font-mono placeholder:text-neutral-400 dark:placeholder:text-[#626670] focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 focus:ring-1 focus:ring-neutral-200 dark:focus:ring-white/20 transition-all"
                  placeholder="Repeat new password"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-500 dark:text-[#8a8f98]">
              <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
              <span>Minimum 8 characters required</span>
            </div>

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full mac-btn-primary !py-2 !w-full text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Updating password...' : 'Update password'}</span>
              <ArrowRight size={13} />
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-neutral-200 dark:border-white/[0.06] text-center text-xs text-neutral-500 dark:text-[#8a8f98]">
          <Link to="/login" className="text-[#111827] dark:text-[#f2f3f5] hover:underline font-medium">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
