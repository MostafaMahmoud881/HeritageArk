# Immersive Story Mode — Architecture Document

## Overview

Extends HeritageVerse's existing AI Story Teller to create an immersive, avatar-driven educational experience where children become part of historical stories inside their browser — no VR required.

## Components Added

```
components/Immersive/
  ├── AvatarCreator.tsx          # Avatar creation wizard (gender, hair, clothes, skin, culture)
  ├── ImmersiveStoryPlayer.tsx   # Main immersive story experience wrapper
  ├── SceneView.tsx              # Scene renderer with avatar compositing
  ├── NPCDialogue.tsx            # NPC chat interaction panel
  ├── QuestTracker.tsx           # Quest progress display
  └── VoiceOverlay.tsx           # Voice narration controls
```

## APIs Added

```
app/api/immersive/
  ├── avatar/route.ts            # POST: Save/update avatar | GET: Get avatar
  ├── scene/route.ts             # POST: Generate scene with avatar compositing
  └── npc/route.ts               # POST: NPC dialogue via Groq AI
```

## Database Changes (Local Storage + Prisma)

Frontend Avatar data stored in localStorage:
```typescript
interface UserAvatar {
  id: string;
  name: string;
  gender: 'boy' | 'girl';
  hair: { style: string; color: string };
  clothes: { style: string; color: string };
  skinTone: string;
  accessories: string[];
  cultureOutfit?: string; // culture-specific outfit ID
  xp: number;
  badges: string[];
  passport: HeritagePassportEntry[];
}
```

Prisma model additions:
```prisma
model UserAvatar {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  name        String
  gender      String
  hairStyle   String
  hairColor   String
  clothesStyle String
  clothesColor String
  skinTone    String
  accessories String[] // JSON array
  cultureOutfit String?
  xp          Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  questProgress QuestProgress[]
}

model QuestProgress {
  id          String    @id @default(cuid())
  avatarId    String
  avatar      UserAvatar @relation(fields: [avatarId], references: [id], onDelete: Cascade)
  questId     String
  stepIndex   Int       @default(0)
  completed   Boolean   @default(false)
  xpEarned    Int       @default(0)
  completedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([avatarId, questId])
}
```

## Scene Generation Pipeline

```
1. User selects story → story has pre-defined scenes
2. Each scene: background + description + NPCs + interactive elements
3. Scene images generated via HuggingFace API:
   - Background: "Ancient Egyptian market, vibrant colors, sunlight, detailed"
   - Avatar composited into scene via CSS positioning
4. NPCs are existing StoryCharacter instances
5. NPC dialogue handled by Groq AI with character context
```

## Performance Impact

- **Mobile**: Minimal. Scenes are static images + CSS overlay. Avatar stored as data URI.
- **Tablet**: Smooth. Single scene image loads, avatar is CSS-only overlay.
- **Desktop**: Full experience with optional Three.js background environments.
- **Low-end fallback**: SVG-generated scene backgrounds, emoji avatars, text-only dialogue.

## Rollback Steps

1. Remove `components/Immersive/` directory
2. Remove `app/api/immersive/` directory  
3. Remove `lib/immersive-stories/` directory
4. Remove Prisma models: `UserAvatar`, `QuestProgress`
5. Run `prisma migrate dev` to rollback database
6. Revert `app/[locale]/stories/page.tsx` changes
7. Remove `IMMERSIVE_STORY_ARCHITECTURE.md`

## Existing Systems Extended (NOT Replaced)

- Stories page: Adds "Immersive Mode" button to existing story cards
- CharacterViewer: Extended with avatar overlay support
- ChatUI: NPC chat panel reuses chat infrastructure
- Quests: Quest progress now syncs with story completion
- Groq AI: NPC dialogue reuses existing Groq provider
- Image Generation: Scene images use the already-implemented HF service

## Avatar Customization Options

| Option | Values |
|--------|--------|
| Gender | Boy, Girl |
| Skin Tone | 6 options (fair to deep) |
| Hair Style | 8 styles (short, long, curly, braids, afro, etc.) |
| Hair Color | 6 colors (black, brown, blonde, red, etc.) |
| Clothes | 6 styles (tunic, robe, shirt+pants, dress, etc.) |
| Accessories | Hat, scarf, necklace, bracelet, glasses |
| Culture Outfit | Nubian, Amazigh, Ancient Egyptian, Roman, Medieval |

## Story Scene Structure

```typescript
interface StoryScene {
  id: string;
  storyId: string;
  sceneNumber: number;
  title: string;
  description: string;
  backgroundPrompt: string; // for HF image generation
  backgroundImage?: string; // cached generated image
  npcs: string[]; // character IDs present
  interactive: {
    type: 'dialogue' | 'quiz' | 'explore' | 'collect';
    data: any;
  }[];
  questTrigger?: string; // quest ID to activate
  xpReward: number;
}
```

## Voice Narration

- Primary: ElevenLabs TTS (already configured via ELEVENLABS_API_KEY)
- Fallback: Browser Speech Synthesis API
- Narration triggers on scene entry, NPC dialogue, and story milestones
- User can toggle voice on/off