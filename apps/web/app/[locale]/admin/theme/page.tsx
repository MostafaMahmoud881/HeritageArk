'use client';

import { useAuth } from '@/lib/auth';
import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button, Input, Badge } from '@heritageverse/ui';

type Theme = {
  id: string;
  name: string;
  isActive: boolean;
  isSystem: boolean;
  colors: Record<string, string>;
  typography: {
    headingFont: string;
    bodyFont: string;
    baseFontSize: string;
    headingWeight: string;
  };
  spacing: {
    spacingUnit: string;
    borderRadius: number;
    containerWidth: string;
  };
  customCSS: string;
  cardShadow: string;
  accentGlow: string;
};

const COLOR_KEYS = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'accent', label: 'Accent' },
  { key: 'gold', label: 'Gold' },
  { key: 'background', label: 'Background' },
  { key: 'text', label: 'Text' },
  { key: 'muted', label: 'Muted' },
  { key: 'border', label: 'Border' },
  { key: 'success', label: 'Success' },
  { key: 'danger', label: 'Danger' },
  { key: 'info', label: 'Info' },
  { key: 'warning', label: 'Warning' },
  { key: 'white', label: 'White' },
];

const DEFAULT_COLORS: Record<string, string> = {
  primary: '#0B132B',
  secondary: '#1C2541',
  accent: '#D4A373',
  gold: '#E9C46A',
  background: '#F8F5F0',
  text: '#0B132B',
  muted: '#6B7280',
  border: '#E8E2D9',
  success: '#059669',
  danger: '#DC2626',
  info: '#2563EB',
  warning: '#D97706',
  white: '#FFFFFF',
};

const DEFAULT_TYPOGRAPHY = {
  headingFont: 'Playfair Display',
  bodyFont: 'Inter',
  baseFontSize: '16px',
  headingWeight: '700',
};

const DEFAULT_SPACING = {
  spacingUnit: '4px',
  borderRadius: 8,
  containerWidth: '1280px',
};

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('heritageverse_access_token');
}

