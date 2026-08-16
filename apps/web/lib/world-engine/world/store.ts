'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorldPosition, WorldConfig, WorldNPC, WorldArtifact, WorldHeritageSite } from './types';
import { DEFAULT_WORLD } from './config';
import { worldBus } from '../utils/event-bus';

interface WorldState {
  // Config
  config: WorldConfig;
  // Player
  playerPosition: WorldPosition;
  playerRotation: number;
  // Interaction
  nearbyNpc: WorldNPC | null;
  nearbyArtifact: WorldArtifact | null;
  nearbyHeritageSite: WorldHeritageSite | null;
  activeZoneId: string | null;
  // UI overlays
  dialogueOpen: boolean;
  activeNpcId: string | null;
  museumOpen: boolean;
  artifactInspectId: string | null;
  educationOpen: boolean;
  educationSiteId: string | null;
  // World state
  isLoaded: boolean;
  // Actions
  setPlayerPosition: (pos: WorldPosition) => void;
  setPlayerRotation: (rot: number) => void;
  setConfig: (config: WorldConfig) => void;
  checkProximity: (pos: WorldPosition) => void;
  openDialogue: (npcId: string) => void;
  closeDialogue: () => void;
  openMuseum: () => void;
  closeMuseum: () => void;
  inspectArtifact: (id: string) => void;
  closeArtifact: () => void;
  openEducation: (siteId: string, culture: string) => void;
  closeEducation: () => void;
  setLoaded: (v: boolean) => void;
}

function dist2D(a: WorldPosition, b: WorldPosition): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.z - b.z) ** 2);
}

export const useWorldStore = create<WorldState>()(
  persist(
    (set, get) => ({
      config: DEFAULT_WORLD,
      playerPosition: DEFAULT_WORLD.spawnPosition,
      playerRotation: 0,
      nearbyNpc: null,
      nearbyArtifact: null,
      nearbyHeritageSite: null,
      activeZoneId: null,
      dialogueOpen: false,
      activeNpcId: null,
      museumOpen: false,
      artifactInspectId: null,
      educationOpen: false,
      educationSiteId: null,
      isLoaded: false,

      setPlayerPosition: (pos) => {
        set({ playerPosition: pos });
        get().checkProximity(pos);
      },

      setPlayerRotation: (rot) => set({ playerRotation: rot }),

      setConfig: (config) => set({ config }),

      checkProximity: (pos) => {
        const { config } = get();

        // NPCs
        const nearNpc = config.npcs.find(n => dist2D(pos, n.position) <= n.interactionRadius) ?? null;
        if (nearNpc?.id !== get().nearbyNpc?.id) {
          set({ nearbyNpc: nearNpc });
          if (nearNpc) worldBus.emit('npc:approach', { npcId: nearNpc.id, distance: dist2D(pos, nearNpc.position) });
          else if (get().nearbyNpc) worldBus.emit('npc:leave', { npcId: get().nearbyNpc!.id });
        }

        // Artifacts
        const nearArtifact = config.artifacts.find(a => dist2D(pos, a.position) <= a.interactionRadius) ?? null;
        set({ nearbyArtifact: nearArtifact });

        // Heritage sites
        const nearSite = config.heritageSites.find(s => dist2D(pos, s.position) <= s.interactionRadius) ?? null;
        set({ nearbyHeritageSite: nearSite });

        // Zones
        const activeZone = config.zones.find(z =>
          pos.x >= z.bounds.minX && pos.x <= z.bounds.maxX &&
          pos.z >= z.bounds.minZ && pos.z <= z.bounds.maxZ
        ) ?? null;

        const prevZoneId = get().activeZoneId;
        if (activeZone?.id !== prevZoneId) {
          if (prevZoneId) worldBus.emit('world:exit', { zoneId: prevZoneId });
          if (activeZone) {
            worldBus.emit('world:enter', { zoneId: activeZone.id });
            // Auto-trigger zone actions
            if (activeZone.trigger === 'museum') get().openMuseum();
            if (activeZone.trigger === 'heritage' && activeZone.triggerPayload?.siteId && activeZone.triggerPayload?.culture) {
              get().openEducation(activeZone.triggerPayload.siteId, activeZone.triggerPayload.culture);
            }
          }
          set({ activeZoneId: activeZone?.id ?? null });
        }
      },

      openDialogue: (npcId) => {
        set({ dialogueOpen: true, activeNpcId: npcId });
        worldBus.emit('dialogue:open', { npcId });
      },

      closeDialogue: () => {
        const { activeNpcId } = get();
        set({ dialogueOpen: false, activeNpcId: null });
        if (activeNpcId) worldBus.emit('dialogue:close', { npcId: activeNpcId });
      },

      openMuseum: () => {
        set({ museumOpen: true });
        worldBus.emit('museum:open', {});
      },

      closeMuseum: () => set({ museumOpen: false }),

      inspectArtifact: (id) => {
        set({ artifactInspectId: id });
        worldBus.emit('artifact:inspect', { artifactId: id });
      },

      closeArtifact: () => set({ artifactInspectId: null }),

      openEducation: (siteId, culture) => {
        set({ educationOpen: true, educationSiteId: siteId });
        worldBus.emit('education:open', { siteId, culture });
      },

      closeEducation: () => set({ educationOpen: false, educationSiteId: null }),

      setLoaded: (v) => set({ isLoaded: v }),
    }),
    {
      name: 'hv-world-state',
      // Only persist player position and rotation — not UI state
      partialize: (s) => ({
        playerPosition: s.playerPosition,
        playerRotation: s.playerRotation,
      }),
    }
  )
);
