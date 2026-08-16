'use client';

import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { AvatarConfig } from '@/components/VirtualMuseum3D';

const VirtualMuseum3D = dynamic(() => import('@/components/VirtualMuseum3D'), { ssr: false });

// ─── Options ──────────────────────────────────────────────────────────────────

const SKIN_COLORS = [
  { label: 'Light', value: '#FDDBB4' },
  { label: 'Medium', value: '#D4956A' },
  { label: 'Tan', value: '#C68642' },
  { label: 'Brown', value: '#8D5524' },
  { label: 'Dark', value: '#4A2912' },
];

const HAIR_COLORS = [
  { label: 'Black', value: '#1a1a1a' },
  { label: 'Brown', value: '#6B3A2A' },
  { label: 'Blonde', value: '#D4A017' },
  { label: 'Red', value: '#8B2500' },
  { label: 'White', value: '#E8E8E8' },
  { label: 'Blue', value: '#1E3A8A' },
];

const SHIRT_COLORS = [
  { label: 'Navy', value: '#1E3A5F' },
  { label: 'Burgundy', value: '#6B1A2A' },
  { label: 'Forest', value: '#1A4A2A' },
  { label: 'Gold', value: '#8B6914' },
  { label: 'Slate', value: '#334155' },
  { label: 'Ivory', value: '#F5F0E8' },
];

// ─── Avatar Preview ───────────────────────────────────────────────────────────

