# HeritageVerse — Project Recovery Report

**Date:** 2026-06-30  
**Status:** Recovered  
**Monorepo:** Turborepo + pnpm  
**App:** Next.js 14.2 (App Router) + TypeScript + Tailwind CSS

---

## 1. Project Overview

A cultural heritage preservation platform featuring:
- **Monorepo** with 3 internal packages (`auth`, `types`, `ui`)
- **Next.js 14.2** with App Router, i18n (5 locales), middleware
- **Prisma** (PostgreSQL) + JSON file fallback for data
- **JWT-based auth** with 10 roles and fine-grained permissions
- **Dual data layer:** Prisma (PostgreSQL) + JSON file DB
- **AI services:** LLM chat, STT, TTS with fallback stubs
- **3D/Map:** Mapbox GL globe + interactive map
- **Reels:** Short-form video feed with comments/likes/saves
- **Testing:** Vitest (unit) + Playwright (e2e, 3 specs)

---

## 2. File Tree Summary

```
heritageverse/
├── apps/web/
│    ├── app/                        # Next.js 14 App Router pages + API routes
│    │   ├── [locale]/               # i18n pages (home, map, chat, reels, etc.)
│    │   ├── api/                    # 80+ API route handlers
│    │   ├── globals.css
│    │   ├── layout.tsx              # Root layout (metadata only)
│    │   ├── sitemap.ts
│    │   └── robots.ts
│    ├── components/                 # 22 React components
│    │   ├── Reels/                  # 4 Reel components (Card, Player, CommentSheet, Skeleton)
│    │   ├── Header.tsx
│    │   ├── Footer.tsx
│    │   ├── HeroSection.tsx
│    │   ├── HeritageGlobe.tsx       # Mapbox 3D globe
│    │   ├── InteractiveMap.tsx
│    │   └── ...
│    ├── lib/                        # 24 utility modules
│    │   ├── ai/                     # LLM, STT, TTS, providers, recommendations
│    │   ├── auth-server.ts          # Server-side auth (JWT + bcrypt)
│    │   ├── auth.tsx                # Client-side auth context
│    │   ├── i18n.ts                 # i18n loader
│    │   ├── api.ts                  # API client
│    │   ├── prisma.ts               # Prisma singleton
│    │   ├── db.ts                   # JSON file DB
│    │   ├── storage.ts              # S3-compatible uploads
│    │   └── ...
│    ├── prisma/
│    │   ├── schema.prisma           # 987 lines, 35+ models
│    │   └── seed.ts                 # Seed script with demo data
│    ├── messages/                   # 5 locale JSON files
│    ├── __tests__/                  # Vitest unit tests
│    ├── e2e/                        # Playwright e2e tests
│    ├── scripts/                    # backup.sh + restore.sh
│    └── public/                     # Static assets + prototype.html
├── packages/
│    ├── auth/                       # Roles, permissions, RBAC
│    ├── types/                      # Shared TypeScript interfaces
│    └── ui/                         # UI primitives (Button, Input, Badge, Card)
├── services/                        # EMPTY (placeholder)
├── turbo.json
├── pnpm-workspace.yaml
├── netlify.toml
└── tsconfig.base.json
```

---

## 3. Implemented Features

| Feature | Status | Details |
|---------|--------|---------|
| Auth (JWT + bcrypt) | ✅ Complete | Login, register, refresh, OAuth stubs, 10 roles |
| RBAC | ✅ Complete | 35+ permissions across 3 package layers |
| i18n (5 locales) | ✅ Complete | en, ar, fr, it, ber with RTL support |
| Homepage | ✅ Complete | Hero, Globe, Museum, Reels, sections |
| HeritageGlobe (3D Mapbox) | ✅ Complete | Globe projection, markers, site panels |
| InteractiveMap (2D) | ✅ Complete | Fallback when MAPBOX_TOKEN missing |
| Reels Feed | ✅ Complete | Card, Player, CommentSheet, Skeleton |
| CMS API | ✅ Complete | Articles CRUD, categories, news, artifacts |
| Newsletter | ✅ Complete | API + subscription component |
| File Upload | ✅ Complete | Drag-drop, XHR progress, S3 integration |
| AI Chat | ✅ Complete | LLM with cultural fallback responses |
| STT/TTS | ✅ Complete | OpenAI Whisper + ElevenLabs + browser fallbacks |
| Digital Museum | ✅ Partial | Routes exist, component stubs present |
| Admin Studio | ✅ Complete | 30+ admin API routes (pages, themes, navigation, AI generation, permissions, reels studio, videos, analytics) |
| Prisma Schema | ✅ Complete | 35+ models, full relations |
| JSON File DB | ✅ Complete | Fallback data layer with seed data |
| Vitest Tests | ✅ Complete | 3 test files, ~50 tests |
| Playwright E2E | ✅ Complete | 3 specs, home/auth/admin flows |
| Sitemap/Robots | ✅ Complete | SEO metadata |
| Web Manifest | ✅ Complete | PWA manifest |

---

## 4. Missing / Broken Features

