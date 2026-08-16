'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button, Badge } from '@heritageverse/ui';
import { AvatarCreator } from '@/components/Immersive/AvatarCreator';
import { ImmersiveStoryPlayer } from '@/components/Immersive/ImmersiveStoryPlayer';
import { UserAvatar, getAvatar, generateAvatarSvg } from '@/lib/immersive-stories/avatar-store';
import { getAllImmersiveStories } from '@/lib/immersive-stories/scenes';

type Phase = 'landing' | 'avatar' | 'select' | 'playing';

const LOCALE_OPTIONS = [
  { code: 'en', label: 'EN', dir: 'ltr' as const },
  { code: 'ar', label: 'عر', dir: 'rtl' as const },
  { code: 'fr', label: 'FR', dir: 'ltr' as const },
  { code: 'ber', label: 'ⵜⴰ', dir: 'ltr' as const },
];

export default function ImmersiveStoriesPage() {
  const [phase, setPhase] = useState<Phase>('landing');
  const [avatar, setAvatar] = useState<UserAvatar | null>(null);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [locale, setLocale] = useState<string>('en');

  useEffect(() => {
    setAvatar(getAvatar());
    setHydrated(true);
  }, []);

  const handleAvatarComplete = useCallback((newAvatar: UserAvatar) => {
    setAvatar(newAvatar);
    setPhase('select');
  }, []);

  const handleStorySelect = useCallback((storyId: string) => {
    setSelectedStoryId(storyId);
    setPhase('playing');
  }, []);

  const handleExit = useCallback(() => {
    setSelectedStoryId(null);
    setPhase('select');
  }, []);

  const stories = getAllImmersiveStories();

  // ─── Landing Phase ────────────────────────────────────────────────
  if (phase === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-accent/5 to-bg">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="text-7xl mb-6">🎭</div>
          <h1 className="text-5xl font-serif text-navy mb-4">Immersive Stories</h1>
          <p className="text-muted text-lg max-w-xl mx-auto mb-8">
            Step into history! Create your own character and become part of ancient stories.
            Explore Egyptian markets, cross the Sahara with merchants, and walk through Roman cities.
          </p>

          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-1 bg-white rounded-lg border border-border p-0.5">
              {LOCALE_OPTIONS.map(opt => (
                <button
                  key={opt.code}
                  onClick={() => setLocale(opt.code)}
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
          </div>

          {locale === 'ar' && (
            <p className="text-muted text-lg max-w-xl mx-auto mb-8">
              خطوة في التاريخ! اصنع شخصيتك الخاصة وكن جزءاً من القصص القديمة.
            </p>
          )}
          {locale === 'fr' && (
            <p className="text-muted text-lg max-w-xl mx-auto mb-8">
              Plongez dans l'histoire ! Créez votre propre personnage et faites partie d'histoires anciennes.
            </p>
          )}
          {locale === 'ber' && (
            <p className="text-muted text-lg max-w-xl mx-auto mb-8">
              Sekcem ɣer umezruy! Snulfu-d tameṭṭut-nwen yerna tili ɣef tmurt-nneɣ.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-border p-4">
              <div className="text-3xl mb-2">🎨</div>
              <h3 className="font-medium text-navy text-sm">
                {locale === 'ar' ? 'إنشاء شخصية' : locale === 'fr' ? 'Créer un avatar' : locale === 'ber' ? 'Snulfu-d amagrad' : 'Create Avatar'}
              </h3>
              <p className="text-xs text-muted mt-1">
                {locale === 'ar' ? 'صمم شخصيتك' : locale === 'fr' ? 'Concevez votre personnage' : locale === 'ber' ? 'Sneɛmel amagrad-nnek' : 'Design your character'}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-border p-4">
              <div className="text-3xl mb-2">📖</div>
              <h3 className="font-medium text-navy text-sm">
                {locale === 'ar' ? 'اختر القصة' : locale === 'fr' ? 'Choisir l\'histoire' : locale === 'ber' ? 'Fren tadyant' : 'Choose Story'}
              </h3>
              <p className="text-xs text-muted mt-1">
                {locale === 'ar' ? 'اختر مغامرتك' : locale === 'fr' ? 'Choisissez votre aventure' : locale === 'ber' ? 'Fren abrid-nnek' : 'Pick your adventure'}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-border p-4">
              <div className="text-3xl mb-2">🌟</div>
              <h3 className="font-medium text-navy text-sm">
                {locale === 'ar' ? 'استكشف وتعلم' : locale === 'fr' ? 'Explorer et apprendre' : locale === 'ber' ? 'Snirem d issin' : 'Explore & Learn'}
              </h3>
              <p className="text-xs text-muted mt-1">
                {locale === 'ar' ? 'اكسب نقاط الخبرة والشارات' : locale === 'fr' ? 'Gagnez XP et badges' : locale === 'ber' ? 'Rnu XP d tbaduyin' : 'Earn XP and badges'}
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setPhase(avatar ? 'select' : 'avatar')}
            >
              {hydrated && avatar
                ? (locale === 'ar' ? 'متابعة المغامرة' : locale === 'fr' ? 'Continuer l\'aventure' : locale === 'ber' ? 'Kemmel abrid' : 'Continue Adventure')
                : (locale === 'ar' ? 'إنشاء شخصيتك' : locale === 'fr' ? 'Créer votre personnage' : locale === 'ber' ? 'Snulfu-d amagrad-nnek' : 'Create Your Character')
              }
            </Button>
            {hydrated && avatar && (
              <Button variant="outline" size="lg" onClick={() => setPhase('avatar')}>
                {locale === 'ar' ? 'تعديل الشخصية' : locale === 'fr' ? 'Modifier l\'avatar' : locale === 'ber' ? 'Ẓreg amagrad' : 'Edit Avatar'}
              </Button>
            )}
          </div>

          {hydrated && avatar && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-accent">
                <img src={generateAvatarSvg(avatar)} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm text-muted">{avatar.name}</span>
              <Badge variant="accent" size="sm">{avatar.xp} XP</Badge>
              {avatar.badges.length > 0 && (
                <Badge variant="muted" size="sm">{avatar.badges.length} badges</Badge>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Avatar Creation Phase ────────────────────────────────────────
  if (phase === 'avatar') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-accent/5 to-bg">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <button
            onClick={() => setPhase('landing')}
            className="flex items-center gap-1.5 text-muted hover:text-navy transition-colors mb-6 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7l-7-7 7-7" />
            </svg>
            {locale === 'ar' ? 'رجوع' : locale === 'fr' ? 'Retour' : locale === 'ber' ? 'Uɣal' : 'Back'}
          </button>
          <AvatarCreator
            onComplete={handleAvatarComplete}
            initialAvatar={avatar}
          />
        </div>
      </div>
    );
  }

  // ─── Story Selection Phase ────────────────────────────────────────
  if (phase === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-accent/5 to-bg">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-accent text-sm font-semibold tracking-widest uppercase">
                {locale === 'ar' ? 'اختر' : locale === 'fr' ? 'Choisissez' : locale === 'ber' ? 'Fren' : 'Choose'}
              </span>
              <h1 className="text-3xl font-serif text-navy mt-1">
                {locale === 'ar' ? 'مغامرتك' : locale === 'fr' ? 'Votre aventure' : locale === 'ber' ? 'Abrid-nnek' : 'Your Adventure'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white rounded-lg border border-border p-0.5">
                {LOCALE_OPTIONS.map(opt => (
                  <button
                    key={opt.code}
                    onClick={() => setLocale(opt.code)}
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
              {hydrated && avatar && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-accent">
                    <img src={generateAvatarSvg(avatar)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm text-navy font-medium">{avatar.name}</span>
                  <Badge variant="accent" size="sm">{avatar.xp} XP</Badge>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => setPhase('avatar')}>
                {locale === 'ar' ? 'تعديل الشخصية' : locale === 'fr' ? 'Modifier l\'avatar' : locale === 'ber' ? 'Ẓreg amagrad' : 'Edit Avatar'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map(story => (
              <button
                key={story.id}
                onClick={() => handleStorySelect(story.id)}
                className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-card hover:border-accent/30 transition-all text-left"
              >
                <div className="aspect-video bg-gradient-to-br from-accent/10 to-navy/10 flex items-center justify-center">
                  <span className="text-6xl group-hover:scale-110 transition-transform">
                    {story.culture === 'Ancient Egyptian' ? '🏛️' : story.culture === 'Amazigh' ? 'ⵣ' : '⚔️'}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="accent" size="sm">{story.culture}</Badge>
                    <Badge variant="muted" size="sm">{story.era}</Badge>
                  </div>
                  <h3 className="text-lg font-serif text-navy group-hover:text-accent transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-xs text-muted mt-1">
                    {story.scenes.length} scenes · {story.scenes.reduce((s, sc) => s + sc.xpReward, 0)} XP
                  </p>
                  <div className="flex gap-1 mt-2">
                    {story.availableOutfits.map(outfit => (
                      <span key={outfit} className="text-xs px-1.5 py-0.5 rounded bg-accent/5 text-accent">
                        {outfit.split('-').pop()}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Playing Phase ────────────────────────────────────────────────
  if (phase === 'playing' && avatar && selectedStoryId) {
    return (
      <ImmersiveStoryPlayer
        storyId={selectedStoryId}
        avatar={avatar}
        onAvatarUpdate={setAvatar}
        onExit={handleExit}
        locale={locale}
        onLocaleChange={setLocale}
      />
    );
  }

  return null;
}
