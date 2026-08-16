'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button, Badge } from '@heritageverse/ui';
import { ARTIFACTS } from '@/lib/data';
import { GeneratedImage } from '@/components/GeneratedImage';
import { getArtifactPlaceholderUrl } from '@/lib/use-generated-image';
import { speakText, stopSpeaking, getAvailableVoices, type VoiceOption, type SpeakOptions } from '@/lib/ai/tts';

// ─── Types ────────────────────────────────────────────────────────────────────

type Artifact = typeof ARTIFACTS[number];

interface Exhibit {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  artifactIds: string[];
  culture: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const EXHIBITS: Exhibit[] = [
  { id: 'nile', name: 'Kingdoms of the Nile', icon: '🏛️', description: 'Ancient Egypt & Nubia — 5,000 years of Nile civilization', color: 'from-amber-600/20 to-amber-800/10', artifactIds: ['a1'], culture: 'Nubian' },
  { id: 'amazigh', name: 'Amazigh Heritage', icon: 'ⵣ', description: 'North Africa\'s indigenous free people — 4,000 years of culture', color: 'from-blue-600/20 to-blue-800/10', artifactIds: ['a2'], culture: 'Amazigh' },
  { id: 'mayan', name: 'Mayan Civilization', icon: '🔮', description: 'Mesoamerica\'s greatest astronomers and mathematicians', color: 'from-emerald-600/20 to-emerald-800/10', artifactIds: ['a3'], culture: 'Mayan' },
  { id: 'ottoman', name: 'Ottoman Golden Age', icon: '🕌', description: '600 years of cultural synthesis across three continents', color: 'from-red-600/20 to-red-800/10', artifactIds: ['a4'], culture: 'Ottoman' },
  { id: 'akan', name: 'Akan & Kente', icon: '🌟', description: 'Ghana\'s royal cloth — proverbs woven in gold thread', color: 'from-yellow-600/20 to-yellow-800/10', artifactIds: [], culture: 'Akan' },
  { id: 'sami', name: 'Sámi Arctic World', icon: '🏔️', description: 'Europe\'s only indigenous people — joik and reindeer', color: 'from-indigo-600/20 to-indigo-800/10', artifactIds: [], culture: 'Sami' },
];

const STATUS_COLOR: Record<string, string> = {
  Preserved: 'text-success bg-success/10',
  Restored: 'text-info bg-info/10',
  Critical: 'text-danger bg-danger/10',
};

const NARRATIONS: Record<string, string> = {
  a1: 'This remarkable Nubian Ankh Amulet dates to 2500 BCE and was excavated from royal burial chambers in ancient Kerma. Crafted from gold and lapis lazuli, it represents the apex of Nubian artistry. The ankh — symbol of eternal life — was central to both Egyptian and Nubian religious cosmology. Today it rests at the Kerma Museum in Sudan.',
  a2: 'The Amazigh Silver Diadem is a ceremonial headpiece worn by Amazigh brides in the 12th century. The elaborate geometric engraving encodes tribal lineage information — each symbol corresponds to a clan, region, and blessing, making this diadem a wearable genealogical record. It is preserved at the National Museum of Algiers.',
  a3: 'The Mayan Jade Burial Mask is a spectacular mosaic funerary piece discovered in the Temple of the Inscriptions at Palenque, Mexico. Its 340 jade pieces depict the ruler K\'inich Janaab\' Pakal transforming into the Maize God. Jade, believed to hold the essence of life, was the most sacred Mayan material. It dates to 300 to 900 CE.',
  a4: 'This Ottoman Iznik Tile is a masterwork from the apex of the Ottoman tilework tradition, created between 1560 and 1600. The cobalt blue and sealing-wax red pigments were technical achievements lost after 1600. Each tile required seven firings and months of preparation. It is now preserved at Topkapi Palace in Istanbul.',
};

// ─── Voice Picker Component ───────────────────────────────────────────────────

function VoicePicker({ lang, value, onChange }: { lang: string; value: string; onChange: (v: string) => void }) {
  const [voices, setVoices] = useState<VoiceOption[]>([]);

  useEffect(() => {
    // Voices load async in Chrome
    const load = () => setVoices(getAvailableVoices(lang));
    load();
    const t = setTimeout(load, 500);
    return () => clearTimeout(t);
  }, [lang]);

  if (!voices.length) return null;

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-xs bg-bg border border-border rounded-lg px-2 py-1.5 text-navy focus:outline-none focus:border-accent"
    >
      <option value="">Auto (best voice)</option>
      {voices.map(v => (
        <option key={v.name} value={v.name}>{v.name.replace(/Microsoft |Google /, '')}</option>
      ))}
    </select>
  );
}

