'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { Button, Input, Badge } from '@heritageverse/ui';

interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  activeLocales: string[];
  twoFactorRequired: boolean;
  oauthProviders: string[];
  registrationMode: string;
  maxUploadSize: number;
  allowedImageFormats: string[];
  allowedDocumentFormats: string[];
  compressionQuality: number;
  notificationSettings: string | null;
  smtpHost: string | null;
  smtpPort: number;
  smtpUsername: string | null;
  smtpPassword: string | null;
  fromAddress: string | null;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
}

const ALL_LOCALES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'sw', name: 'Swahili', flag: '🇹🇿' },
];

const NOTIFICATION_DEFAULTS = {
  new_user: true,
  content_published: true,
  translation_done: true,
  media_uploaded: true,
  system_errors: true,
};

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('heritageverse_access_token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export default function SettingsPage() {
  const { can } = useAuth();
  const canEdit = can('settings.edit');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [siteName, setSiteName] = useState('HeritageArk');
  const [siteDescription, setSiteDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [activeLocales, setActiveLocales] = useState<string[]>(['en', 'ar', 'fr']);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [oauthProviders, setOauthProviders] = useState<string[]>(['google']);
  const [registrationMode, setRegistrationMode] = useState('open');
  const [maxUploadSize, setMaxUploadSize] = useState(2000);
  const [allowedImageFormats, setAllowedImageFormats] = useState<string[]>(['jpg', 'png', 'gif', 'webp', 'tiff', 'svg']);
  const [allowedDocumentFormats, setAllowedDocumentFormats] = useState<string[]>(['pdf', 'docx', 'txt', 'csv']);
  const [compressionQuality, setCompressionQuality] = useState(85);
  const [notifications, setNotifications] = useState(NOTIFICATION_DEFAULTS);
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/settings', { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to load settings');
      const json = await res.json();
      const s: SiteSettings = json.data;
      setSiteName(s.siteName);
      setSiteDescription(s.siteDescription ?? '');
      setLogoUrl(s.logoUrl ?? '');
      setFaviconUrl(s.faviconUrl ?? '');
      setActiveLocales(s.activeLocales);
      setTwoFactorRequired(s.twoFactorRequired);
      setOauthProviders(s.oauthProviders);
      setRegistrationMode(s.registrationMode);
      setMaxUploadSize(s.maxUploadSize);
      setAllowedImageFormats(s.allowedImageFormats);
      setAllowedDocumentFormats(s.allowedDocumentFormats);
      setCompressionQuality(s.compressionQuality);
      if (s.notificationSettings) {
        try { setNotifications({ ...NOTIFICATION_DEFAULTS, ...JSON.parse(s.notificationSettings) }); } catch {}
      }
      setSmtpHost(s.smtpHost ?? '');
      setSmtpPort(s.smtpPort);
      setSmtpUsername(s.smtpUsername ?? '');
      setSmtpPassword(s.smtpPassword ?? '');
      setFromAddress(s.fromAddress ?? '');
      setMaintenanceMode(s.maintenanceMode);
      setMaintenanceMessage(s.maintenanceMessage ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          siteName,
          siteDescription,
          logoUrl,
          faviconUrl,
          activeLocales,
          twoFactorRequired,
          oauthProviders,
          registrationMode,
          maxUploadSize,
          allowedImageFormats,
          allowedDocumentFormats,
          compressionQuality,
          notificationSettings: JSON.stringify(notifications),
          smtpHost,
          smtpPort,
          smtpUsername,
          smtpPassword,
          fromAddress,
          maintenanceMode,
          maintenanceMessage: maintenanceMessage || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      alert('Settings saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleLocale = (code: string) => {
    setActiveLocales(prev =>
      prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code]
    );
  };

  const toggleOAuth = (provider: string) => {
    setOauthProviders(prev =>
      prev.includes(provider) ? prev.filter(p => p !== provider) : [...prev, provider]
    );
  };

  const toggleNotification = (key: string) => {
    setNotifications(prev => ({ ...prev, [key]: !(prev as any)[key] }));
  };

  const Section = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl border border-border p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-navy">{title}</h2>
        {description && <p className="text-sm text-muted mt-1">{description}</p>}
      </div>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-navy">Settings</h1>
          <p className="text-muted mt-1">Configure platform settings</p>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          disabled={saving || !canEdit}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General */}
        <Section title="General" description="Basic site information">
          <div className="space-y-4">
            <Input
              label="Site Name"
              value={siteName}
              onChange={e => setSiteName(e.target.value)}
              disabled={!canEdit}
            />
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Site Description</label>
              <textarea
                value={siteDescription}
                onChange={e => setSiteDescription(e.target.value)}
                rows={3}
                disabled={!canEdit}
                className="w-full px-4 py-2.5 rounded-lg border border-border text-navy placeholder:text-muted/40 resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <Input
              label="Logo URL"
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              disabled={!canEdit}
            />
            <Input
              label="Favicon URL"
              value={faviconUrl}
              onChange={e => setFaviconUrl(e.target.value)}
              disabled={!canEdit}
            />
          </div>
        </Section>

        {/* Languages */}
        <Section title="Languages" description="Active locales for the platform">
          <div className="space-y-3">
            {ALL_LOCALES.map((locale) => {
              const active = activeLocales.includes(locale.code);
              return (
                <div key={locale.code} className="flex items-center justify-between p-3 rounded-lg bg-bg/50 border border-border/50">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{locale.flag}</span>
                    <div>
                      <p className="text-sm font-medium text-navy">{locale.name}</p>
                      <p className="text-xs text-muted">{locale.code.toUpperCase()}</p>
                    </div>
                  </div>
                  {canEdit ? (
                    <button
                      onClick={() => toggleLocale(locale.code)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        active ? 'bg-accent' : 'bg-border'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        active ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  ) : (
                    <Badge variant={active ? 'success' : 'muted'} size="sm">
                      {active ? 'Active' : 'Inactive'}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        {/* Authentication */}
        <Section title="Authentication" description="Security and login settings">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-bg/50 border border-border/50">
              <div>
                <p className="text-sm font-medium text-navy">Two-Factor Authentication</p>
                <p className="text-xs text-muted">Require 2FA for all admin users</p>
              </div>
              {canEdit ? (
                <button
                  onClick={() => setTwoFactorRequired(!twoFactorRequired)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    twoFactorRequired ? 'bg-accent' : 'bg-border'
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                    twoFactorRequired ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              ) : (
                <Badge variant={twoFactorRequired ? 'success' : 'muted'} size="sm">
                  {twoFactorRequired ? 'On' : 'Off'}
                </Badge>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-2">OAuth Providers</label>
              <div className="space-y-2">
                {['Google', 'Microsoft', 'Apple'].map((provider) => {
                  const key = provider.toLowerCase();
                  const enabled = oauthProviders.includes(key);
                  return (
                    <label key={provider} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-bg/30 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() => toggleOAuth(key)}
                        disabled={!canEdit}
                        className="w-4 h-4 text-accent focus:ring-accent/30 border-border rounded"
                      />
                      <span className="text-sm text-navy">{provider}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-2">Registration</label>
              <select
                disabled={!canEdit}
                value={registrationMode}
                onChange={e => setRegistrationMode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50"
              >
                <option value="open">Open Registration</option>
                <option value="invite">Invite Only</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </Section>

        {/* Maintenance */}
        <Section title="Maintenance Mode" description="Temporarily take the public site offline for maintenance">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-bg/50 border border-border/50">
              <div>
                <p className="text-sm font-medium text-navy">Enable Maintenance Mode</p>
                <p className="text-xs text-muted">Public pages redirect to a maintenance screen. Admins can still access /admin.</p>
              </div>
              {canEdit ? (
                <button
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${maintenanceMode ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${maintenanceMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              ) : (
                <Badge variant={maintenanceMode ? 'warning' : 'muted'} size="sm">
                  {maintenanceMode ? 'On' : 'Off'}
                </Badge>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Maintenance Message</label>
              <textarea
                value={maintenanceMessage}
                onChange={e => setMaintenanceMessage(e.target.value)}
                rows={3}
                disabled={!canEdit}
                placeholder="We'll be back soon..."
                className="w-full px-4 py-2.5 rounded-lg border border-border text-navy placeholder:text-muted/40 resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </Section>

        {/* Media */}
        <Section title="Media" description="Upload limits and allowed formats">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Maximum Upload Size (MB)</label>
              <input
                type="number"
                value={maxUploadSize}
                onChange={e => setMaxUploadSize(parseInt(e.target.value) || 0)}
                disabled={!canEdit}
                className="w-full px-4 py-2.5 rounded-lg border border-border text-navy focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-2">Allowed Image Formats</label>
              <div className="flex flex-wrap gap-2">
                {['JPG', 'PNG', 'GIF', 'WebP', 'TIFF', 'SVG'].map((fmt) => {
                  const key = fmt.toLowerCase();
                  const enabled = allowedImageFormats.includes(key);
                  return (
                    <label key={fmt} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 text-sm cursor-pointer hover:bg-bg/30">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() => setAllowedImageFormats(prev =>
                          prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
                        )}
                        disabled={!canEdit}
                        className="w-3.5 h-3.5 text-accent"
                      />
                      .{key}
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-2">Allowed Document Formats</label>
              <div className="flex flex-wrap gap-2">
                {['PDF', 'DOCX', 'TXT', 'CSV'].map((fmt) => {
                  const key = fmt.toLowerCase();
                  const enabled = allowedDocumentFormats.includes(key);
                  return (
                    <label key={fmt} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 text-sm cursor-pointer hover:bg-bg/30">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() => setAllowedDocumentFormats(prev =>
                          prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
                        )}
                        disabled={!canEdit}
                        className="w-3.5 h-3.5 text-accent"
                      />
                      .{key}
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Image Compression Quality</label>
              <input
                type="range"
                min="1"
                max="100"
                value={compressionQuality}
                onChange={e => setCompressionQuality(parseInt(e.target.value))}
                disabled={!canEdit}
                className="w-full accent-accent"
              />
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>Low</span>
                <span>{compressionQuality}%</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" description="Email and system notification settings">
          <div className="space-y-4">
            {[
              { label: 'New User Registration', key: 'new_user' },
              { label: 'Content Published', key: 'content_published' },
              { label: 'Translation Completed', key: 'translation_done' },
              { label: 'Media Uploaded', key: 'media_uploaded' },
              { label: 'System Errors', key: 'system_errors' },
            ].map((notif) => {
              const enabled = (notifications as any)[notif.key] ?? true;
              return (
                <div key={notif.key} className="flex items-center justify-between p-3 rounded-lg bg-bg/50 border border-border/50">
                  <p className="text-sm text-navy">{notif.label}</p>
                  {canEdit ? (
                    <button
                      onClick={() => toggleNotification(notif.key)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        enabled ? 'bg-accent' : 'bg-border'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        enabled ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  ) : (
                    <Badge variant={enabled ? 'success' : 'muted'} size="sm">
                      {enabled ? 'On' : 'Off'}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        {/* Email */}
        <Section title="Email" description="Email server configuration">
          <div className="space-y-4">
            <Input label="SMTP Host" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} disabled={!canEdit} />
            <Input label="SMTP Port" type="number" value={String(smtpPort)} onChange={e => setSmtpPort(parseInt(e.target.value) || 0)} disabled={!canEdit} />
            <Input label="SMTP Username" value={smtpUsername} onChange={e => setSmtpUsername(e.target.value)} disabled={!canEdit} />
            <Input label="SMTP Password" type="password" value={smtpPassword} onChange={e => setSmtpPassword(e.target.value)} disabled={!canEdit} />
            <Input label="From Address" value={fromAddress} onChange={e => setFromAddress(e.target.value)} disabled={!canEdit} />
          </div>
        </Section>
      </div>

      {/* Bottom Save */}
      <div className="flex justify-end pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          disabled={saving || !canEdit}
        >
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
}
