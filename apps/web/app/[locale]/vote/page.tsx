'use client';

import { useState, useEffect, useCallback } from 'react';
import { LANGUAGES, CULTURES, EMERGENCY_ALERTS } from '@/lib/data';
import { Badge, Button } from '@heritageverse/ui';

const VOTE_ITEMS = [
  { id: 'v1', name: 'Nobiin Language Preservation', category: 'Language', emoji: '🗣️', culture: 'Nubian', flag: '🇪🇬', urgency: 95, desc: 'Support documentation and revitalization of the Nobiin language with fewer than 50,000 speakers.' },
  { id: 'v2', name: 'Northern Sami Language Vitality', category: 'Language', emoji: '🏔️', culture: 'Sami', flag: '🏔️', urgency: 88, desc: 'Preserve Northern Sami language with only 25,000 remaining speakers across four countries.' },
  { id: 'v3', name: 'Atlas Amazigh Textile Archive', category: 'Culture', emoji: '🧵', culture: 'Amazigh', flag: '🇲🇦', urgency: 72, desc: 'Digitize disappearing carpet-weaving patterns from Atlas Mountain communities.' },
  { id: 'v4', name: 'Kurdish Oral Epic Preservation', category: 'Culture', emoji: '📖', culture: 'Kurdish', flag: '🌿', urgency: 65, desc: 'Record and archive Kurdish oral epic traditions across four countries.' },
  { id: 'v5', name: 'Mayan Glyph Digitization', category: 'Heritage', emoji: '🗿', culture: 'Mayan', flag: '🇲🇽', urgency: 90, desc: '3D scan weathered Mayan stelae before further erosion destroys glyph details.' },
  { id: 'v6', name: 'Nubian Gold Thread Embroidery', category: 'Craft', emoji: '🧵', culture: 'Nubian', flag: '🇪🇬', urgency: 60, desc: 'Support the last masters of Nubian gold thread embroidery in Aswan.' },
  { id: 'v7', name: 'Ottoman Iznik Tile Restoration', category: 'Heritage', emoji: '🔵', culture: 'Ottoman', flag: '🇹🇷', urgency: 50, desc: 'Restore deteriorating Iznik tiles in historic mosques and palaces.' },
  { id: 'v8', name: 'Andean Quechua Documentation', category: 'Language', emoji: '🏔️', culture: 'Andean', flag: '🇵🇪', urgency: 78, desc: 'Document Quechua oral traditions and creation myths from elder speakers.' },
];

const COUNTRIES = [
  { name: 'Egypt', flag: '🇪🇬', score: 92, items: 3 },
  { name: 'Morocco', flag: '🇲🇦', score: 78, items: 2 },
  { name: 'Turkey', flag: '🇹🇷', score: 65, items: 1 },
  { name: 'Guatemala', flag: '🇬🇹', score: 88, items: 2 },
  { name: 'Peru', flag: '🇵🇪', score: 72, items: 1 },
  { name: 'Norway', flag: '🇳🇴', score: 85, items: 1 },
];

