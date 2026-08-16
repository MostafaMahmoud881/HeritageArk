/**
 * World Engine — Shared Types
 */

export interface WorldPosition {
  x: number;
  y: number;
  z: number;
}

export interface WorldZone {
  id: string;
  name: string;
  culture: string;
  /** Bounding box in world units */
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  /** What happens when player enters */
  trigger: 'museum' | 'artifact' | 'heritage' | 'npc' | 'none';
  triggerPayload?: Record<string, string>;
  /** Optional 3D model path (GLB/GLTF/OBJ/FBX) */
  modelPath?: string;
  /** Fallback emoji for 2D/CSS rendering */
  emoji?: string;
  description?: string;
}

export interface WorldNPC {
  id: string;
  name: string;
  culture: string;
  /** Links to existing HeritageArk storyteller id */
  storytellerId?: string;
  /** Links to existing AI chat context */
  aiContext?: string;
  position: WorldPosition;
  /** Optional 3D model path */
  modelPath?: string;
  emoji?: string;
  interactionRadius: number;
}

export interface WorldArtifact {
  id: string;
  name: string;
  culture: string;
  position: WorldPosition;
  /** Links to existing HeritageArk artifact id */
  hvArtifactId?: string;
  modelPath?: string;
  emoji?: string;
  interactionRadius: number;
}

export interface WorldHeritageSite {
  id: string;
  name: string;
  culture: string;
  position: WorldPosition;
  /** Links to existing HeritageArk culture slug */
  cultureSlug?: string;
  modelPath?: string;
  emoji?: string;
  interactionRadius: number;
}

export interface WorldConfig {
  id: string;
  name: string;
  zones: WorldZone[];
  npcs: WorldNPC[];
  artifacts: WorldArtifact[];
  heritageSites: WorldHeritageSite[];
  spawnPosition: WorldPosition;
  /** Ambient music track */
  ambientTrack?: string;
}
