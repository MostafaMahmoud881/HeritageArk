'use client';

/**
 * Avatar storage utility.
 * Stores avatar data in localStorage for persistence across sessions.
 * Can be extended to sync with database when user is logged in.
 */

export interface UserAvatar {
  id: string;
  name: string;
  gender: 'boy' | 'girl';
  hair: { style: string; color: string };
  clothes: { style: string; color: string };
  skinTone: string;
  accessories: string[];
  cultureOutfit?: string;
  xp: number;
  badges: string[];
  passport: HeritagePassportEntry[];
  createdAt: number;
}

export interface HeritagePassportEntry {
  storyId: string;
  storyTitle: string;
  culture: string;
  completedAt: number;
  scenesCompleted: number;
  totalScenes: number;
  xpEarned: number;
}

const STORAGE_KEY = 'heritageverse_avatar';

const DEFAULT_AVATAR: UserAvatar = {
  id: '',
  name: 'Explorer',
  gender: 'boy',
  hair: { style: 'short', color: '#3D2B1F' },
  clothes: { style: 'tunic', color: '#D4A373' },
  skinTone: '#F5D0A9',
  accessories: [],
  xp: 0,
  badges: [],
  passport: [],
  createdAt: Date.now(),
};

// ─── Skin Tone Options ──────────────────────────────────────────────

export const SKIN_TONES = [
  { id: 'fair', hex: '#FCE4D6', label: 'Fair' },
  { id: 'light', hex: '#F5D0A9', label: 'Light' },
  { id: 'olive', hex: '#D4A574', label: 'Olive' },
  { id: 'tan', hex: '#C68E5B', label: 'Tan' },
  { id: 'brown', hex: '#8D5524', label: 'Brown' },
  { id: 'deep', hex: '#5C3317', label: 'Deep' },
];

// ─── Hair Options ───────────────────────────────────────────────────

export const HAIR_STYLES = [
  { id: 'short', label: 'Short', emoji: '👦' },
  { id: 'long', label: 'Long', emoji: '👧' },
  { id: 'curly', label: 'Curly', emoji: '🦱' },
  { id: 'braids', label: 'Braids', emoji: '👧🏾' },
  { id: 'afro', label: 'Afro', emoji: '👦🏿' },
  { id: 'bob', label: 'Bob Cut', emoji: '👩' },
  { id: 'ponytail', label: 'Ponytail', emoji: '👱‍♀️' },
  { id: 'bald', label: 'Bald', emoji: '🧑' },
];

export const HAIR_COLORS = [
  { id: 'black', hex: '#1A1A1A', label: 'Black' },
  { id: 'brown', hex: '#3D2B1F', label: 'Brown' },
  { id: 'dark-brown', hex: '#5C3A1E', label: 'Dark Brown' },
  { id: 'blonde', hex: '#D4A017', label: 'Blonde' },
  { id: 'red', hex: '#B22222', label: 'Red' },
  { id: 'gray', hex: '#808080', label: 'Gray' },
];

// ─── Clothes Options ────────────────────────────────────────────────

export const CLOTHES_STYLES = [
  { id: 'tunic', label: 'Tunic', emoji: '👕' },
  { id: 'robe', label: 'Robe', emoji: '🧥' },
  { id: 'shirt-pants', label: 'Shirt & Pants', emoji: '👔' },
  { id: 'dress', label: 'Dress', emoji: '👗' },
  { id: 'armor', label: 'Armor', emoji: '🛡️' },
  { id: 'traditional', label: 'Traditional', emoji: '🧣' },
];

export const CLOTHES_COLORS = [
  { id: 'accent', hex: '#D4A373', label: 'Gold' },
  { id: 'navy', hex: '#0B132B', label: 'Navy' },
  { id: 'red', hex: '#8B1A1A', label: 'Crimson' },
  { id: 'green', hex: '#2D6A4F', label: 'Forest' },
  { id: 'blue', hex: '#1B6CA8', label: 'Azure' },
  { id: 'purple', hex: '#6B3FA0', label: 'Purple' },
  { id: 'white', hex: '#F5F5F5', label: 'White' },
  { id: 'black', hex: '#1A1A1A', label: 'Black' },
];

// ─── Culture Outfits ────────────────────────────────────────────────

export const CULTURE_OUTFITS = [
  { id: 'egyptian-sheath', label: 'Egyptian Sheath Dress', culture: 'Ancient Egyptian', emoji: '👸' },
  { id: 'egyptian-kilt', label: 'Egyptian Kilt', culture: 'Ancient Egyptian', emoji: '🤴' },
  { id: 'egyptian-priest', label: 'Egyptian Priest Robe', culture: 'Ancient Egyptian', emoji: '🧙' },
  { id: 'amazigh-tunic', label: 'Amazigh Tunic', culture: 'Amazigh', emoji: 'ⵣ' },
  { id: 'amazigh-robe', label: 'Amazigh Wool Robe', culture: 'Amazigh', emoji: '🧣' },
  { id: 'saharan-traveler', label: 'Saharan Traveler', culture: 'Amazigh', emoji: '🐪' },
  { id: 'roman-tunic', label: 'Roman Tunic', culture: 'Roman', emoji: '🏛️' },
  { id: 'roman-armor', label: 'Roman Legion Armor', culture: 'Roman', emoji: '⚔️' },
  { id: 'roman-robe', label: 'Roman Senator Robe', culture: 'Roman', emoji: '🧑‍⚖️' },
  { id: 'nubian-robe', label: 'Nubian Royal Robe', culture: 'Nubian', emoji: '👑' },
  { id: 'medieval-scholar', label: 'Medieval Scholar', culture: 'Medieval', emoji: '📚' },
];

