'use client';

import { useState, useCallback } from 'react';
import { Badge, Button } from '@heritageverse/ui';
import { speakText, stopSpeaking } from '@/lib/ai';

const TOURS = [
  { id: 't1', city: 'Cairo', country: 'Egypt', flag: '🇪🇬', name: 'Nubian Heritage Tour', culture: 'Nubian', duration: '2h', stops: 8, langs: ['English', 'Arabic', 'Nobiin'], emoji: '🏛️', color: '#8B4513', lat: 30.0444, lng: 31.2357, stopsList: ['Meet at Aswan Museum', 'Unfinished Obelisk', 'Nubian Village', 'Philae Temple', 'Nubian Museum', 'Old Cataract', 'Botanical Garden', 'Nile Felucca Ride'] },
  { id: 't2', city: 'Marrakech', country: 'Morocco', flag: '🇲🇦', name: 'Amazigh Souk Tour', culture: 'Amazigh', duration: '1.5h', stops: 6, langs: ['English', 'Arabic', 'Tamazight'], emoji: '🔷', color: '#1B6CA8', lat: 31.6295, lng: -7.9811, stopsList: ['Jemaa el-Fnaa', 'Souk Semmarine', 'Carpet Souk', 'Tanneries', 'Bahia Palace', 'Saadian Tombs'] },
  { id: 't3', city: 'Istanbul', country: 'Turkey', flag: '🇹🇷', name: 'Ottoman Legacy Walk', culture: 'Ottoman', duration: '2.5h', stops: 10, langs: ['English', 'Turkish'], emoji: '🕌', color: '#8B1A1A', lat: 41.0082, lng: 28.9784, stopsList: ['Hagia Sophia', 'Blue Mosque', 'Topkapi Palace', 'Grand Bazaar', 'Suleymaniye Mosque', 'Spice Bazaar', 'Galata Tower', 'Dolmabahce Palace', 'Basilica Cistern', 'Rustem Pasha Mosque'] },
  { id: 't4', city: 'Cusco', country: 'Peru', flag: '🇵🇪', name: 'Inca Trail Tour', culture: 'Andean', duration: '3h', stops: 12, langs: ['English', 'Spanish', 'Quechua'], emoji: '🏔️', color: '#B5421A', lat: -13.5320, lng: -71.9675, stopsList: ['Plaza de Armas', 'Sacsayhuaman', 'Qenqo', 'Puca Pucara', 'Tambomachay', 'San Pedro Market', 'Inca Museum', 'San Blas', 'Moray', 'Maras Salt Mines', 'Ollantaytambo', 'Puerto Maldonado'] },
  { id: 't5', city: 'Chichicastenango', country: 'Guatemala', flag: '🇬🇹', name: 'Mayan Market Tour', culture: 'Mayan', duration: '2h', stops: 7, langs: ['English', 'Spanish', 'K\'iche\''], emoji: '🌽', color: '#6B3FA0', lat: 14.9433, lng: -91.1094, stopsList: ['Santo Tomas Church', 'Market Plaza', 'Textile Stalls', 'Masks Corner', 'Pottery Row', 'Copal Ceremony', 'Chichi Viewpoint'] },
  { id: 't6', city: 'Kautokeino', country: 'Norway/Sweden/Finland', flag: '🏔️', name: 'Reindeer Migration Route', culture: 'Sami', duration: '4h', stops: 5, langs: ['English', 'Sami', 'Norwegian', 'Swedish'], emoji: '🦌', color: '#4A4E69', lat: 69.0118, lng: 23.0418, stopsList: ['Sami Siida Village', 'Reindeer Herding Grounds', 'Joik Circle', 'Duodji Workshop', 'Lavvu Camp'] },
];

const LANGUAGES = ['English', 'Arabic', 'Turkish', 'Spanish', 'Sami', 'Nobiin', 'Tamazight', 'Quechua'];