function AvatarPreview({ config }: { config: AvatarConfig }) {
  return (
    <div className="relative w-32 h-44 mx-auto">
      <svg viewBox="0 0 80 120" className="w-full h-full">
        <ellipse cx="40" cy="85" rx="18" ry="28" fill={config.shirtColor} />
        <rect x="35" y="58" width="10" height="10" fill={config.skinColor} />
        {config.photoUrl ? (
          <>
            <clipPath id="headClip"><circle cx="40" cy="46" r="18" /></clipPath>
            <image href={config.photoUrl} x="22" y="28" width="36" height="36" clipPath="url(#headClip)" preserveAspectRatio="xMidYMid slice" />
            <circle cx="40" cy="46" r="18" fill="none" stroke={config.hairColor} strokeWidth="2" />
          </>
        ) : (
          <>
            <circle cx="40" cy="46" r="18" fill={config.skinColor} />
            <ellipse cx="40" cy="32" rx="18" ry="10" fill={config.hairColor} />
            <ellipse cx="22" cy="42" rx="5" ry="10" fill={config.hairColor} />
            <ellipse cx="58" cy="42" rx="5" ry="10" fill={config.hairColor} />
            <circle cx="34" cy="45" r="2.5" fill="#1a1a1a" />
            <circle cx="46" cy="45" r="2.5" fill="#1a1a1a" />
            <circle cx="35" cy="44" r="1" fill="white" />
            <circle cx="47" cy="44" r="1" fill="white" />
            <path d="M 34 52 Q 40 57 46 52" stroke="#8B5E3C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </>
        )}
        <ellipse cx="18" cy="82" rx="6" ry="18" fill={config.shirtColor} transform="rotate(-10 18 82)" />
        <ellipse cx="62" cy="82" rx="6" ry="18" fill={config.shirtColor} transform="rotate(10 62 82)" />
        <circle cx="15" cy="98" r="5" fill={config.skinColor} />
        <circle cx="65" cy="98" r="5" fill={config.skinColor} />
      </svg>
      {config.photoUrl && (
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-400 border-2 border-[#0D0D0D] flex items-center justify-center text-[10px]">✓</div>
      )}
    </div>
  );
}

function ColorRow({ label, options, value, onChange }: {
  label: string; options: { label: string; value: string }[];
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-white/50 text-xs uppercase tracking-widest mb-2">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {options.map(o => (
          <button key={o.value} title={o.label} onClick={() => onChange(o.value)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${value === o.value ? 'border-[#B07D4F] scale-110 shadow-lg' : 'border-transparent hover:border-white/30'}`}
            style={{ backgroundColor: o.value }} />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VirtualMuseumPage() {
  const [step, setStep] = useState<'avatar' | 'museum'>('avatar');
  const [glbUrl] = useState<string | null>('/museum/the_hallwyl_museum_1st_floor_combined.glb');
  const [avatar, setAvatar] = useState<AvatarConfig>({
    name: 'Explorer',
    skinColor: '#D4956A',
    hairColor: '#1a1a1a',
    shirtColor: '#1E3A5F',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  const handlePhoto = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const url = e.target?.result as string;
      setPhotoPreview(url);
      setAvatar(a => ({ ...a, photoUrl: url }));
    };
    reader.readAsDataURL(file);
  }, []);

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePhoto(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPhoto(false);
    const file = e.dataTransfer.files[0];
    if (file) handlePhoto(file);
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setAvatar(a => ({ ...a, photoUrl: undefined }));
    if (photoRef.current) photoRef.current.value = '';
  };

  if (step === 'museum') {
    return <VirtualMuseum3D avatar={avatar} glbUrl={glbUrl} onExit={() => setStep('avatar')} />;
  }

  return (
    <div className="min-h-screen bg-[#0D0A06] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-[#B07D4F] text-xs tracking-[0.3em] uppercase font-medium">WebVR Experience</span>
          <h1 className="text-4xl font-serif text-white mt-3 mb-2">Hallwyl Virtual Museum</h1>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            Upload your photo to create a personalized avatar, then explore the 1st Floor State Rooms with live audio guides.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-8">

          {/* Photo upload */}
          <div>
            <p className="text-white/70 text-sm font-medium mb-3">
              📸 Your Photo <span className="text-white/30 font-normal">(optional — becomes your avatar face)</span>
            </p>
            <div
              onDragOver={e => { e.preventDefault(); setIsDraggingPhoto(true); }}
              onDragLeave={() => setIsDraggingPhoto(false)}
              onDrop={onDrop}
              onClick={() => !photoPreview && photoRef.current?.click()}
              className={`relative rounded-xl border-2 border-dashed transition-all ${
                isDraggingPhoto ? 'border-[#B07D4F] bg-[#B07D4F]/10' :
                photoPreview ? 'border-[#B07D4F]/40 bg-[#B07D4F]/5' :
                'border-white/10 hover:border-[#B07D4F]/30 cursor-pointer'
              } p-5`}
            >
              {photoPreview ? (
                <div className="flex items-center gap-4">
                  <img src={photoPreview} alt="Your photo" className="w-16 h-16 rounded-full object-cover border-2 border-[#B07D4F]/40" />
                  <div className="flex-1">
                    <p className="text-white/70 text-sm font-medium">Photo loaded ✓</p>
                    <p className="text-white/30 text-xs mt-0.5">Your face will appear on the avatar's head in 3D</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); removePhoto(); }}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all flex items-center justify-center text-sm">
                    ✕
                  </button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <div className="text-3xl mb-2">🤳</div>
                  <p className="text-white/50 text-sm">Drop your photo here or click to upload</p>
                  <p className="text-white/20 text-xs mt-1">JPG, PNG, WEBP — your face becomes the avatar</p>
                </div>
              )}
            </div>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
          </div>

          {/* Avatar creator */}
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col items-center gap-4">
              <div className="w-40 h-52 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
                <AvatarPreview config={avatar} />
              </div>
              <input
                value={avatar.name}
                onChange={e => setAvatar(a => ({ ...a, name: e.target.value }))}
                placeholder="Your name"
                maxLength={20}
                className="w-full text-center bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#B07D4F]/50"
              />
            </div>

            <div className="space-y-5">
              <ColorRow label="Skin Tone" options={SKIN_COLORS} value={avatar.skinColor} onChange={v => setAvatar(a => ({ ...a, skinColor: v }))} />
              <ColorRow label="Hair Color" options={HAIR_COLORS} value={avatar.hairColor} onChange={v => setAvatar(a => ({ ...a, hairColor: v }))} />
              <ColorRow label="Outfit" options={SHIRT_COLORS} value={avatar.shirtColor} onChange={v => setAvatar(a => ({ ...a, shirtColor: v }))} />
            </div>
          </div>

          {/* Enter */}
          <button
            onClick={() => setStep('museum')}
            disabled={!avatar.name.trim()}
            className="w-full py-4 rounded-xl bg-[#B07D4F] text-white font-bold text-sm tracking-wide hover:bg-[#9A6B3F] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            🏛️ Enter the Museum as {avatar.name || '...'}
          </button>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: '🎙️', label: '5 Audio Guides' },
              { icon: '🗺️', label: 'Live Minimap' },
              { icon: '🖱️', label: 'Drag to Look' },
            ].map(item => (
              <div key={item.label} className="bg-white/5 rounded-xl p-3">
                <div className="text-xl mb-1">{item.icon}</div>
                <p className="text-white/40 text-xs">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
