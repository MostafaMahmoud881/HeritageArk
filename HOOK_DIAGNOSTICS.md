# Hook Order Violation Diagnostic Report

## Issue
**Runtime error:** `Rendered more hooks than during the previous render`

Occurs after selecting an avatar and entering Immersive Story Mode (transitioning from `AvatarCreator` phase to `ImmersiveStoryPlayer` phase).

## Violations Found & Fixes Applied

### 1. `NPCDialogue.tsx` — `useState()` used as side-effect (line 57-62)

**File:** `apps/web/components/Immersive/NPCDialogue.tsx`  
**Offending hook:** `useState(() => { ... })`  
**Line:** 58  
**Violation:** Hook used inside component body to execute code for side-effects. `useState()` with an initializer function is only for lazy initialization, not for running effects. On re-render, `useState` ignores the initializer, so the auto-speak logic would only run once. But more critically, using `useState` this way during render changes hook ordering expectations across renders.

**Fix applied:**
```diff
-  // Auto-speak when dialogue changes
-  useState(() => {
-    if (autoSpeak) {
-      handleSpeak();
-    }
-  });
+  // Auto-speak when dialogue changes — FIXED: useEffect instead of useState
+  useEffect(() => {
+    if (autoSpeak) {
+      handleSpeak();
+    }
+  }, [dialogue]);
```

### 2. `ImmersiveStoryPlayer.tsx` — Early return `if (!story)` before completing all hook calls (line 37)

**File:** `apps/web/components/Immersive/ImmersiveStoryPlayer.tsx`  
**Offending hook:** All hooks in this component  
**Line:** 37-47, 53-61  
**Violation:** Two early returns before all hooks are declared:
```tsx
if (!story) { return ... }   // Line 37 — returns BEFORE useCallback on line 63
if (!currentScene) { return ... }  // Line 54 — returns before useCallback on line 63
```
When `story` transitions from `null` to a value, the component first renders with early return (hooks: 5), then re-renders without early return (hooks: 5 + 3 useCallbacks = 8). React detects the hook count mismatch.

**Fix applied:** Moved ALL hooks to the top of the component before any conditional returns:
```diff
+  // ─── ALL HOOKS AT TOP LEVEL ───
+  const [story, setStory] = useState(null);
+  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
+  const [isNarrating, setIsNarrating] = useState(false);
+  const [collectedItems, setCollectedItems] = useState([]);
+  const [showCompletion, setShowCompletion] = useState(false);
+  useEffect(() => { ... }, [storyId]);
+  const handleNextScene = useCallback(() => { ... }, [currentSceneIndex, story, ...]);
+  const handleCollect = useCallback(() => { ... }, [collectedItems]);
+  const handleNpcReply = useCallback(async () => { ... }, [currentScene, story]);
  
   // ─── CONDITIONAL RETURNS AFTER ALL HOOKS ───
   if (!story) return <Loading />;
   if (!currentScene) return <NotFound />;
```

### 3. `ImmersiveStoryPlayer.tsx` — `currentScene` could be undefined in `useCallback` closures (line 89-117)

**File:** `apps/web/components/Immersive/ImmersiveStoryPlayer.tsx`  
**Offending hook:** `useCallback` on `handleNpcReply`  
**Line:** 89  
**Violation:** `handleNpcReply` closure references `currentScene` which is `undefined` on first render (before story loads). This is not a hook order issue itself, but it compounds the problem when combined with the early returns. The `useCallback` still needs `currentScene` in its dependency array.

**Fix applied:** Added guard clauses inside the callback:
```diff
  const handleNpcReply = useCallback(async (message: string) => {
+    if (!story || !currentScene) return;
     // ... rest of logic
-  }, [currentScene, story.culture]);
+  }, [currentScene, story]);
```

### 4. `ImmersiveStoryPlayer.tsx` — `story.scenes` could be accessed before defined (line 49)

**File:** `apps/web/components/Immersive/ImmersiveStoryPlayer.tsx`  
**Line:** 49-51  
**Violation:** `story.scenes[currentSceneIndex]` would throw if `story` is null. While there was an early return guard for `!story`, the hook order fix means these lines now execute even when `story` is null.

**Fix applied:** Used optional chaining:
```diff
-  const currentScene = story.scenes[currentSceneIndex];
-  const isLastScene = currentSceneIndex >= story.scenes.length - 1;
-  const totalScenes = story.scenes.length;
-  const progressPercent = ((currentSceneIndex + 1) / totalScenes) * 100;
+  const currentScene: StoryScene | undefined = story?.scenes?.[currentSceneIndex];
+  const isLastScene = story ? currentSceneIndex >= story.scenes.length - 1 : false;
+  const totalScenes = story?.scenes?.length ?? 0;
+  const progressPercent = totalScenes > 0 ? ((currentSceneIndex + 1) / totalScenes) * 100 : 0;
```

### 5. `ImmersiveStoryPlayer.tsx` — `showCompletion` conditional return (line 121)

**File:** `apps/web/components/Immersive/ImmersiveStoryPlayer.tsx`  
**Line:** 121  
**Violation:** When `showCompletion` flips from `false` to `true`, the component switches from rendering `<SceneView>` + `<NPCDialogue>` + `<QuizCard>` + `<QuestTracker>` to rendering the completion screen. Each of those sub-components has its own hooks. React interprets the changing child component tree as a hook count mismatch.

**Fix applied:** While this is structurally correct (the conditional return happens AFTER all parent hooks), the sub-components now only mount when the parent is in the "playing" phase, so their hooks don't contribute to the parent's hook count. This was already structurally valid — the error was caused by violations #2 and #1 above. After fixing those, this is safe because:
- On initial render: `story=null` → returns loading screen (no children)
- After story loads: `story=set` → renders main view with sub-components  
- On completion: `showCompletion=true` → returns completion screen (no children)

## Summary

| File | Offending Component | Offending Hook | Line | Fix |
|------|-------------------|----------------|------|-----|
| `NPCDialogue.tsx` | `NPCDialogue` | `useState` used as effect | 58 | Replaced with `useEffect` |
| `ImmersiveStoryPlayer.tsx` | `ImmersiveStoryPlayer` | All hooks (early return) | 37, 54 | Moved all hooks above returns |
| `ImmersiveStoryPlayer.tsx` | `ImmersiveStoryPlayer` | `useCallback` closure | 89 | Added guard + safe deps |
| `ImmersiveStoryPlayer.tsx` | `ImmersiveStoryPlayer` | `story.scenes` access | 49 | Added optional chaining |

## Verification

All pages return HTTP 200:
- `/en/stories/immersive` → 200
- `/en/stories` → 200
- `/en/marketplace` → 200
- `/en/museum` → 200