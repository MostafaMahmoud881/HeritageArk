'use client';

import { useState, useCallback } from 'react';
import { Button, Badge } from '@heritageverse/ui';
import {
  UserAvatar,
  SKIN_TONES,
  HAIR_STYLES,
  HAIR_COLORS,
  CLOTHES_STYLES,
  CLOTHES_COLORS,
  CULTURE_OUTFITS,
  ACCESSORIES,
  createDefaultAvatar,
  saveAvatar,
  generateAvatarSvg,
} from '@/lib/immersive-stories/avatar-store';

interface AvatarCreatorProps {
  onComplete: (avatar: UserAvatar) => void;
  initialAvatar?: UserAvatar | null;
}

type Step = 'gender' | 'name' | 'skin' | 'hair' | 'clothes' | 'outfit' | 'accessories' | 'preview';

export function AvatarCreator({ onComplete, initialAvatar }: AvatarCreatorProps) {
  const [step, setStep] = useState<Step>(initialAvatar ? 'preview' : 'gender');
  const [avatar, setAvatar] = useState<UserAvatar>(
    initialAvatar || createDefaultAvatar('', 'boy'),
  );
  const [nameInput, setNameInput] = useState(avatar.name || '');

  const updateAvatar = useCallback((updates: Partial<UserAvatar>) => {
    setAvatar(prev => ({ ...prev, ...updates }));
  }, []);

  const handleComplete = useCallback(() => {
    const finalAvatar = { ...avatar, name: nameInput || 'Explorer' };
    saveAvatar(finalAvatar);
    onComplete(finalAvatar);
  }, [avatar, nameInput, onComplete]);

  const previewSvg = generateAvatarSvg(avatar);

  const renderGenderStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-serif text-navy mb-2">Who are you?</h2>
      <p className="text-muted text-sm mb-6">Choose your character</p>
      <div className="flex justify-center gap-6">
        <button
          onClick={() => { updateAvatar({ gender: 'boy' }); setStep('name'); }}
          className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border hover:border-accent hover:bg-accent/5 transition-all"
        >
          <span className="text-6xl group-hover:scale-110 transition-transform">👦</span>
          <span className="font-medium text-navy">Boy</span>
        </button>
        <button
          onClick={() => { updateAvatar({ gender: 'girl' }); setStep('name'); }}
          className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border hover:border-accent hover:bg-accent/5 transition-all"
        >
          <span className="text-6xl group-hover:scale-110 transition-transform">👧</span>
          <span className="font-medium text-navy">Girl</span>
        </button>
      </div>
    </div>
  );

  const renderNameStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-serif text-navy mb-2">What is your name?</h2>
      <p className="text-muted text-sm mb-6">Your name will appear in the story</p>
      <input
        type="text"
        value={nameInput}
        onChange={(e) => setNameInput(e.target.value)}
        placeholder="Enter your name..."
        maxLength={20}
        className="w-full max-w-xs mx-auto block bg-white border border-border rounded-xl px-4 py-3 text-navy placeholder-muted/50 focus:outline-none focus:border-accent transition-colors text-center text-lg"
        autoFocus
        onKeyDown={(e) => { if (e.key === 'Enter' && nameInput.trim()) setStep('skin'); }}
      />
      <div className="flex gap-3 justify-center mt-6">
        <Button variant="outline" size="sm" onClick={() => setStep('gender')}>Back</Button>
        <Button variant="primary" size="sm" onClick={() => setStep('skin')} disabled={!nameInput.trim()}>
          Next
        </Button>
      </div>
    </div>
  );

  const renderSkinStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-serif text-navy mb-2">Choose your skin tone</h2>
      <p className="text-muted text-sm mb-6">Pick the color that looks like you</p>
      <div className="flex justify-center gap-3 flex-wrap">
        {SKIN_TONES.map(tone => (
          <button
            key={tone.id}
            onClick={() => { updateAvatar({ skinTone: tone.hex }); setStep('hair'); }}
            className="group flex flex-col items-center gap-2"
          >
            <div
              className="w-16 h-16 rounded-full border-2 border-border group-hover:border-accent transition-all group-hover:scale-110"
              style={{ backgroundColor: tone.hex }}
            />
            <span className="text-xs text-muted">{tone.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-6">
        <Button variant="outline" size="sm" onClick={() => setStep('name')}>Back</Button>
      </div>
    </div>
  );

  const renderHairStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-serif text-navy mb-2">Choose your hair</h2>
      <p className="text-muted text-sm mb-4">Pick a style and color</p>
      
      <div className="flex justify-center gap-2 flex-wrap mb-4">
        {HAIR_STYLES.map(style => (
          <button
            key={style.id}
            onClick={() => updateAvatar({ hair: { ...avatar.hair, style: style.id } })}
            className={`px-3 py-2 rounded-xl text-sm transition-all ${
              avatar.hair.style === style.id
                ? 'bg-accent text-white'
                : 'bg-bg border border-border text-muted hover:border-accent'
            }`}
          >
            {style.emoji} {style.label}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-2 flex-wrap mb-6">
        {HAIR_COLORS.map(color => (
          <button
            key={color.id}
            onClick={() => updateAvatar({ hair: { ...avatar.hair, color: color.hex } })}
            className="group flex flex-col items-center"
          >
            <div
              className={`w-8 h-8 rounded-full border-2 transition-all group-hover:scale-110 ${
                avatar.hair.color === color.hex ? 'border-accent' : 'border-border'
              }`}
              style={{ backgroundColor: color.hex }}
            />
          </button>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" size="sm" onClick={() => setStep('skin')}>Back</Button>
        <Button variant="primary" size="sm" onClick={() => setStep('clothes')}>Next</Button>
      </div>
    </div>
  );

  const renderClothesStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-serif text-navy mb-2">Choose your clothes</h2>
      <p className="text-muted text-sm mb-4">Pick a style and color</p>
      
      <div className="flex justify-center gap-2 flex-wrap mb-4">
        {CLOTHES_STYLES.map(style => (
          <button
            key={style.id}
            onClick={() => updateAvatar({ clothes: { ...avatar.clothes, style: style.id } })}
            className={`px-3 py-2 rounded-xl text-sm transition-all ${
              avatar.clothes.style === style.id
                ? 'bg-accent text-white'
                : 'bg-bg border border-border text-muted hover:border-accent'
            }`}
          >
            {style.emoji} {style.label}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-2 flex-wrap mb-6">
        {CLOTHES_COLORS.map(color => (
          <button
            key={color.id}
            onClick={() => updateAvatar({ clothes: { ...avatar.clothes, color: color.hex } })}
            className="group flex flex-col items-center"
          >
            <div
              className={`w-8 h-8 rounded-full border-2 transition-all group-hover:scale-110 ${
                avatar.clothes.color === color.hex ? 'border-accent' : 'border-border'
              }`}
              style={{ backgroundColor: color.hex }}
            />
          </button>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" size="sm" onClick={() => setStep('hair')}>Back</Button>
        <Button variant="primary" size="sm" onClick={() => setStep('outfit')}>Next</Button>
      </div>
    </div>
  );

  const renderOutfitStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-serif text-navy mb-2">Culture Outfit (Optional)</h2>
      <p className="text-muted text-sm mb-4">Wear traditional clothes from a culture</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
        <button
          onClick={() => updateAvatar({ cultureOutfit: undefined })}
          className={`px-3 py-2 rounded-xl text-sm transition-all ${
            !avatar.cultureOutfit
              ? 'bg-accent text-white'
              : 'bg-bg border border-border text-muted hover:border-accent'
          }`}
        >
          😊 Regular
        </button>
        {CULTURE_OUTFITS.map(outfit => (
          <button
            key={outfit.id}
            onClick={() => updateAvatar({ cultureOutfit: outfit.id })}
            className={`px-3 py-2 rounded-xl text-sm transition-all ${
              avatar.cultureOutfit === outfit.id
                ? 'bg-accent text-white'
                : 'bg-bg border border-border text-muted hover:border-accent'
            }`}
          >
            {outfit.emoji} {outfit.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" size="sm" onClick={() => setStep('clothes')}>Back</Button>
        <Button variant="primary" size="sm" onClick={() => setStep('accessories')}>Next</Button>
      </div>
    </div>
  );

  const renderAccessoriesStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-serif text-navy mb-2">Accessories</h2>
      <p className="text-muted text-sm mb-4">Pick some accessories (tap to toggle)</p>
      
      <div className="flex justify-center gap-2 flex-wrap mb-6">
        {ACCESSORIES.map(acc => {
          const isSelected = avatar.accessories.includes(acc.id);
          return (
            <button
              key={acc.id}
              onClick={() => {
                const accs = isSelected
                  ? avatar.accessories.filter(a => a !== acc.id)
                  : [...avatar.accessories, acc.id];
                updateAvatar({ accessories: accs });
              }}
              className={`px-4 py-3 rounded-xl text-sm transition-all ${
                isSelected
                  ? 'bg-accent text-white ring-2 ring-accent'
                  : 'bg-bg border border-border text-muted hover:border-accent'
              }`}
            >
              <div className="text-2xl mb-1">{acc.emoji}</div>
              <div>{acc.label}</div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" size="sm" onClick={() => setStep('outfit')}>Back</Button>
        <Button variant="primary" size="sm" onClick={() => setStep('preview')}>Review</Button>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-serif text-navy mb-2">Your Avatar</h2>
      <p className="text-muted text-sm mb-6">{avatar.name}, ready for adventure!</p>
      
      <div className="w-40 h-40 mx-auto mb-6 rounded-2xl overflow-hidden border-2 border-accent shadow-card">
        <img src={previewSvg} alt="Your avatar" className="w-full h-full object-cover" />
      </div>

      <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
        {avatar.badges.length > 0 && avatar.badges.map((badge, i) => (
          <Badge key={i} variant="accent" size="sm">{badge}</Badge>
        ))}
        <Badge variant="muted" size="sm">XP: {avatar.xp}</Badge>
      </div>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" size="sm" onClick={() => setStep('accessories')}>Edit</Button>
        <Button variant="primary" size="md" onClick={handleComplete}>
          {initialAvatar ? 'Save Changes' : 'Start Adventure!'}
        </Button>
      </div>
    </div>
  );

  const stepIndicator = (
    <div className="flex justify-center gap-1.5 mb-6">
      {(['gender', 'name', 'skin', 'hair', 'clothes', 'outfit', 'accessories', 'preview'] as Step[]).map((s, i) => (
        <div
          key={s}
          className={`w-2 h-2 rounded-full transition-all ${
            ['gender', 'name', 'skin', 'hair', 'clothes', 'outfit', 'accessories', 'preview'].indexOf(step) >= i
              ? 'bg-accent'
              : 'bg-border'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-border shadow-card p-6 max-w-lg mx-auto">
      {step !== 'gender' && stepIndicator}
      
      {step === 'gender' && renderGenderStep()}
      {step === 'name' && renderNameStep()}
      {step === 'skin' && renderSkinStep()}
      {step === 'hair' && renderHairStep()}
      {step === 'clothes' && renderClothesStep()}
      {step === 'outfit' && renderOutfitStep()}
      {step === 'accessories' && renderAccessoriesStep()}
      {step === 'preview' && renderPreviewStep()}
    </div>
  );
}