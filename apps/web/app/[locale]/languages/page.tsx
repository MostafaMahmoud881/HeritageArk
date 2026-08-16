'use client';

import { useState } from 'react';
import { LANGUAGES } from '@/lib/data';
import { Badge, Button } from '@heritageverse/ui';

const STATUS_COLORS: Record<string, string> = {
  Endangered: '#DC2626',
  Vulnerable: '#D97706',
};

const STATUS_BG: Record<string, string> = {
  Endangered: '#FEE2E2',
  Vulnerable: '#FEF3C7',
};

const RISK_LEVELS: Record<string, { label: string; color: string }> = {
  Endangered: { label: 'Critical Risk', color: '#DC2626' },
  Vulnerable: { label: 'At Risk', color: '#D97706' },
};

const SPEAKER_BARS = [
  { label: '2020', value: 90 },
  { label: '2022', value: 80 },
  { label: '2024', value: 70 },
  { label: '2026', value: 60 },
];

export default function LanguagesPage() {
  const [selectedLang, setSelectedLang] = useState<typeof LANGUAGES[0] | null>(null);

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="text-accent text-sm font-semibold tracking-widest uppercase">Documentation</span>
          <h1 className="text-4xl font-serif text-navy mt-2">Endangered Languages Tracker</h1>
          <p className="text-muted mt-3 max-w-xl">
            Monitoring the vitality of indigenous and endangered languages worldwide.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {LANGUAGES.map((lang) => (
            <div
              key={lang.id}
              className="bg-white rounded-2xl border border-border p-6 hover:shadow-card transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedLang(selectedLang?.id === lang.id ? null : lang)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{lang.flag}</span>
                  <div>
                    <h3 className="text-lg font-serif text-navy">{lang.name}</h3>
                    <p className="text-sm text-muted">{lang.regions}</p>
                  </div>
                </div>
                <Badge
                  variant={lang.status === 'Endangered' ? 'danger' : 'warning'}
                  size="sm"
                >
                  {lang.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-bg rounded-xl p-3 text-center">
                  <span className="text-xl font-bold text-navy">{lang.speakers}</span>
                  <p className="text-xs text-muted mt-0.5">Speakers</p>
                </div>
                <div className="bg-bg rounded-xl p-3 text-center">
                  <span className="text-xl font-bold text-navy" style={{ color: lang.col }}>{lang.family}</span>
                  <p className="text-xs text-muted mt-0.5">Family</p>
                </div>
                <div className="bg-bg rounded-xl p-3 text-center">
                  <div className="inline-flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[lang.status] }} />
                    <span className="text-sm font-bold text-navy">{RISK_LEVELS[lang.status]?.label}</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">Risk Level</p>
                </div>
              </div>

              <div className="bg-bg rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted">Speaker Population Trend</span>
                  <span className="text-xs text-muted">Declining</span>
                </div>
                <div className="space-y-1.5">
                  {SPEAKER_BARS.map((bar) => (
                    <div key={bar.label} className="flex items-center gap-2">
                      <span className="text-xs text-muted w-8 shrink-0">{bar.label}</span>
                      <div className="flex-1 h-3 rounded-full bg-white overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${bar.value}%`,
                            backgroundColor: lang.status === 'Endangered' ? '#DC2626' : '#D97706',
                            opacity: 0.7 + (bar.value / 100) * 0.3,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted w-7 text-right">{bar.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedLang?.id === lang.id && (
                <div className="mt-4 pt-4 border-t border-border animate-slide-up">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-muted">Greeting:</span>
                    <span className="font-medium text-navy">{lang.hello}</span>
                    <span className="text-xs text-muted">({lang.hello_script})</span>
                  </div>
                  <div className="bg-bg rounded-xl p-3">
                    <p className="text-xs font-medium text-muted mb-2">UNESCO Status Indicator</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: lang.status === 'Endangered' ? '25%' : '50%',
                            backgroundColor: STATUS_COLORS[lang.status],
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium" style={{ color: STATUS_COLORS[lang.status] }}>
                        {lang.status === 'Endangered' ? 'Critically Endangered' : 'Vulnerable'}
                      </span>
                    </div>
                  </div>
                  {lang.lesson && (
                    <div className="mt-3 bg-bg rounded-xl p-3">
                      <p className="text-xs font-medium text-muted mb-2">{lang.lesson.title}</p>
                      <div className="space-y-1">
                        {lang.lesson.words.map((w, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="font-medium text-navy">{w.word}</span>
                            <span className="text-muted">{w.meaning}</span>
                            <span className="text-xs text-muted">{w.phonetic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-serif text-navy">🗺️ Geographic Distribution</h2>
          </div>
          <div className="p-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {LANGUAGES.map((lang) => (
                <div key={lang.id} className="bg-bg rounded-xl p-4 flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-navy text-sm truncate">{lang.name}</p>
                    <p className="text-xs text-muted truncate">{lang.regions}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[lang.status] }} />
                      <span className="text-xs" style={{ color: STATUS_COLORS[lang.status] }}>{lang.status}</span>
                      <span className="text-xs text-muted">{lang.speakers} speakers</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
