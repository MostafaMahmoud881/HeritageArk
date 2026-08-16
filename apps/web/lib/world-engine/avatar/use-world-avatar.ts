'use client';

import { useEffect, useCallback } from 'react';
import { useWorldStore } from '../world/store';
import { getAvatar, saveAvatar, addXp, addBadge, type UserAvatar } from '@/lib/immersive-stories/avatar-store';
import { worldBus } from '../utils/event-bus';

/**
 * useWorldAvatar — bridges the existing avatar-store with the world engine.
 * Reuses all existing avatar logic; adds XP grants on quest completion.
 */
export function useWorldAvatar() {
  const playerPosition = useWorldStore(s => s.playerPosition);
  const setPlayerPosition = useWorldStore(s => s.setPlayerPosition);

  // Grant XP when a quest completes
  useEffect(() => {
    const unsub = worldBus.on('quest:complete', ({ xp, questId }) => {
      const avatar = getAvatar();
      if (!avatar) return;
      const updated = addXp(avatar, xp);
      const badged = addBadge(updated, `🏆 Quest: ${questId}`);
      saveAvatar(badged);
    });
    return unsub;
  }, []);

  // Grant XP when an item is collected
  useEffect(() => {
    const unsub = worldBus.on('inventory:collect', ({ itemName }) => {
      const avatar = getAvatar();
      if (!avatar) return;
      saveAvatar(addXp(avatar, 10));
    });
    return unsub;
  }, []);

  const movePlayer = useCallback((x: number, z: number) => {
    setPlayerPosition({ x, y: 0, z });
  }, [setPlayerPosition]);

  return { playerPosition, movePlayer };
}
