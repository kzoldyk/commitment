import React, { useState, useEffect } from 'react';
import { Bell, Globe, User, Save, Check, AlertCircle, Sliders } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { MacWindow } from '../components/MacWindow';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');

  // Preferences
  const [reminders, setReminders] = useState(true);
  const [missedAlerts, setMissedAlerts] = useState(true);
  const [restorationAlerts, setRestorationAlerts] = useState(true);
  const [invitationAlerts, setInvitationAlerts] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getPreferences();
        if (res.preferences) {
          setReminders(Boolean(res.preferences.remindersEnabled));
          setMissedAlerts(Boolean(res.preferences.missedAlertsEnabled));
          setRestorationAlerts(Boolean(res.preferences.restorationAlertsEnabled));
          setInvitationAlerts(Boolean(res.preferences.invitationAlertsEnabled));
        }
      } catch (e) {
        console.error('Failed to load preferences', e);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await api.updateProfile({ displayName, timezone });
      await api.updatePreferences({
        remindersEnabled: reminders,
        missedAlertsEnabled: missedAlerts,
        restorationAlertsEnabled: restorationAlerts,
        invitationAlertsEnabled: invitationAlerts,
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">system preferences</h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">configure evaluation timezones and notification outbox</p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Check size={15} />
          <span>settings updated successfully.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Settings */}
        <MacWindow title="profile_settings.prefPane" icon={<User size={13} className="text-rose-500" />}>
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-1">username (immutable)</label>
              <input
                type="text"
                disabled
                value={user?.username || ''}
                className="w-full bg-neutral-200/70 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800/60 rounded-xl px-3.5 py-2 text-neutral-600 dark:text-neutral-500 font-mono text-xs cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 mb-1">display name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-900 dark:text-white text-xs focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-950"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-700 dark:text-neutral-300 mb-1">evaluation timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-neutral-100/80 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-900 dark:text-white font-mono text-xs focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-neutral-950"
              />
              <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                daily cutoffs (midnight) and 1 AM evaluations are scheduled against this timezone.
              </span>
            </div>
          </div>
        </MacWindow>

        {/* Notification Preferences */}
        <MacWindow title="notifications.prefPane" icon={<Bell size={13} className="text-amber-500" />}>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-100/80 dark:bg-black/40 border border-black/5 dark:border-white/5 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-neutral-900 dark:text-white block">Daily Incomplete Reminders</span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Receive alert at 10 PM if daily progress is incomplete</span>
              </div>
              <input
                type="checkbox"
                checked={reminders}
                onChange={(e) => setReminders(e.target.checked)}
                className="w-4 h-4 rounded bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-rose-600 focus:ring-rose-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-100/80 dark:bg-black/40 border border-black/5 dark:border-white/5 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-neutral-900 dark:text-white block">Missed Commitment & Penalty Emails</span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Alerts sent at 1 AM evaluation when a life is lost</span>
              </div>
              <input
                type="checkbox"
                checked={missedAlerts}
                onChange={(e) => setMissedAlerts(e.target.checked)}
                className="w-4 h-4 rounded bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-rose-600 focus:ring-rose-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-100/80 dark:bg-black/40 border border-black/5 dark:border-white/5 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-neutral-900 dark:text-white block">Life Restoration Notifications</span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Alert when a streak milestone restores a life</span>
              </div>
              <input
                type="checkbox"
                checked={restorationAlerts}
                onChange={(e) => setRestorationAlerts(e.target.checked)}
                className="w-4 h-4 rounded bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-rose-600 focus:ring-rose-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-100/80 dark:bg-black/40 border border-black/5 dark:border-white/5 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-neutral-900 dark:text-white block">Contract Invitations</span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">When someone designates you as their accountability partner</span>
              </div>
              <input
                type="checkbox"
                checked={invitationAlerts}
                onChange={(e) => setInvitationAlerts(e.target.checked)}
                className="w-4 h-4 rounded bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-rose-600 focus:ring-rose-500"
              />
            </label>
          </div>
        </MacWindow>

        <button
          type="submit"
          disabled={saving}
          className="mac-btn-primary w-full py-2.5 rounded-xl text-white font-semibold text-xs shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <div className="mac-gloss" />
          <Save size={14} />
          <span>{saving ? 'saving...' : 'save preferences'}</span>
        </button>
      </form>
    </div>
  );
};
