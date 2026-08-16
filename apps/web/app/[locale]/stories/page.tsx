'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@heritageverse/ui';
import { CharacterViewer } from '@/components/Assets/CharacterViewer';
import { speakText, stopSpeaking, pauseSpeaking, resumeSpeaking } from '@/lib/ai';
import { useTranslate } from '@/lib/TranslationProvider';
import { STORYTELLERS, getStoryContent } from '@/lib/storytellers';
import type { StoryTeller } from '@/lib/storytellers';

const CHARACTER_ID_MAP: Record<string, string> = {
  'ibn-battuta': 'ibn-battuta',
  'herodotus': 'ancient-egyptian-child',
  'nefrura': 'ancient-egyptian-child',
  'tamazight': 'amazigh-merchant',
  'khenemet': 'nubian-farmer',
  'marcus': 'roman-soldier',
  'makeda': 'african-queen',
  'fatima': 'ancient-egyptian-child',
};

const TTS_LOCALE: Record<string, string> = {
  Arabic: 'ar-SA',
  English: 'en-US',
  French: 'fr-FR',
  Amazigh: 'en-US',
};

// Map the site locale (e.g. "ar") to a BCP-47 TTS locale used by this page
const SITE_LOCALE_TO_TTS: Record<string, string> = {
  ar: 'ar-SA',
  en: 'en-US',
  fr: 'fr-FR',
  it: 'it-IT',
  ber: 'en-US',
};

// Translate text via the server API (which has access to the AI provider keys).
// The client-side translateText always falls back to English because env keys
// are not available in the browser, so we must go through the API route.
const translationCache = new Map<string, string>();
async function translateViaApi(text: string, targetLang: string): Promise<string> {
  if (!text || targetLang === 'en') return text;
  const cacheKey = `${targetLang}::${text}`;
  const cached = translationCache.get(cacheKey);
  if (cached) return cached;
  try {
    const res = await fetch('/api/ai/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sourceLang: 'en', targetLang }),
    });
    if (!res.ok) return text;
    const data = await res.json();
    const translation = (data.translation || '').trim() || text;
    translationCache.set(cacheKey, translation);
    return translation;
  } catch {
    return text;
  }
}

const VOICE_LANGUAGES = [
  { label: 'English', flag: '🇬🇧', value: 'en-US', lang: 'en' },
  { label: 'العربية', flag: '🇸🇦', value: 'ar-SA', lang: 'ar' },
  { label: 'Français', flag: '🇫🇷', value: 'fr-FR', lang: 'fr' },
  { label: 'Italiano', flag: '🇮🇹', value: 'it-IT', lang: 'it' },
  { label: 'Español', flag: '🇪🇸', value: 'es-ES', lang: 'es' },
  { label: 'Deutsch', flag: '🇩🇪', value: 'de-DE', lang: 'de' },
  { label: 'Amazigh', flag: '🏳️', value: 'en-US', lang: 'ber' },
];

function getTTSLanguage(story: StoryTeller): string {
  const lang = story.languages[0] || 'English';
  return TTS_LOCALE[lang] || 'en-US';
}

