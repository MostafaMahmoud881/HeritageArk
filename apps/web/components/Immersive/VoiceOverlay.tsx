'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { generateSpeech, speakWithBrowser, detectLanguage, SupportedLanguage, splitIntoSentences } from '@/lib/ai/voice-engine';

interface VoiceOverlayProps {
  text?: string;
  language?: string;
  autoPlay?: boolean;
  onSentence?: (sentence: string, index: number) => void;
  onComplete?: () => void;
  className?: string;
  showDiagnostics?: boolean;
}

export function VoiceOverlay({
  text,
  language,
  autoPlay = false,
  onSentence,
  onComplete,
  className = '',
  showDiagnostics = false,
}: VoiceOverlayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [provider, setProvider] = useState<string>('idle');
  const [cacheHit, setCacheHit] = useState(false);
  const [genTime, setGenTime] = useState(0);
  const [detectedLang, setDetectedLang] = useState<SupportedLanguage>('en');
  const [currentSentence, setCurrentSentence] = useState(-1);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [supported, setSupported] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const browserControlsRef = useRef<{ pause: () => void; resume: () => void; stop: () => void; isPlaying: () => boolean } | null>(null);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && ('speechSynthesis' in window || 'Audio' in window));
  }, []);

  // Auto-play when text changes
  useEffect(() => {
    if (autoPlay && text) {
      handlePlay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const handlePlay = useCallback(async () => {
    if (!text) return;

    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    browserControlsRef.current?.stop();

    const lang = (language as SupportedLanguage) || detectLanguage(text);
    setDetectedLang(lang);
    setIsPlaying(true);
    setIsPaused(false);
    setCurrentSentence(-1);

    // Try server-side TTS first
    const startMs = Date.now();
    const result = await generateSpeech(text, lang);
    const elapsed = Date.now() - startMs;

    setProvider(result.provider);
    setCacheHit(result.cached);
    setGenTime(elapsed);

    if (result.url) {
      // Server-generated audio
      setAudioUrl(result.url);
      const audio = new Audio(result.url);
      audioRef.current = audio;
      audio.playbackRate = speed;
      audio.volume = volume;

      audio.onended = () => {
        setIsPlaying(false);
        onComplete?.();
      };

      audio.onerror = () => {
        // Fallback to browser TTS
        fallbackToBrowser();
      };

      await audio.play();
    } else {
      // Fallback to browser TTS
      fallbackToBrowser();
    }
  }, [text, language, speed, volume, onComplete]);

  const fallbackToBrowser = useCallback(() => {
    if (!text) return;
    setProvider('browser');

    const controls = speakWithBrowser(text, detectedLang, {
      rate: speed,
      volume,
      onStart: () => setIsPlaying(true),
      onEnd: () => {
        setIsPlaying(false);
        onComplete?.();
      },
      onSentence: (sentence, index) => {
        setCurrentSentence(index);
        onSentence?.(sentence, index);
      },
    });

    browserControlsRef.current = controls;
  }, [text, detectedLang, speed, volume, onComplete, onSentence]);

  const handlePause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPaused(true);
    }
    browserControlsRef.current?.pause();
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    if (audioRef.current && isPaused) {
      audioRef.current.play();
      setIsPaused(false);
    }
    browserControlsRef.current?.resume();
    setIsPaused(false);
  }, [isPaused]);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    browserControlsRef.current?.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSentence(-1);
  }, []);

  const handleReplay = useCallback(() => {
    handleStop();
    setTimeout(() => handlePlay(), 100);
  }, [handleStop, handlePlay]);

  const handleSpeedChange = useCallback(() => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5];
    const idx = speeds.indexOf(speed);
    const next = speeds[(idx + 1) % speeds.length] ?? 1;
    setSpeed(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    }
  }, [speed]);

  if (!supported) return null;

  const sentences = text ? splitIntoSentences(text) : [];

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Controls */}
      <div className="flex items-center gap-1.5">
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            disabled={!text}
            className="p-2 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-all disabled:opacity-30"
            title="Play"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        ) : isPaused ? (
          <button
            onClick={handleResume}
            className="p-2 rounded-xl bg-accent text-white hover:bg-accent/90 transition-all"
            title="Resume"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="p-2 rounded-xl bg-accent text-white animate-pulse"
            title="Pause"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          </button>
        )}

        <button
          onClick={handleStop}
          disabled={!isPlaying}
          className="p-2 rounded-xl bg-bg text-muted hover:text-navy transition-all disabled:opacity-30"
          title="Stop"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
        </button>

        <button
          onClick={handleReplay}
          disabled={!text}
          className="p-2 rounded-xl bg-bg text-muted hover:text-navy transition-all disabled:opacity-30"
          title="Replay"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <button
          onClick={handleSpeedChange}
          className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
            speed !== 1 ? 'bg-accent text-white' : 'bg-bg text-muted hover:text-navy'
          }`}
          title="Speed"
        >
          {speed}x
        </button>

        <span className={`text-xs ${isPlaying ? 'text-accent' : 'text-muted'}`}>
          {isPlaying ? (isPaused ? 'Paused' : 'Playing') : 'Voice'}
        </span>
      </div>

      {/* Teacher Mode: Sentence Highlighting */}
      {sentences.length > 1 && isPlaying && (
        <div className="bg-bg rounded-xl p-3 max-h-32 overflow-y-auto text-xs leading-relaxed space-y-1">
          {sentences.map((sentence, i) => (
            <p
              key={i}
              className={`transition-colors ${
                i === currentSentence
                  ? 'text-accent font-medium bg-accent/5 rounded px-1'
                  : i < currentSentence
                    ? 'text-navy/40'
                    : 'text-navy/70'
              }`}
            >
              {sentence}
            </p>
          ))}
        </div>
      )}

      {/* Diagnostics */}
      {showDiagnostics && (
        <div className="bg-black/90 text-green-400 font-mono text-[10px] p-2 rounded-lg space-y-0.5">
          <p>provider: {provider}</p>
          <p>cache: {cacheHit ? 'HIT' : 'MISS'}</p>
          <p>genTime: {genTime}ms</p>
          <p>lang: {detectedLang}</p>
          <p>speed: {speed}x</p>
          {audioUrl && <p className="break-all">url: {audioUrl.slice(0, 60)}…</p>}
        </div>
      )}
    </div>
  );
}