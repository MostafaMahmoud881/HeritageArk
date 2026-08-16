# Hydration Mismatch Fix Report

## Issue
**Error:** `Text content does not match server-rendered HTML`
**Server:** "Create Your Character"
**Client:** "Continue Adventure"

**Root cause:** `getAvatar()` was called during SSR render (line 14 of `stories/immersive/page.tsx`), which returned `null` on the server (no `localStorage`), but returned a stored avatar on the client after hydration. This caused the button text to differ between server and client renders.

## Affected Component

**File:** `apps/web/app/[locale]/stories/immersive/page.tsx`  
**Component:** `ImmersiveStoriesPage`  
**Line:** 14 (original)

## SSR Mismatches Found & Fixed

### 1. Avatar state initialization (line 14)

**Before (hydration mismatch):**
```tsx
const [avatar, setAvatar] = useState<UserAvatar | null>(getAvatar());
// Server: getAvatar() returns null (no localStorage)
// Client: getAvatar() returns stored avatar → different initial state
```

**After (fixed):**
```tsx
// Initialize to null on both server and client to avoid hydration mismatch.
// localStorage is read only after mount in the useEffect below.
const [avatar, setAvatar] = useState<UserAvatar | null>(null);
const [hydrated, setHydrated] = useState(false);

useEffect(() => {
  setAvatar(getAvatar());
  setHydrated(true);
}, []);
```

### 2. Button text conditional (line 79)

**Before (hydration mismatch):**
```tsx
{avatar ? 'Continue Adventure' : 'Create Your Character'}
// Server: always "Create Your Character" (avatar=null)
// Client: "Continue Adventure" if avatar exists → text mismatch
```

**After (fixed):**
```tsx
{hydrated && avatar ? 'Continue Adventure' : 'Create Your Character'}
// Server: always "Create Your Character" (hydrated=false)
// Client: "Create Your Character" until useEffect runs, then switches
```

### 3. Avatar-dependent UI (lines 81-99)

**Before (hydration mismatch):**
```tsx
{avatar && (
  <Button variant="outline" size="lg" onClick={() => setPhase('avatar')}>
    Edit Avatar
  </Button>
)}
// Server: hidden (avatar=null)
// Client: shown if avatar exists → DOM structure mismatch
```

**After (fixed):**
```tsx
{hydrated && avatar && (
  <Button variant="outline" size="lg" onClick={() => setPhase('avatar')}>
    Edit Avatar
  </Button>
)}
// Server: hidden (hydrated=false)
// Client: hidden until useEffect runs, then shown if avatar exists
```

### 4. Avatar info display (lines 88-99)

**Before:** `{avatar && (<div>...</div>)}` — DOM structure mismatch  
**After:** `{hydrated && avatar && (<div>...</div>)}` — guarded by hydration flag

### 5. Story selection phase avatar display (line 139)

**Before:** `{avatar && (<div>...</div>)}` — DOM structure mismatch  
**After:** `{hydrated && avatar && (<div>...</div>)}` — guarded by hydration flag

## Other Pages Checked

| Page | localStorage Usage | Hydration Safe? |
|------|-------------------|-----------------|
| `/stories/immersive` | `getAvatar()` in `useEffect` | ✅ Fixed |
| `/quests` | `localStorage.getItem` in `useEffect` | ✅ Already safe |
| `/vote` | `localStorage.getItem` in `useEffect` | ✅ Already safe |
| `/notifications` | `getAuthToken()` with `typeof window` guard | ✅ Already safe |
| `/admin/settings` | `localStorage` in event handlers | ✅ Already safe |
| `/admin/users` | `localStorage` in `useEffect` | ✅ Already safe |
| `/admin/theme` | `getAuthToken()` with `typeof window` guard | ✅ Already safe |
| `/admin/branding` | `getAuthToken()` with `typeof window` guard | ✅ Already safe |
| `/admin/navigation` | `getAuthToken()` with `typeof window` guard | ✅ Already safe |

## Browser-Only APIs Moved to Client Side

| API | File | Fix |
|-----|------|-----|
| `localStorage.getItem('heritageverse_avatar')` | `stories/immersive/page.tsx` | Moved from `useState` initializer to `useEffect` |
| `localStorage.getItem('heritageverse_avatar')` | `avatar-store.ts` | Already has `typeof window === 'undefined'` guard |

## Verification

All pages return HTTP 200:
- `/en/stories/immersive` → 200
- `/en/stories` → 200
- `/en/marketplace` → 200
- `/en/museum` → 200
- `/en/quests` → 200
- `/en/vote` → 200

## Summary

The hydration mismatch was caused by calling `getAvatar()` (which reads `localStorage`) in the `useState` initializer. During SSR, `localStorage` is unavailable so `getAvatar()` returns `null`. After hydration on the client, `getAvatar()` returns the stored avatar, causing the UI to render differently.

**Fix:** Added a `hydrated` state flag that starts `false` and is set to `true` in a `useEffect`. All avatar-dependent UI is guarded with `hydrated && avatar`, ensuring server and client render the same initial HTML. After hydration completes, the avatar data loads and the UI updates to show the personalized state.