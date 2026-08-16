# Scene Image Pipeline — Diagnostics Report

## Root Cause

`StoryScene.backgroundImage` was always `undefined`. The scene definitions in `scenes.ts` only contain `backgroundPrompt` (a text description). No code was calling the image generation API to convert that prompt into an actual image URL. `SceneView` checked `scene.backgroundImage` and fell into the placeholder branch, but the "Loading scene..." skeleton was shown when `!bgLoaded && !scene.backgroundImage` — which is always true — so it displayed forever.

Additionally, `HF_TOKEN` is not set in `.env`, meaning HuggingFace generation was silently skipped with no fallback reaching the frontend.

---

## Pipeline Flow (Fixed)

```
StoryScene.backgroundPrompt
        │
        ▼
useSceneImage() hook  [apps/web/lib/use-scene-image.ts]
        │  status: generating → downloading
        │
        ▼
POST /api/immersive/scene-image  [apps/web/app/api/immersive/scene-image/route.ts]
        │
        ├─ Check disk cache  /public/generated-scenes/index.json
        │       └─ HIT → return cached URL immediately
        │
        ├─ HuggingFace API (3 models, 18s timeout each)
        │       FLUX.1-schnell → SDXL → SD v1.5
        │       └─ SUCCESS → save to /public/generated-scenes/{sceneId}-{ts}.jpg
        │
        ├─ Wikimedia Commons fallback
        │       └─ search "{culture} {scene title}"
        │
        ├─ Unsplash fallback
        │       └─ source.unsplash.com/800x450/?{culture}+heritage
        │
        └─ Culture placeholder SVG (inline data: URI — never blank)
                └─ ALWAYS renders something
```

---

## Logging Added

Every step emits a `console.log` with prefix `[SCENE_IMG]` (server) or `[SCENE_IMAGE]` (client):

| Log | Location | Meaning |
|-----|----------|---------|
| `── START ──` | server route | Request received |
| `HF request → {model}` | server route | HF API call sent |
| `HF response status: {n}` | server route | HF HTTP status |
| `HF success model={m}` | server route | Image bytes received |
| `Saved HF image` | server route | Written to `/public/generated-scenes/` |
| `Wikimedia fallback URL` | server route | Wikimedia used |
| `Unsplash fallback URL` | server route | Unsplash used |
| `Cached URL to index` | server route | URL persisted to `index.json` |
| `── DONE ──` | server route | Full diagnostics summary |
| `── START ──` | client hook | Hook triggered |
| `imageUrl=` | client hook | URL received (or empty) |
| `TIMEOUT` | client hook | 20s exceeded |
| `── DONE ──` | client hook | Final diagnostics |

---

## Timeout & Fallback

- Client-side: 20-second `AbortController` timeout on the fetch to `/api/immersive/scene-image`
- Server-side: `AbortSignal.timeout(18_000)` on each HF model call
- Fallback order: HuggingFace → Wikimedia → Unsplash → Culture SVG placeholder
- The frontend **never shows a blank white scene** — the SVG placeholder is always available instantly

---

## Visible Status Labels

| Status | Label shown in UI |
|--------|------------------|
| `generating` | `Generating image...` |
| `downloading` | `Downloading image...` |
| `fallback` | `Using fallback image...` |
| `cached` | *(no label)* |
| `error` | `Image unavailable` |

---

## Image Caching

Generated images are saved to:

```
apps/web/public/generated-scenes/
├── index.json                    ← sceneId → URL map (persisted across restarts)
├── egypt-village-1720000000.jpg
├── egypt-market-1720000001.jpg
└── ...
```

The `index.json` is checked on every request. Cache hits skip all generation and return immediately.

---

## Diagnostics Panel

In `development` mode, a diagnostics panel is rendered below each scene image:

```
provider: huggingface
model: black-forest-labs/FLUX.1-schnell
duration: 4823ms
url: /generated-scenes/egypt-village-1720000000.jpg
fallback: no
```

If a fallback was used:
```
provider: unsplash
model: unsplash
duration: 21043ms
url: https://images.unsplash.com/...
fallback: yes (unsplash)
error: timeout
```

Controlled via `showDiagnostics` prop on `<SceneView>`. Enabled automatically when `NODE_ENV === 'development'`.

---

## HuggingFace Token Setup

`HF_TOKEN` is currently **not set** in `.env`. This is why HF generation silently fails.

To enable HF generation:

1. Get a free token at https://huggingface.co/settings/tokens
2. Add to `apps/web/.env`:
   ```
   HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. Ensure the token has **Inference API** access
4. Free tier allows ~1000 requests/month on FLUX.1-schnell

Without `HF_TOKEN`, the pipeline automatically falls through to Wikimedia → Unsplash → SVG placeholder. Scenes will always display visual content regardless.

---

## Files Changed

| File | Change |
|------|--------|
| `apps/web/lib/use-scene-image.ts` | New — client hook with logging, 20s timeout, fallback chain, diagnostics |
| `apps/web/components/Immersive/SceneView.tsx` | Rewritten — uses `useSceneImage`, status labels, diagnostics panel, never blank |
| `apps/web/app/api/immersive/scene-image/route.ts` | New — dedicated scene image endpoint with disk cache, full logging |
| `apps/web/components/Immersive/ImmersiveStoryPlayer.tsx` | Added `showDiagnostics` prop in dev mode |
| `apps/web/public/generated-scenes/` | New directory — cached scene images |