export default function ThemePage() {
  const { user } = useAuth();
  const { locale } = useParams<{ locale: string }>();

  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');

  const [colors, setColors] = useState<Record<string, string>>({ ...DEFAULT_COLORS });
  const [typography, setTypography] = useState({ ...DEFAULT_TYPOGRAPHY });
  const [spacing, setSpacing] = useState({ ...DEFAULT_SPACING });
  const [customCSS, setCustomCSS] = useState('');
  const [cardShadow, setCardShadow] = useState('');
  const [accentGlow, setAccentGlow] = useState('');

  const selectedTheme = themes.find(t => t.id === selectedThemeId);

  const fetchThemes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAccessToken();
      const res = await fetch('/api/admin/themes', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load themes');
      const body = await res.json();
      const data = body.data ?? body;
      setThemes(data);
      const active = data.find((t: Theme) => t.isActive);
      if (active) {
        setSelectedThemeId(active.id);
        applyThemeData(active);
      } else if (data.length > 0) {
        setSelectedThemeId(data[0].id);
        applyThemeData(data[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  function applyThemeData(theme: any) {
    setColors({
      primary: theme.primaryColor || DEFAULT_COLORS.primary,
      secondary: theme.secondaryColor || DEFAULT_COLORS.secondary,
      accent: theme.accentColor || DEFAULT_COLORS.accent,
      gold: theme.goldColor || DEFAULT_COLORS.gold,
      background: theme.bgColor || DEFAULT_COLORS.background,
      text: theme.textColor || DEFAULT_COLORS.text,
      muted: theme.mutedColor || DEFAULT_COLORS.muted,
      border: theme.borderColor || DEFAULT_COLORS.border,
      success: theme.successColor || DEFAULT_COLORS.success,
      danger: theme.dangerColor || DEFAULT_COLORS.danger,
      info: theme.infoColor || DEFAULT_COLORS.info,
      warning: theme.warningColor || DEFAULT_COLORS.warning,
      white: theme.whiteColor || DEFAULT_COLORS.white,
    });
    setTypography({
      headingFont: theme.headingFont || DEFAULT_TYPOGRAPHY.headingFont,
      bodyFont: theme.bodyFont || DEFAULT_TYPOGRAPHY.bodyFont,
      baseFontSize: theme.baseFontSize || DEFAULT_TYPOGRAPHY.baseFontSize,
      headingWeight: theme.headingWeight || DEFAULT_TYPOGRAPHY.headingWeight,
    });
    setSpacing({
      spacingUnit: theme.spacing || DEFAULT_SPACING.spacingUnit,
      borderRadius: parseInt(theme.borderRadius) || DEFAULT_SPACING.borderRadius,
      containerWidth: theme.containerWidth || DEFAULT_SPACING.containerWidth,
    });
    setCustomCSS(theme.customCss || '');
    setCardShadow(theme.cardShadow || '');
    setAccentGlow(theme.accentGlow || '');
  }

  function handleThemeSelect(id: string) {
    setSelectedThemeId(id);
    const theme = themes.find(t => t.id === id);
    if (theme) applyThemeData(theme);
  }

  async function handleSave() {
    if (!selectedThemeId) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const token = getAccessToken();
      const body = {
        primaryColor: colors.primary,
        secondaryColor: colors.secondary,
        accentColor: colors.accent,
        goldColor: colors.gold,
        bgColor: colors.background,
        textColor: colors.text,
        mutedColor: colors.muted,
        borderColor: colors.border,
        successColor: colors.success,
        dangerColor: colors.danger,
        infoColor: colors.info,
        warningColor: colors.warning,
        whiteColor: colors.white,
        headingFont: typography.headingFont,
        bodyFont: typography.bodyFont,
        baseFontSize: typography.baseFontSize,
        headingWeight: typography.headingWeight,
        spacing: spacing.spacingUnit,
        borderRadius: String(spacing.borderRadius),
        containerWidth: spacing.containerWidth,
        customCss: customCSS,
        cardShadow,
        accentGlow,
      };
      const res = await fetch(`/api/admin/themes/${selectedThemeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to save theme');
      setSuccess('Theme saved successfully');
      fetchThemes();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleActivate() {
    if (!selectedThemeId) return;
    try {
      setActivating(true);
      setError(null);
      setSuccess(null);
      const token = getAccessToken();
      const res = await fetch(`/api/admin/themes/${selectedThemeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ isActive: true }),
      });
      if (!res.ok) throw new Error('Failed to activate theme');
      setSuccess('Theme activated successfully');
      fetchThemes();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActivating(false);
    }
  }

  async function handleDelete() {
    if (!selectedThemeId || selectedTheme?.isSystem) return;
    if (!confirm('Are you sure you want to delete this theme?')) return;
    try {
      setError(null);
      setSuccess(null);
      const token = getAccessToken();
      const res = await fetch(`/api/admin/themes/${selectedThemeId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to delete theme');
      setSuccess('Theme deleted successfully');
      fetchThemes();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleCreateTheme() {
    if (!newThemeName.trim()) return;
    try {
      setError(null);
      const token = getAccessToken();
      const res = await fetch('/api/admin/themes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: newThemeName,
          primaryColor: DEFAULT_COLORS.primary,
          secondaryColor: DEFAULT_COLORS.secondary,
          accentColor: DEFAULT_COLORS.accent,
          goldColor: DEFAULT_COLORS.gold,
          bgColor: DEFAULT_COLORS.background,
          textColor: DEFAULT_COLORS.text,
          mutedColor: DEFAULT_COLORS.muted,
          borderColor: DEFAULT_COLORS.border,
          successColor: DEFAULT_COLORS.success,
          dangerColor: DEFAULT_COLORS.danger,
          infoColor: DEFAULT_COLORS.info,
          warningColor: DEFAULT_COLORS.warning,
          whiteColor: DEFAULT_COLORS.white,
          headingFont: DEFAULT_TYPOGRAPHY.headingFont,
          bodyFont: DEFAULT_TYPOGRAPHY.bodyFont,
          baseFontSize: DEFAULT_TYPOGRAPHY.baseFontSize,
          headingWeight: DEFAULT_TYPOGRAPHY.headingWeight,
          spacing: DEFAULT_SPACING.spacingUnit,
          borderRadius: String(DEFAULT_SPACING.borderRadius),
          containerWidth: DEFAULT_SPACING.containerWidth,
        }),
      });
      if (!res.ok) throw new Error('Failed to create theme');
      setShowCreateModal(false);
      setNewThemeName('');
      setSuccess('Theme created successfully');
      fetchThemes();
    } catch (err: any) {
      setError(err.message);
    }
  }

  function updateColor(key: string, value: string) {
    setColors(prev => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 skeleton-pulse rounded" />
        <div className="h-4 w-64 skeleton-pulse rounded" />
        <div className="h-10 w-full skeleton-pulse rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 skeleton-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-navy">Theme Customization</h1>
          <p className="text-muted mt-1">Customize the look and feel of your HeritageArk site</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="md" onClick={() => setShowCreateModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Theme
          </Button>
        </div>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-xl px-5 py-3 text-danger text-sm flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          {error}
        </div>
      )}
      {success && (
        <div className="bg-success/10 border border-success/20 rounded-xl px-5 py-3 text-success text-sm flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          {success}
        </div>
      )}

      {/* Theme Selector */}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-navy mb-1.5">Select Theme</label>
            <select
              value={selectedThemeId}
              onChange={e => handleThemeSelect(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            >
              {themes.map(theme => (
                <option key={theme.id} value={theme.id}>
                  {theme.name} {theme.isActive ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>
          {selectedTheme && (
            <Badge variant={selectedTheme.isActive ? 'success' : 'muted'}>
              {selectedTheme.isActive ? 'Active' : 'Inactive'}
            </Badge>
          )}
        </div>
      </div>

      {selectedTheme && (
        <>
          {/* Colors */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Colors</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {COLOR_KEYS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg border border-border shrink-0"
                    style={{ backgroundColor: colors[key] || '#ccc' }}
                  />
                  <div className="flex-1">
                    <label className="block text-xs text-muted mb-0.5">{label}</label>
                    <input
                      type="text"
                      value={colors[key] || ''}
                      onChange={e => updateColor(key, e.target.value)}
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-white text-navy focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent font-mono"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Typography</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Heading Font"
                value={typography.headingFont}
                onChange={e => setTypography(prev => ({ ...prev, headingFont: e.target.value }))}
                placeholder="Playfair Display"
              />
              <Input
                label="Body Font"
                value={typography.bodyFont}
                onChange={e => setTypography(prev => ({ ...prev, bodyFont: e.target.value }))}
                placeholder="Inter"
              />
              <Input
                label="Base Font Size"
                value={typography.baseFontSize}
                onChange={e => setTypography(prev => ({ ...prev, baseFontSize: e.target.value }))}
                placeholder="16px"
              />
              <Input
                label="Heading Weight"
                value={typography.headingWeight}
                onChange={e => setTypography(prev => ({ ...prev, headingWeight: e.target.value }))}
                placeholder="700"
              />
            </div>
          </div>

          {/* Spacing & Layout */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Spacing & Layout</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Spacing Unit"
                value={spacing.spacingUnit}
                onChange={e => setSpacing(prev => ({ ...prev, spacingUnit: e.target.value }))}
                placeholder="4px"
              />
              <Input
                label="Container Width"
                value={spacing.containerWidth}
                onChange={e => setSpacing(prev => ({ ...prev, containerWidth: e.target.value }))}
                placeholder="1280px"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-navy mb-1.5">
                Border Radius: {spacing.borderRadius}px
              </label>
              <input
                type="range"
                min={0}
                max={32}
                value={spacing.borderRadius}
                onChange={e => setSpacing(prev => ({ ...prev, borderRadius: parseInt(e.target.value) }))}
                className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>0</span>
                <span>32</span>
              </div>
            </div>
          </div>

          {/* Card Shadow & Accent Glow */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Effects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Card Shadow"
                value={cardShadow}
                onChange={e => setCardShadow(e.target.value)}
                placeholder="0 12px 40px rgba(0, 0, 0, 0.1)"
              />
              <Input
                label="Accent Glow"
                value={accentGlow}
                onChange={e => setAccentGlow(e.target.value)}
                placeholder="0 6px 20px rgba(212, 163, 115, 0.4)"
              />
            </div>
          </div>

          {/* Custom CSS */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Custom CSS</h2>
            <textarea
              value={customCSS}
              onChange={e => setCustomCSS(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 rounded-lg border border-border bg-white text-navy font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-y"
              placeholder="/* Write custom CSS here */"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg" loading={saving} onClick={handleSave}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
              Save Theme
            </Button>
            <Button
              variant="dark"
              size="lg"
              loading={activating}
              onClick={handleActivate}
              disabled={selectedTheme.isActive}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              {selectedTheme.isActive ? 'Already Active' : 'Activate Theme'}
            </Button>
            <Button
              variant="danger"
              size="lg"
              onClick={handleDelete}
              disabled={selectedTheme.isSystem}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
              Delete Theme
            </Button>
          </div>
        </>
      )}

      {/* Create Theme Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-card p-6 w-full max-w-md mx-4 border border-border">
            <h3 className="text-lg font-semibold text-navy mb-4">Create New Theme</h3>
            <Input
              label="Theme Name"
              value={newThemeName}
              onChange={e => setNewThemeName(e.target.value)}
              placeholder="My Custom Theme"
            />
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button variant="ghost" size="md" onClick={() => { setShowCreateModal(false); setNewThemeName(''); }}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleCreateTheme} disabled={!newThemeName.trim()}>
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