export default function VotePage() {
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('hv_votes');
    if (saved) {
      try { setVotes(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hv_votes', JSON.stringify(votes));
  }, [votes]);

  const handleVote = useCallback((id: string) => {
    setVotes(prev => {
      const current = prev[id] || 0;
      if (current >= 5) return prev;
      const next = { ...prev, [id]: current + 1 };
      return next;
    });
    setAnimatingId(id);
    setTimeout(() => setAnimatingId(null), 1000);
  }, []);

  const sortedByVotes = [...VOTE_ITEMS].sort((a, b) => (votes[a.id] || 0) - (votes[b.id] || 0)).reverse();
  const maxVotes = Math.max(...VOTE_ITEMS.map(i => votes[i.id] || 0), 1);
  const mostUrgent = VOTE_ITEMS.reduce((prev, curr) => prev.urgency > curr.urgency ? prev : curr);

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="text-accent text-sm font-semibold tracking-widest uppercase">Participate</span>
          <h1 className="text-4xl font-serif text-navy mt-2">Preservation Voting</h1>
          <p className="text-muted mt-3 max-w-xl">
            Vote for heritage preservation priorities. Your voice helps direct attention to the most urgent cultural causes.
          </p>
        </div>

        <div className="bg-navy rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🚨</span>
            <Badge variant="danger" size="sm">Most Urgent</Badge>
          </div>
          <h2 className="text-2xl font-serif text-white">{mostUrgent.emoji} {mostUrgent.name}</h2>
          <p className="text-white/60 text-sm mt-1">{mostUrgent.desc}</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-white/40 text-xs">{mostUrgent.flag} {mostUrgent.culture}</span>
            <div className="flex-1 h-2 rounded-full bg-white/10 max-w-xs overflow-hidden">
              <div className="h-full rounded-full bg-danger" style={{ width: `${mostUrgent.urgency}%` }} />
            </div>
            <span className="text-danger text-xs font-bold">Urgency: {mostUrgent.urgency}%</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {sortedByVotes.map((item) => {
              const voteCount = votes[item.id] || 0;
              const barWidth = maxVotes > 0 ? (voteCount / 5) * 100 : 0;
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border border-border p-5 hover:shadow-card transition-all duration-300 ${animatingId === item.id ? 'scale-[1.02] border-accent' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-bg flex items-center justify-center text-3xl shrink-0">
                      {item.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-serif text-navy">{item.name}</h3>
                        <Badge variant={item.category === 'Language' ? 'accent' : item.category === 'Culture' ? 'gold' : 'muted'} size="sm">{item.category}</Badge>
                      </div>
                      <p className="text-xs text-muted">{item.flag} {item.culture}</p>
                      <p className="text-sm text-muted mt-1">{item.desc}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <Button
                          size="sm"
                          onClick={() => handleVote(item.id)}
                          disabled={voteCount >= 5}
                          className={animatingId === item.id ? 'animate-bounce' : ''}
                        >
                          {voteCount >= 5 ? '✓ Max Votes' : `Vote (${voteCount}/5)`}
                        </Button>
                        <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden max-w-[200px]">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${barWidth}%`,
                              backgroundColor: voteCount >= 3 ? '#059669' : voteCount >= 1 ? '#D97706' : '#E8E2D9',
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted font-medium">{voteCount} votes</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-xs font-bold ${item.urgency >= 80 ? 'text-danger' : item.urgency >= 60 ? 'text-warning' : 'text-muted'}`}>
                        {item.urgency}%
                      </div>
                      <div className="text-xs text-muted">Urgency</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
              <div className="p-5 border-b border-border">
                <h2 className="font-serif text-navy">🌍 Global Rankings</h2>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {sortedByVotes.slice(0, 5).map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                        {idx + 1}
                      </span>
                      <span className="text-sm text-navy flex-1 truncate">{item.emoji} {item.name}</span>
                      <span className="text-xs font-medium text-muted">{votes[item.id] || 0} votes</span>
                    </div>
                  ))}
                  {sortedByVotes.length === 0 && (
                    <p className="text-sm text-muted text-center py-4">No votes yet. Be the first!</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
              <div className="p-5 border-b border-border">
                <h2 className="font-serif text-navy">🏳️ Country Rankings</h2>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {COUNTRIES.sort((a, b) => b.score - a.score).map((country) => (
                    <div key={country.name} className="flex items-center gap-3">
                      <span className="text-xl">{country.flag}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-navy">{country.name}</p>
                        <p className="text-xs text-muted">{country.items} active items</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold" style={{ color: country.score >= 80 ? '#059669' : country.score >= 60 ? '#D97706' : '#6B7280' }}>
                          {country.score}
                        </div>
                        <div className="text-xs text-muted">score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
              <div className="p-5 border-b border-border">
                <h2 className="font-serif text-navy">🗳️ Your Votes</h2>
              </div>
              <div className="p-5">
                {Object.keys(votes).length === 0 ? (
                  <p className="text-sm text-muted text-center py-4">You haven&apos;t voted yet. Start voting above!</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(votes).map(([id, count]) => {
                      const item = VOTE_ITEMS.find(v => v.id === id);
                      if (!item) return null;
                      return (
                        <div key={id} className="flex items-center justify-between bg-bg rounded-xl px-3 py-2">
                          <span className="text-sm text-navy">{item.emoji} {item.name}</span>
                          <span className="text-xs font-medium text-accent">{count}/5</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
