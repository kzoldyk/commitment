import React, { useState, useEffect, useMemo } from 'react';
import { Bell, User, Save, Check, AlertCircle, Compass, Search } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth-context';

const ALL_TIMEZONES = typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl
  ? Intl.supportedValuesOf('timeZone')
  : [
      'UTC',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Asia/Kolkata',
      'Asia/Tokyo',
      'Asia/Singapore',
      'Asia/Shanghai',
      'Australia/Sydney',
    ];

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [tzSearch, setTzSearch] = useState('');
  const [showTzDropdown, setShowTzDropdown] = useState(false);

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

  const filteredTimezones = useMemo(() => {
    if (!tzSearch.trim()) return ALL_TIMEZONES.slice(0, 50);
    const query = tzSearch.toLowerCase();
    return ALL_TIMEZONES.filter((tz) => tz.toLowerCase().includes(query)).slice(0, 50);
  }, [tzSearch]);

  const isValidTimezone = useMemo(() => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }, [timezone]);

  const handleAutoDetect = () => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) {
        setTimezone(detected);
        setTzSearch('');
        setShowTzDropdown(false);
      }
    } catch (err) {
      console.error('Could not detect timezone', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidTimezone) {
      setError('Please select a valid IANA timezone identifier');
      return;
    }
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
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6 select-none">
      <div>
        <h1 className="text-xl font-semibold text-[#111827] dark:text-[#f2f3f5] tracking-tight">System preferences</h1>
        <p className="text-xs text-neutral-500 dark:text-[#8a8f98] font-mono mt-0.5">Configure evaluation timezones and notification guardrails</p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Check size={14} />
          <span>Settings updated successfully.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle size={14} className="text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Settings */}
        <div className="rounded-xl border border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-200 dark:border-white/[0.06]">
            <User size={14} className="text-neutral-500 dark:text-[#8a8f98]" />
            <h2 className="text-xs font-mono uppercase tracking-wider text-[#111827] dark:text-[#f2f3f5] font-semibold">
              Profile & Evaluation Timezone
            </h2>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1">Username (immutable)</label>
              <input
                type="text"
                disabled
                value={user?.username || ''}
                className="w-full bg-neutral-100 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/[0.06] rounded-md px-3.5 py-2 text-neutral-500 dark:text-[#626670] font-mono text-xs cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98] mb-1">Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md px-3.5 py-2 text-[#111827] dark:text-[#f2f3f5] text-xs focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 focus:ring-1 focus:ring-neutral-200 dark:focus:ring-white/20 transition-all placeholder:text-neutral-400 dark:placeholder:text-[#626670]"
              />
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono text-neutral-600 dark:text-[#8a8f98]">Evaluation timezone</label>
                <button
                  type="button"
                  onClick={handleAutoDetect}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  <Compass size={12} />
                  <span>Auto-detect</span>
                </button>
              </div>

              {/* Selected timezone with toggle button */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={timezone}
                    readOnly
                    onClick={() => setShowTzDropdown(!showTzDropdown)}
                    className={`w-full bg-white dark:bg-white/[0.03] border ${
                      isValidTimezone ? 'border-neutral-200 dark:border-white/[0.08]' : 'border-rose-500/50'
                    } rounded-md px-3.5 py-2 text-[#111827] dark:text-[#f2f3f5] font-mono text-xs cursor-pointer focus:outline-none`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowTzDropdown(!showTzDropdown)}
                  className="mac-btn-secondary !px-3 !py-1.5 !rounded-md text-xs font-mono cursor-pointer"
                >
                  Change
                </button>
              </div>

              {!isValidTimezone && (
                <span className="text-[11px] text-rose-500 dark:text-rose-400 font-mono mt-1 block">
                  Invalid timezone identifier. Please select from the dropdown.
                </span>
              )}

              {/* Timezone picker dropdown popover */}
              {showTzDropdown && (
                <div className="absolute z-30 mt-2 w-full bg-white dark:bg-[#131418] border border-neutral-200 dark:border-white/[0.08] rounded-lg shadow-xl dark:shadow-2xl p-3">
                  <div className="relative mb-2">
                    <Search size={13} className="absolute left-3 top-2.5 text-neutral-400 dark:text-[#626670]" />
                    <input
                      type="text"
                      placeholder="Search timezone (e.g. New_York, Kolkata)..."
                      value={tzSearch}
                      onChange={(e) => setTzSearch(e.target.value)}
                      autoFocus
                      className="w-full bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#111827] dark:text-[#f2f3f5] font-mono focus:outline-none focus:border-neutral-400 dark:focus:border-white/30"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-0.5">
                    {filteredTimezones.map((tz) => (
                      <button
                        key={tz}
                        type="button"
                        onClick={() => {
                          setTimezone(tz);
                          setShowTzDropdown(false);
                          setTzSearch('');
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                          tz === timezone
                            ? 'bg-neutral-100 dark:bg-white/[0.1] text-[#111827] dark:text-white font-medium'
                            : 'hover:bg-neutral-50 dark:hover:bg-white/[0.04] text-neutral-600 dark:text-[#8a8f98]'
                        }`}
                      >
                        {tz}
                      </button>
                    ))}
                    {filteredTimezones.length === 0 && (
                      <div className="p-3 text-center text-xs text-neutral-400 dark:text-[#626670] font-mono">
                        No matching timezone found
                      </div>
                    )}
                  </div>
                </div>
              )}

              <span className="text-[10px] text-neutral-400 dark:text-[#626670] font-mono mt-1.5 block">
                Daily cutoffs (midnight) and 1 AM evaluations are scheduled against this timezone.
              </span>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="rounded-xl border border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-200 dark:border-white/[0.06]">
            <Bell size={14} className="text-neutral-500 dark:text-[#8a8f98]" />
            <h2 className="text-xs font-mono uppercase tracking-wider text-[#111827] dark:text-[#f2f3f5] font-semibold">
              Notification Guardrails
            </h2>
          </div>

          <div className="space-y-2.5">
            <label className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/[0.06] cursor-pointer hover:border-neutral-300 dark:hover:border-white/[0.1] transition-all">
              <div>
                <span className="text-xs font-medium text-[#111827] dark:text-[#f2f3f5] block">Daily incomplete reminders</span>
                <span className="text-[11px] text-neutral-500 dark:text-[#626670]">Receive alert at 10 PM if daily progress is incomplete</span>
              </div>
              <input
                type="checkbox"
                checked={reminders}
                onChange={(e) => setReminders(e.target.checked)}
                className="w-4 h-4 rounded bg-neutral-100 dark:bg-white/[0.04] border-neutral-300 dark:border-white/[0.1] accent-amber-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/[0.06] cursor-pointer hover:border-neutral-300 dark:hover:border-white/[0.1] transition-all">
              <div>
                <span className="text-xs font-medium text-[#111827] dark:text-[#f2f3f5] block">Missed commitment & penalty emails</span>
                <span className="text-[11px] text-neutral-500 dark:text-[#626670]">Alerts sent at 1 AM evaluation when a life is lost</span>
              </div>
              <input
                type="checkbox"
                checked={missedAlerts}
                onChange={(e) => setMissedAlerts(e.target.checked)}
                className="w-4 h-4 rounded bg-neutral-100 dark:bg-white/[0.04] border-neutral-300 dark:border-white/[0.1] accent-amber-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/[0.06] cursor-pointer hover:border-neutral-300 dark:hover:border-white/[0.1] transition-all">
              <div>
                <span className="text-xs font-medium text-[#111827] dark:text-[#f2f3f5] block">Life restoration notifications</span>
                <span className="text-[11px] text-neutral-500 dark:text-[#626670]">Alert when a streak milestone restores a life</span>
              </div>
              <input
                type="checkbox"
                checked={restorationAlerts}
                onChange={(e) => setRestorationAlerts(e.target.checked)}
                className="w-4 h-4 rounded bg-neutral-100 dark:bg-white/[0.04] border-neutral-300 dark:border-white/[0.1] accent-amber-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/[0.06] cursor-pointer hover:border-neutral-300 dark:hover:border-white/[0.1] transition-all">
              <div>
                <span className="text-xs font-medium text-[#111827] dark:text-[#f2f3f5] block">Contract invitations</span>
                <span className="text-[11px] text-neutral-500 dark:text-[#626670]">When someone designates you as their accountability partner</span>
              </div>
              <input
                type="checkbox"
                checked={invitationAlerts}
                onChange={(e) => setInvitationAlerts(e.target.checked)}
                className="w-4 h-4 rounded bg-neutral-100 dark:bg-white/[0.04] border-neutral-300 dark:border-white/[0.1] accent-amber-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="mac-btn-primary !px-5 !py-2 !rounded-md text-xs font-medium disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Save size={13} />
            <span>{saving ? 'Saving...' : 'Save preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
