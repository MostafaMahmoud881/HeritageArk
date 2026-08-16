'use client';

import { Suspense, useState } from 'react';
import type { Asset3DModel } from '@heritageverse/types';

interface ThreeDViewerProps {
  model: Asset3DModel;
  autoRotate?: boolean;
  showControls?: boolean;
  showMetadata?: boolean;
  onClose?: () => void;
  className?: string;
}

export function ThreeDViewer({
  model,
  autoRotate = true,
  showControls = true,
  showMetadata = true,
  onClose,
  className = '',
}: ThreeDViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showPanel, setShowPanel] = useState(false);

  if (!model.fileUrl && !model.sourceUrl) {
    return (
      <div className={`flex items-center justify-center bg-navy/5 rounded-2xl border border-border ${className}`}>
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </div>
          <p className="text-navy font-medium">{model.name}</p>
          <p className="text-muted text-sm mt-1">
            {model.source === 'sketchfab' ? 'View on Sketchfab' : 'Source model'}
          </p>
          {model.sourceUrl && (
            <a
              href={model.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-accent text-navy text-sm font-semibold rounded-xl hover:bg-accent/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Open in {model.source === 'sketchfab' ? 'Sketchfab' : 'Source'}
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-navy rounded-2xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${className}`}>
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        {showControls && (
          <>
            <button
              onClick={() => setZoom(z => Math.min(3, z + 0.2))}
              className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Zoom in"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            <button
              onClick={() => setZoom(z => Math.max(0.3, z - 0.2))}
              className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Zoom out"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
              </svg>
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              )}
            </button>
          </>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center">
            <svg className="animate-spin w-10 h-10 text-accent mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-white/60 text-sm">Loading 3D model...</p>
          </div>
        </div>
      }>
        <div className="flex items-center justify-center h-full min-h-[400px] relative">
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              perspective: '1000px',
            }}
          >
            <div
              className="relative cursor-grab active:cursor-grabbing"
              style={{
                transform: `rotateY(${rotation}deg) scale(${zoom})`,
                transition: 'transform 0.1s ease-out',
                transformStyle: 'preserve-3d',
              }}
              onMouseDown={(e) => {
                const startX = e.clientX;
                const startRot = rotation;
                const onMove = (ev: MouseEvent) => {
                  setRotation(startRot + (ev.clientX - startX) * 0.5);
                };
                const onUp = () => {
                  window.removeEventListener('mousemove', onMove);
                  window.removeEventListener('mouseup', onUp);
                };
                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
              }}
            >
              {model.thumbnailUrl ? (
                <img
                  src={model.thumbnailUrl}
                  alt={model.name}
                  className="max-w-full max-h-full object-contain rounded-xl"
                  style={{ maxHeight: isFullscreen ? '80vh' : '400px' }}
                />
              ) : (
                <div className="w-48 h-48 rounded-2xl bg-white/5 flex items-center justify-center">
                  <svg className="w-20 h-20 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </Suspense>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">{model.name}</p>
            <p className="text-white/60 text-xs">
              {model.format?.toUpperCase()} · {model.source}
            </p>
          </div>
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-white text-xs hover:bg-white/20 transition-colors"
          >
            Info
          </button>
        </div>
      </div>

      {showMetadata && showPanel && (
        <div className="absolute bottom-16 right-4 w-64 bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <p className="text-white font-medium text-sm mb-3">Model Info</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-white/60">Source</span>
              <span className="text-white capitalize">{model.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Format</span>
              <span className="text-white uppercase">{model.format}</span>
            </div>
            {model.category && (
              <div className="flex justify-between">
                <span className="text-white/60">Category</span>
                <span className="text-white capitalize">{model.category}</span>
              </div>
            )}
            {model.culture && (
              <div className="flex justify-between">
                <span className="text-white/60">Culture</span>
                <span className="text-white">{model.culture}</span>
              </div>
            )}
            {model.license && (
              <div className="flex justify-between">
                <span className="text-white/60">License</span>
                <span className="text-white">{model.license}</span>
              </div>
            )}
            {model.attribution && (
              <div className="pt-2 border-t border-white/10">
                <span className="text-white/60">Attribution</span>
                <p className="text-white mt-1">{model.attribution}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ArtifactViewer({ model, className }: { model: Asset3DModel; className?: string }) {
  return (
    <ThreeDViewer
      model={model}
      autoRotate={true}
      showControls={true}
      showMetadata={true}
      className={className}
    />
  );
}
