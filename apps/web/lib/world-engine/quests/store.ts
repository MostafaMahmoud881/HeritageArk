'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QUESTS, type Quest } from '@/lib/quests';
import { worldBus } from '../utils/event-bus';

interface QuestProgress {
  questId: string;
  completedSteps: number[];
  completed: boolean;
  completedAt?: number;
  xpEarned: number;
}

interface QuestState {
  progress: Record<string, QuestProgress>;
  activeQuestId: string | null;
  totalXp: number;
  // Actions
  activateQuest: (questId: string) => void;
  completeStep: (questId: string, stepIndex: number) => void;
  getProgress: (questId: string) => QuestProgress;
  getActiveQuest: () => Quest | null;
  allQuests: Quest[];
}

const defaultProgress = (questId: string): QuestProgress => ({
  questId,
  completedSteps: [],
  completed: false,
  xpEarned: 0,
});

export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => ({
      progress: {},
      activeQuestId: null,
      totalXp: 0,
      allQuests: QUESTS,

      activateQuest: (questId) => {
        set({ activeQuestId: questId });
        worldBus.emit('quest:trigger', { questId });
      },

      completeStep: (questId, stepIndex) => {
        const quest = QUESTS.find(q => q.id === questId);
        if (!quest) return;

        set(s => {
          const prev = s.progress[questId] ?? defaultProgress(questId);
          if (prev.completedSteps.includes(stepIndex)) return s;

          const completedSteps = [...prev.completedSteps, stepIndex];
          const allDone = completedSteps.length >= quest.steps.length;
          const xpEarned = allDone && !prev.completed ? quest.xp : prev.xpEarned;

          const updated: QuestProgress = {
            ...prev,
            completedSteps,
            completed: allDone,
            completedAt: allDone ? Date.now() : prev.completedAt,
            xpEarned,
          };

          if (allDone && !prev.completed) {
            worldBus.emit('quest:complete', { questId, xp: quest.xp });
          }

          return {
            progress: { ...s.progress, [questId]: updated },
            totalXp: s.totalXp + (allDone && !prev.completed ? quest.xp : 0),
          };
        });
      },

      getProgress: (questId) => get().progress[questId] ?? defaultProgress(questId),

      getActiveQuest: () => {
        const { activeQuestId } = get();
        return activeQuestId ? (QUESTS.find(q => q.id === activeQuestId) ?? null) : null;
      },
    }),
    { name: 'hv-world-quests' }
  )
);
