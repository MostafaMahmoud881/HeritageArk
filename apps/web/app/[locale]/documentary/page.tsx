'use client';

import { useState, useMemo, useRef } from 'react';
import { CULTURES, CULTURE_DETAILS } from '@/lib/data';
import { Badge, Button } from '@heritageverse/ui';

const AGE_RANGES = ['5-8', '9-12', '13-17', '18+'];
const TIME_PERIODS = ['Ancient (pre-1000 CE)', 'Medieval (1000-1500 CE)', 'Colonial (1500-1900 CE)', 'Modern (1900-present)', 'All Periods'];

const SECTIONS = ['Title', 'Introduction', 'Historical Context', 'Cultural Significance', 'Conclusion'];

function generateScript(cultureId: string, periodIdx: number, ageIdx: number) {
  const culture = CULTURES.find(c => c.id === cultureId);
  const details = CULTURE_DETAILS[cultureId];
  if (!culture || !details) return null;

  const period = TIME_PERIODS[periodIdx] ?? 'Ancient';
  const ageRange = AGE_RANGES[ageIdx] ?? 'Adult';

  const periodLabel = period.split('(').shift()!.trim();
  const title = `${culture.name} Heritage: ${periodLabel} Documentary`;
  const intro = `${details.summary} This educational documentary explores the rich cultural heritage of the ${culture.name} people, examining their traditions, history, and enduring legacy in the modern world.`;
  const descFirst = details.description.split('.').shift()!;
  const historical = `${culture.name} civilization has a profound historical legacy. ${descFirst}. Throughout ${period.toLowerCase()}, their cultural practices evolved while maintaining core traditions that define their identity today.`;
  const cultural = `The ${culture.name} people maintain several distinctive traditions that have been passed down through generations: ${details.traditions.join(', ')}. These practices represent not just artistic expression but a living connection to ancestral knowledge and worldview.`;
  const conclusion = `Today, the ${culture.name} heritage faces both challenges and opportunities. Efforts to document, preserve, and revitalize these traditions continue through community initiatives and global partnerships. Understanding ${culture.name} culture helps us appreciate the diversity of human experience and the importance of cultural preservation.`;

  const ageAdjust = ageRange === '5-8' ? ' Using simple language and engaging visuals suitable for young learners.' : ageRange === '9-12' ? ' Presented at intermediate level with interactive elements.' : ageRange === '13-17' ? ' In-depth analysis appropriate for secondary education.' : ' Comprehensive academic-level content with primary source analysis.';

  const narration = `[NARRATOR]: Welcome to "${title}". ${intro}${ageAdjust}\n\n[NARRATOR]: Let us journey through the historical landscape of the ${culture.name} people.\n\n[NARRATOR]: ${historical}\n\n[NARRATOR]: ${cultural}\n\n[NARRATOR]: ${conclusion}`;

  const storyboard = [
    { scene: 1, visual: `Aerial landscape of ${culture.region} with ${culture.flag}`, duration: '30s', audio: 'Opening narration with ambient sounds' },
    { scene: 2, visual: `${culture.name} artifacts and traditional practices`, duration: '45s', audio: `Detailed narration of ${culture.name} history and traditions` },
    { scene: 3, visual: `Interviews with ${culture.name} community members and cultural practitioners`, duration: '60s', audio: 'First-person accounts and expert commentary' },
    { scene: 4, visual: `Modern ${culture.name} cultural revitalization efforts`, duration: '30s', audio: 'Closing narration with call to preservation' },
  ];

  const lessonPlan = {
    title: `Educational Lesson Plan: ${culture.name} Heritage`,
    ageGroup: ageRange,
    duration: '45-60 minutes',
    objectives: [`Understand the historical significance of ${culture.name} civilization`, `Identify key ${culture.name} traditions and their meanings`, `Analyze the impact of historical events on ${culture.name} culture`, `Develop appreciation for cultural diversity and preservation`],
    activities: [
      `Watch the ${culture.name} documentary and discuss key themes`,
      `Research one ${culture.name} tradition in depth and present findings`,
      `Create artwork inspired by ${culture.name} cultural motifs`,
      `Write a reflection on why cultural preservation matters`,
    ],
    assessment: 'Students will complete a short quiz and a creative project demonstrating their understanding of the culture.',
  };

  return { title, intro, historical, cultural, conclusion, narration, storyboard, lessonPlan };
}

export default function DocumentaryPage() {
  const [country, setCountry] = useState('');
  const [cultureId, setCultureId] = useState('');
  const [period, setPeriod] = useState(0);
  const [audienceAge, setAudienceAge] = useState(2);
  const [generated, setGenerated] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const printRef = useRef<HTMLDivElement>(null);

  const filteredCultures = useMemo(() => {
    return CULTURES.filter(c => !country || c.region.toLowerCase().includes(country.toLowerCase()));
  }, [country]);

  const script = useMemo(() => {
    if (!cultureId) return null;
    return generateScript(cultureId, period, audienceAge);
  }, [cultureId, period, audienceAge]);

  const handleGenerate = () => {
    if (!cultureId) return;
    setGenerated(true);
    setActiveSection(0);
  };

  function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/on\w+=[^\s>]+/gi, '')
    .replace(/javascript:/gi, '');
}

