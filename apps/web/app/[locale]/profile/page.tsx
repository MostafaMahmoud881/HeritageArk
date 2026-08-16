'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useParams } from 'next/navigation';
import { Button, Input, Badge } from '@heritageverse/ui';

interface ActivityItem {
  id: string;
  type: 'article' | 'comment' | 'bookmark';
  title: string;
  description: string;
  date: string;
}

const ACTIVITIES: ActivityItem[] = [
  { id: '1', type: 'article', title: 'The Lost Libraries of Timbuktu', description: 'You published a new article', date: '2 hours ago' },
  { id: '2', type: 'comment', title: 'Silk Road Origins', description: 'You commented on this article', date: '1 day ago' },
  { id: '3', type: 'bookmark', title: 'Berber Weaving Traditions', description: 'You bookmarked this article', date: '3 days ago' },
  { id: '4', type: 'article', title: 'Ancient Nubian Pyramids', description: 'You published a new article', date: '1 week ago' },
  { id: '5', type: 'comment', title: 'Temple of Dendur', description: 'You commented on this artifact', date: '2 weeks ago' },
];

export default function ProfilePage() {
  const { user, updateUser, isLoading } = useAuth();
  const { locale } = useParams<{ locale: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'profile' | 'password' | 'activity'>('profile');

  const activityIcons: Record<string, string> = {
    article: '📝',
    comment: '💬',
    bookmark: '🔖',
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    updateUser({ name, email });
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500);
  };

  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateUser({ avatar: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) return;
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTwoFactorToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    updateUser({ twoFactorEnabled: !twoFactorEnabled });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin text-accent" width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-muted text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center pt-20 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-navy mb-2">Sign in to view your profile</h1>
          <a href={`/${locale}/auth/login`} className="text-accent hover:text-accent/80 font-medium">Sign in</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="content-section">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-6 mb-10">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-gold flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
              </div>
              <button
                onClick={handleAvatarUpload}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent text-navy flex items-center justify-center text-xs hover:bg-accent/90 transition-colors shadow-md"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>
            <div>
              <h1 className="text-3xl font-serif text-navy">{user.name}</h1>
              <p className="text-muted mt-1">{user.email}</p>
              <Badge variant="accent" size="sm" className="mt-2">{user.role.replace('_', ' ')}</Badge>
            </div>
          </div>

          <div className="flex gap-1 border-b border-border mb-8">
            {(['profile', 'password', 'activity'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-[1px] capitalize ${
                  tab === t ? 'text-accent border-accent' : 'text-muted border-transparent hover:text-navy'
                }`}
              >
                {t === 'activity' ? 'Activity History' : t}
              </button>
            ))}
          </div>

          {tab === 'profile' && (
            <div className="space-y-8">
              <div className="bg-white rounded-xl border border-border p-6 space-y-5">
                <h2 className="text-lg font-semibold text-navy">Profile Information</h2>
                <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors resize-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  {saved && <span className="text-sm text-success font-medium">Saved successfully</span>}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold text-navy mb-4">Security</h2>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-navy">Two-Factor Authentication</p>
                    <p className="text-xs text-muted mt-0.5">Add an extra layer of security to your account</p>
                  </div>
                  <button
                    onClick={handleTwoFactorToggle}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      twoFactorEnabled ? 'bg-accent' : 'bg-border'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      twoFactorEnabled ? 'translate-x-5' : ''
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'password' && (
            <div className="bg-white rounded-xl border border-border p-6 space-y-5">
              <h2 className="text-lg font-semibold text-navy">Change Password</h2>
              <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
              <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
              <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-danger">Passwords do not match</p>
              )}
              <div className="flex items-center justify-between">
                <Button
                  onClick={handlePasswordChange}
                  disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
                >
                  Update Password
                </Button>
                {saved && <span className="text-sm text-success font-medium">Password updated</span>}
              </div>
            </div>
          )}

          {tab === 'activity' && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-navy mb-4">Activity History</h2>
              {ACTIVITIES.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted">No activity yet</p>
                </div>
              ) : (
                <div className="space-y-0 divide-y divide-border/50">
                  {ACTIVITIES.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 py-4">
                      <span className="text-xl mt-0.5">{activityIcons[item.type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy">{item.title}</p>
                        <p className="text-xs text-muted mt-0.5">{item.description}</p>
                      </div>
                      <span className="text-xs text-muted whitespace-nowrap">{item.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
