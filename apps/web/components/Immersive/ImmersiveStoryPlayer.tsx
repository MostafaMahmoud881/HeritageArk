'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button, Badge } from '@heritageverse/ui';
import { UserAvatar, generateAvatarSvg, addPassportEntry, addBadge } from '@/lib/immersive-stories/avatar-store';
import {
  ImmersiveStory,
  StoryScene,
  getImmersiveStory,
  getLocalizedScene,
  getLocalizedStory,
  getSuggestedQuestions,
} from '@/lib/immersive-stories/scenes';
import { SceneView } from './SceneView';
import { NPCDialogue } from './NPCDialogue';
import { QuestTracker } from './QuestTracker';
import { VoiceOverlay } from './VoiceOverlay';
import { speakText, stopSpeaking } from '@/lib/ai';

interface ImmersiveStoryPlayerProps {
  storyId: string;
  avatar: UserAvatar;
  onAvatarUpdate: (avatar: UserAvatar) => void;
  onExit: () => void;
  locale: string;
  onLocaleChange: (locale: string) => void;
}

const LOCALE_OPTIONS = [
  { code: 'en', label: 'EN', dir: 'ltr' as const },
  { code: 'ar', label: 'عر', dir: 'rtl' as const },
  { code: 'fr', label: 'FR', dir: 'ltr' as const },
  { code: 'ber', label: 'ⵜⴰ', dir: 'ltr' as const },
];

