'use client';

import { useState } from 'react';
import { Button } from '@heritageverse/ui';

type CitationFormat = 'apa' | 'mla' | 'chicago' | 'harvard';

interface FormData {
  author: string;
  title: string;
  publisher: string;
  year: string;
  url: string;
  accessed: string;
}

const FORMATS: { key: CitationFormat; label: string; flag: string }[] = [
  { key: 'apa', label: 'APA 7th', flag: '📘' },
  { key: 'mla', label: 'MLA 9th', flag: '📙' },
  { key: 'chicago', label: 'Chicago', flag: '📕' },
  { key: 'harvard', label: 'Harvard', flag: '📗' },
];

function generateCitation(f: CitationFormat, d: FormData): string {
  const a = d.author || 'Author';
  const t = d.title || 'Title';
  const p = d.publisher || 'Publisher';
  const y = d.year || 'n.d.';
  const u = d.url || '';
  const ac = d.accessed || '';

  switch (f) {
    case 'apa':
      return `${a}. (${y}). ${t}. ${p}.${u ? ` ${u}` : ''}`;
    case 'mla':
      return `${a}. "${t}." ${p}, ${y},${u ? ` ${u}.` : '.'}`;
    case 'chicago':
      return `${a}. ${t}. ${p}, ${y}.${u ? ` ${u}.` : ''}`;
    case 'harvard':
      return `${a} (${y}) ${t}. ${p}.${u ? ` Available at: ${u}` : ''}${ac ? ` (Accessed: ${ac}).` : '.'}`;
  }
}

export default function CitationPage() {
  const [form, setForm] = useState<FormData>({
    author: '',
    title: '',
    publisher: '',
    year: '',
    url: '',
    accessed: '',
  });
  const [citations, setCitations] = useState<Record<CitationFormat, string> | null>(null);
  const [copied, setCopied] = useState<CitationFormat | null>(null);

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleGenerate = () => {
    setCitations({
      apa: generateCitation('apa', form),
      mla: generateCitation('mla', form),
      chicago: generateCitation('chicago', form),
      harvard: generateCitation('harvard', form),
    });
  };

  const handleCopy = (format: CitationFormat, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(format);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyAll = () => {
    if (!citations) return;
    const all = Object.values(citations).join('\n\n---\n\n');
    navigator.clipboard.writeText(all);
    setCopied('apa');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-accent text-sm font-semibold tracking-widest uppercase">Tool</span>
          <h1 className="text-4xl md:text-5xl font-serif text-navy mt-2">Citation Generator</h1>
          <p className="text-muted mt-3 max-w-2xl mx-auto">
            Generate properly formatted citations in APA, MLA, Chicago, and Harvard styles.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-border shadow-card p-6 lg:p-8">
            <h2 className="text-lg font-serif text-navy mb-6">Source Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Author Name</label>
                <input
                  type="text"
                  value={form.author}
                  onChange={handleChange('author')}
                  placeholder="e.g. Smith, John"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={handleChange('title')}
                  placeholder="e.g. The Heritage of Ancient Civilizations"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Publisher</label>
                  <input
                    type="text"
                    value={form.publisher}
                    onChange={handleChange('publisher')}
                    placeholder="e.g. Oxford Press"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Year</label>
                  <input
                    type="text"
                    value={form.year}
                    onChange={handleChange('year')}
                    placeholder="e.g. 2024"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">URL</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={handleChange('url')}
                  placeholder="https://example.com/article"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Accessed Date</label>
                <input
                  type="text"
                  value={form.accessed}
                  onChange={handleChange('accessed')}
                  placeholder="e.g. 30 Jun 2026"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                />
              </div>
            </div>

            <Button onClick={handleGenerate} size="lg" className="w-full mt-6">
              Generate Citation
            </Button>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {!citations ? (
              <div className="bg-white rounded-2xl border border-border shadow-card p-12 text-center">
                <span className="text-6xl block mb-4">📚</span>
                <h3 className="text-xl font-serif text-navy mb-2">No citations yet</h3>
                <p className="text-muted text-sm">Fill in the source details and click generate.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted">Generated citations</p>
                  <Button variant="outline" size="sm" onClick={handleCopyAll}>
                    {copied ? 'Copied!' : 'Copy All'}
                  </Button>
                </div>
                {FORMATS.map(({ key, label, flag }) => (
                  <div
                    key={key}
                    className="bg-white rounded-2xl border border-border shadow-card p-5 group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{flag}</span>
                        <span className="font-semibold text-navy text-sm uppercase">{label}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(key, citations[key])}
                        className="text-xs text-muted hover:text-accent transition-colors font-medium"
                      >
                        {copied === key ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-sm text-navy leading-relaxed font-mono bg-bg rounded-xl p-4 border border-border/50">
                      {citations[key]}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
