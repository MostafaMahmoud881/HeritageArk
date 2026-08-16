'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@heritageverse/ui';
import { QUESTS, type Quest } from '@/lib/quests';

const XP_BG_COLORS = [
  '#FEF3C7',
  '#DBEAFE',
  '#D1FAE5',
  '#FCE7F3',
  '#E0E7FF',
  '#FEE2E2',
  '#EDE9FE',
  '#FEF9C3',
];

const XP_TEXT_COLORS = [
  '#D97706',
  '#2563EB',
  '#059669',
  '#DB2777',
  '#4F46E5',
  '#DC2626',
  '#7C3AED',
  '#CA8A04',
];

function useQuestProgress() {
  const [progress, setProgress] = useState<Record<string, { done: boolean[]; badgeEarned: boolean }>>({});
  const [totalXp, setTotalXp] = useState(0);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('hv_quest_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProgress(parsed.progress || {});
        setTotalXp(parsed.totalXp || 0);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (Object.keys(progress).length > 0 || totalXp > 0) {
      localStorage.setItem('hv_quest_progress', JSON.stringify({ progress, totalXp }));
    }
  }, [progress, totalXp]);

  const toggleStep = useCallback((questId: string, stepIdx: number) => {
    setProgress(prev => {
      const quest = prev[questId] || { done: [], badgeEarned: false };
      const newDone = [...quest.done];
      newDone[stepIdx] = !newDone[stepIdx];
      const allDone = QUESTS.find(q => q.id === questId)?.steps.every((_, i) => newDone[i]) || false;
      const wasEarned = quest.badgeEarned;
      const badgeEarned = allDone || wasEarned;
      if (allDone && !wasEarned) {
        setJustCompleted(questId);
        setTimeout(() => setJustCompleted(null), 4000);
        const questXp = QUESTS.find(q => q.id === questId)?.xp || 0;
        setTotalXp(prevXp => prevXp + questXp);
      }
      return { ...prev, [questId]: { done: newDone, badgeEarned } };
    });
  }, []);

  return { progress, totalXp, toggleStep, justCompleted, setJustCompleted };
}

