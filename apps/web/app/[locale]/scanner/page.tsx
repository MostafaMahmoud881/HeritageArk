'use client';

import { useState, useRef, useEffect } from 'react';
import { ARTIFACTS } from '@/lib/data';
import { Badge, Button } from '@heritageverse/ui';
import Link from 'next/link';

const STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'danger'> = {
  Preserved: 'success',
  Restored: 'warning',
  Critical: 'danger',
};

export default function ScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<typeof ARTIFACTS[0] | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScan = () => {
    setScanning(true);
    setShowUpload(false);
    setTimeout(() => {
      setScanning(false);
      const random = ARTIFACTS[Math.floor(Math.random() * ARTIFACTS.length)] ?? null;
      setSelectedArtifact(random);
      setScanned(true);
    }, 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
      handleScan();
    }
  };

  const handleReset = () => {
    setScanned(false);
    setSelectedArtifact(null);
    setImagePreview(null);
    setShowUpload(false);
  };

  return (
    <div className="min-h-screen bg-navy pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-accent text-sm font-semibold tracking-widest uppercase">Discover</span>
          <h1 className="text-4xl md:text-5xl font-serif text-white mt-3">AR Artifact Scanner</h1>
          <p className="text-white/60 mt-4 max-w-2xl mx-auto">
            Point your camera at cultural artifacts to instantly identify and learn their heritage.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-navy2 border-2 border-white/10 mb-6">
            {scanning && (
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="absolute inset-0 bg-accent/10" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div className="absolute inset-0 border-[3px] border-accent/60 rounded-2xl" style={{ animation: 'scanPulse 1.5s ease-in-out infinite' }} />
                <div className="absolute left-0 right-0 h-0.5 bg-accent/80 shadow-lg shadow-accent/50" style={{ animation: 'scanLine 1.5s ease-in-out infinite' }} />
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-3" style={{ animation: 'spin 1s linear infinite' }}>🔍</div>
                  <p className="text-white font-medium">Scanning artifact...</p>
                </div>
              </div>
            )}

            {!scanning && !scanned && !imagePreview && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-7xl mb-4 opacity-30">📷</div>
                  <p className="text-white/40 text-lg">Place artifact in viewfinder</p>
                  <p className="text-white/20 text-sm mt-1">or upload an image below</p>
                </div>
              </div>
            )}

            {!scanning && !scanned && imagePreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            )}

            {!scanning && scanned && selectedArtifact && (
              <div className="w-full h-full flex items-center justify-center bg-navy2">
                <span className="text-8xl">{selectedArtifact.emoji}</span>
              </div>
            )}

            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/80 text-xs font-medium">AR Active</span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>

          <div className="flex items-center justify-center gap-4 mb-8">
            <Button onClick={handleScan} disabled={scanning} size="lg">
              {scanning ? 'Scanning...' : scanned ? 'Scan Again' : 'Start Scan'}
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={scanning}
            >
              Upload Image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {showUpload && !scanning && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center mb-8">
              <div className="text-5xl mb-4">📸</div>
              <p className="text-white/70 mb-4">Upload a photo of an artifact to identify it</p>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Choose Photo
              </Button>
            </div>
          )}

          {scanned && selectedArtifact && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 animate-slide-up">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{selectedArtifact.emoji}</span>
                <div>
                  <h3 className="text-xl font-serif text-white">{selectedArtifact.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-white/50">{selectedArtifact.culture}</span>
                    <span className="text-white/20">·</span>
                    <span className="text-sm text-white/50">{selectedArtifact.period}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 rounded-xl p-3">
                  <span className="text-xs text-white/40 block">Material</span>
                  <span className="text-sm text-white">{selectedArtifact.material}</span>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <span className="text-xs text-white/40 block">Dimensions</span>
                  <span className="text-sm text-white">{selectedArtifact.dims}</span>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <span className="text-xs text-white/40 block">Location</span>
                  <span className="text-sm text-white">{selectedArtifact.loc}</span>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <span className="text-xs text-white/40 block">Museum</span>
                  <span className="text-sm text-white">{selectedArtifact.museum}</span>
                </div>
              </div>

              <p className="text-white/70 text-sm leading-relaxed mb-4">{selectedArtifact.desc}</p>

              <div className="flex items-center justify-between">
                <Badge variant={STATUS_VARIANTS[selectedArtifact.status] || 'muted'} size="sm">
                  {selectedArtifact.status}
                </Badge>
                <Link
                  href={`/museum/${selectedArtifact.id}`}
                  className="text-accent hover:text-accent/80 text-sm font-medium transition-colors"
                >
                  View in Museum →
                </Link>
              </div>
            </div>
          )}

          {!scanned && !showUpload && (
            <div className="text-center">
              <Button variant="ghost" onClick={() => setShowUpload(true)} className="text-white/40 hover:text-white/60">
                No camera? Upload an image instead
              </Button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes scanPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
        @keyframes scanLine {
          0%, 100% { top: 10%; }
          50% { top: 90%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
