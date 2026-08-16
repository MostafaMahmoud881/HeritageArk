'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Button, Input, Badge } from '@heritageverse/ui';

export default function AISettingsPage() {
  const { can } = useAuth();

  const [providers, setProviders] = useState<any[]>([]);
  const [credits, setCredits] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    emergencyShutdown: false,
    budgetAlert: 100,
    rateLimit: 10,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tab, setTab] = useState<'providers' | 'credits' | 'quotas' | 'settings'>('providers');
  const [newKeyModal, setNewKeyModal] = useState<{ providerId: string; label: string; key: string } | null>(null);
  const [grantModal, setGrantModal] = useState<{ userId: string; email: string; credits: number } | null>(null);
  const [quotas, setQuotas] = useState<any>({
    super_admin: { video: 1000, image: 1000, subtitle: 500, translation: 500, voice: 500 },
    admin: { video: 500, image: 500, subtitle: 300, translation: 300, voice: 300 },
    creator: { video: 200, image: 200, subtitle: 100, translation: 100, voice: 100 },
    researcher: { video: 50, image: 100, subtitle: 50, translation: 200, voice: 50 },
    contributor: { video: 20, image: 50, subtitle: 20, translation: 50, voice: 20 },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [provRes, creditRes, transRes, settingsRes, quotaRes] = await Promise.all([
        fetch('/api/admin/ai/providers'),
        fetch('/api/admin/ai/credits'),
        fetch('/api/admin/ai/credits/transactions'),
        fetch('/api/admin/ai/settings'),
        fetch('/api/admin/ai/credits/quotas'),
      ]);
      if (provRes.ok) { const d = await provRes.json(); setProviders(d.data ?? []); }
      if (creditRes.ok) { const d = await creditRes.json(); setCredits(d.data ?? []); }
      if (transRes.ok) { const d = await transRes.json(); setTransactions(d.data ?? []); }
      if (settingsRes.ok) { const d = await settingsRes.json(); if (d.data) setSettings(d.data); }
      if (quotaRes.ok) { const d = await quotaRes.json(); if (d.data) setQuotas(d.data); }
    } catch (err) {
      setError('Failed to load AI settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleProvider = async (id: string, enabled: boolean) => {
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/ai/providers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      if (res.ok) {
        setProviders(prev => prev.map(p => p.id === id ? { ...p, enabled } : p));
        setSuccess(`Provider ${enabled ? 'enabled' : 'disabled'}`);
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to update provider');
      }
    } catch { setError('Failed to update'); } finally { setSaving(false); }
  };

  const setDefaultProvider = async (id: string) => {
    try {
      setSaving(true);
      await fetch(`/api/admin/ai/providers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      setProviders(prev => prev.map(p => ({ ...p, isDefault: p.id === id })));
      setSuccess('Default provider updated');
    } catch { setError('Failed to update'); } finally { setSaving(false); }
  };

  const addApiKey = async () => {
    if (!newKeyModal) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/ai/providers/${newKeyModal.providerId}/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyLabel: newKeyModal.label, keyValue: newKeyModal.key }),
      });
      if (res.ok) {
        setNewKeyModal(null);
        setSuccess('API key added');
        loadData();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to add key');
      }
    } catch { setError('Failed to add key'); } finally { setSaving(false); }
  };

  const deleteKey = async (providerId: string, keyId: string) => {
    if (!confirm('Delete this API key?')) return;
    try {
      const res = await fetch(`/api/admin/ai/providers/${providerId}/keys/${keyId}`, { method: 'DELETE' });
      if (res.ok) { setSuccess('API key deleted'); loadData(); }
      else setError('Failed to delete key');
    } catch { setError('Failed to delete'); }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/ai/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) setSuccess('Settings saved');
      else setError('Failed to save settings');
    } catch { setError('Failed to save'); } finally { setSaving(false); }
  };

  const grantCredits = async () => {
    if (!grantModal) return;
    try {
      setSaving(true);
      const res = await fetch('/api/admin/ai/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: grantModal.userId, videoCredits: grantModal.credits }),
      });
      if (res.ok) { setGrantModal(null); setSuccess('Credits granted'); loadData(); }
      else { const d = await res.json(); setError(d.error || 'Failed'); }
    } catch { setError('Failed to grant credits'); } finally { setSaving(false); }
  };

  const saveQuotas = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/ai/credits/quotas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotas),
      });
      if (res.ok) setSuccess('Quotas saved');
      else setError('Failed to save quotas');
    } catch { setError('Failed to save'); } finally { setSaving(false); }
  };

  if (loading) {
    return <div className="p-6 space-y-4"><div className="skeleton-pulse h-8 w-48 rounded-lg" /><div className="skeleton-pulse h-64 rounded-xl" /></div>;
  }

  const tabs = [
    { id: 'providers' as const, label: 'AI Providers' },
    { id: 'credits' as const, label: 'Credits & Usage' },
    { id: 'quotas' as const, label: 'Role Quotas' },
    { id: 'settings' as const, label: 'Global Settings' },
  ];

  const hasAnyKey = providers.some(p => p.apiKeys?.length > 0);
  const anyEnabled = providers.some(p => p.enabled && p.apiKeys?.length > 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-navy">AI Settings</h1>
          <p className="text-muted mt-1">
            {anyEnabled
              ? 'AI Video Generation is active and ready.'
              : 'AI Video Generation is currently disabled. Add an API key to activate this feature.'}
          </p>
        </div>
        {!anyEnabled && <Badge variant="danger" size="md">Inactive</Badge>}
        {anyEnabled && <Badge variant="success" size="md">Active</Badge>}
      </div>

      {error && <div className="bg-danger/10 text-danger p-4 rounded-xl">{error}</div>}
      {success && <div className="bg-success/10 text-success p-4 rounded-xl">{success}</div>}

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-border p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setError(null); setSuccess(null); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === t.id ? 'bg-navy text-white' : 'text-muted hover:text-navy'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Providers Tab */}
      {tab === 'providers' && (
        <div className="space-y-4">
          {!hasAnyKey && (
            <div className="bg-warning/10 border border-warning/20 rounded-xl p-6 text-center">
              <p className="text-warning font-medium text-lg mb-2">No API Keys Configured</p>
              <p className="text-muted">AI Video Generation is currently disabled. Add an API key to activate this feature.</p>
            </div>
          )}
          {providers.map(provider => (
            <div key={provider.id} className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-navy">{provider.name}</h3>
                    {provider.isDefault && <Badge variant="accent" size="sm">Default</Badge>}
                    {provider.enabled ? <Badge variant="success" size="sm">Enabled</Badge> : <Badge variant="muted" size="sm">Disabled</Badge>}
                  </div>
                  {provider.description && <p className="text-sm text-muted mt-0.5">{provider.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {!provider.isDefault && (
                    <Button variant="outline" size="sm" onClick={() => setDefaultProvider(provider.id)}>
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant={provider.enabled ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => toggleProvider(provider.id, !provider.enabled)}
                  >
                    {provider.enabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-3 gap-4 mb-4 p-3 rounded-lg bg-bg/50 text-sm">
                <div>
                  <p className="text-muted text-xs">Monthly Limit</p>
                  <p className="font-medium text-navy">{provider.monthlyLimit || 'Unlimited'}</p>
                </div>
                <div>
                  <p className="text-muted text-xs">Daily Limit</p>
                  <p className="font-medium text-navy">{provider.dailyLimit || 'Unlimited'}</p>
                </div>
                <div>
                  <p className="text-muted text-xs">Monthly API Calls</p>
                  <p className="font-medium text-navy">{provider.monthlyApiCalls}</p>
                </div>
              </div>

              {/* API Keys */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-navy">API Keys</h4>
                  <Button variant="ghost" size="sm" onClick={() => setNewKeyModal({ providerId: provider.id, label: '', key: '' })}>
                    + Add Key
                  </Button>
                </div>
                {provider.apiKeys?.length === 0 && (
                  <p className="text-xs text-muted italic">No API keys configured</p>
                )}
                {provider.apiKeys?.map((key: any) => (
                  <div key={key.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-bg/50 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-navy">{key.keyLabel}</span>
                      <span className="text-muted">••••••••</span>
                      {key.isActive ? <Badge variant="success" size="sm">Active</Badge> : <Badge variant="muted" size="sm">Inactive</Badge>}
                    </div>
                    <button onClick={() => deleteKey(provider.id, key.id)} className="text-danger/60 hover:text-danger text-xs">Delete</button>
                  </div>
                ))}
              </div>

              {/* Monthly Cost */}
              {provider.monthlyCost > 0 && (
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-sm">
                  <span className="text-muted">Estimated monthly cost:</span>
                  <span className="font-medium text-navy">${provider.monthlyCost.toFixed(2)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Credits Tab */}
      {tab === 'credits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-navy">User Credits</h2>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-medium text-navy">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-bg/50 text-muted text-xs uppercase">
                  <tr>
                    <th className="text-left p-3">User</th>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Credit Type</th>
                    <th className="text-right p-3">Amount</th>
                    <th className="text-left p-3">Description</th>
                    <th className="text-left p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.length === 0 && (
                    <tr><td colSpan={6} className="p-6 text-center text-muted">No transactions yet</td></tr>
                  )}
                  {transactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-bg/30">
                      <td className="p-3 text-navy font-medium">{tx.balance?.user?.name || tx.balanceId}</td>
                      <td className="p-3">
                        <Badge variant={tx.type === 'use' ? 'danger' : 'success'} size="sm">{tx.type}</Badge>
                      </td>
                      <td className="p-3 text-muted">{tx.creditType}</td>
                      <td className={`p-3 text-right font-medium ${tx.amount > 0 ? 'text-success' : 'text-danger'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </td>
                      <td className="p-3 text-muted">{tx.description || '-'}</td>
                      <td className="p-3 text-muted text-xs">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Current Balances */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-medium text-navy">Current Balances</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-bg/50 text-muted text-xs uppercase">
                  <tr>
                    <th className="text-left p-3">User</th>
                    <th className="text-right p-3">Video</th>
                    <th className="text-right p-3">Image</th>
                    <th className="text-right p-3">Subtitle</th>
                    <th className="text-right p-3">Translation</th>
                    <th className="text-right p-3">Voice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {credits.length === 0 && (
                    <tr><td colSpan={6} className="p-6 text-center text-muted">No credit balances yet</td></tr>
                  )}
                  {credits.map((cb: any) => (
                    <tr key={cb.id} className="hover:bg-bg/30">
                      <td className="p-3 text-navy font-medium">{cb.user?.name || cb.userId}</td>
                      <td className="p-3 text-right">{cb.videoCredits} / {cb.videoCreditsUsed}</td>
                      <td className="p-3 text-right">{cb.imageCredits} / {cb.imageCreditsUsed}</td>
                      <td className="p-3 text-right">{cb.subtitleCredits} / {cb.subtitleCreditsUsed}</td>
                      <td className="p-3 text-right">{cb.translationCredits} / {cb.translationCreditsUsed}</td>
                      <td className="p-3 text-right">{cb.voiceCredits} / {cb.voiceCreditsUsed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Quotas Tab */}
      {tab === 'quotas' && (
        <div className="bg-white rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-navy">Role Credit Quotas</h2>
          <p className="text-sm text-muted">Configure monthly credit limits per role</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg/50 text-muted text-xs uppercase">
                <tr>
                  <th className="text-left p-3">Role</th>
                  <th className="text-right p-3">Video</th>
                  <th className="text-right p-3">Image</th>
                  <th className="text-right p-3">Subtitle</th>
                  <th className="text-right p-3">Translation</th>
                  <th className="text-right p-3">Voice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Object.entries(quotas).map(([role, q]: [string, any]) => (
                  <tr key={role} className="hover:bg-bg/30">
                    <td className="p-3 text-navy font-medium capitalize">{role.replace('_', ' ')}</td>
                    {['video', 'image', 'subtitle', 'translation', 'voice'].map(type => (
                      <td key={type} className="p-3">
                        <input
                          type="number"
                          value={q[type] ?? 0}
                          onChange={e => setQuotas((prev: any) => ({ ...prev, [role]: { ...prev[role], [type]: parseInt(e.target.value) } }))}
                          className="w-20 text-right px-2 py-1 rounded border border-border text-navy text-sm"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button variant="primary" onClick={saveQuotas} loading={saving}>Save Quotas</Button>
        </div>
      )}

      {/* Settings Tab */}
      {tab === 'settings' && (
        <div className="bg-white rounded-xl border border-border p-6 space-y-6">
          <h2 className="text-lg font-semibold text-navy">Global AI Settings</h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emergencyShutdown}
                onChange={e => setSettings((prev: any) => ({ ...prev, emergencyShutdown: e.target.checked }))}
                className="w-4 h-4 rounded border-border text-accent focus:ring-accent/30"
              />
              <div>
                <p className="font-medium text-navy text-sm">Emergency Shutdown</p>
                <p className="text-xs text-muted">Immediately stop all AI generation across the platform</p>
              </div>
            </label>

            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Budget Alert Threshold ($)</label>
              <Input
                type="number"
                value={settings.budgetAlert}
                onChange={(e: any) => setSettings((prev: any) => ({ ...prev, budgetAlert: parseFloat(e.target.value) }))}
              />
              <p className="text-xs text-muted mt-1">Send alert when estimated monthly cost exceeds this amount</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Max Generations per Minute</label>
              <Input
                type="number"
                value={settings.rateLimit}
                onChange={(e: any) => setSettings((prev: any) => ({ ...prev, rateLimit: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <Button variant="primary" onClick={saveSettings} loading={saving}>Save Settings</Button>
        </div>
      )}

      {/* Add API Key Modal */}
      {newKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setNewKeyModal(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-navy mb-4">Add API Key</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Key Label</label>
                <Input
                  placeholder="e.g. Production Key"
                  value={newKeyModal.label}
                  onChange={(e: any) => setNewKeyModal({ ...newKeyModal, label: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">API Key</label>
                <Input
                  type="password"
                  placeholder="Paste your API key here"
                  value={newKeyModal.key}
                  onChange={(e: any) => setNewKeyModal({ ...newKeyModal, key: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setNewKeyModal(null)}>Cancel</Button>
                <Button variant="primary" onClick={addApiKey} loading={saving} disabled={!newKeyModal.key}>Add Key</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
