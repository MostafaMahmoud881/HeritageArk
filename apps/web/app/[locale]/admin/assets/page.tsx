'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button, Input, Badge } from '@heritageverse/ui';
import MediaLibrary from '@/components/Assets/MediaLibrary';
import { IconPicker } from '@/components/Assets/IconPicker';
import { CharacterViewer } from '@/components/Assets/CharacterViewer';
import { ThreeDViewer } from '@/lib/assets/3d-viewer';
import { ICON_CATEGORIES } from '@/lib/assets/icon-registry';
import type { RegistryIcon, Asset3DModel, StoryCharacter } from '@heritageverse/types';

type Tab = 'media' | 'icons' | 'illustrations' | '3d-models' | 'characters' | 'import';

export default function AdminAssetsPage() {
  const { can } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('media');
  const [importSource, setImportSource] = useState<'sketchfab' | 'smithsonian' | 'poly-pizza' | 'iconscout'>('sketchfab');
  const [importUrl, setImportUrl] = useState('');
  const [importQuery, setImportQuery] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'media', label: 'Media Library', icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z' },
    { id: 'icons', label: 'Icon Registry', icon: 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42' },
    { id: 'illustrations', label: 'Illustrations', icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z' },
    { id: '3d-models', label: '3D Models', icon: 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9' },
    { id: 'characters', label: 'Characters', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
    { id: 'import', label: 'Import Assets', icon: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5' },
  ];

  const handleImport = async () => {
    if (!importUrl && !importQuery) return;
    setImporting(true);
    setImportResult(null);
    try {
      const res = await fetch('/api/assets/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: importSource,
          type: importSource === 'iconscout' ? 'illustration' : '3d-model',
          url: importUrl || undefined,
          query: importQuery || undefined,
        }),
      });
      const body = await res.json();
      if (body.success) {
        setImportResult(`Successfully imported from ${importSource}!`);
      } else {
        setImportResult(`Import failed: ${body.error || 'Unknown error'}`);
      }
    } catch (err) {
      setImportResult(`Import error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-navy">Assets Manager</h1>
          <p className="text-muted mt-1">Manage icons, illustrations, 3D models, and characters</p>
        </div>
      </div>

      <div className="flex gap-1 bg-white rounded-xl border border-border p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-navy text-white' : 'text-muted hover:text-navy'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'media' && (
        <div className="bg-white rounded-xl border border-border p-6">
          <MediaLibrary />
        </div>
      )}

      {activeTab === 'icons' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Icon Registry</h2>
            <IconPicker
              onSelect={(icon) => {
                fetch('/api/assets/icons', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: icon.id, isActive: !icon.isActive }),
                });
              }}
            />
          </div>
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Categories</h2>
            <div className="space-y-2">
              {Object.entries(ICON_CATEGORIES).map(([key, cat]) => (
                <div key={key} className="flex items-center justify-between p-2.5 rounded-lg bg-bg/50">
                  <div>
                    <p className="text-sm font-medium text-navy">{cat.label}</p>
                    <p className="text-xs text-muted">{cat.description}</p>
                  </div>
                  <Badge variant="accent" size="sm">{key}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'illustrations' && (
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy">Illustration Library</h2>
            <Button variant="primary" size="sm" onClick={() => setActiveTab('import')}>
              Import from IconScout
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['empty-states', 'education', 'story-teller', 'error-pages', 'onboarding', 'kids'].map(cat => (
              <div key={cat} className="bg-bg rounded-xl border border-border p-4 text-center hover:shadow-card transition-shadow">
                <div className="w-full aspect-square rounded-lg bg-white flex items-center justify-center mb-3">
                  <svg className="w-12 h-12 text-accent/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-navy capitalize">{cat.replace('-', ' ')}</p>
                <p className="text-xs text-muted mt-0.5">Illustrations</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === '3d-models' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">3D Model Sources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { source: 'sketchfab', name: 'Sketchfab', icon: '🧊', color: 'from-blue-500/20 to-blue-600/10', url: 'https://sketchfab.com' },
                { source: 'smithsonian', name: 'Smithsonian 3D', icon: '🏛️', color: 'from-amber-500/20 to-amber-600/10', url: 'https://3d.si.edu' },
                { source: 'poly-pizza', name: 'Poly Pizza', icon: '🍕', color: 'from-green-500/20 to-green-600/10', url: 'https://poly.pizza' },
              ].map(src => (
                <div key={src.source} className={`bg-gradient-to-br ${src.color} rounded-xl p-5 border border-white/20`}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{src.icon}</span>
                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted hover:text-navy underline">Visit ↗</a>
                  </div>
                  <p className="font-medium text-navy">{src.name}</p>
                  <p className="text-xs text-muted mt-1">Import 3D models from {src.name}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => { setImportSource(src.source as typeof importSource); setActiveTab('import'); }}
                  >
                    Import
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'characters' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Story Characters</h2>
            <div className="space-y-3">
              {[
                { id: 'ibn-battuta', name: 'Ibn Battuta', culture: 'Moroccan', era: '14th Century' },
                { id: 'ancient-egyptian-child', name: 'Neferu', culture: 'Ancient Egyptian', era: 'New Kingdom' },
                { id: 'amazigh-merchant', name: 'Tifawt', culture: 'Amazigh', era: '11th Century' },
                { id: 'nubian-farmer', name: 'Khenemet', culture: 'Nubian', era: 'Meroitic Period' },
                { id: 'roman-soldier', name: 'Marcus', culture: 'Roman', era: '2nd Century CE' },
                { id: 'african-queen', name: 'Amanitore', culture: 'Kushite', era: '1st Century CE' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveTab('characters')}
                  className="flex items-center gap-3 w-full p-3 rounded-xl bg-bg/50 hover:bg-accent/5 border border-border hover:border-accent/30 transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-lg font-bold text-accent">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-navy">{c.name}</p>
                    <p className="text-xs text-muted">{c.culture} · {c.era}</p>
                  </div>
                  <Badge variant="accent" size="sm">Active</Badge>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Preview</h2>
            <CharacterViewer characterId="ibn-battuta" />
          </div>
        </div>
      )}

      {activeTab === 'import' && (
        <div className="max-w-2xl bg-white rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-navy mb-4">Import External Assets</h2>

          <div className="flex gap-2 mb-4">
            {[
              { id: 'sketchfab', label: 'Sketchfab', icon: '🧊' },
              { id: 'smithsonian', label: 'Smithsonian', icon: '🏛️' },
              { id: 'poly-pizza', label: 'Poly Pizza', icon: '🍕' },
              { id: 'iconscout', label: 'IconScout', icon: '🎨' },
            ].map(src => (
              <button
                key={src.id}
                onClick={() => setImportSource(src.id as typeof importSource)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  importSource === src.id ? 'bg-navy text-white' : 'bg-bg text-muted hover:text-navy'
                }`}
              >
                <span>{src.icon}</span>
                {src.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {(importSource === 'sketchfab' || importSource === 'smithsonian' || importSource === 'poly-pizza') && (
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">
                  {importSource === 'sketchfab' ? 'Sketchfab Model URL' : importSource === 'smithsonian' ? 'Smithsonian 3D URL' : 'Poly Pizza Model URL'}
                </label>
                <Input
                  placeholder={`https://${importSource === 'poly-pizza' ? 'poly.pizza' : importSource === 'smithsonian' ? '3d.si.edu' : 'sketchfab.com'}/...`}
                  value={importUrl}
                  onChange={e => setImportUrl(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Search query</label>
              <Input
                placeholder={importSource === 'iconscout' ? 'Search for illustrations...' : 'Model name...'}
                value={importQuery}
                onChange={e => setImportQuery(e.target.value)}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleImport}
              loading={importing}
              disabled={!importUrl && !importQuery}
            >
              Import from {importSource.charAt(0).toUpperCase() + importSource.slice(1)}
            </Button>

            {importResult && (
              <div className={`p-3 rounded-xl text-sm ${
                importResult.startsWith('Success') ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
              }`}>
                {importResult}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-navy mb-2">Supported Import Sources</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { name: 'Sketchfab', formats: 'GLTF, GLB, OBJ, FBX', license: 'CC BY 4.0' },
                { name: 'Smithsonian 3D', formats: 'GLB', license: 'CC0' },
                { name: 'Poly Pizza', formats: 'GLB', license: 'CC BY 4.0' },
                { name: 'IconScout', formats: 'SVG, PNG', license: 'Royalty-free' },
              ].map(s => (
                <div key={s.name} className="p-3 rounded-lg bg-bg/50">
                  <p className="font-medium text-navy">{s.name}</p>
                  <p className="text-xs text-muted mt-0.5">{s.formats}</p>
                  <p className="text-xs text-muted">{s.license}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
