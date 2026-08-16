'use client';

import { useState, useEffect } from 'react';
import { Input } from '@heritageverse/ui';
import { getIconRegistry, ICON_CATEGORIES } from '@/lib/assets/icon-registry';
import type { RegistryIcon, IconCategory } from '@heritageverse/types';

const CATEGORY_ICONS: Record<string, string> = {
  globe: '🌍', museum: '🏛️', language: '🗣️', reels: '🎬', chat: '🤖',
  articles: '📝', news: '📡', researchers: '🔬', institutions: '🏢',
  marketplace: '🛒', 'virtual-museum': '🥽', documentary: '🎥',
  'story-teller': '📖', quests: '⚔️', education: '📚', culture: '🎨',
  navigation: '🧭', social: '🤝', media: '▶️', actions: '⚡',
};

interface IconPickerProps {
  selected?: string;
  onSelect: (icon: RegistryIcon) => void;
  category?: IconCategory | string;
}

export function IconPicker({ selected, onSelect, category }: IconPickerProps) {
  const [icons, setIcons] = useState<RegistryIcon[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(category || 'all');

  useEffect(() => {
    const all = getIconRegistry().filter(i => i.isActive);
    setIcons(all);
  }, []);

  const categories = ['all', ...new Set(icons.map(i => i.category))];

  const filtered = icons.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || i.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-accent text-navy'
                : 'bg-bg text-muted hover:text-navy'
            }`}
          >
            {cat !== 'all' && <span>{CATEGORY_ICONS[cat] || '•'}</span>}
            {cat === 'all' ? 'All' : ICON_CATEGORIES[cat as IconCategory]?.label || cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-60 overflow-y-auto p-1">
        {filtered.map(icon => (
          <button
            key={icon.id}
            onClick={() => onSelect(icon)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              selected === icon.id
                ? 'bg-accent/15 ring-2 ring-accent'
                : 'hover:bg-bg border border-transparent hover:border-accent/20'
            }`}
            title={icon.name}
          >
            <span className="text-lg">{CATEGORY_ICONS[icon.category] || '✨'}</span>
            <span className="text-[10px] text-muted text-center truncate w-full leading-tight">
              {icon.name}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted text-sm py-4">No icons found</p>
      )}
    </div>
  );
}