function CelebrationOverlay({ quest, onClose }: { quest: Quest; onClose: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%)' }} />
      <div className="text-center animate-slide-up relative">
        <div className="text-7xl mb-4 animate-bounce">{quest.badge}</div>
        <div className="bg-white rounded-2xl p-6 shadow-2xl pointer-events-auto mx-4">
          <h2 className="text-2xl font-bold text-navy mb-1">Quest Complete!</h2>
          <p className="text-muted mb-2">{quest.title}</p>
          <div className="text-3xl font-bold text-success">+{quest.xp} XP</div>
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-2xl" style={{
                animation: `starPop 0.5s ease ${i * 0.2}s both`,
              }}>⭐</span>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes starPop {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function QuestCard({
  quest,
  progress,
  onToggleStep,
  xpColor,
  xpBg,
}: {
  quest: Quest;
  progress: { done: boolean[]; badgeEarned: boolean };
  onToggleStep: (stepIdx: number) => void;
  xpColor: string;
  xpBg: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const doneCount = progress.done.filter(Boolean).length;
  const totalSteps = quest.steps.length;
  const percent = totalSteps > 0 ? Math.round((doneCount / totalSteps) * 100) : 0;
  const completed = percent >= 100;

  return (
    <div
      className="rounded-2xl transition-all duration-300 overflow-hidden"
      style={{
        backgroundColor: '#FFFFFF',
        border: `2px solid ${completed ? '#059669' : '#E8E2D9'}`,
        boxShadow: completed ? '0 0 20px rgba(5, 150, 105, 0.15)' : '0 4px 16px rgba(0,0,0,0.06)',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5"
      >
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ backgroundColor: xpBg }}
          >
            {quest.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-navy text-lg">{quest.title}</h3>
              {completed && <span className="text-sm">✅</span>}
              {progress.badgeEarned && (
                <span className="text-lg">{quest.badge}</span>
              )}
            </div>
            <p className="text-sm text-muted mt-0.5">{quest.description}</p>
            {quest.region && (
              <p className="text-xs text-muted mt-0.5">📍 {quest.region}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="font-bold text-lg" style={{ color: xpColor }}>+{quest.xp}</div>
            <div className="text-xs text-muted">XP</div>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percent}%`,
                  backgroundColor: completed ? '#059669' : xpColor,
                }}
              />
            </div>
            <span className="text-xs font-medium text-muted shrink-0">{doneCount}/{totalSteps}</span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted">
          <span>{expanded ? '▼' : '▶'} </span>
          <span>{expanded ? 'Hide steps' : 'Show steps'}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border animate-slide-up" style={{ animationDuration: '0.2s' }}>
          <div className="pt-4 space-y-2">
            {quest.steps.map((step, idx) => (
              <label
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors hover:bg-bg"
                style={{
                  backgroundColor: progress.done[idx] ? '#D1FAE5' : '#F9FAFB',
                }}
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    backgroundColor: progress.done[idx] ? '#059669' : '#E8E2D9',
                    color: progress.done[idx] ? 'white' : 'transparent',
                  }}
                >
                  {progress.done[idx] && '✓'}
                </div>
                <input
                  type="checkbox"
                  checked={!!progress.done[idx]}
                  onChange={() => onToggleStep(idx)}
                  className="sr-only"
                />
                <span className="text-2xl shrink-0">{step.emoji}</span>
                <span className="text-sm text-navy flex-1">{step.description}</span>
              </label>
            ))}
          </div>
          {completed && !progress.badgeEarned && (
            <div className="mt-3 p-3 rounded-xl text-center font-bold animate-pulse" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              🎉 All steps complete! Badge earned!
            </div>
          )}
          {completed && progress.badgeEarned && (
            <div className="mt-3 p-3 rounded-xl text-center font-bold" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
              {quest.badge} Badge Earned! +{quest.xp} XP
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function QuestsPage() {
  const { progress, totalXp, toggleStep, justCompleted, setJustCompleted } = useQuestProgress();
  const [showPassport, setShowPassport] = useState(false);

  const earnedBadges = QUESTS.filter(q => progress[q.id]?.badgeEarned);
  const completedQuests = QUESTS.filter(q => {
    const p = progress[q.id];
    return p && p.done.filter(Boolean).length === q.steps.length;
  });

  return (
    <div className="pt-24 pb-16 min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      {justCompleted && (
        <CelebrationOverlay
          quest={QUESTS.find(q => q.id === justCompleted)!}
          onClose={() => setJustCompleted(null)}
        />
      )}

      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <span className="text-sm font-semibold tracking-widest uppercase" style={{ color: '#7C3AED' }}>
              🎮 Gamified Learning
            </span>
            <h1 className="text-4xl font-serif text-navy mt-1">Heritage Quests</h1>
            <p className="text-muted mt-2 max-w-xl">
              Complete missions, earn badges, and collect XP as you explore world heritage!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="px-5 py-3 rounded-xl text-center"
              style={{
                background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                border: '1px solid #F59E0B',
              }}
            >
              <div className="text-2xl font-bold" style={{ color: '#D97706' }}>{totalXp}</div>
              <div className="text-xs font-medium" style={{ color: '#92400E' }}>Total XP</div>
            </div>
            <Button
              onClick={() => setShowPassport(!showPassport)}
              variant={showPassport ? 'primary' : 'outline'}
              size="md"
            >
              {showPassport ? 'Hide Passport' : '📕 Passport'}
            </Button>
          </div>
        </div>

        {showPassport && (
          <div className="mb-8 p-6 rounded-2xl animate-slide-up" style={{ backgroundColor: '#FFFFFF', border: '2px solid #E8E2D9', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📕</span>
              <h2 className="text-xl font-bold text-navy">Heritage Passport</h2>
              <span className="text-sm text-muted">({earnedBadges.length}/{QUESTS.length} badges)</span>
            </div>
            {earnedBadges.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-5xl block mb-3">🗺️</span>
                <p className="text-muted">No badges yet! Start completing quests to fill your passport.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {earnedBadges.map((quest) => (
                  <div
                    key={quest.id}
                    className="p-3 rounded-xl text-center animate-slide-up"
                    style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}
                  >
                    <div className="text-3xl mb-1">{quest.badge}</div>
                    <div className="text-xs font-bold text-navy truncate">{quest.title}</div>
                    <div className="text-xs" style={{ color: '#D97706' }}>+{quest.xp} XP</div>
                  </div>
                ))}
              </div>
            )}
            {completedQuests.length > 0 && completedQuests.length < QUESTS.length && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-sm text-muted">
                  Progress: {completedQuests.length}/{QUESTS.length} quests completed
                </div>
                <div className="mt-2 h-2 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(completedQuests.length / QUESTS.length) * 100}%`,
                      backgroundColor: '#D4A373',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          {QUESTS.map((quest, idx) => {
            const p = progress[quest.id] || { done: [], badgeEarned: false };
            return (
              <QuestCard
                key={quest.id}
                quest={quest}
                progress={p}
                onToggleStep={(stepIdx) => toggleStep(quest.id, stepIdx)}
                xpColor={XP_TEXT_COLORS[idx % XP_TEXT_COLORS.length]!}
                xpBg={XP_BG_COLORS[idx % XP_BG_COLORS.length]!}
              />
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm" style={{ backgroundColor: '#E8E2D9', color: '#6B7280' }}>
            🏆 Complete all quests to earn the Heritage Master badge
          </div>
        </div>
      </div>
    </div>
  );
}
