'use client';

import { useState } from 'react';
import { useTranslate } from '@/lib/TranslationProvider';
import { GARMENTS } from '@/lib/data';

export default function FashionPage() {
  const { locale } = useTranslate();
  const [selected, setSelected] = useState<typeof GARMENTS[number] | null>(null);

  return (
    <div className="min-h-screen bg-[#F7F4EF] pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B9955A]/15 border border-[#B9955A]/30 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9955A] animate-pulse" />
            <span className="text-[#B9955A] text-xs tracking-widest uppercase font-medium">Fashion Archive</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-[#2D3436]">Heritage Fashion & Garments</h1>
          <p className="text-[#59636D] mt-2 max-w-2xl">
            Explore traditional garments from cultures around the world — each carrying centuries of identity, craftsmanship, and meaning.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GARMENTS.map(garment => (
            <button
              key={garment.id}
              onClick={() => setSelected(garment)}
              className="group bg-white rounded-2xl border border-[#E8DDC8] overflow-hidden hover:shadow-lg hover:border-[#B9955A]/40 transition-all duration-300 text-left"
            >
              <div className="aspect-square flex items-center justify-center rounded-xl" style={{ background: `${garment.col}15`, backgroundImage: `url('/public/generated/${garment.image}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <span className="absolute inset-0 flex items-center justify-center text-white/80 text-xs font-medium">{garment.emoji}</span>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold text-[#B9955A] uppercase tracking-wider">{garment.cat}</span>
                  <span className="text-xs text-[#59636D] ml-auto">{garment.origin}</span>
                </div>
                <h3 className="font-serif text-[#2D3436] group-hover:text-[#B9955A] transition-colors">{garment.name}</h3>
                <p className="text-xs text-[#59636D] mt-1">{garment.era}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {garment.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#F7F4EF] text-[#59636D]">#{tag}</span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="h-48 flex items-center justify-center rounded-t-xl" style={{ background: `${selected.col}20`, backgroundImage: `url('/public/generated/${selected.image}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>{selected.emoji}</div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-semibold text-[#B9955A] uppercase tracking-wider">{selected.cat}</span>
                  <span className="text-xs text-[#59636D]">{selected.origin} · {selected.era}</span>
                </div>
                <h2 className="text-3xl font-serif text-[#2D3436] mb-4">{selected.name}</h2>
                
                {/* History Section */}
                <div className="bg-[#F7F4EF] rounded-xl p-4 mb-6 border border-[#E8DDC8]">
                  <h3 className="text-sm font-semibold text-[#B9955A] uppercase tracking-wider mb-3">Historical Significance</h3>
                  <p className="text-[#59636D] leading-relaxed">{selected.history}</p>
                </div>

                {/* Population Section */}
                <div className="bg-[#F7F4EF] rounded-xl p-4 mb-6 border border-[#E8DDC8]">
                  <h3 className="text-sm font-semibold text-[#B9955A] uppercase tracking-wider mb-3">Original Population</h3>
                  <p className="text-[#59636D] leading-relaxed">{selected.population}</p>
                </div>

                {/* Materials Section */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-[#B9955A] uppercase tracking-wider mb-2">Materials</h4>
                    <p className="text-[#59636D]">{selected.material}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-[#B9955A] uppercase tracking-wider mb-2">Technique</h4>
                    <p className="text-[#59636D]">{selected.technique}</p>
                  </div>
                </div>

                {/* Symbolism Section */}
                <div className="bg-[#F7F4EF] rounded-xl p-4 mb-6 border border-[#E8DDC8]">
                  <h3 className="text-sm font-semibold text-[#B9955A] uppercase tracking-wider mb-3">Symbolism</h3>
                  <p className="text-[#59636D] leading-relaxed">{selected.symbolism}</p>
                </div>

                <div className="flex flex-wrap gap-1 mt-4">
                  {selected.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#F7F4EF] text-[#59636D]">#{tag}</span>
                  ))}
                </div>

                <p className="text-[#59636D] leading-relaxed mt-4 mb-6">{selected.desc}</p>

                <button onClick={() => setSelected(null)} className="mt-5 w-full py-2.5 rounded-xl border border-[#E8DDC8] text-[#59636D] text-sm hover:bg-[#F7F4EF] transition-colors">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}