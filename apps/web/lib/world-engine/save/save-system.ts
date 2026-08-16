'use client';

import { worldBus } from '../utils/event-bus';

export interface SaveSlot {
  slot: number;
  label: string;
  savedAt: number;
  playerPosition: { x: number; y: number; z: number };
  playerRotation: number;
  inventoryIds: string[];
  questProgress: Record<string, unknown>;
  totalXp: number;
}

const KEY = (slot: number) => `hv-world-save-${slot}`;
const MAX_SLOTS = 3;

export const SaveSystem = {
  save(slot: number, data: Omit<SaveSlot, 'slot' | 'savedAt' | 'label'>, label?: string): void {
    if (typeof window === 'undefined') return;
    const entry: SaveSlot = {
      ...data,
      slot,
      savedAt: Date.now(),
      label: label ?? `Save ${slot} — ${new Date().toLocaleDateString()}`,
    };
    try {
      localStorage.setItem(KEY(slot), JSON.stringify(entry));
      worldBus.emit('save:done', { slot });
    } catch (e) {
      console.warn('[SaveSystem] Failed to save:', e);
    }
  },

  load(slot: number): SaveSlot | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(KEY(slot));
      return raw ? (JSON.parse(raw) as SaveSlot) : null;
    } catch {
      return null;
    }
  },

  listSlots(): (SaveSlot | null)[] {
    return Array.from({ length: MAX_SLOTS }, (_, i) => SaveSystem.load(i + 1));
  },

  delete(slot: number): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEY(slot));
  },
};