// ─── Artifact Detail Panel ────────────────────────────────────────────────────

function ArtifactDetail({ artifact, onClose }: { artifact: Artifact; onClose: () => void }) {
  const [isNarrating, setIsNarrating] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [voiceName, setVoiceName] = useState('');
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStreamed, setAiStreamed] = useState('');

  const narration = NARRATIONS[artifact.id] ?? `${artifact.name} — ${artifact.desc}`;

  const handleNarrate = useCallback(async () => {
    if (isNarrating) {
      stopSpeaking();
      setIsNarrating(false);
      return;
    }
    setIsNarrating(true);
    const opts: SpeakOptions = { rate: speed, voiceName: voiceName || undefined };
    await speakText(narration, 'en', opts);
    setIsNarrating(false);
  }, [isNarrating, narration, speed, voiceName]);

  const handleAiExplain = useCallback(async () => {
    setAiLoading(true);
    setAiText('');
    setAiStreamed('');
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Tell me about the ${artifact.name} from ${artifact.culture} culture, period ${artifact.period}, found in ${artifact.loc}. Give a rich 3-paragraph museum guide explanation.` }],
          language: 'default',
          mode: 'converse',
        }),
      });
      const data = await res.json();
      const full: string = data.content ?? narration;
      setAiText(full);
      // Stream effect
      let i = 0;
      const iv = setInterval(() => {
        i += 4;
        if (i >= full.length) { setAiStreamed(full); clearInterval(iv); }
        else setAiStreamed(full.slice(0, i));
      }, 12);
    } catch {
      setAiText(narration);
      setAiStreamed(narration);
    } finally {
      setAiLoading(false);
    }
  }, [artifact, narration]);

  // Stop narration when closing
  useEffect(() => () => stopSpeaking(), []);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header image */}
        <div className="relative h-56 rounded-t-2xl overflow-hidden">
          <GeneratedImage
            src={getArtifactPlaceholderUrl(artifact.name, artifact.culture)}
            alt={artifact.name}
            culture={artifact.culture}
            name={artifact.name}
            fallbackEmoji={artifact.emoji}
            className="h-full w-full"
          />
          <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLOR[artifact.status] ?? 'text-muted bg-muted/10'}`}>
            {artifact.status}
          </span>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors">
            <svg className="w-4 h-4 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-2xl font-serif text-navy">{artifact.name}</h2>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted flex-wrap">
                <span>📍 {artifact.loc}</span>
                <span>🕐 {artifact.period}</span>
                <span>📏 {artifact.dims}</span>
              </div>
            </div>
            <Badge variant="accent" size="sm">{artifact.culture}</Badge>
          </div>

          {/* Description */}
          <p className="text-navy/80 leading-relaxed text-sm">{artifact.desc}</p>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-3">
            {[['Material', artifact.material], ['Museum', artifact.museum], ['Period', artifact.period], ['Status', artifact.status]].map(([label, val]) => (
              <div key={label} className="bg-bg rounded-xl p-3">
                <p className="text-xs text-muted mb-0.5">{label}</p>
                <p className="text-sm font-medium text-navy">{val}</p>
              </div>
            ))}
          </div>

          {/* Voice controls */}
          <div className="bg-navy/5 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-navy uppercase tracking-wider">🎙️ Audio Guide</span>
              <div className="ml-auto flex items-center gap-2 flex-wrap">
                {/* Speed */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted">Speed:</span>
                  {[0.75, 1.0, 1.25, 1.5].map(s => (
                    <button key={s} onClick={() => setSpeed(s)}
                      className={`text-xs px-2 py-0.5 rounded-lg transition-colors ${speed === s ? 'bg-accent text-white' : 'bg-white text-muted hover:text-navy border border-border'}`}>
                      {s}x
                    </button>
                  ))}
                </div>
                {/* Voice picker */}
                <VoicePicker lang="en" value={voiceName} onChange={setVoiceName} />
              </div>
            </div>
            <Button
              variant={isNarrating ? 'outline' : 'primary'}
              size="sm"
              onClick={handleNarrate}
              className="w-full"
            >
              {isNarrating ? (
                <><span className="w-2 h-2 rounded-full bg-accent animate-pulse inline-block mr-2" />Stop Narration</>
              ) : (
                <>▶ Play Audio Guide</>
              )}
            </Button>
          </div>

          {/* AI Explanation */}
          <div className="border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-navy uppercase tracking-wider">🤖 AI Deep Dive</span>
              <Button variant="outline" size="sm" onClick={handleAiExplain} disabled={aiLoading}>
                {aiLoading ? 'Generating...' : aiText ? 'Regenerate' : 'Ask AI'}
              </Button>
            </div>
            {(aiStreamed || aiLoading) && (
              <p className="text-sm text-navy/80 leading-relaxed whitespace-pre-wrap">
                {aiLoading && !aiStreamed ? (
                  <span className="flex items-center gap-2 text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                ) : aiStreamed}
                {aiStreamed && aiStreamed.length < aiText.length && <span className="animate-pulse">|</span>}
              </p>
            )}
            {/* Narrate AI text */}
            {aiText && !aiLoading && (
              <Button variant="ghost" size="sm" onClick={() => speakText(aiText, 'en', { rate: speed, voiceName: voiceName || undefined })}>
                ▶ Read AI explanation aloud
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Museum Page ─────────────────────────────────────────────────────────

export default function VirtualMuseumPage() {
  const [activeExhibit, setActiveExhibit] = useState<Exhibit | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [search, setSearch] = useState('');
  const [filterCulture, setFilterCulture] = useState('All');

  const cultures = ['All', ...Array.from(new Set(ARTIFACTS.map(a => a.culture)))];

  const visibleArtifacts = ARTIFACTS.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.culture.toLowerCase().includes(search.toLowerCase());
    const matchCulture = filterCulture === 'All' || a.culture === filterCulture;
    const matchExhibit = !activeExhibit || activeExhibit.artifactIds.includes(a.id) || activeExhibit.culture === a.culture;
    return matchSearch && matchCulture && matchExhibit;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy/5 to-bg pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4">

        {/* Hero */}
        <div className="text-center mb-8">
          <span className="text-accent text-xs font-bold tracking-widest uppercase">Virtual Museum</span>
          <h1 className="text-4xl font-serif text-navy mt-2 mb-3">Artifacts of Humanity's Memory</h1>
          <p className="text-muted max-w-xl mx-auto text-sm leading-relaxed">
            Explore curated artifacts from ancient civilizations. Click any piece for an AI audio guide, deep-dive explanation, and historical context.
          </p>
        </div>

        {/* 3D Museum Banner */}
        <Link
          href="/museum/virtual"
          className="group flex items-center justify-between gap-4 bg-gradient-to-r from-[#1a0f05] to-[#2d1a08] border border-[#D4A373]/30 rounded-2xl p-5 mb-10 hover:border-[#D4A373]/60 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#D4A373]/10 border border-[#D4A373]/20 flex items-center justify-center text-2xl flex-shrink-0">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#D4A373] font-semibold text-sm">NEW — Hallwyl Virtual Museum</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4A373]/20 text-[#D4A373] font-bold uppercase tracking-wider">3D</span>
              </div>
              <p className="text-white/50 text-xs">Create your avatar and walk through the 1st Floor State Rooms with live audio guides</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#D4A373] text-sm font-medium group-hover:gap-3 transition-all flex-shrink-0">
            Enter <span>→</span>
          </div>
        </Link>

        {/* Exhibit Rooms */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {EXHIBITS.map(ex => (
            <button
              key={ex.id}
              onClick={() => setActiveExhibit(activeExhibit?.id === ex.id ? null : ex)}
              className={`bg-gradient-to-br ${ex.color} rounded-xl p-4 border text-left transition-all hover:shadow-card group ${activeExhibit?.id === ex.id ? 'border-accent ring-2 ring-accent/30' : 'border-white/20'}`}
            >
              <span className="text-2xl block mb-2">{ex.icon}</span>
              <p className="text-xs font-semibold text-navy leading-tight group-hover:text-accent transition-colors">{ex.name}</p>
            </button>
          ))}
        </div>

        {/* Active exhibit banner */}
        {activeExhibit && (
          <div className="bg-navy text-white rounded-2xl p-5 mb-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Now Viewing</p>
              <h2 className="text-xl font-serif">{activeExhibit.icon} {activeExhibit.name}</h2>
              <p className="text-white/60 text-sm mt-1">{activeExhibit.description}</p>
            </div>
            <button onClick={() => setActiveExhibit(null)} className="text-white/50 hover:text-white transition-colors text-sm">
              ✕ Exit exhibit
            </button>
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search artifacts, cultures, periods..."
            className="flex-1 bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-navy placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors"
          />
          <div className="flex gap-2 flex-wrap">
            {cultures.map(c => (
              <button key={c} onClick={() => setFilterCulture(c)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${filterCulture === c ? 'bg-accent text-white' : 'bg-white border border-border text-muted hover:border-accent/40 hover:text-navy'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Artifacts Grid */}
        {visibleArtifacts.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <span className="text-5xl block mb-4">🏺</span>
            <p>No artifacts match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {visibleArtifacts.map(artifact => (
              <button
                key={artifact.id}
                onClick={() => setSelectedArtifact(artifact)}
                className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-card hover:border-accent/30 transition-all text-left"
                style={{ borderTop: `3px solid ${artifact.col}` }}
              >
                <GeneratedImage
                  src={getArtifactPlaceholderUrl(artifact.name, artifact.culture)}
                  alt={artifact.name}
                  culture={artifact.culture}
                  name={artifact.name}
                  fallbackEmoji={artifact.emoji}
                  className="h-44"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="muted" size="sm">{artifact.culture}</Badge>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[artifact.status] ?? ''}`}>
                      {artifact.status}
                    </span>
                  </div>
                  <h3 className="font-serif text-navy text-base group-hover:text-accent transition-colors leading-tight">{artifact.name}</h3>
                  <p className="text-xs text-muted mt-1">{artifact.period} · {artifact.loc.split(',')[0]}</p>
                  <p className="text-xs text-muted/70 mt-2 line-clamp-2 leading-relaxed">{artifact.desc}</p>
                  <div className="mt-3 flex items-center gap-1 text-accent text-xs font-medium">
                    <span>▶ Audio guide</span>
                    <span className="text-muted/40 mx-1">·</span>
                    <span>🤖 AI explain</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Info footer */}
        <div className="mt-12 bg-white rounded-2xl border border-border p-6 text-center">
          <p className="text-sm text-muted">
            🏛️ <strong className="text-navy">{ARTIFACTS.length} artifacts</strong> across <strong className="text-navy">{EXHIBITS.length} exhibits</strong> — click any artifact for AI audio guide, voice selection, and deep-dive explanation.
          </p>
        </div>
      </div>

      {/* Artifact Detail Modal */}
      {selectedArtifact && (
        <ArtifactDetail artifact={selectedArtifact} onClose={() => setSelectedArtifact(null)} />
      )}
    </div>
  );
}
