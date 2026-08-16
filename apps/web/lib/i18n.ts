import en from '@/messages/en.json';
import ar from '@/messages/ar.json';
import fr from '@/messages/fr.json';
import it from '@/messages/it.json';
import ber from '@/messages/ber.json';

// Domain-level overrides
import enCommon from '@/messages/domains/en/common.json';
import enHome from '@/messages/domains/en/home.json';
import enMuseum from '@/messages/domains/en/museum.json';
import enChat from '@/messages/domains/en/chat.json';
import enReels from '@/messages/domains/en/reels.json';
import enAdmin from '@/messages/domains/en/admin.json';
import enStoryteller from '@/messages/domains/en/storyteller.json';
import enContent from '@/messages/domains/en/content.json';

import arCommon from '@/messages/domains/ar/common.json';
import arHome from '@/messages/domains/ar/home.json';
import arMuseum from '@/messages/domains/ar/museum.json';
import arChat from '@/messages/domains/ar/chat.json';
import arReels from '@/messages/domains/ar/reels.json';
import arAdmin from '@/messages/domains/ar/admin.json';
import arStoryteller from '@/messages/domains/ar/storyteller.json';
import arContent from '@/messages/domains/ar/content.json';

import frCommon from '@/messages/domains/fr/common.json';
import frHome from '@/messages/domains/fr/home.json';
import frMuseum from '@/messages/domains/fr/museum.json';
import frChat from '@/messages/domains/fr/chat.json';
import frReels from '@/messages/domains/fr/reels.json';
import frAdmin from '@/messages/domains/fr/admin.json';
import frStoryteller from '@/messages/domains/fr/storyteller.json';
import frContent from '@/messages/domains/fr/content.json';

import itCommon from '@/messages/domains/it/common.json';
import itHome from '@/messages/domains/it/home.json';
import itMuseum from '@/messages/domains/it/museum.json';
import itChat from '@/messages/domains/it/chat.json';
import itReels from '@/messages/domains/it/reels.json';
import itAdmin from '@/messages/domains/it/admin.json';
import itStoryteller from '@/messages/domains/it/storyteller.json';
import itContent from '@/messages/domains/it/content.json';

import berCommon from '@/messages/domains/ber/common.json';
import berHome from '@/messages/domains/ber/home.json';
import berMuseum from '@/messages/domains/ber/museum.json';
import berChat from '@/messages/domains/ber/chat.json';
import berReels from '@/messages/domains/ber/reels.json';
import berAdmin from '@/messages/domains/ber/admin.json';
import berStoryteller from '@/messages/domains/ber/storyteller.json';
import berContent from '@/messages/domains/ber/content.json';

export type Locale = 'en' | 'ar' | 'fr' | 'it' | 'ber';
export const locales: Locale[] = ['en', 'ar', 'fr', 'it', 'ber'];
export const defaultLocale: Locale = 'en';

function deepMerge(base: any, overlay: any): any {
  const result = { ...base };
  for (const key of Object.keys(overlay || {})) {
    if (
      result[key] &&
      typeof result[key] === 'object' &&
      !Array.isArray(result[key]) &&
      typeof overlay[key] === 'object' &&
      !Array.isArray(overlay[key])
    ) {
      result[key] = deepMerge(result[key], overlay[key]);
    } else if (overlay[key] !== undefined) {
      result[key] = overlay[key];
    }
  }
  return result;
}

function buildMessages(base: any, domains: Record<string, any>[]): Record<string, any> {
  let merged = { ...base };
  for (const domain of domains) {
    merged = deepMerge(merged, domain);
  }
  return merged;
}

const messages: Record<Locale, Record<string, any>> = {
  en: buildMessages(en, [enCommon, enHome, enMuseum, enChat, enReels, enAdmin, enStoryteller, enContent]),
  ar: buildMessages(ar, [arCommon, arHome, arMuseum, arChat, arReels, arAdmin, arStoryteller, arContent]),
  fr: buildMessages(fr, [frCommon, frHome, frMuseum, frChat, frReels, frAdmin, frStoryteller, frContent]),
  it: buildMessages(it, [itCommon, itHome, itMuseum, itChat, itReels, itAdmin, itStoryteller, itContent]),
  ber: buildMessages(ber, [berCommon, berHome, berMuseum, berChat, berReels, berAdmin, berStoryteller, berContent]),
};

export function getMessages(locale: Locale) {
  return messages[locale] || messages.en;
}

const FALLBACK_CHAIN: Record<Locale, Locale[]> = {
  en: ['en'],
  ar: ['ar', 'en'],
  fr: ['fr', 'en'],
  it: ['it', 'en'],
  ber: ['ber', 'ar', 'en'],
};

function resolve(locale: Locale, path: string): string | null {
  const msg = getMessages(locale);
  const keys = path.split('.');
  let value: any = msg;
  for (const key of keys) {
    if (value == null || typeof value !== 'object') return null;
    value = value[key];
  }
  return typeof value === 'string' ? value : null;
}

export function t(locale: Locale, path: string): string {
  const chain = FALLBACK_CHAIN[locale] || [locale, 'en'];
  for (const l of chain) {
    const result = resolve(l, path);
    if (result !== null) return result;
  }
  return path;
}

export function hasTranslation(locale: Locale, path: string): boolean {
  return resolve(locale, path) !== null;
}

export function isRTL(locale: Locale): boolean {
  return locale === 'ar';
}
