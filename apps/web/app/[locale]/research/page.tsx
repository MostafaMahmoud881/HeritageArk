'use client';

import { useState } from 'react';
import { Badge, Button } from '@heritageverse/ui';

const INSTITUTIONS = [
  { id: 'i1', name: 'Dr. Layla Haddad', type: 'Researcher', field: 'Cultural Anthropology', inst: 'University of Oxford', flag: '🇬🇧', badge: '✓ Verified Researcher', badgeColor: '#059669', emoji: '👩‍🔬', verified: true },
  { id: 'i2', name: 'Dr. Samir Tadros', type: 'Researcher', field: 'Ethnomusicology', inst: 'SOAS, London', flag: '🇬🇧', badge: '✓ Verified Researcher', badgeColor: '#059669', emoji: '🎵', verified: true },
  { id: 'i3', name: 'Prof. Fatima Ait Benhaddou', type: 'Researcher', field: 'Textile Anthropology', inst: 'University of Fez', flag: '🇲🇦', badge: '✓ Verified Researcher', badgeColor: '#059669', emoji: '🧵', verified: true },
  { id: 'i4', name: 'University of Oxford', type: 'University', field: 'Cultural Heritage Studies', inst: 'Oxford, UK', flag: '🇬🇧', badge: '✓ Accredited University', badgeColor: '#2563EB', emoji: '🎓', verified: true },
  { id: 'i5', name: 'SOAS University of London', type: 'University', field: 'Anthropology & Heritage', inst: 'London, UK', flag: '🇬🇧', badge: '✓ Accredited University', badgeColor: '#2563EB', emoji: '📚', verified: true },
  { id: 'i6', name: 'National Museum of Egypt', type: 'Museum', field: 'Egyptology & Nubian Studies', inst: 'Cairo, Egypt', flag: '🇪🇬', badge: '✓ Accredited Museum', badgeColor: '#7C3AED', emoji: '🏛️', verified: true },
  { id: 'i7', name: 'Topkapi Palace Museum', type: 'Museum', field: 'Ottoman Art & Architecture', inst: 'Istanbul, Turkey', flag: '🇹🇷', badge: '✓ Accredited Museum', badgeColor: '#7C3AED', emoji: '🕌', verified: true },
  { id: 'i8', name: 'Ministry of Culture, Egypt', type: 'Government', field: 'Heritage Preservation', inst: 'Cairo, Egypt', flag: '🇪🇬', badge: '✓ Government Institution', badgeColor: '#D97706', emoji: '🏛️', verified: true },
  { id: 'i9', name: 'Moroccan Ministry of Culture', type: 'Government', field: 'Amazigh Heritage', inst: 'Rabat, Morocco', flag: '🇲🇦', badge: '✓ Government Institution', badgeColor: '#D97706', emoji: '⚖️', verified: true },
  { id: 'i10', name: 'Sami Parliament Cultural Council', type: 'Government', field: 'Indigenous Rights & Heritage', inst: 'Kautokeino, Norway', flag: '🏔️', badge: '✓ Indigenous Governance', badgeColor: '#0891B2', emoji: '🦌', verified: true },
];

const BADGE_TYPES = [
  { name: 'Verified Researcher', color: '#059669', icon: '🎓', desc: 'Academic researcher with peer-reviewed publications in heritage studies' },
  { name: 'Accredited University', color: '#2563EB', icon: '🏛️', desc: 'Recognized academic institution with heritage studies programs' },
  { name: 'Accredited Museum', color: '#7C3AED', icon: '🖼️', desc: 'Museum with accredited conservation and curation standards' },
  { name: 'Government Institution', color: '#D97706', icon: '⚖️', desc: 'Official government body responsible for cultural heritage' },
];

export default function ResearchPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const types = ['All', 'Researcher', 'University', 'Museum', 'Government'];

  const filtered = INSTITUTIONS.filter(i => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase()) && !i.inst.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== 'All' && i.type !== filterType) return false;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="text-accent text-sm font-semibold tracking-widest uppercase">Verify</span>
          <h1 className="text-4xl font-serif text-navy mt-2">Research Verification</h1>
          <p className="text-muted mt-3 max-w-xl">
            Verified researchers, universities, museums, and government institutions preserving cultural heritage.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden mb-8">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-serif text-navy">🏆 Badge Showcase</h2>
          </div>
          <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BADGE_TYPES.map((badge) => (
              <div key={badge.name} className="bg-bg rounded-xl p-4 text-center hover:shadow-card transition-all">
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className="font-semibold text-sm text-navy">{badge.name}</p>
                <p className="text-xs text-muted mt-1">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search institutions or researchers..."
              className="w-full bg-white border border-border rounded-xl px-4 py-3 text-navy placeholder-muted/50 focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filterType === type
                    ? 'bg-accent text-white shadow-md'
                    : 'bg-white border border-border text-muted hover:border-accent/30 hover:text-navy'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-border p-5 hover:shadow-card transition-all duration-300"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-14 h-14 rounded-xl bg-bg flex items-center justify-center text-2xl">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-navy truncate">{item.name}</h3>
                  <p className="text-xs text-muted truncate">{item.field}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: item.badgeColor + '15', color: item.badgeColor }}>
                    {item.badge}
                  </span>
                </div>
                <span className="text-lg">{item.flag}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted pt-3 border-t border-border">
                <span>{item.type}</span>
                <span>{item.inst}</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="text-6xl">🔍</span>
            <p className="text-muted text-lg mt-4">No results match your search.</p>
            <button onClick={() => { setSearch(''); setFilterType('All'); }} className="text-accent hover:text-accent/80 mt-2 text-sm">
              Clear filters
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif text-navy">📋 Apply for Verification</h2>
              <p className="text-sm text-muted mt-1">Submit your institution or researcher profile for verification.</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'primary' : 'outline'}>
              {showForm ? 'Cancel' : 'Apply'}
            </Button>
          </div>

          {showForm && (
            <div className="p-6 animate-slide-up">
              {formSubmitted ? (
                <div className="text-center py-8">
                  <span className="text-5xl block mb-3">✅</span>
                  <h3 className="text-xl font-semibold text-navy mb-2">Application Submitted</h3>
                  <p className="text-muted text-sm">Our verification team will review your application within 5-7 business days. You will be notified once verified.</p>
                  <Button variant="outline" className="mt-4" onClick={() => { setFormSubmitted(false); setShowForm(false); }}>
                    Close
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Full Name / Institution</label>
                      <input type="text" required placeholder="e.g. Dr. Jane Smith or University of X" className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-navy placeholder-muted/50 focus:outline-none focus:border-accent" />
                    </div>
                    <div>
                      <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Type</label>
                      <select className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-navy focus:outline-none focus:border-accent">
                        <option>Researcher</option>
                        <option>University</option>
                        <option>Museum</option>
                        <option>Government Institution</option>
                        <option>Cultural Organization</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Email</label>
                    <input type="email" required placeholder="your@email.com" className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-navy placeholder-muted/50 focus:outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Field of Expertise</label>
                    <input type="text" required placeholder="e.g. Cultural Anthropology, Ethnomusicology" className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-navy placeholder-muted/50 focus:outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Credentials / Description</label>
                    <textarea rows={3} required placeholder="Describe your qualifications, publications, or institutional accreditation..." className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-navy placeholder-muted/50 focus:outline-none focus:border-accent resize-none" />
                  </div>
                  <Button type="submit" className="w-full">Submit Application</Button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
