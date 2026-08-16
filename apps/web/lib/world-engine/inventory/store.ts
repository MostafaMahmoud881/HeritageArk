'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { worldBus } from '../utils/event-bus';

export interface InventoryItem {
  id: string;
  name: string;
  culture: string;
  emoji: string;
  description?: string;
  /** Links to existing HeritageArk artifact id */
  hvArtifactId?: string;
  collectedAt: number;
}

interface InventoryState {
  items: InventoryItem[];
  collect: (item: Omit<InventoryItem, 'collectedAt'>) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: [],

      collect: (item) => {
        if (get().has(item.id)) return;
        const full: InventoryItem = { ...item, collectedAt: Date.now() };
        set(s => ({ items: [...s.items, full] }));
        worldBus.emit('inventory:collect', { itemId: item.id, itemName: item.name });
      },

      remove: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),

      has: (id) => get().items.some(i => i.id === id),

      clear: () => set({ items: [] }),
    }),
    { name: 'hv-inventory' }
  )
);
