'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ARTIFACTS } from '@/lib/data';
import { Badge, Button } from '@heritageverse/ui';
import { speakText, stopSpeaking } from '@/lib/ai';

const STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'danger'> = {
  Preserved: 'success',
  Restored: 'warning',
  Critical: 'danger',
};

const NARRATION_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'ar', label: 'Arabic' },
  { code: 'de', label: 'German' },
  { code: 'zh', label: 'Chinese' },
];

export default function ArtifactDetailPage() {
  const params = useParams();
  const artifact = ARTIFACTS.find((a) => a.id === params.id);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [narrationLang, setNarrationLang] = useState('en');
  const [isDragging, setIsDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef<number | null>(null);

  const descText = artifact?.desc || '';

  const startAutoRotate = useCallback(() => {
    if (autoRotateRef.current) return;
    let angle = 0;
    const step = () => {
      if (!isDragging) {
        angle += 0.3;
        setRotateY(angle);
      }
      autoRotateRef.current = requestAnimationFrame(step);
    };
    autoRotateRef.current = requestAnimationFrame(step);
  }, [isDragging]);

  const stopAutoRotate = useCallback(() => {
    if (autoRotateRef.current) {
      cancelAnimationFrame(autoRotateRef.current);
      autoRotateRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoRotate();
    return stopAutoRotate;
  }, [startAutoRotate, stopAutoRotate]);

  useEffect(() => {
    if (!isDragging) startAutoRotate();
    else stopAutoRotate();
  }, [isDragging, startAutoRotate, stopAutoRotate]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    setRotateY((prev) => prev + dx * 0.5);
    setRotateX((prev) => Math.max(-30, Math.min(30, prev - dy * 0.5)));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const speak = async () => {
    if (!descText) return;
    stopSpeaking();
    setIsSpeaking(true);
    try {
      await speakText(descText, narrationLang);
    } catch {
      // fallback handled by speakText
    }
    setIsSpeaking(false);
  };

  const stopSpeak = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  if (!artifact) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl">🔍</span>
          <h1 className="text-2xl font-serif text-white mt-4">Artifact Not Found</h1>
          <Link href="/museum" className="inline-block mt-6 text-accent hover:text-accent/80 transition-colors">
            &larr; Back to Museum
          </Link>
        </div>
      </div>
    );
  }

  const related = ARTIFACTS.filter(
    (a) => a.id !== artifact.id && a.culture === artifact.culture
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy via-navy2 to-navy">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/museum"
          className="inline-flex items-center gap-2 text-white/50 hover:text-accent transition-colors text-sm mb-8"
        >
          &larr; Back to Museum
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div
            className="relative cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ perspective: '1200px' }}
          >
            <div
              className="aspect-square rounded-2xl bg-gradient-to-br from-navy2 to-navy border border-white/10 flex items-center justify-center overflow-hidden select-none"
              style={{
                transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                transformStyle: 'preserve-3d',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
            >
              <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent"
                style={{ transform: 'translateZ(20px)' }}
              />
              <span
                className="relative text-9xl md:text-[12rem]"
                style={{ transform: 'translateZ(40px)' }}
              >
                {artifact.emoji}
              </span>
              <div
                className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/30"
                style={{ transform: 'translateZ(30px)' }}
              >
                {isDragging ? 'Release to auto-rotate' : 'Drag to explore'}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge variant={STATUS_VARIANTS[artifact.status] || 'muted'} size="md">
                  {artifact.status}
                </Badge>
                <span className="text-white/40 text-sm">{artifact.culture}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif text-white">{artifact.name}</h1>
              <p className="text-accent text-lg mt-2">{artifact.period}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Culture', value: artifact.culture },
                { label: 'Period', value: artifact.period },
                { label: 'Location', value: artifact.loc },
                { label: 'Material', value: artifact.material },
                { label: 'Dimensions', value: artifact.dims },
                { label: 'Museum', value: artifact.museum },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <p className="text-xs text-white/40 uppercase tracking-wider">{item.label}</p>
                  <p className="text-white font-medium mt-1">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-sm text-accent font-semibold tracking-widest uppercase mb-3">Description</h2>
              <p className="text-white/70 leading-relaxed">{artifact.desc}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-sm text-accent font-semibold tracking-widest uppercase mb-4">
                Audio Narration
              </h2>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Button
                  variant={isSpeaking ? 'danger' : 'primary'}
                  size="sm"
                  onClick={isSpeaking ? stopSpeak : speak}
                >
                  {isSpeaking ? 'Stop' : 'Listen'}
                </Button>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-white/40">Language:</label>
                  <select
                    value={narrationLang}
                    onChange={(e) => {
                      setNarrationLang(e.target.value);
                      if (isSpeaking) {
                        stopSpeaking();
                        setIsSpeaking(false);
                      }
                    }}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-accent"
                  >
                    {NARRATION_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code} className="text-navy">
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-xs text-white/30">
                Your browser&apos;s built-in text-to-speech will read the artifact description aloud.
                Different languages may sound different based on available system voices.
              </p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-serif text-white mb-8">
              Related Artifacts from {artifact.culture}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/museum/${r.id}`}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 hover:border-accent/30 transition-all duration-500 hover:translate-y-[-4px]"
                >
                  <div className="aspect-square flex items-center justify-center text-5xl bg-gradient-to-br from-navy2 to-navy relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative z-10 group-hover:scale-110 transition-transform duration-500">
                      {r.emoji}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif text-white group-hover:text-accent transition-colors">
                      {r.name}
                    </h3>
                    <p className="text-xs text-white/40 mt-1">{r.period}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