function getStoryVisual(story: StoryTeller): string {
  const accent = story.color;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="60%" stop-color="${accent}"/>
        <stop offset="100%" stop-color="#f59e0b"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stop-color="#fff7d6" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#fff7d6" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="960" height="720" fill="url(#bg)"/>
    <circle cx="750" cy="140" r="140" fill="url(#glow)"/>
    <circle cx="180" cy="560" r="220" fill="#ffffff" opacity="0.08"/>
    <circle cx="800" cy="560" r="180" fill="#ffffff" opacity="0.08"/>
    <text x="96" y="130" fill="#ffffff" font-size="28" font-family="serif" opacity="0.78">${story.culture}</text>
    <text x="96" y="210" fill="#ffffff" font-size="68" font-family="serif" font-weight="700">${story.name}</text>
    <text x="96" y="258" fill="#ffffff" font-size="26" font-family="serif" opacity="0.8">${story.title}</text>
    <text x="96" y="610" fill="#ffffff" font-size="170" font-family="serif">${story.emoji}</text>
    <rect x="540" y="388" width="300" height="170" rx="28" fill="#ffffff" opacity="0.14"/>
    <text x="570" y="455" fill="#ffffff" font-size="24" font-family="sans-serif" opacity="0.86">Interactive oral story</text>
    <text x="570" y="492" fill="#ffffff" font-size="20" font-family="sans-serif" opacity="0.72">Choose paths, answer quizzes, and speak with the storyteller.</text>
    <circle cx="820" cy="190" r="18" fill="#fff"/>
    <circle cx="850" cy="230" r="10" fill="#fff" opacity="0.7"/>
    <circle cx="790" cy="245" r="8" fill="#fff" opacity="0.55"/>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function StoriesPage() {
  const { t, locale } = useTranslate();
  const [activeStory, setActiveStory] = useState<StoryTeller | null>(null);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [voiceLanguage, setVoiceLanguage] = useState(SITE_LOCALE_TO_TTS[locale] || 'en-US');
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [displayQuestion, setDisplayQuestion] = useState('');
  const [displayChoices, setDisplayChoices] = useState<string[]>([]);
  const [quizIndex, setQuizIndex] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<'correct' | 'incorrect' | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const segments = activeStory ? getStoryContent(activeStory.id) : [];
  const currentSegment = segments[segmentIndex];

  const reset = useCallback(() => {
    stopSpeaking();
    setActiveStory(null);
    setSegmentIndex(0);
    setPoints(0);
    setIsNarrating(false);
    setIsPaused(false);
    setIsVoiceEnabled(true);
    setVoiceLanguage(SITE_LOCALE_TO_TTS[locale] || 'en-US');
    setShowVoicePicker(false);
    setQuizIndex(null);
    setSelectedAnswer(null);
    setAnswerResult(null);
    setIsComplete(false);
  }, [locale]);

  const advance = useCallback((nextIndex: number) => {
    if (nextIndex >= segments.length) {
      setIsComplete(true);
      return;
    }
    setSelectedAnswer(null);
    setQuizIndex(null);
    setSegmentIndex(nextIndex);
  }, [segments.length]);

  const startStory = useCallback((story: StoryTeller) => {
    stopSpeaking();
    setActiveStory(story);
    setSegmentIndex(0);
    setPoints(0);
    setIsNarrating(false);
    setIsPaused(false);
    setIsVoiceEnabled(true);
    setVoiceLanguage(SITE_LOCALE_TO_TTS[locale] || getTTSLanguage(story));
    setShowVoicePicker(false);
    setQuizIndex(null);
    setSelectedAnswer(null);
    setAnswerResult(null);
    setIsComplete(false);
  }, [locale]);

  // 1. When the segment changes, activate its quiz question (if any)
  useEffect(() => {
    if (!activeStory || !currentSegment) return;
    const qi = currentSegment.quizIndex;
    if (qi !== undefined && qi >= 0 && qi < activeStory.quizQuestions.length) {
      setQuizIndex(qi);
    }
  }, [activeStory, segmentIndex, currentSegment]);

  // 2. Resolve the on-screen text for the current segment in the selected language
  useEffect(() => {
    if (!currentSegment) return;
    let cancelled = false;
    const langCode = voiceLanguage.slice(0, 2);
    const load = async () => {
      if (langCode === 'en') {
        if (!cancelled) setDisplayText(currentSegment.text);
        return;
      }
      const translated = await translateViaApi(currentSegment.text, langCode);
      if (!cancelled) setDisplayText(translated);
    };
    load();
    return () => { cancelled = true; };
  }, [currentSegment, voiceLanguage]);

  // 3. Narrate the resolved (translated) text — not the raw English source
  useEffect(() => {
    if (!activeStory || isComplete || !displayText || !isVoiceEnabled) return;
    let cancelled = false;
    const langCode = voiceLanguage.slice(0, 2);
    setIsNarrating(true);
    void speakText(displayText, langCode, { rate: 1.08 })
      .catch(() => {
        // TTS unavailable, continue silently
      })
      .finally(() => {
        if (!cancelled) setIsNarrating(false);
      });
    return () => {
      cancelled = true;
      stopSpeaking();
    };
  }, [displayText, isVoiceEnabled, isComplete, activeStory, voiceLanguage]);

  // 4. Resolve the quiz question and options in the selected language
  useEffect(() => {
    if (quizIndex === null || !activeStory) {
      setDisplayQuestion('');
      setDisplayChoices([]);
      return;
    }
    const langCode = voiceLanguage.slice(0, 2);
    if (langCode === 'en') {
      setDisplayQuestion('');
      setDisplayChoices([]);
      return;
    }
    let cancelled = false;
    const q = activeStory.quizQuestions[quizIndex];
    if (!q) return;
    const load = async () => {
      const tq = await translateViaApi(q.question, langCode);
      const opts = await Promise.all(q.options.map(opt => translateViaApi(opt, langCode)));
      if (!cancelled) {
        setDisplayQuestion(tq);
        setDisplayChoices(opts);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [quizIndex, voiceLanguage, activeStory]);

  const handleAnswer = useCallback((answerIndex: number) => {
    if (quizIndex === null || selectedAnswer !== null || !activeStory) return;
    setSelectedAnswer(answerIndex);
    const question = activeStory.quizQuestions[quizIndex];
    if (question && answerIndex === question.answer) {
      setPoints(p => p + 10);
      setAnswerResult('correct');
    } else {
      setAnswerResult('incorrect');
    }
  }, [quizIndex, selectedAnswer, activeStory]);

  const handleChoice = useCallback((nextSegment: number) => {
    advance(nextSegment);
  }, [advance]);

  const handleNext = useCallback(() => {
    if (quizIndex !== null && selectedAnswer === null) return;
    setAnswerResult(null);
    advance(segmentIndex + 1);
  }, [quizIndex, selectedAnswer, advance, segmentIndex]);

  const handleStopVoice = useCallback(() => {
    stopSpeaking();
    setIsVoiceEnabled(false);
    setIsNarrating(false);
    setIsPaused(false);
  }, []);

  const handleTogglePause = useCallback(() => {
    if (isPaused) {
      resumeSpeaking();
      setIsPaused(false);
    } else {
      pauseSpeaking();
      setIsPaused(true);
    }
  }, [isPaused]);

  const handleReplay = useCallback(() => {
    if (!currentSegment || !displayText) return;
    stopSpeaking();
    setIsPaused(false);
    const langCode = voiceLanguage.slice(0, 2);
    setIsNarrating(true);
    void speakText(displayText, langCode, { rate: 1.08 }).finally(() => setIsNarrating(false));
  }, [currentSegment, displayText, voiceLanguage]);

  const handleEnableVoice = useCallback(() => {
    setIsVoiceEnabled(true);
    setIsPaused(false);
  }, []);

  if (!activeStory) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-accent/5 to-bg">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-serif text-navy mb-3">{t('stories.pageTitle')}</h1>
            <p className="text-muted max-w-xl mx-auto">
              {t('stories.pageSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STORYTELLERS.map(story => (
              <button
                key={story.id}
                onClick={() => startStory(story)}
                className="group bg-white rounded-2xl border border-border p-6 text-left hover:shadow-card hover:border-accent/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${story.color}20` }}
                  >
                    {story.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted">{story.culture}</span>
                      <span className="text-muted">·</span>
                      <span className="text-xs text-muted">{story.era}</span>
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                        {story.difficulty}
                      </span>
                    </div>
                    <h3 className="text-lg font-serif text-navy group-hover:text-accent transition-colors">
                      {story.name}
                    </h3>
                    <p className="text-xs text-muted/60 italic">{story.title}</p>
                    <p className="text-sm text-muted mt-1 line-clamp-2">{story.storyPreview}</p>
                  </div>
                  <svg className="w-5 h-5 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0 mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isComplete) {
    const totalQuestions = activeStory.quizQuestions.length;
    const totalPossible = totalQuestions * 10;

    return (
      <div className="min-h-screen bg-gradient-to-b from-accent/5 to-bg flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-serif text-navy mb-3">{t('stories.complete')}</h2>
          <p className="text-muted mb-2">{t('stories.finished')} <span className="font-semibold text-navy">{activeStory.name}</span>{t('stories.possesive')} {t('stories.story')}.</p>
          <div className="bg-white rounded-2xl border border-border p-6 shadow-card mb-8 inline-block">
            <p className="text-sm text-muted mb-1">{t('stories.pointsEarned')}</p>
            <p className="text-4xl font-bold text-accent">{points}<span className="text-lg text-muted font-normal">/{totalPossible}</span></p>
            <p className="text-xs text-muted mt-1">{points === totalPossible ? t('stories.perfectScore') : points >= totalPossible / 2 ? t('stories.greatJob') : t('stories.keepExploring')}</p>
          </div>
          <Button variant="primary" onClick={reset}>
            {t('stories.back')}
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = quizIndex !== null ? activeStory.quizQuestions[quizIndex] : undefined;
  const showChoices = currentSegment?.choices && currentSegment.choices.length > 0;
  const showQuiz = quizIndex !== null && selectedAnswer === null;
  const showFeedback = quizIndex !== null && selectedAnswer !== null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/5 to-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-muted hover:text-navy transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7l-7-7 7-7" />
          </svg>
          {t('stories.back')}
        </button>

        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-muted">{activeStory.culture}</span>
          <span className="text-muted">·</span>
          <span className="text-xs text-muted">{activeStory.era}</span>
          <span className="ml-auto text-xs text-muted">
            {t('stories.points')}: {points}
            {isNarrating && (
              <span className="ml-3 inline-flex items-center gap-1 text-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                {t('stories.narrating')}
              </span>
            )}
          </span>
        </div>

        {/* ── Audio Controls Bar ── */}
        <div className="mb-6 rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
            {/* Status indicator */}
            <div className="flex items-center gap-2 min-w-0">
              {isNarrating && !isPaused ? (
                <span className="flex items-center gap-1.5 text-accent text-xs font-medium">
                  <span className="flex gap-0.5">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-0.5 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </span>
                  Narrating
                </span>
              ) : isPaused ? (
                <span className="flex items-center gap-1.5 text-amber-500 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Paused
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-muted text-xs">
                  <span className="w-2 h-2 rounded-full bg-border" />
                  {isVoiceEnabled ? 'Ready' : 'Voice off'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {/* Play/Pause/Stop */}
              {isVoiceEnabled ? (
                <>
                  <button
                    onClick={handleTogglePause}
                    disabled={!isNarrating && !isPaused}
                    title={isPaused ? 'Resume' : 'Pause'}
                    className="w-8 h-8 rounded-full flex items-center justify-center border border-border hover:border-accent/40 hover:bg-accent/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-navy"
                  >
                    {isPaused ? (
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    )}
                  </button>
                  <button
                    onClick={handleReplay}
                    title="Replay"
                    className="w-8 h-8 rounded-full flex items-center justify-center border border-border hover:border-accent/40 hover:bg-accent/5 transition-all text-navy"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  </button>
                  <button
                    onClick={handleStopVoice}
                    title="Stop voice"
                    className="w-8 h-8 rounded-full flex items-center justify-center border border-red-200 hover:bg-red-50 text-red-400 hover:text-red-500 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEnableVoice}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium hover:bg-accent/20 transition-all"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                  Enable voice
                </button>
              )}

              {/* Language picker */}
              <div className="relative">
                <button
                  onClick={() => setShowVoicePicker(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:border-accent/40 bg-white text-xs text-navy transition-all"
                >
                  <span>{VOICE_LANGUAGES.find(l => l.value === voiceLanguage)?.flag ?? '🌐'}</span>
                  <span>{VOICE_LANGUAGES.find(l => l.value === voiceLanguage)?.label ?? 'Language'}</span>
                  <svg className="w-3 h-3 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {showVoicePicker && (
                  <div className="absolute right-0 top-full mt-1 z-30 bg-white border border-border rounded-xl shadow-card overflow-hidden min-w-[160px]">
                    {VOICE_LANGUAGES.map(lang => (
                      <button
                        key={lang.value + lang.lang}
                        onClick={() => {
                          setVoiceLanguage(lang.value);
                          setShowVoicePicker(false);
                          stopSpeaking();
                          setIsNarrating(false);
                          setIsPaused(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-accent/5 transition-colors ${
                          voiceLanguage === lang.value && lang.lang !== 'ber' ? 'bg-accent/8 text-accent font-medium' : 'text-navy'
                        }`}
                      >
                        <span className="text-base">{lang.flag}</span>
                        {lang.label}
                        {voiceLanguage === lang.value && (
                          <svg className="w-3.5 h-3.5 text-accent ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <CharacterViewer
            characterId={CHARACTER_ID_MAP[activeStory.id] || activeStory.id}
            className="lg:sticky lg:top-8"
          />

          <div className="bg-white rounded-2xl border border-border p-8 shadow-card">
            <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-navy/5">
              <img
                src={getStoryVisual(activeStory)}
                alt={`${activeStory.name} story illustration`}
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            <h2 className="text-2xl font-serif text-navy mb-6">{activeStory.name}</h2>

            {currentSegment && (
              <div className={`min-h-[200px] flex flex-col ${currentSegment.speaker === 'child' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[90%] ${currentSegment.speaker === 'child' ? 'bg-accent/5 rounded-2xl rounded-br-sm' : 'bg-bg rounded-2xl rounded-bl-sm'} p-4`}>
                  {currentSegment.speaker === 'child' && (
                    <p className="text-[11px] font-semibold text-accent/70 uppercase tracking-wider mb-1">{t('stories.you')}</p>
                  )}
                  {currentSegment.speaker === 'character' && (
                    <p className="text-[11px] font-semibold text-navy/50 uppercase tracking-wider mb-1">{activeStory.name}</p>
                  )}
                  <p dir="auto" className="text-lg text-navy/80 leading-relaxed">{displayText || currentSegment.text}</p>
                </div>

                {quizIndex !== null && selectedAnswer === null && (
                  <div className="w-full mt-6 pt-6 border-t border-border">
                    <p className="text-xs font-medium text-muted mb-2">Interactive question</p>
                    <p className="text-sm text-navy/70">
                      Answer the question below to earn points and keep the story moving.
                    </p>
                  </div>
                )}

                {showQuiz && currentQuestion && (
                  <div className="w-full mt-6 pt-6 border-t border-border">
                    <p dir="auto" className="font-semibold text-navy mb-3">
                      {displayQuestion || currentQuestion.question}
                    </p>
                    <div className="space-y-2">
                      {currentQuestion.options.map((option, i) => (
                        <button
                          key={i}
                          dir="auto"
                          onClick={() => handleAnswer(i)}
                          className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-navy/80 ${
                            selectedAnswer === i
                              ? i === currentQuestion.answer
                                ? 'border-green-300 bg-green-50'
                                : 'border-red-300 bg-red-50'
                              : 'border-border hover:border-accent hover:bg-accent/5'
                          }`}
                        >
                          <span className="text-xs text-muted mr-2">{String.fromCharCode(65 + i)}.</span>
                          {displayChoices[i] || option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {showFeedback && currentQuestion && (
                  <div className="w-full mt-6 pt-6 border-t border-border">
                    <div className={`p-4 rounded-xl ${answerResult === 'correct' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <p className={`font-semibold ${answerResult === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
                        {answerResult === 'correct' ? t('common.correct') : t('common.incorrect')}
                      </p>
                      <p className="text-sm text-navy/70 mt-1">
                        {answerResult === 'correct'
                          ? `+10 ${t('stories.points')}!`
                          : `${t('stories.answerWas')}: ${currentQuestion.options[currentQuestion.answer]}`}
                      </p>
                    </div>
                  </div>
                )}

                {showChoices && (
                  <div className="w-full mt-6 pt-6 border-t border-border">
                    <p className="text-xs text-muted font-medium mb-3">{t('stories.whatNext')}</p>
                    <div className="space-y-2">
                      {currentSegment.choices!.map((choice, i) => (
                        <button
                          key={i}
                          onClick={() => handleChoice(choice.nextSegment)}
                          className="w-full text-left px-4 py-3 rounded-xl bg-accent/5 border border-accent/20 hover:bg-accent/10 hover:border-accent/40 transition-all text-navy"
                        >
                          {choice.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <div className="flex gap-1">
                {segments.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === segmentIndex ? 'bg-accent' : 'bg-border'
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                {(showQuiz || showChoices) ? null : (
                  showFeedback ? (
                    <Button variant="primary" size="sm" onClick={handleNext}>
                      {segmentIndex < segments.length - 1 ? t('common.continue') : t('common.finish')}
                    </Button>
                  ) : (
                    <Button variant="primary" size="sm" onClick={handleNext}>
                      {isNarrating ? t('stories.listening') : segmentIndex < segments.length - 1 ? t('common.continue') : t('common.finish')}
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