export function ImmersiveStoryPlayer({
  storyId,
  avatar,
  onAvatarUpdate,
  onExit,
  locale,
  onLocaleChange,
}: ImmersiveStoryPlayerProps) {
  const [story, setStory] = useState<ImmersiveStory | null>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isNarrating, setIsNarrating] = useState(false);
  const [collectedItems, setCollectedItems] = useState<string[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    const loaded = getImmersiveStory(storyId);
    setStory(loaded ? getLocalizedStory(loaded, locale) : null);
    setCurrentSceneIndex(0);
    setCollectedItems([]);
    setShowCompletion(false);
  }, [storyId, locale]);

  const currentScene: StoryScene | undefined = story?.scenes?.[currentSceneIndex];
  const localizedScene = currentScene ? getLocalizedScene(currentScene, locale) : undefined;
  const isLastScene = story ? currentSceneIndex >= story.scenes.length - 1 : false;
  const totalScenes = story?.scenes?.length ?? 0;
  const progressPercent = totalScenes > 0 ? ((currentSceneIndex + 1) / totalScenes) * 100 : 0;

  const handleNextScene = useCallback(() => {
    if (!story) return;
    if (currentSceneIndex < story.scenes.length - 1) {
      setCurrentSceneIndex(i => i + 1);
    } else {
      setShowCompletion(true);
      const totalXp = story.scenes.reduce((sum, s) => sum + s.xpReward, 0);
      const updated = addPassportEntry(avatar, {
        storyId: story.id,
        storyTitle: story.title,
        culture: story.culture,
        completedAt: Date.now(),
        scenesCompleted: totalScenes,
        totalScenes,
        xpEarned: totalXp,
      });
      const badged = addBadge(updated, `🌍 ${story.title} Explorer`);
      onAvatarUpdate(badged);
    }
  }, [currentSceneIndex, story, avatar, onAvatarUpdate, totalScenes]);

  const handleCollect = useCallback((item: string) => {
    if (!collectedItems.includes(item)) {
      setCollectedItems(prev => [...prev, item]);
    }
  }, [collectedItems]);

  const handleNpcReply = useCallback(async (message: string) => {
    if (!story || !currentScene) return;
    setIsNarrating(true);
    try {
      const res = await fetch('/api/immersive/npc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          npcName: currentScene.npcs[0] || 'Guide',
          culture: story.culture,
          userMessage: message,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        await speakText(data.reply, locale);
      }
    } catch {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          `That's a great question! In ${story.culture} culture, that was very important.`
        );
        utterance.lang = locale;
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
      }
    }
    setIsNarrating(false);
  }, [currentScene, story, locale]);

  useEffect(() => {
    stopSpeaking();
  }, [locale, currentSceneIndex]);

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-accent/5 to-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-accent/20 animate-pulse mx-auto mb-3" />
          <p className="text-muted">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!currentScene) {
    return null;
  }

  if (!localizedScene) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-accent/5 to-bg flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl">📖</span>
          <p className="text-muted mt-4">Story not found</p>
          <Button variant="outline" size="sm" onClick={onExit} className="mt-4">
            Back to Stories
          </Button>
        </div>
      </div>
    );
  }

  if (showCompletion) {
    const totalXp = story.scenes.reduce((sum, s) => sum + s.xpReward, 0);
    const avatarSvg = generateAvatarSvg(avatar);

    return (
      <div className="min-h-screen bg-gradient-to-b from-accent/5 to-bg flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <div className="text-6xl mb-6">🎉</div>
          <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-accent">
            <img src={avatarSvg} alt={avatar.name} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-3xl font-serif text-navy mb-2">Story Complete!</h2>
          <p className="text-muted mb-2">
            {avatar.name} explored <span className="font-semibold text-navy">{story.title}</span>
          </p>
          <div className="bg-white rounded-2xl border border-border shadow-card p-6 mb-6 inline-block">
            <p className="text-sm text-muted mb-1">XP Earned</p>
            <p className="text-4xl font-bold text-accent">+{totalXp}</p>
            <div className="flex gap-1.5 justify-center mt-3 flex-wrap">
              {collectedItems.map((item, i) => (
                <Badge key={i} variant="accent" size="sm">{item}</Badge>
              ))}
            </div>
            <div className="mt-3">
              <Badge variant="accent" size="sm">🌍 {story.title} Explorer</Badge>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="primary" onClick={onExit}>
              Back to Stories
            </Button>
            <Button variant="outline" onClick={() => {
              setShowCompletion(false);
              setCurrentSceneIndex(0);
              setCollectedItems([]);
            }}>
              Replay
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentInteractive = localizedScene.interactive;
  const dialogueInteractive = currentInteractive.find(i => i.type === 'dialogue');
  const dialogueData = dialogueInteractive?.data;

  return (
    <div dir={LOCALE_OPTIONS.find(l => l.code === locale)?.dir || 'ltr'} className="min-h-screen bg-gradient-to-b from-accent/5 to-bg">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 text-muted hover:text-navy transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7l-7-7 7-7" />
            </svg>
            {locale === 'ar' ? 'خروج' : locale === 'fr' ? 'Quitter' : locale === 'ber' ? 'Ffeɣ' : 'Exit Story'}
          </button>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white rounded-lg border border-border p-0.5">
              {LOCALE_OPTIONS.map(opt => (
                <button
                  key={opt.code}
                  onClick={() => onLocaleChange(opt.code)}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                    locale === opt.code
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-muted hover:text-navy hover:bg-bg'
                  }`}
                  title={opt.code}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-muted hidden sm:inline">
              {locale === 'ar' ? 'مشهد' : locale === 'fr' ? 'Scène' : locale === 'ber' ? 'Agan' : 'Scene'} {currentSceneIndex + 1} {locale === 'ar' ? 'من' : locale === 'fr' ? 'sur' : locale === 'ber' ? 'si' : 'of'} {totalScenes}
            </span>
            <VoiceOverlay className="shrink-0" language={locale} />
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-accent">{avatar.name}</span>
              <div className="w-6 h-6 rounded-full overflow-hidden border border-accent">
                <img src={generateAvatarSvg(avatar)} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-border rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <SceneView
              scene={localizedScene}
              avatar={avatar}
              className="w-full"
              showDiagnostics={process.env.NODE_ENV === 'development'}
              locale={locale}
            />

            <div className="space-y-3">
              {currentInteractive.map((interactive, i) => {
                const sceneKey = `${currentScene.id}-${interactive.type}-${i}`;
                switch (interactive.type) {
                  case 'dialogue': {
                    const tDialogue = interactive.data.translations?.[locale]?.text || interactive.data.text;
                    const tSuggestions = getSuggestedQuestions(locale);
                    return (
                      <NPCDialogue
                        key={sceneKey}
                        npcName={currentScene.npcs[0] || 'Guide'}
                        npcCulture={story.culture}
                        dialogue={tDialogue}
                        onReply={handleNpcReply}
                        onComplete={handleNextScene}
                        autoSpeak={currentSceneIndex === 0 && i === 0}
                        suggestions={tSuggestions}
                        language={locale}
                      />
                    );
                  }

                  case 'quiz': {
                    const tQuestion = interactive.data.translations?.[locale]?.question || interactive.data.question;
                    const tOptions = interactive.data.translations?.[locale]?.options || interactive.data.options;
                    return (
                      <QuizCard
                        key={sceneKey}
                        question={tQuestion}
                        options={tOptions}
                        correctAnswer={interactive.data.answer}
                        xpReward={currentScene.xpReward}
                        onCorrect={() => {
                          const updated = addPassportEntry(avatar, {
                            storyId: story.id,
                            storyTitle: story.title,
                            culture: story.culture,
                            completedAt: Date.now(),
                            scenesCompleted: currentSceneIndex + 1,
                            totalScenes,
                            xpEarned: currentScene.xpReward,
                          });
                          onAvatarUpdate(updated);
                        }}
                      />
                    );
                  }

                  case 'collect': {
                    const tItem = interactive.data.translations?.[locale]?.item || interactive.data.item;
                    const tDesc = interactive.data.translations?.[locale]?.description || interactive.data.description;
                    return (
                      <CollectCard
                        key={sceneKey}
                        item={tItem}
                        description={tDesc}
                        onCollect={() => handleCollect(tItem)}
                        alreadyCollected={collectedItems.includes(tItem)}
                      />
                    );
                  }

                  case 'explore': {
                    const tItems = interactive.data.translations?.[locale]?.items || interactive.data.items;
                    return (
                      <ExploreCard
                        key={sceneKey}
                        items={tItems}
                        onExplore={() => {}}
                      />
                    );
                  }

                  default:
                    return null;
                }
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-2">
              {currentSceneIndex > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSceneIndex(i => i - 1)}
                >
                  ← {locale === 'ar' ? 'المشهد السابق' : locale === 'fr' ? 'Scène précédente' : locale === 'ber' ? 'Agan yezwar' : 'Previous Scene'}
                </Button>
              )}
              {isLastScene ? (
                <Button variant="primary" size="md" onClick={handleNextScene}>
                  {locale === 'ar' ? 'إنهاء القصة 🎉' : locale === 'fr' ? 'Terminer l\'histoire 🎉' : locale === 'ber' ? 'Fakk tadyant 🎉' : 'Finish Story 🎉'}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNextScene}
                  className="ml-auto"
                >
                  {locale === 'ar' ? 'المشهد التالي →' : locale === 'fr' ? 'Scène suivante →' : locale === 'ber' ? 'Agan aynnaf →' : 'Next Scene →'}
                </Button>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-border shadow-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="accent" size="sm">{story.culture}</Badge>
                <Badge variant="muted" size="sm">{story.era}</Badge>
              </div>
              <h3 className="font-serif text-navy text-lg">{story.title}</h3>
              <p className="text-xs text-muted mt-1">{localizedScene.description}</p>
            </div>

            {collectedItems.length > 0 && (
              <div className="bg-white rounded-2xl border border-border shadow-card p-4">
                <p className="text-xs text-muted font-medium mb-2">
                  {locale === 'ar' ? 'العناصر المجمعة' : locale === 'fr' ? 'Objets collectés' : locale === 'ber' ? 'Ifaruyen' : 'Collected Items'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {collectedItems.map((item, i) => (
                    <Badge key={i} variant="accent" size="sm">✓ {item}</Badge>
                  ))}
                </div>
              </div>
            )}

            <QuestTracker avatar={avatar} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────

function QuizCard({
  question,
  options,
  correctAnswer,
  xpReward,
  onCorrect,
}: {
  question: string;
  options: string[];
  correctAnswer: number;
  xpReward: number;
  onCorrect: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    if (index === correctAnswer) {
      onCorrect();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span>🧠</span>
        <span className="font-medium text-navy text-sm">Quick Quiz</span>
        {!answered && <Badge variant="accent" size="sm">+{xpReward} XP</Badge>}
      </div>
      <p className="text-sm text-navy mb-3">{question}</p>
      <div className="space-y-2">
        {options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            disabled={answered}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
              answered
                ? i === correctAnswer
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : i === selected
                    ? 'bg-red-50 border border-red-200 text-red-700'
                    : 'bg-bg border border-border text-muted'
                : 'bg-bg border border-border text-navy hover:border-accent hover:bg-accent/5'
            }`}
          >
            <span className="text-muted mr-2">{String.fromCharCode(65 + i)}.</span>
            {option}
          </button>
        ))}
      </div>
      {answered && selected === correctAnswer && (
        <p className="text-xs text-success mt-2">✓ Correct! +{xpReward} XP</p>
      )}
      {answered && selected !== correctAnswer && (
        <p className="text-xs text-danger mt-2">
          ✗ The answer was: {options[correctAnswer]}
        </p>
      )}
    </div>
  );
}