const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const clean = sanitizeHtml(content);
    const win = window.open('', '', 'width=900,height=700');
    if (!win) return;
    win.document.write(`<html><head><title>${script?.title || 'Documentary Script'}</title><style>body{font-family:Georgia,serif;padding:40px;color:#0B132B;}h1{font-size:28px;}h2{font-size:20px;color:#D4A375;}.section{margin-bottom:30px;}</style></head><body>${clean}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="text-accent text-sm font-semibold tracking-widest uppercase">Create</span>
          <h1 className="text-4xl font-serif text-navy mt-2">AI Documentary Generator</h1>
          <p className="text-muted mt-3 max-w-xl">
            Generate educational documentary scripts, narration, and lesson plans from cultural heritage data.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-card border border-border p-6">
              <h2 className="text-lg font-serif text-navy mb-4">📋 Documentary Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Country / Region</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => { setCountry(e.target.value); setCultureId(''); }}
                    placeholder="e.g. Egypt, Morocco..."
                    className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-navy placeholder-muted/50 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Culture</label>
                  <select
                    value={cultureId}
                    onChange={(e) => setCultureId(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-navy focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="">Select a culture</option>
                    {filteredCultures.map((c) => (
                      <option key={c.id} value={c.id}>{c.flag} {c.name} ({c.region})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Time Period</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(Number(e.target.value))}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-navy focus:outline-none focus:border-accent transition-colors"
                  >
                    {TIME_PERIODS.map((p, i) => (
                      <option key={i} value={i}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Audience Age</label>
                  <div className="flex gap-2">
                    {AGE_RANGES.map((age, i) => (
                      <button
                        key={age}
                        onClick={() => setAudienceAge(i)}
                        className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                          audienceAge === i
                            ? 'bg-accent text-white'
                            : 'bg-bg border border-border text-muted hover:border-accent/30'
                        }`}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleGenerate} disabled={!cultureId} className="w-full" size="lg">
                  🎬 Generate Documentary
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {!generated ? (
              <div className="bg-white rounded-2xl shadow-card border border-border p-12 text-center">
                <span className="text-7xl block mb-4">🎥</span>
                <h2 className="text-2xl font-serif text-navy mb-2">Ready to Create</h2>
                <p className="text-muted max-w-md mx-auto">
                  Select a culture, time period, and audience age, then click Generate to produce a complete documentary package.
                </p>
              </div>
            ) : script ? (
              <div ref={printRef} className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {SECTIONS.map((section, i) => (
                      <button
                        key={section}
                        onClick={() => setActiveSection(i)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          activeSection === i
                            ? 'bg-accent text-white'
                            : 'bg-bg text-muted hover:bg-accent/10'
                        }`}
                      >
                        {section}
                      </button>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    🖨️ Export / Print
                  </Button>
                </div>

                <div className="p-6">
                  {activeSection === 0 && (
                    <div className="animate-slide-up">
                      <Badge variant="accent" size="sm">Title</Badge>
                      <h2 className="text-3xl font-serif text-navy mt-3 mb-2">{script.title}</h2>
                      <p className="text-muted text-sm">A documentary about {CULTURES.find(c => c.id === cultureId)?.name} heritage</p>
                    </div>
                  )}

                  {activeSection === 1 && (
                    <div className="animate-slide-up">
                      <Badge variant="accent" size="sm">Introduction</Badge>
                      <p className="text-navy mt-3 leading-relaxed">{script.intro}</p>
                    </div>
                  )}

                  {activeSection === 2 && (
                    <div className="animate-slide-up">
                      <Badge variant="accent" size="sm">Historical Context</Badge>
                      <p className="text-navy mt-3 leading-relaxed">{script.historical}</p>
                    </div>
                  )}

                  {activeSection === 3 && (
                    <div className="animate-slide-up">
                      <Badge variant="accent" size="sm">Cultural Significance</Badge>
                      <p className="text-navy mt-3 leading-relaxed">{script.cultural}</p>
                    </div>
                  )}

                  {activeSection === 4 && (
                    <div className="animate-slide-up">
                      <Badge variant="accent" size="sm">Conclusion</Badge>
                      <p className="text-navy mt-3 leading-relaxed">{script.conclusion}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-border p-6">
                  <h3 className="font-serif text-navy text-lg mb-4">🎙️ Narration Script</h3>
                  <pre className="whitespace-pre-wrap text-sm text-navy leading-relaxed bg-bg rounded-xl p-4">{script.narration}</pre>
                </div>

                <div className="border-t border-border p-6">
                  <h3 className="font-serif text-navy text-lg mb-4">🎬 Storyboard</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {script.storyboard.map((scene) => (
                      <div key={scene.scene} className="bg-bg rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="accent" size="sm">Scene {scene.scene}</Badge>
                          <span className="text-xs text-muted">{scene.duration}</span>
                        </div>
                        <p className="text-sm text-navy"><strong>Visual:</strong> {scene.visual}</p>
                        <p className="text-sm text-muted mt-1"><strong>Audio:</strong> {scene.audio}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border p-6">
                  <h3 className="font-serif text-navy text-lg mb-4">📚 Educational Lesson Plan</h3>
                  <div className="bg-bg rounded-xl p-5">
                    <h4 className="font-bold text-navy text-lg mb-2">{script.lessonPlan.title}</h4>
                    <div className="flex items-center gap-4 mb-4 text-sm text-muted">
                      <span>Age: {script.lessonPlan.ageGroup}</span>
                      <span>Duration: {script.lessonPlan.duration}</span>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Learning Objectives</p>
                      <ul className="space-y-1">
                        {script.lessonPlan.objectives.map((obj, i) => (
                          <li key={i} className="text-sm text-navy flex items-start gap-2">
                            <span className="text-accent">✓</span> {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Activities</p>
                      <ol className="space-y-1 list-decimal list-inside">
                        {script.lessonPlan.activities.map((act, i) => (
                          <li key={i} className="text-sm text-navy">{act}</li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Assessment</p>
                      <p className="text-sm text-navy">{script.lessonPlan.assessment}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-card border border-border p-12 text-center">
                <span className="text-6xl block mb-4">⚠️</span>
                <p className="text-muted">Please select a culture to generate a documentary.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
