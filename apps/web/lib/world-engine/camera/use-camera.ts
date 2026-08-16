'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useWorldStore } from '../world/store';
import { worldBus } from '../utils/event-bus';

export interface CameraState {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

const DEFAULT: CameraState = { zoom: 1, offsetX: 0, offsetY: 0 };

/**
 * useCamera — manages 2D top-down camera for the CSS/canvas world renderer.
 * For Three.js usage, pass the camera ref directly to R3F.
 */
export function useCamera() {
  const stateRef = useRef<CameraState>({ ...DEFAULT });
  const playerPos = useWorldStore(s => s.playerPosition);

  // Follow player
  useEffect(() => {
    stateRef.current.offsetX = -playerPos.x;
    stateRef.current.offsetY = -playerPos.z;
  }, [playerPos.x, playerPos.z]);

  const zoomIn = useCallback(() => {
    stateRef.current.zoom = Math.min(stateRef.current.zoom + 0.1, 2.5);
  }, []);

  const zoomOut = useCallback(() => {
    stateRef.current.zoom = Math.max(stateRef.current.zoom - 0.1, 0.4);
  }, []);

  const reset = useCallback(() => {
    stateRef.current = { ...DEFAULT };
    worldBus.emit('camera:reset', {});
  }, []);

  const focusOn = useCallback((x: number, z: number) => {
    stateRef.current.offsetX = -x;
    stateRef.current.offsetY = -z;
  }, []);

  // Listen for bus events
  useEffect(() => {
    const unsub = worldBus.on('camera:reset', reset);
    return unsub;
  }, [reset]);

  return { stateRef, zoomIn, zoomOut, reset, focusOn };
}