// ─── Accessories ────────────────────────────────────────────────────

export const ACCESSORIES = [
  { id: 'hat', label: 'Hat', emoji: '🎩' },
  { id: 'scarf', label: 'Scarf', emoji: '🧣' },
  { id: 'necklace', label: 'Necklace', emoji: '📿' },
  { id: 'bracelet', label: 'Bracelet', emoji: '💫' },
  { id: 'glasses', label: 'Glasses', emoji: '👓' },
  { id: 'crown', label: 'Crown', emoji: '👑' },
  { id: 'headband', label: 'Headband', emoji: '🎀' },
  { id: 'earrings', label: 'Earrings', emoji: '💎' },
];

// ─── Storage Functions ──────────────────────────────────────────────

export function getAvatar(): UserAvatar | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('[AvatarStore] Failed to load avatar:', e);
  }
  return null;
}

export function saveAvatar(avatar: UserAvatar): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(avatar));
  } catch (e) {
    console.warn('[AvatarStore] Failed to save avatar:', e);
  }
}

export function createDefaultAvatar(name: string, gender: 'boy' | 'girl'): UserAvatar {
  return {
    ...DEFAULT_AVATAR,
    id: `avatar-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    gender,
    createdAt: Date.now(),
  };
}

export function addXp(avatar: UserAvatar, amount: number): UserAvatar {
  const updated = { ...avatar, xp: avatar.xp + amount };
  saveAvatar(updated);
  return updated;
}

export function addBadge(avatar: UserAvatar, badge: string): UserAvatar {
  if (avatar.badges.includes(badge)) return avatar;
  const updated = { ...avatar, badges: [...avatar.badges, badge] };
  saveAvatar(updated);
  return updated;
}

export function addPassportEntry(
  avatar: UserAvatar,
  entry: HeritagePassportEntry,
): UserAvatar {
  const existing = avatar.passport.findIndex(p => p.storyId === entry.storyId);
  let passport: HeritagePassportEntry[];
  if (existing >= 0) {
    passport = [...avatar.passport];
    passport[existing] = entry;
  } else {
    passport = [...avatar.passport, entry];
  }
  const updated = { ...avatar, passport, xp: avatar.xp + entry.xpEarned };
  saveAvatar(updated);
  return updated;
}

export function generateAvatarSvg(avatar: UserAvatar): string {
  // Generate a simple SVG representation of the avatar
  const skinColor = avatar.skinTone;
  const hairColor = avatar.hair.color;
  const clothesColor = avatar.clothes.color;
  const isGirl = avatar.gender === 'girl';
  
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <defs>
        <clipPath id="circle"><circle cx="100" cy="100" r="95"/></clipPath>
      </defs>
      <g clip-path="url(#circle)">
        <!-- Background -->
        <rect width="200" height="200" fill="${clothesColor}40" rx="100"/>
        <!-- Body / Clothes -->
        <rect x="50" y="110" width="100" height="90" rx="10" fill="${clothesColor}" opacity="0.8"/>
        <!-- Head -->
        <circle cx="100" cy="80" r="45" fill="${skinColor}"/>
        <!-- Hair -->
        ${isGirl
          ? `<ellipse cx="100" cy="55" rx="48" ry="30" fill="${hairColor}"/>
             <ellipse cx="100" cy="50" rx="45" ry="25" fill="${hairColor}"/>`
          : `<ellipse cx="100" cy="55" rx="48" ry="20" fill="${hairColor}"/>
             <rect x="55" y="40" width="90" height="30" rx="15" fill="${hairColor}"/>`
        }
        <!-- Eyes -->
        <circle cx="82" cy="78" r="5" fill="#333"/>
        <circle cx="118" cy="78" r="5" fill="#333"/>
        <!-- Mouth -->
        <path d="M88 95 Q100 105 112 95" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Accessories -->
        ${avatar.accessories.includes('glasses')
          ? `<circle cx="82" cy="78" r="10" fill="none" stroke="#666" stroke-width="1.5"/>
             <circle cx="118" cy="78" r="10" fill="none" stroke="#666" stroke-width="1.5"/>
             <line x1="92" y1="78" x2="108" y2="78" stroke="#666" stroke-width="1.5"/>`
          : ''
        }
        ${avatar.accessories.includes('crown')
          ? `<polygon points="60,45 70,20 80,35 90,15 100,30 110,15 120,35 130,20 140,45" fill="#D4A373" stroke="#B8860B" stroke-width="1"/>`
          : ''
        }
        ${avatar.accessories.includes('necklace')
          ? `<circle cx="100" cy="105" r="12" fill="none" stroke="#D4A373" stroke-width="2" stroke-dasharray="3,2"/>`
          : ''
        }
      </g>
    </svg>`
  )}`;
}