export default function ToursPage() {
  const [selectedTour, setSelectedTour] = useState<typeof TOURS[0] | null>(null);
  const [audioLang, setAudioLang] = useState('English');
  const [speaking, setSpeaking] = useState(false);
  const [currentStop, setCurrentStop] = useState<number | null>(null);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const speakStop = useCallback(async (text: string, stopIdx: number) => {
    stopSpeaking();
    setCurrentStop(stopIdx);
    setSpeaking(true);
    try {
      await speakText(text);
    } catch {
      // fallback handled by speakText
    }
    setSpeaking(false);
    setCurrentStop(null);
  }, []);

  const startTour = useCallback(async () => {
    if (!selectedTour) return;
    stopSpeaking();
    const allText = `Welcome to the ${selectedTour.name} in ${selectedTour.city}. ${selectedTour.stopsList.map((s, i) => `Stop ${i + 1}: ${s}.`).join(' ')}`;
    setSpeaking(true);
    try {
      await speakText(allText);
    } catch {
      // fallback handled by speakText
    }
    setSpeaking(false);
  }, [selectedTour]);

  const stopAudio = () => {
    stopSpeaking();
    setSpeaking(false);
    setCurrentStop(null);
  };

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="text-accent text-sm font-semibold tracking-widest uppercase">Explore</span>
          <h1 className="text-4xl font-serif text-navy mt-2">Audio Walking Tours</h1>
          <p className="text-muted mt-3 max-w-xl">
            Immersive guided audio tours through heritage-rich cities and landscapes.
          </p>
        </div>

        {selectedTour ? (
          <div className="animate-slide-up">
            <button
              onClick={() => { setSelectedTour(null); stopAudio(); }}
              className="text-accent hover:text-accent/80 text-sm font-medium mb-6 flex items-center gap-1"
            >
              ← Back to all tours
            </button>

            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl" style={{ backgroundColor: selectedTour.color + '20' }}>
                          {selectedTour.emoji}
                        </div>
                        <div>
                          <h2 className="text-2xl font-serif text-navy">{selectedTour.name}</h2>
                          <p className="text-muted text-sm">{selectedTour.flag} {selectedTour.city}, {selectedTour.country}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-accent font-bold">{selectedTour.duration}</div>
                        <div className="text-xs text-muted">{selectedTour.stops} stops</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-6">
                      <Badge variant="accent" size="sm">{selectedTour.culture}</Badge>
                      {selectedTour.langs.map(l => (
                        <Badge key={l} variant="muted" size="sm">{l}</Badge>
                      ))}
                    </div>

                    <h3 className="font-semibold text-navy mb-3">Tour Stops</h3>
                    <div className="space-y-2 mb-6">
                      {selectedTour.stopsList.map((stop, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer hover:bg-accent/5"
                          style={{
                            backgroundColor: currentStop === idx ? '#FEF3C7' : '#F9FAFB',
                            border: currentStop === idx ? '1px solid #F59E0B' : '1px solid transparent',
                          }}
                          onClick={() => speakStop(`Stop ${idx + 1}: ${stop}. ${getStopDescription(selectedTour.id, idx)}`, idx)}
                        >
                          <div className="w-8 h-8 rounded-full bg-accent text-white text-sm font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <span className="text-navy font-medium text-sm">{stop}</span>
                            <p className="text-xs text-muted mt-0.5">{getStopDescription(selectedTour.id, idx)}</p>
                          </div>
                          <button className="text-accent hover:text-accent/80 text-sm" title="Play narration">
                            🔊
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <Button onClick={startTour} disabled={speaking} size="lg">
                        {speaking ? '🔊 Playing...' : '▶ Start Tour'}
                      </Button>
                      {speaking && (
                        <Button variant="outline" onClick={stopAudio}>
                          ⏹ Stop
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden mb-4">
                  <div className="aspect-[4/3] bg-navy relative flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="text-6xl mb-3">{selectedTour.flag}</div>
                      <p className="text-white/80 font-medium">{selectedTour.city}</p>
                      <p className="text-white/40 text-sm">{selectedTour.country}</p>
                      <div className="mt-3 inline-flex items-center gap-1 text-xs text-white/50 bg-white/10 rounded-full px-3 py-1">
                        📍 {selectedTour.lat.toFixed(2)}, {selectedTour.lng.toFixed(2)}
                      </div>
                    </div>
                    <div className="absolute inset-0 border-[1px] border-white/10 rounded-2xl pointer-events-none" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1 text-xs text-white/40">
                      <span>🗺️</span>
                      <span>Map preview</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-card border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-navy text-sm">Audio Language</h4>
                    <div className="relative">
                      <button
                        onClick={() => setShowLangPicker(!showLangPicker)}
                        className="px-3 py-1.5 rounded-lg text-sm border border-border hover:bg-bg transition-colors"
                      >
                        {audioLang} ▼
                      </button>
                      {showLangPicker && (
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-border z-10 min-w-[140px] overflow-hidden">
                          {LANGUAGES.map(l => (
                            <button
                              key={l}
                              onClick={() => { setAudioLang(l); setShowLangPicker(false); }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-bg transition-colors"
                              style={{ backgroundColor: audioLang === l ? '#FEF3C7' : undefined }}
                            >
                              {l}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted">Narration will be read in {audioLang}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOURS.map((tour) => (
              <button
                key={tour.id}
                onClick={() => setSelectedTour(tour)}
                className="group bg-white rounded-2xl border border-border p-6 text-left hover:shadow-card hover:border-accent/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: tour.color + '20' }}>
                    {tour.emoji}
                  </div>
                  <span className="text-2xl">{tour.flag}</span>
                </div>
                <h3 className="font-serif text-lg text-navy group-hover:text-accent transition-colors">{tour.name}</h3>
                <p className="text-sm text-muted mt-1">{tour.city}, {tour.country}</p>
                <div className="flex items-center gap-3 mt-3 text-sm text-muted">
                  <span>⏱ {tour.duration}</span>
                  <span>📍 {tour.stops} stops</span>
                </div>
                <Badge variant="accent" size="sm" className="mt-3">{tour.culture}</Badge>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getStopDescription(tourId: string, stopIdx: number): string {
  const descriptions: Record<string, string[]> = {
    t1: ['Start your Nubian journey at the museum entrance', 'Ancient granite quarry where obelisks were carved', 'Experience traditional Nubian hospitality', 'Temple of Isis relocated during dam construction', 'Artifacts spanning 5000 years of Nubian history', 'Colonial-era hotel on the Nile', 'Exotic plants from around the world', 'Sunset sail on a traditional felucca'],
    t2: ['The bustling main square of Marrakech', 'The largest market in the medina', 'Handwoven Amazigh rugs and textiles', 'Traditional leather dyeing pits', '19th-century palace with stunning gardens', 'Ancient royal burial site'],
    t3: ['Byzantine masterpiece turned mosque turned museum', 'Six-minaret Ottoman marvel', 'Home of Ottoman sultans for 400 years', 'One of the oldest covered markets in the world', 'Sinan\'s masterpiece of Ottoman architecture', 'Aromatic spices from across the empire', 'Genoese tower with panoramic views', 'Opulent palace on the Bosphorus', 'Ancient underground water system', 'Sinan\'s final masterpiece'],
    t4: ['Heart of the Inca capital', 'Massive stone fortress overlooking Cusco', 'Zigzag canals and carved rock formations', 'Ancient military outpost', 'Aqueducts and water ceremonies', 'Traditional Andean market', 'Pre-Columbian artifacts', 'Arts and crafts neighborhood', 'Circular terraced agricultural experiment', 'Ancient salt evaporation ponds', 'Well-preserved Inca fortress town', 'Gateway to the Amazon'],
    t5: ['16th-century colonial church on Maya temple site', 'Vibrant indigenous market since pre-Columbian times', 'Traditional Mayan textiles and huipiles', 'Ceremonial masks for dance traditions', 'Hand-painted pottery and ceramics', 'Traditional spiritual cleansing ritual', 'Panoramic view of the highlands'],
    t6: ['Traditional Sami village settlement', 'Learn about reindeer herding practices', 'Experience joik singing ceremony', 'Sami handicraft demonstration', 'Traditional tent camp with storytelling'],
  };
  return descriptions[tourId]?.[stopIdx] || 'Learn about this heritage location.';
}
