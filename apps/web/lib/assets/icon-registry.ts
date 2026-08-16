import type { IconCategory, RegistryIcon } from '@heritageverse/types';

export const ICON_CATEGORIES: Record<IconCategory, { label: string; description: string }> = {
  globe: { label: 'Heritage Globe', description: 'Icons for the 3D globe interface' },
  museum: { label: 'Museum', description: 'Museum and exhibition icons' },
  language: { label: 'Languages', description: 'Language and translation icons' },
  reels: { label: 'Reels', description: 'Short-form video icons' },
  chat: { label: 'AI Chat', description: 'Chat and AI assistant icons' },
  articles: { label: 'Articles', description: 'Content and article icons' },
  news: { label: 'News', description: 'News and update icons' },
  researchers: { label: 'Researchers', description: 'Research and academic icons' },
  institutions: { label: 'Institutions', description: 'Organization icons' },
  marketplace: { label: 'Marketplace', description: 'Shop and commerce icons' },
  'virtual-museum': { label: 'Virtual Museum', description: '3D and VR museum icons' },
  documentary: { label: 'Documentary Generator', description: 'Film and documentary icons' },
  'story-teller': { label: 'Story Teller', description: 'Storytelling and narrative icons' },
  quests: { label: 'Quests', description: 'Adventure and quest icons' },
  education: { label: 'Education', description: 'Learning and education icons' },
  culture: { label: 'Culture', description: 'Cultural heritage icons' },
  navigation: { label: 'Navigation', description: 'Menu and navigation icons' },
  social: { label: 'Social', description: 'Social media and sharing icons' },
  media: { label: 'Media', description: 'Media playback icons' },
  actions: { label: 'Actions', description: 'Action and utility icons' },
};

const DEFAULT_ICONS: RegistryIcon[] = [
  { id: 'globe-earth', name: 'Globe', component: 'Globe', provider: 'lucide', category: 'globe', tags: ['globe', 'earth', 'world'], isActive: true },
  { id: 'museum-building', name: 'Museum', component: 'Landmark', provider: 'lucide', category: 'museum', tags: ['museum', 'building', 'culture'], isActive: true },
  { id: 'language-speech', name: 'Language', component: 'Languages', provider: 'lucide', category: 'language', tags: ['language', 'translate', 'speech'], isActive: true },
  { id: 'reels-video', name: 'Reels', component: 'Film', provider: 'lucide', category: 'reels', tags: ['reels', 'video', 'film'], isActive: true },
  { id: 'chat-ai', name: 'AI Chat', component: 'Bot', provider: 'heroicons', category: 'chat', tags: ['chat', 'ai', 'assistant'], isActive: true },
  { id: 'articles-news', name: 'Articles', component: 'Newspaper', provider: 'lucide', category: 'articles', tags: ['articles', 'news', 'content'], isActive: true },
  { id: 'news-update', name: 'News', component: 'RadioTower', provider: 'lucide', category: 'news', tags: ['news', 'update', 'broadcast'], isActive: true },
  { id: 'researchers', name: 'Researchers', component: 'GraduationCap', provider: 'lucide', category: 'researchers', tags: ['research', 'academic', 'scholar'], isActive: true },
  { id: 'institutions', name: 'Institutions', component: 'Building2', provider: 'lucide', category: 'institutions', tags: ['institution', 'organization'], isActive: true },
  { id: 'marketplace', name: 'Marketplace', component: 'Store', provider: 'lucide', category: 'marketplace', tags: ['market', 'shop', 'commerce'], isActive: true },
  { id: 'virtual-museum', name: 'Virtual Museum', component: 'Cube3d', provider: 'lucide', category: 'virtual-museum', tags: ['3d', 'museum', 'virtual'], isActive: true },
  { id: 'documentary', name: 'Documentary', component: 'Clapperboard', provider: 'lucide', category: 'documentary', tags: ['documentary', 'film', 'video'], isActive: true },
  { id: 'story-teller', name: 'Story Teller', component: 'BookOpen', provider: 'lucide', category: 'story-teller', tags: ['story', 'narrative', 'book'], isActive: true },
  { id: 'quests', name: 'Quests', component: 'Compass', provider: 'lucide', category: 'quests', tags: ['quest', 'adventure', 'explore'], isActive: true },
  { id: 'education', name: 'Education', component: 'BookOpenCheck', provider: 'lucide', category: 'education', tags: ['education', 'learn', 'study'], isActive: true },
  { id: 'culture-heritage', name: 'Culture', component: 'Palette', provider: 'lucide', category: 'culture', tags: ['culture', 'heritage', 'art'], isActive: true },
];

let iconRegistry: RegistryIcon[] = [...DEFAULT_ICONS];

export function getIconRegistry(): RegistryIcon[] {
  return iconRegistry;
}

export function getIconById(id: string): RegistryIcon | undefined {
  return iconRegistry.find(i => i.id === id);
}

export function getIconsByCategory(category: IconCategory | string): RegistryIcon[] {
  return iconRegistry.filter(i => i.category === category);
}

export function getActiveIcons(): RegistryIcon[] {
  return iconRegistry.filter(i => i.isActive);
}

export function resolveIconComponent(name: string): string {
  const icons: Record<string, string> = {
    Globe: 'lucide-react::Globe',
    Landmark: 'lucide-react::Landmark',
    Languages: 'lucide-react::Languages',
    Film: 'lucide-react::Film',
    Newspaper: 'lucide-react::Newspaper',
    RadioTower: 'lucide-react::RadioTower',
    GraduationCap: 'lucide-react::GraduationCap',
    Building2: 'lucide-react::Building2',
    Store: 'lucide-react::Store',
    Clapperboard: 'lucide-react::Clapperboard',
    BookOpen: 'lucide-react::BookOpen',
    Compass: 'lucide-react::Compass',
    BookOpenCheck: 'lucide-react::BookOpenCheck',
    Palette: 'lucide-react::Palette',
    Bot: '@heroicons/react/24/outline::Bot',
    Cube3d: 'lucide-react::Box',
  };
  return icons[name] || 'lucide-react::Circle';
}

export async function replaceIcon(id: string, updates: Partial<RegistryIcon>): Promise<RegistryIcon | null> {
  const idx = iconRegistry.findIndex(i => i.id === id);
  if (idx === -1) return null;
  iconRegistry[idx] = { ...iconRegistry[idx], ...updates } as RegistryIcon;
  return iconRegistry[idx] ?? null;
}

export async function addIcon(icon: RegistryIcon): Promise<RegistryIcon> {
  iconRegistry.push(icon);
  return icon;
}

export async function importFromIconScout(query: string): Promise<RegistryIcon[]> {
  const imported: RegistryIcon[] = [];
  const id = `iconscout-${Date.now()}`;
  imported.push({
    id,
    name: query.charAt(0).toUpperCase() + query.slice(1),
    component: 'Circle',
    provider: 'iconscout',
    category: 'actions',
    tags: [query],
    isActive: true,
    url: `https://api.iconscout.com/v3/search?query=${encodeURIComponent(query)}`,
  });
  return imported;
}

export async function resetRegistry(): Promise<void> {
  iconRegistry = [...DEFAULT_ICONS];
}
