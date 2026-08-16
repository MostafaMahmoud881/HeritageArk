'use client';

import { useState } from 'react';
import { Badge } from '@heritageverse/ui';
import { UserAvatar } from '@/lib/immersive-stories/avatar-store';
import { QUESTS } from '@/lib/quests';

interface QuestTrackerProps {
  avatar: UserAvatar;
  activeQuestId?: string;
  onQuestComplete?: (questId: string) => void;
}

export function QuestTracker({ avatar, activeQuestId, onQuestComplete }: QuestTrackerProps) {
  const [expanded, setExpanded] = useState(false);
  const activeQuest = activeQuestId ? QUESTS.find(q => q.id === activeQuestId) : null;

  return (
    <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-bg/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <span className="font-medium text-navy text-sm">Quests</span>
          {avatar.xp > 0 && (
            <Badge variant="accent" size="sm">{avatar.xp} XP</Badge>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 animate-slide-up">
          {/* Active Quest */}
          {activeQuest && (
            <div className="bg-accent/5 rounded-xl p-3 border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <span>{activeQuest.emoji}</span>
                <span className="font-medium text-navy text-sm">{activeQuest.title}</span>
                <Badge variant="accent" size="sm">+{activeQuest.xp} XP</Badge>
              </div>
              <p className="text-xs text-muted mb-2">{activeQuest.description}</p>
              <div className="space-y-1">
                {activeQuest.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-navy/70">
                    <span>{step.emoji}</span>
                    <span>{step.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges */}
          {avatar.badges.length > 0 && (
            <div>
              <p className="text-xs text-muted font-medium mb-2">Badges Earned</p>
              <div className="flex gap-1.5 flex-wrap">
                {avatar.badges.map((badge, i) => (
                  <Badge key={i} variant="accent" size="sm">{badge}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Heritage Passport */}
          {avatar.passport.length > 0 && (
            <div>
              <p className="text-xs text-muted font-medium mb-2">Heritage Passport</p>
              <div className="space-y-1.5">
                {avatar.passport.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-navy/70 bg-bg rounded-lg p-2">
                    <span>🌍</span>
                    <span className="flex-1">{entry.storyTitle}</span>
                    <span className="text-muted">{entry.culture}</span>
                    <Badge variant="muted" size="sm">+{entry.xpEarned} XP</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!activeQuest && avatar.badges.length === 0 && avatar.passport.length === 0 && (
            <p className="text-xs text-muted text-center py-4">
              Complete stories to earn XP, badges, and passport stamps!
            </p>
          )}
        </div>
      )}
    </div>
  );
}