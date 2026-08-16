# Localization Migration Report

**Date:** 2026-07-01
**Project:** HeritageArk (apps/web)

## Summary

i18n infrastructure migration from hardcoded English strings to a fallback-chain-based translation system supporting 5 locales. All high-priority frontend pages and components fully migrated.

## Architecture

### Translation System
- **`lib/TranslationProvider.tsx`** — React context provider + `useTranslate()` hook
- **`components/T.tsx`** — Inline `<T path="key" />` component for server-side JSX
- **`lib/i18n.ts`** — Fallback chain (ber→ar→en), domain file deep-merging, `hasTranslation()`
- **`messages/domains/{locale}/`** — 7 domain-based files per locale (common, home, museum, chat, reels, admin, storyteller)

### Fallback Chain
```
ber → ar → en → (key path as string)
ar  → en
fr  → en
it  → en
en  → en
```

### RTL Handling
- Arabic (`ar`) → RTL; all others → LTR
- Tailwind logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`) used throughout

### Locale Switching
1. User clicks locale button in Header
2. `switchLocale()` rewrites URL prefix (e.g., `/en/...` → `/ar/...`)
3. Middleware detects locale from URL prefix
4. Layout sets `<html dir>` and `lang`
5. `TranslationProvider` provides `t()` to all children

## Translation Coverage

**Total unique t() keys:** 129
**Fully translated (all 5 locales):** 129 (100.0%)

| Locale | Keys | Coverage |
|--------|------|----------|
| English (en) | 129/129 | 100% |
| Arabic (ar) | 129/129 | 100% |
| French (fr) | 129/129 | 100% |
| Italian (it) | 129/129 | 100% |
| Amazigh (ber) | 129/129 | 100% |

## Migrated Components & Pages

### Infrastructure
| File | Change |
|------|--------|
| `app/[locale]/layout.tsx` | Wrapped with `<TranslationProvider>` |
| `lib/TranslationProvider.tsx` | React context + `useTranslate()` hook |
| `components/T.tsx` | Inline translation component |
| `lib/i18n.ts` | Fallback chain, domain merging, `hasTranslation()` |
| `scripts/check-translations.mjs` | Build-time coverage checker |
| `messages/domains/{locale}/` | 7 domain files per locale |

### High-Priority Pages/Components (Fully Translated)
| Component | Keys | Details |
|-----------|------|---------|
| `PlatformSections.tsx` | 49 | documentaries, museum, map, languages, stories, fashion, crafts, timeline, expeditions, emergency, news, art, cultures |
| `Footer.tsx` | 17 | footer links, newsletter, social, copyright |
| `app/[locale]/stories/page.tsx` | 21 | page title, complete screen, quiz feedback, points, buttons, progress, TTS |
| `HeroSection.tsx` | 9 | hero title, subtitle, CTAs, quick links, stats |
| `CharacterViewer.tsx` | 7 | empty state, speak button, switch label, welcome messages |
| `HomeReelsSection.tsx` | 6 | section title, subtitle, CTA |
| `NewsletterSection.tsx` | 6 | heading, description, input, button |
| `Header.tsx` | 4 | nav links, auth buttons, locale names |
| `HeritageGlobeSection.tsx` | 4 | badge, heading, description |
| `MapPreview.tsx` | 4 | explore badge, header, subtitle |
| `MuseumPreviewSection.tsx` | 4 | discover badge, heading, description, enter CTA |
| `app/[locale]/not-found.tsx` | 4 | 404 message, back link |
| `app/[locale]/error.tsx` | 3 | error title, description, retry |
| `FloatingReelsButton.tsx` | 2 | aria-label, button text |
| `HeritageGlobe.tsx` | 2 | (false positives: div, mapbox-gl) |
| `SearchBar.tsx` | 2 | placeholder, button |
| `MobileBottomNav.tsx` | 5 | nav labels (home, museum, stories, reels, more) |

### Stories Feature (Restored)
- All 8 storytellers from `STORYTELLERS` array (up from 4)
- Full interactive scripts via `getStoryContent()` (10-11 segments per story, up from 3)
- Quiz questions at correct narrative points with +10 points per correct answer
- Branching choices for user-driven story paths
- Page-level TTS narrates each segment via `speakText()` in useEffect

## Remaining Components (Not Yet Migrated)

### Pages Under `app/[locale]/`
| File | Priority | Est. Keys |
|------|----------|-----------|
| `auth/**/*.tsx` | Medium | ~30 |
| `admin/**/*.tsx` (12+ files) | Low | ~60 |
| `settings/page.tsx` | Low | ~5 |
| `profile/page.tsx` | Low | ~5 |
| `upload/page.tsx` | Low | ~3 |
| `museum/page.tsx` | Medium | ~10 |
| `museum/[id]/page.tsx` | Medium | ~8 |
| `chat/page.tsx` | Medium | ~15 |
| `reels/**/*.tsx` | Medium | ~10 |
| `search/page.tsx` | Low | ~3 |
| `dictionary/**/*.tsx` | Low | ~8 |

### Components
| Component | Priority | Est. Keys |
|-----------|----------|-----------|
| `Admin/*.tsx` | Low | ~10 |
| `Reels/*.tsx` | Medium | ~8 |

## Build-Time Check

```bash
node scripts/check-translations.mjs
```

Output: coverage report with per-locale stats, missing keys with file references, and exit code (0 = all real keys present).

## Key Decisions

1. **Monolithic files** as authoritative source; domain files are overlays (deep-merged)
2. **React Context** (`TranslationProvider`) instead of prop-drilling
3. **Full page navigation** on locale switch (hard reload) — simplest approach
4. **`t(path)` returns path string as last resort** — UI never shows blank
5. **Arabic is the only RTL locale** — consistent with existing design
6. **Stories TTS at page level** via `speakText()` in useEffect — full control over segment sequencing and quiz/choice pauses
7. **No interpolation in `t()`** — dynamic greetings use inline template strings with `t('common.hello')` + `t('common.iAm')`
8. **New keys under existing sections** — `hero.quick*`, `hero.stat*`, `globe.description`, `nav.dictionary`, `nav.upload` added without creating new top-level sections
