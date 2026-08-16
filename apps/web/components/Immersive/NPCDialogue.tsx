'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@heritageverse/ui';
import { speakText, stopSpeaking } from '@/lib/ai';

interface NPCDialogueProps {
  npcName: string;
  npcCulture: string;
  dialogue: string;
  onReply?: (message: string) => void;
  onComplete?: () => void;
  autoSpeak?: boolean;
  suggestions?: string[];
  language?: string;
}

export function NPCDialogue({
  npcName,
  npcCulture,
  dialogue,
  onReply,
  onComplete,
  autoSpeak = true,
  suggestions = ['Tell me more!', 'Why is this important?', 'What happens next?', 'How do you know this?'],
  language = 'en',
}: NPCDialogueProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');

  const handleSpeak = useCallback(async () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    try {
      await speakText(dialogue, language);
    } catch {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(dialogue);
        utterance.lang = language;
        utterance.rate = 0.9;
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
      }
    }
    setIsSpeaking(false);
  }, [dialogue, isSpeaking, language]);

  const handleAskQuestion = useCallback(() => {
    if (!customQuestion.trim()) return;
    onReply?.(customQuestion);
    setCustomQuestion('');
    setShowReply(false);
  }, [customQuestion, onReply]);

  useEffect(() => {
    if (autoSpeak && dialogue) {
      handleSpeak();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogue, language]);

  return (
    <div className="bg-white rounded-2xl border border-border shadow-card p-4">
      {/* NPC Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">
          {npcName.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-navy text-sm">{npcName}</p>
          <p className="text-xs text-muted">{npcCulture}</p>
        </div>
        <button
          onClick={handleSpeak}
          className="ml-auto p-2 rounded-lg hover:bg-accent/10 transition-colors"
          title={isSpeaking ? 'Stop' : 'Listen'}
        >
          <svg className="w-5 h-5 text-muted hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            {isSpeaking ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5.25 5.25 0 010-7.07m7.072 0a5.25 5.25 0 010 7.07M12 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            )}
          </svg>
        </button>
      </div>

      {/* Dialogue Bubble */}
      <div className="bg-bg rounded-xl p-4 mb-3">
        <p className="text-navy text-sm leading-relaxed">{dialogue}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowReply(!showReply)}
        >
          Reply
        </Button>
        <Button variant="outline" size="sm" onClick={onComplete}>
          Continue
        </Button>
      </div>

      {/* Custom Question Input — only shown when Reply is clicked */}
      {showReply && (
        <div className="mt-3 pt-3 border-t border-border animate-slide-up">
          <div className="flex gap-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder={`Ask ${npcName} a question...`}
              className="flex-1 bg-bg border border-border rounded-xl px-3 py-2 text-sm text-navy placeholder-muted/50 focus:outline-none focus:border-accent"
              onKeyDown={(e) => { if (e.key === 'Enter') handleAskQuestion(); }}
            />
            <Button variant="primary" size="sm" onClick={handleAskQuestion} disabled={!customQuestion.trim()}>
              Ask
            </Button>
          </div>
          <div className="mt-2 flex gap-1.5 flex-wrap">
            {suggestions.map(suggestion => (
              <button
                key={suggestion}
                onClick={() => {
                  setCustomQuestion(suggestion);
                  onReply?.(suggestion);
                }}
                className="text-xs px-2 py-1 rounded-lg bg-accent/5 text-accent hover:bg-accent/10 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
