'use client';

import { useState, useEffect, useRef } from 'react';
import type { StoryCharacter, CharacterExpression } from '@heritageverse/types';
import { getCharacterById, getCharacters } from '@/lib/assets/asset-manager';
import { speakText, stopSpeaking } from '@/lib/ai';
import { useTranslate } from '@/lib/TranslationProvider';

interface CharacterViewerProps {
  characterId?: string;
  character?: StoryCharacter;
  onSpeak?: (text: string) => void;
  autoNarrate?: boolean;
  className?: string;
  narrateTexts?: string[];
}

export function CharacterViewer({
  characterId,
  character: propChar,
  onSpeak,
  autoNarrate = false,
  className = '',
  narrateTexts,
}: CharacterViewerProps) {
  const { t } = useTranslate();
  const [char, setChar] = useState<StoryCharacter | undefined>(propChar);
  const [expression, setExpression] = useState<CharacterExpression | undefined>();
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [allChars, setAllChars] = useState<StoryCharacter[]>([]);

  useEffect(() => {
    if (characterId && !propChar) {
      getCharacterById(characterId).then(setChar);
    }
    getCharacters().then(setAllChars);
  }, [characterId, propChar]);

  useEffect(() => {
    if (char && char.expressions.length > 0) {
      const def = char.expressions.find(e => e.id === char.defaultExpression) || char.expressions[0];
      setExpression(def);
    }
  }, [char]);

  useEffect(() => {
    if (!narrateTexts || narrateTexts.length === 0 || !autoNarrate) return;
    let cancelled = false;
    (async () => {
      for (const text of narrateTexts) {
        if (cancelled) break;
        try {
          await speakText(text, 'en-US');
        } catch {
          break;
        }
      }
    })();
    return () => { cancelled = true; stopSpeaking(); };
  }, [narrateTexts, autoNarrate]);

  if (!char) {
    return (
      <div className={`flex items-center justify-center bg-navy/5 rounded-2xl border border-border p-8 ${className}`}>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <p className="text-navy font-medium">{t('character.select')}</p>
          <p className="text-muted text-sm mt-1">{t('character.choose')}</p>
        </div>
      </div>
    );
  }

  const setEmotion = (emotion: string) => {
    const expr = char.expressions.find(e => e.emotion === emotion || e.id === emotion);
    if (expr) {
      setIsAnimating(true);
      setExpression(expr);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const showSpeech = (text: string) => {
    setSpeechBubble(text);
    if (onSpeak) onSpeak(text);
    if (autoNarrate) {
      speakText(text, 'en-US');
    }
    setTimeout(() => setSpeechBubble(null), 5000);
  };

  const speechBubbleStyles = {
    rounded: 'rounded-2xl',
    square: 'rounded-lg',
    thought: 'rounded-3xl border-dashed',
    whisper: 'rounded-xl italic text-sm opacity-80',
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="relative">
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl bg-gradient-to-b from-accent/10 to-navy/5 overflow-hidden border border-border">
          {expression?.imageUrl ? (
            <img
              src={expression.imageUrl}
              alt={char.name}
              className={`w-full h-full object-cover transition-transform duration-300 ${isAnimating ? 'scale-105' : 'scale-100'}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-2">
                  <span className="text-accent text-2xl font-bold">{char.name.charAt(0)}</span>
                </div>
                <p className="text-navy font-medium text-sm">{char.name}</p>
                <p className="text-muted text-xs">{char.culture}</p>
              </div>
            </div>
          )}
        </div>

        {speechBubble && (
          <div className={`absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full bg-white shadow-lg border border-border p-3 max-w-[200px] ${speechBubbleStyles[char.speechBubbleStyle || 'rounded']}`}>
            <p className="text-sm text-navy">{speechBubble}</p>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-border rotate-45" />
          </div>
        )}
      </div>

      <div className="text-center">
        <h3 className="text-lg font-serif text-navy">{char.name}</h3>
        <p className="text-sm text-muted">{char.culture} · {char.era}</p>
        {char.bio && (
          <p className="text-xs text-muted/70 mt-1 max-w-xs">{char.bio}</p>
        )}
      </div>

      <div className="flex gap-1.5">
        {char.expressions.map(expr => (
          <button
            key={expr.id}
            onClick={() => setEmotion(expr.id)}
            className={`p-2 rounded-lg transition-all ${
              expression?.id === expr.id
                ? 'bg-accent/15 ring-2 ring-accent'
                : 'bg-bg hover:bg-accent/5 border border-border'
            }`}
            title={expr.name}
          >
            {expr.imageUrl ? (
              <img src={expr.imageUrl} alt={expr.name} className="w-8 h-8 rounded" />
            ) : (
              <span className="text-sm">
                {expr.emotion === 'neutral' ? '😐' : expr.emotion === 'happy' ? '😊' : expr.emotion === 'sad' ? '😢' : expr.emotion === 'angry' ? '😠' : expr.emotion === 'surprised' ? '😮' : expr.emotion === 'thinking' ? '🤔' : expr.emotion === 'excited' ? '🤩' : '😨'}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => showSpeech(`${t('common.hello')}! ${t('common.iAm')} ${char.name}. ${t('character.welcome')}`)}
          className="px-4 py-2 bg-accent text-navy text-sm font-semibold rounded-xl hover:bg-accent/90 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            {t('common.speak')}
          </span>
        </button>
      </div>

      {allChars.length > 1 && (
        <div className="w-full pt-4 border-t border-border">
          <p className="text-xs text-muted font-medium mb-2">{t('character.switch')}</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allChars.filter(c => c.id !== char.id).map(c => (
              <button
                key={c.id}
                onClick={() => setChar(c)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg border border-border hover:border-accent/30 transition-colors shrink-0"
              >
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                  {c.name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium text-navy">{c.name}</p>
                  <p className="text-[10px] text-muted">{c.culture}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
