'use client';

import { useState, useEffect, useCallback } from 'react';
import { StoryScene } from '@/lib/immersive-stories/scenes';
import { UserAvatar, generateAvatarSvg } from '@/lib/immersive-stories/avatar-store';
import { useSceneImage } from '@/lib/use-scene-image';

interface SceneViewProps {
  scene: StoryScene;
  avatar: UserAvatar;
  onSceneReady?: () => void;
  showDiagnostics?: boolean;
  className?: string;
  locale?: string;
}

const SCENE_LABEL: Record<string, string> = {
  en: 'Scene',
  ar: 'مشهد',
  fr: 'Scène',
  ber: 'Agan',
};

export function SceneView({
  scene,
  avatar,
  onSceneReady,
  showDiagnostics = false,
  className = '',
  locale = 'en',
}: SceneViewProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);

  const { imageUrl, status, statusLabel, diagnostics } = useSceneImage(
    scene.id,
    scene.backgroundPrompt,
    scene.storyId,
    scene.backgroundImage,
  );

  // Log every state change
  useEffect(() => {
    console.log(`[SceneView] sceneId=${scene.id} status=${status} imageUrl=${imageUrl || '(empty)'}`);
  }, [scene.id, status, imageUrl]);

  useEffect(() => {
    setImgLoaded(false);
    setShowAvatar(false);
  }, [scene.id]);

  const handleImgLoad = useCallback(() => {
    setImgLoaded(true);
    setTimeout(() => setShowAvatar(true), 300);
    onSceneReady?.();
  }, [onSceneReady]);

  // If image URL is a data: URI (SVG placeholder) treat it as instantly loaded
  useEffect(() => {
    if (imageUrl?.startsWith('data:')) {
      setImgLoaded(true);
      setTimeout(() => setShowAvatar(true), 300);
      onSceneReady?.();
    }
  }, [imageUrl, onSceneReady]);

  const avatarSvg = generateAvatarSvg(avatar);
  const isLoading = !imageUrl && (status === 'generating' || status === 'downloading' || status === 'idle');

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border ${className}`}>
      {/* Scene Background */}
      <div className="relative w-full aspect-video bg-navy/5">

        {/* Always render image when URL is available */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={scene.title}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImgLoad}
            onError={() => {
              console.error(`[SceneView] img onError for sceneId=${scene.id} url=${imageUrl}`);
              setImgLoaded(true); // show whatever loaded
            }}
          />
        )}

        {/* Loading overlay — only while actively fetching */}
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-navy/10 flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-sm text-navy font-medium">{statusLabel || 'Generating image...'}</p>
              <p className="text-xs text-muted mt-1">{scene.title}</p>
            </div>
          </div>
        )}

        {/* Fallback / status badge */}
        {statusLabel && !isLoading && (
          <div className="absolute top-10 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
            {statusLabel}
          </div>
        )}

        {/* Scene Number Badge */}
        <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg">
          {SCENE_LABEL[locale] || 'Scene'} {scene.sceneNumber}
        </div>

        {/* Scene Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-white font-serif text-lg">{scene.title}</h3>
          <p className="text-white/70 text-sm">{scene.description}</p>
        </div>

        {/* Avatar Overlay */}
        {showAvatar && (
          <div className="absolute bottom-16 right-4 transition-all duration-500 animate-slide-up">
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-accent shadow-lg bg-white">
                <img src={avatarSvg} alt={avatar.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-medium">
                {avatar.name}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Diagnostics Panel */}
      {showDiagnostics && diagnostics && (
        <div className="bg-black/90 text-green-400 font-mono text-[10px] p-3 space-y-0.5">
          <p>provider: {diagnostics.provider}</p>
          <p>model: {diagnostics.model}</p>
          <p>duration: {diagnostics.generationDurationMs}ms</p>
          <p className="break-all">url: {diagnostics.returnedImageUrl.slice(0, 80)}{diagnostics.returnedImageUrl.length > 80 ? '…' : ''}</p>
          <p>fallback: {diagnostics.fallbackUsed ? `yes (${diagnostics.fallbackSource})` : 'no'}</p>
          {diagnostics.error && <p className="text-red-400">error: {diagnostics.error}</p>}
        </div>
      )}
    </div>
  );
}
