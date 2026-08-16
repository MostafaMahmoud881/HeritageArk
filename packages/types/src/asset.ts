export type AssetSource = 'iconscout' | 'lucide' | 'heroicons' | 'sketchfab' | 'smithsonian' | 'poly-pizza' | 'local-upload' | 'external-url';

export type AssetStatus = 'active' | 'inactive' | 'importing' | 'failed';

export type AssetCategory =
  | 'icon' | 'illustration' | '3d-model' | 'character'
  | 'image' | 'video' | 'audio' | 'document';

export type IconCategory =
  | 'globe' | 'museum' | 'language' | 'reels' | 'chat'
  | 'articles' | 'news' | 'researchers' | 'institutions'
  | 'marketplace' | 'virtual-museum' | 'documentary' | 'story-teller'
  | 'quests' | 'education' | 'culture' | 'navigation' | 'social'
  | 'media' | 'actions';

export interface AssetMeta {
  key: string;
  value: string;
}

export interface AssetTag {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

export interface RegistryIcon {
  id: string;
  name: string;
  component: string;
  category: IconCategory | string;
  provider: 'lucide' | 'heroicons' | 'iconscout' | 'custom';
  tags: string[];
  isActive: boolean;
  svg?: string;
  url?: string;
}

export interface RegistryIllustration {
  id: string;
  name: string;
  category: string;
  provider: 'iconscout' | 'local' | 'external';
  url: string;
  previewUrl?: string;
  tags: string[];
  isActive: boolean;
  attribution?: string;
}

export interface Asset3DModel {
  id: string;
  name: string;
  slug: string;
  source: 'sketchfab' | 'smithsonian' | 'poly-pizza' | 'local-upload';
  sourceUrl?: string;
  sourceId?: string;
  format: 'glb' | 'gltf' | 'obj' | 'fbx';
  fileUrl?: string;
  thumbnailUrl?: string;
  previewImageUrl?: string;
  category: string;
  culture?: string;
  era?: string;
  tags: string[];
  size?: number;
  vertexCount?: number;
  polygonCount?: number;
  isActive: boolean;
  metadata?: Record<string, unknown>;
  attribution?: string;
  license?: string;
}

export interface StoryCharacter {
  id: string;
  name: string;
  slug: string;
  culture?: string;
  era?: string;
  bio?: string;
  portraitUrl?: string;
  fullBodyUrl?: string;
  thumbnailUrl?: string;
  expressions: CharacterExpression[];
  defaultExpression: string;
  speechBubbleStyle?: 'rounded' | 'square' | 'thought' | 'whisper';
  voiceActor?: string;
  voiceSampleUrl?: string;
  isActive: boolean;
  tags: string[];
}

export interface CharacterExpression {
  id: string;
  name: string;
  imageUrl: string;
  emotion: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'thinking' | 'excited' | 'worried';
}

export interface AssetImportRequest {
  source: AssetSource;
  type: AssetCategory;
  url?: string;
  query?: string;
  category?: string;
  tags?: string[];
}

export interface AssetImportResult {
  success: boolean;
  asset?: RegistryIcon | RegistryIllustration | Asset3DModel | StoryCharacter;
  error?: string;
}

export interface MediaLibraryItem {
  id: string;
  name: string;
  type: AssetCategory;
  url: string;
  thumbnailUrl?: string;
  size?: number;
  width?: number;
  height?: number;
  duration?: number;
  tags: string[];
  category?: string;
  source: AssetSource;
  createdAt: string;
  updatedAt: string;
}

export interface MediaLibraryFilter {
  type?: AssetCategory | 'all';
  source?: AssetSource | 'all';
  search?: string;
  tags?: string[];
  category?: string;
  page?: number;
  limit?: number;
}
