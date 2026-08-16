/**
 * World Engine — Event Bus
 * Replaces window.HV / global mutable state with a typed pub/sub singleton.
 * Safe to import on server (no window access at module level).
 */

type Handler<T = unknown> = (payload: T) => void;

export type WorldEventMap = {
  // Navigation
  'world:enter': { zoneId: string };
  'world:exit': { zoneId: string };
  // NPC
  'npc:approach': { npcId: string; distance: number };
  'npc:interact': { npcId: string };
  'npc:leave': { npcId: string };
  // Dialogue
  'dialogue:open': { npcId: string; storyId?: string };
  'dialogue:close': { npcId: string };
  'dialogue:reply': { npcId: string; message: string };
  // Museum
  'museum:open': { exhibitId?: string };
  // Artifact
  'artifact:inspect': { artifactId: string };
  // Heritage site
  'heritage:enter': { siteId: string; culture: string };
  // Quest
  'quest:trigger': { questId: string; stepId?: string };
  'quest:complete': { questId: string; xp: number };
  // Inventory
  'inventory:collect': { itemId: string; itemName: string };
  // Save
  'save:request': Record<string, never>;
  'save:done': { slot: number };
  // Education
  'education:open': { siteId: string; culture: string };
  // Camera
  'camera:focus': { targetId: string };
  'camera:reset': Record<string, never>;
};

type EventKey = keyof WorldEventMap;

class EventBus {
  private listeners = new Map<EventKey, Set<Handler<any>>>();

  on<K extends EventKey>(event: K, handler: Handler<WorldEventMap[K]>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off<K extends EventKey>(event: K, handler: Handler<WorldEventMap[K]>): void {
    this.listeners.get(event)?.delete(handler);
  }

  emit<K extends EventKey>(event: K, payload: WorldEventMap[K]): void {
    this.listeners.get(event)?.forEach(h => h(payload));
  }

  once<K extends EventKey>(event: K, handler: Handler<WorldEventMap[K]>): void {
    const wrapped: Handler<WorldEventMap[K]> = (p) => {
      handler(p);
      this.off(event, wrapped);
    };
    this.on(event, wrapped);
  }
}

// Singleton — one bus for the entire app
export const worldBus = new EventBus();
