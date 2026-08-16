'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useParams } from 'next/navigation';
import { Button, Badge } from '@heritageverse/ui';

interface NotificationPref {
  email: boolean;
  push: boolean;
}

interface NotificationSettings {
  articles: NotificationPref;
  comments: NotificationPref;
  likes: NotificationPref;
  system: NotificationPref;
  newsletter: boolean;
}

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const { locale } = useParams<{ locale: string }>();

  const [language, setLanguage] = useState(locale);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState<NotificationSettings>({
    articles: { email: true, push: false },
    comments: { email: true, push: true },
    likes: { email: false, push: true },
    system: { email: true, push: true },
    newsletter: true,
  });
  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showActivity: true,
    allowTagging: true,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [saved, setSaved] = useState(false);

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  ];

  const toggleNotification = (key: keyof Omit<NotificationSettings, 'newsletter'>, channel: 'email' | 'push') => {
    setNotifications((prev) => ({
      ...prev,
      [key]: { ...prev[key], [channel]: !prev[key][channel] },
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteAccount = () => {
    setDeleteText('');
    setShowDeleteConfirm(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin text-accent" width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-muted text-sm">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center pt-20 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-navy mb-2">Sign in to manage settings</h1>
          <a href={`/${locale}/auth/login`} className="text-accent hover:text-accent/80 font-medium">Sign in</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="content-section">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-serif text-navy">Settings</h1>
            <p className="text-muted mt-1">Manage your account preferences</p>
          </div>

          <div className="space-y-6">
            {/* Language */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-navy mb-4">Language Preference</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all text-sm ${
                      language === lang.code
                        ? 'border-accent bg-accent/5 text-accent font-medium'
                        : 'border-border text-muted hover:border-accent/30 hover:text-navy'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-navy mb-4">Theme</h2>
              <div className="flex gap-3">
                {(['light', 'dark'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-lg border transition-all text-sm capitalize ${
                      theme === t
                        ? 'border-accent bg-accent/5 text-accent font-medium'
                        : 'border-border text-muted hover:border-accent/30 hover:text-navy'
                    }`}
                  >
                    {t === 'light' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                      </svg>
                    )}
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-navy mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                {(['articles', 'comments', 'likes', 'system'] as const).map((key) => (
                  <div key={key} className="flex items-center justify-between py-2">
                    <p className="text-sm font-medium text-navy capitalize">{key}</p>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[key].email}
                          onChange={() => toggleNotification(key, 'email')}
                          className="rounded border-border text-accent focus:ring-accent/30"
                        />
                        Email
                      </label>
                      <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[key].push}
                          onChange={() => toggleNotification(key, 'push')}
                          className="rounded border-border text-accent focus:ring-accent/30"
                        />
                        Push
                      </label>
                    </div>
                  </div>
                ))}
                <hr className="border-border/50" />
                <label className="flex items-center justify-between py-2 cursor-pointer">
                  <span className="text-sm font-medium text-navy">Newsletter</span>
                  <input
                    type="checkbox"
                    checked={notifications.newsletter}
                    onChange={() => setNotifications((prev) => ({ ...prev, newsletter: !prev.newsletter }))}
                    className="rounded border-border text-accent focus:ring-accent/30"
                  />
                </label>
              </div>
            </div>

            {/* Privacy */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-navy mb-4">Privacy Settings</h2>
              <div className="space-y-4">
                {([
                  { key: 'showProfile', label: 'Show profile to other users' },
                  { key: 'showActivity', label: 'Show activity history' },
                  { key: 'allowTagging', label: 'Allow others to tag me' },
                ] as const).map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between py-2 cursor-pointer">
                    <span className="text-sm text-navy">{label}</span>
                    <input
                      type="checkbox"
                      checked={privacy[key]}
                      onChange={() => setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }))}
                      className="rounded border-border text-accent focus:ring-accent/30"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Save */}
            <div className="flex items-center justify-between">
              <Button onClick={handleSave}>Save Settings</Button>
              {saved && <span className="text-sm text-success font-medium">Settings saved</span>}
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-xl border border-danger/20 p-6">
              <h2 className="text-lg font-semibold text-danger mb-1">Danger Zone</h2>
              <p className="text-sm text-muted mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
              {!showDeleteConfirm ? (
                <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                  Delete Account
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-navy font-medium">Type <span className="text-danger font-bold">DELETE</span> to confirm</p>
                  <input
                    value={deleteText}
                    onChange={(e) => setDeleteText(e.target.value)}
                    placeholder='Type "DELETE" to confirm'
                    className="w-full px-4 py-2.5 rounded-lg border border-danger/30 bg-white text-navy placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-danger/30 text-sm"
                  />
                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                    <Button
                      variant="danger"
                      disabled={deleteText !== 'DELETE'}
                      onClick={handleDeleteAccount}
                    >
                      Confirm Deletion
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