function CollectCard({
  item,
  description,
  onCollect,
  alreadyCollected,
}: {
  item: string;
  description: string;
  onCollect: () => void;
  alreadyCollected: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-card p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🎒</span>
        <div className="flex-1">
          <p className="font-medium text-navy text-sm">{item}</p>
          <p className="text-xs text-muted mt-1">{description}</p>
        </div>
        <button
          onClick={onCollect}
          disabled={alreadyCollected}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            alreadyCollected
              ? 'bg-green-50 text-green-600 border border-green-200'
              : 'bg-accent text-white hover:bg-accent/90'
          }`}
        >
          {alreadyCollected ? '✓ Collected' : 'Collect'}
        </button>
      </div>
    </div>
  );
}

function ExploreCard({
  items,
  onExplore,
}: {
  items: string[];
  onExplore: () => void;
}) {
  const [found, setFound] = useState<boolean[]>(items.map(() => false));

  const handleFind = (index: number) => {
    setFound(prev => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span>🔍</span>
        <span className="font-medium text-navy text-sm">Explore the Scene</span>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => handleFind(i)}
              disabled={found[i]}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                found[i]
                  ? 'bg-green-50 border border-green-200 text-green-600'
                  : 'bg-bg border border-border text-navy hover:border-accent hover:bg-accent/5'
              }`}
            >
              {found[i] ? '✓' : '🔎'} {item}
            </button>
          </div>
        ))}
      </div>
      {found.every(Boolean) && (
        <p className="text-xs text-success mt-2">You found everything! ✨</p>
      )}
    </div>
  );
}