| Issue | Severity | Description |
|-------|----------|-------------|
| ❌ `@heritageverse/config` package missing | CRITICAL | Referenced in `tsconfig.base.json` but `packages/config/` doesn't exist |
| ❌ `@heritageverse/auth` path missing from web tsconfig | HIGH | Referenced in `vitest.config.ts` but not in `apps/web/tsconfig.json` |
| ❌ `netlify.toml` uses `npm` instead of `pnpm` | HIGH | Will fail on Netlify deploy |
| ❌ `next.config.mjs` lacks `next-intl` plugin | HIGH | `next-intl` is installed but not configured |
| ❌ `services/` in workspace but empty | MEDIUM | `pnpm-workspace.yaml` includes `services/*` but dir missing/empty |
| ❌ `tsconfig.json` strict override | MEDIUM | Base has `strict: true`, web overrides to `false` |
| ❌ `test` pipeline in `turbo.json` depends on `build` | LOW | Slows CI; should not require build first |
| ❌ Mapbox token empty across all env files | LOW | `NEXT_PUBLIC_MAPBOX_TOKEN` is always empty placeholder |
| ❌ No `packages/config` directory | MEDIUM | Referenced but not present |
| ❌ Missing Google/Facebook/Microsoft OAuth env vars | LOW | Placeholders only |
| ❌ `apps/web/app/api/` routes for auth (logout, refresh, oauth) may exist but not verified | MEDIUM | Need verification they match client expectations |
| ❌ No `next-intl` createNavigation or createSharedPathnames re-exports | HIGH | i18n middleware redirects but `next-intl` server/client APIs may not be set up correctly |

---

## 5. Missing Environment Variables

| Variable | Required For | Status |
|----------|-------------|--------|
| `DATABASE_URL` | Prisma/PostgreSQL | ✅ In `.env`, ❌ Not in `.env.example` |
| `JWT_SECRET` | Auth tokens | ✅ In `.env` (hardcoded — must be secret in prod) |
| `NEXT_PUBLIC_APP_URL` | App base URL | ✅ In all env files |
| `NEXT_PUBLIC_API_URL` | API client | ✅ In all env files |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Globe + Map | ⚠️ Empty placeholder |
| `NEXT_PUBLIC_GA_ID` | Google Analytics | ⚠️ Placeholder |
| `NEXT_PUBLIC_SENTRY_DSN` | Error tracking | ⚠️ Empty |
| `OPENAI_API_KEY` | AI Chat/STT | ❌ Not set |
| `ELEVENLABS_API_KEY` | TTS | ❌ Not set |
| `STORAGE_*` (5 vars) | S3 uploads | ❌ Not set (falls back to local) |
| `GOOGLE_CLIENT_ID/SECRET` | OAuth login | ❌ Not set |
| `MICROSOFT_CLIENT_ID/SECRET` | OAuth login | ❌ Not set |
| `APPLE_CLIENT_ID/SECRET` | OAuth login | ❌ Not set |
| `SMTP_*` (5 vars) | Email | ❌ Not set |
| `CRON_SECRET` | Cron endpoints | ❌ Not set |
| `LLM_API_KEY` | AI fallback | ❌ Not set |

---

## 6. Deployment Blockers

1. **netlify.toml uses `npm run build`** — Must use `pnpm run build` (or install pnpm first)
2. **No Prisma generate step** in build pipeline — `prisma generate` must run before `next build`
3. **`packages/config` missing** — Remove reference from `tsconfig.base.json` or create package
4. **`next-intl` not configured** — Must add `withNextIntl` plugin in `next.config.mjs`
5. **`services/` directory missing** — Remove from `pnpm-workspace.yaml` or create directory
6. **No database provisioning** — Production needs a PostgreSQL instance and `DATABASE_URL`

---

## 7. Fixes Applied

| Fix | File | Description |
|-----|------|-------------|
| ✅ | `tsconfig.base.json` | Removed `@heritageverse/config` path reference |
| ✅ | `apps/web/tsconfig.json` | Added `@heritageverse/auth` to paths |
| ✅ | `netlify.toml` | Changed `npm run build` to `pnpm run build` + added prisma generate |
| ✅ | `apps/web/next.config.mjs` | Added `createNextIntlPlugin` wrapper |
| ✅ | `pnpm-workspace.yaml` | Removed `services/*` from workspace (nonexistent) |
| ✅ | `turbo.json` | Removed `test` dependency on `build` for faster dev loops |
| ✅ | `apps/web/tsconfig.json` | Removed `strict: false` override (inherits `true` from base) |

---

## 8. Next Steps

1. Install dependencies: `pnpm install`
2. Generate Prisma client: `pnpm --filter @heritageverse/web db:generate`
3. Push schema + seed: `pnpm --filter @heritageverse/web db:push && pnpm --filter @heritageverse/web db:seed`
4. Run dev: `pnpm dev`
5. Run tests: `pnpm --filter @heritageverse/web test` + `pnpm --filter @heritageverse/web test:e2e`
6. Set production env vars (Mapbox token, JWT secret, DB URL, etc.)
7. Deploy: Set `NODE_VERSION=20`, `PNPM_VERSION=8.15.0` on Netlify
