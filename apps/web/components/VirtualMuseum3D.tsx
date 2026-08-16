'use client';

import { useRef, useEffect, useState, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';

export interface AvatarConfig {
  name: string;
  skinColor: string;
  hairColor: string;
  shirtColor: string;
  photoUrl?: string;
}

// ─── Hotspots ─────────────────────────────────────────────────────────────────

const HOTSPOTS = [
  { id: 'entrance', position: [0, 1.5, -2] as [number,number,number], label: 'Grand Entrance Hall', emoji: '🏛️', story: 'Welcome to the Hallwyl Museum — built between 1893 and 1898 for Count Walther and Countess Wilhelmina von Hallwyl. This magnificent entrance hall reflects the eclectic historicism style popular in late 19th century Sweden. The marble floors and gilded ceilings were designed to impress visitors from the very first step.' },
  { id: 'dining', position: [4, 1.5, 0] as [number,number,number], label: 'The Dining Room', emoji: '🍽️', story: 'The grand dining room hosted lavish banquets for Stockholm\'s elite. The table could seat 24 guests. Notice the hand-painted ceiling depicting scenes from Norse mythology. The silver candelabras are original pieces from the 1890s, each weighing over 12 kilograms.' },
  { id: 'library', position: [-4, 1.5, 0] as [number,number,number], label: 'The Library', emoji: '📚', story: 'Countess Wilhelmina was an avid collector and scholar. This library housed over 3,000 volumes on art history, archaeology, and natural sciences. She was one of the first women in Sweden to systematically catalog an art collection.' },
  { id: 'gallery', position: [0, 1.5, 4] as [number,number,number], label: 'The Art Gallery', emoji: '🖼️', story: 'The gallery displays the Countess\'s extraordinary collection of Flemish and Dutch masters from the 17th century. She acquired over 70 paintings during her travels across Europe, including works attributed to students of Rembrandt and Rubens.' },
  { id: 'courtyard', position: [0, 1.5, -8] as [number,number,number], label: 'The Inner Courtyard', emoji: '🌿', story: 'The glass-roofed inner courtyard was a revolutionary architectural feature in 1898. It allowed natural light to flood the interior while protecting guests from Stockholm\'s harsh winters. The fountain depicts the goddess Diana surrounded by hunting hounds.' },
];

// ─── Loader ───────────────────────────────────────────────────────────────────

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'white' }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(176,125,79,0.3)', borderTopColor: '#B07D4F', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: '#B07D4F' }}>Loading Museum</p>
        <div style={{ width: 180, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#B07D4F', transition: 'width 0.3s' }} />
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{Math.round(progress)}%</p>
      </div>
    </Html>
  );
}

// ─── Museum GLB ───────────────────────────────────────────────────────────────

function MuseumModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  useEffect(() => {
    scene.traverse(child => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) { mesh.castShadow = true; mesh.receiveShadow = true; }
    });
  }, [scene]);
  return <primitive object={scene} scale={1} position={[0, 0, 0]} />;
}

// ─── Fallback room ────────────────────────────────────────────────────────────

function FallbackRoom() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#2a1f14" roughness={0.8} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#1a1208" />
      </mesh>
      {([
        [[0, 2, -10], [0, 0, 0]],
        [[0, 2, 10], [0, Math.PI, 0]],
        [[-10, 2, 0], [0, Math.PI / 2, 0]],
        [[10, 2, 0], [0, -Math.PI / 2, 0]],
      ] as [[number,number,number],[number,number,number]][]).map(([p, r], i) => (
        <mesh key={i} position={p} rotation={r} receiveShadow>
          <planeGeometry args={[20, 4]} />
          <meshStandardMaterial color="#3d2b1a" roughness={0.9} />
        </mesh>
      ))}
      {([[-4,0,-4],[4,0,-4],[-4,0,4],[4,0,4]] as [number,number,number][]).map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <cylinderGeometry args={[0.3, 0.35, 4, 12]} />
          <meshStandardMaterial color="#c8a97a" roughness={0.4} metalness={0.1} />
        </mesh>
      ))}
      <pointLight position={[0, 3.5, 0]} intensity={2} color="#fff5e0" distance={15} />
      <pointLight position={[-5, 3, -5]} intensity={1} color="#B07D4F" distance={10} />
      <pointLight position={[5, 3, 5]} intensity={1} color="#B07D4F" distance={10} />
    </group>
  );
}

// ─── Avatar head (photo texture or color) ─────────────────────────────────────

function AvatarHead({ photoUrl, skinColor }: { photoUrl?: string; skinColor: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!photoUrl) return;
    const loader = new THREE.TextureLoader();
    loader.load(photoUrl, tex => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    });
  }, [photoUrl]);

  return (
    <mesh ref={meshRef} position={[0, 1.75, 0]} castShadow>
      <sphereGeometry args={[0.22, 32, 32]} />
      {texture
        ? <meshStandardMaterial map={texture} />
        : <meshStandardMaterial color={skinColor} />}
    </mesh>
  );
}

// ─── Hotspot marker ───────────────────────────────────────────────────────────

function HotspotMarker({ hotspot, onActivate, playerPos }: {
  hotspot: typeof HOTSPOTS[0];
  onActivate: (h: typeof HOTSPOTS[0]) => void;
  playerPos: THREE.Vector3;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const pos = new THREE.Vector3(...hotspot.position);
  const inRange = playerPos.distanceTo(pos) < 3;

  useFrame(state => {
    if (meshRef.current) {
      meshRef.current.position.y = hotspot.position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={hotspot.position}>
      <mesh ref={meshRef}
        onClick={() => inRange && onActivate(hotspot)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}>
        <octahedronGeometry args={[0.2]} />
        <meshStandardMaterial
          color={inRange ? '#B07D4F' : '#ffffff'}
          emissive={hovered ? '#B07D4F' : inRange ? '#7A5535' : '#222'}
          emissiveIntensity={hovered ? 2 : 1}
          transparent opacity={0.9}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <ringGeometry args={[0.3, 0.5, 32]} />
        <meshStandardMaterial color={inRange ? '#B07D4F' : '#444'} transparent opacity={0.3} />
      </mesh>
      <Html center position={[0, 0.6, 0]} distanceFactor={8}>
        <div style={{
          padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 500,
          whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none',
          background: inRange ? '#B07D4F' : 'rgba(0,0,0,0.6)',
          color: inRange ? '#fff' : 'rgba(255,255,255,0.6)',
          border: inRange ? 'none' : '1px solid rgba(255,255,255,0.15)',
        }}>
          {hotspot.emoji} {hotspot.label}{inRange ? ' · Click' : ''}
        </div>
      </Html>
    </group>
  );
}

// ─── Mouse-look controller (no PointerLock) ───────────────────────────────────

function PlayerController({ avatar, onPositionChange, onHotspotActivate, glbUrl }: {
  avatar: AvatarConfig;
  onPositionChange: (pos: THREE.Vector3) => void;
  onHotspotActivate: (h: typeof HOTSPOTS[0]) => void;
  glbUrl: string | null;
}) {
  const { camera, gl } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const playerPos = useRef(new THREE.Vector3(0, 1.7, 2));
  const yaw = useRef(0);
  const pitch = useRef(0);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    camera.position.copy(playerPos.current);

    const onKey = (e: KeyboardEvent) => {
      keys.current[e.code] = e.type === 'keydown';
      if (['KeyW','KeyS','KeyA','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
    };
    const onMouseDown = (e: MouseEvent) => { isDragging.current = true; lastMouse.current = { x: e.clientX, y: e.clientY }; };
    const onMouseUp = () => { isDragging.current = false; };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      yaw.current -= dx * 0.003;
      pitch.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch.current - dy * 0.003));
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) { isDragging.current = true; lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || !e.touches[0]) return;
      const dx = e.touches[0].clientX - lastMouse.current.x;
      const dy = e.touches[0].clientY - lastMouse.current.y;
      lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      yaw.current -= dx * 0.004;
      pitch.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch.current - dy * 0.004));
    };

    window.addEventListener('keydown', onKey, { capture: true });
    window.addEventListener('keyup', onKey, { capture: true });
    gl.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    gl.domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    gl.domElement.setAttribute('tabindex', '-1');

    return () => {
      window.removeEventListener('keydown', onKey, { capture: true });
      window.removeEventListener('keyup', onKey, { capture: true });
      gl.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      gl.domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [camera, gl]);

  useFrame((_, delta) => {
    // Apply yaw + pitch to camera
    const euler = new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler);

    const speed = 4;
    const dir = new THREE.Vector3();
    const forward = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    const right = new THREE.Vector3(Math.cos(yaw.current), 0, -Math.sin(yaw.current));

    if (keys.current['KeyW'] || keys.current['ArrowUp']) dir.add(forward);
    if (keys.current['KeyS'] || keys.current['ArrowDown']) dir.sub(forward);
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) dir.sub(right);
    if (keys.current['KeyD'] || keys.current['ArrowRight']) dir.add(right);

    if (dir.length() > 0) {
      dir.normalize().multiplyScalar(speed * delta);
      playerPos.current.add(dir);
      playerPos.current.x = Math.max(-9, Math.min(9, playerPos.current.x));
      playerPos.current.z = Math.max(-9, Math.min(9, playerPos.current.z));
    }

    playerPos.current.y = 1.7;
    camera.position.copy(playerPos.current);
    onPositionChange(playerPos.current.clone());
  });

  return (
    <>
      {glbUrl ? (
        <Suspense fallback={<Loader />}>
          <MuseumModel url={glbUrl} />
        </Suspense>
      ) : (
        <FallbackRoom />
      )}
      {HOTSPOTS.map(h => (
        <HotspotMarker key={h.id} hotspot={h} onActivate={onHotspotActivate} playerPos={playerPos.current} />
      ))}
    </>
  );
}

// ─── Story Panel ──────────────────────────────────────────────────────────────

function StoryPanel({ hotspot, onClose }: { hotspot: typeof HOTSPOTS[0]; onClose: () => void }) {
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(() => {
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const utt = new SpeechSynthesisUtterance(hotspot.story);
    utt.rate = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (v) utt.voice = v;
    utt.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
    setSpeaking(true);
  }, [speaking, hotspot.story]);

  useEffect(() => () => { window.speechSynthesis.cancel(); }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-6 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-lg bg-[#0D0D0D]/95 backdrop-blur-xl border border-[#B07D4F]/30 rounded-2xl p-6 shadow-2xl" style={{ animation: 'slideUp 0.3s ease-out' }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{hotspot.emoji}</span>
            <div>
              <h3 className="text-white font-serif text-lg">{hotspot.label}</h3>
              <p className="text-[#B07D4F]/60 text-xs tracking-widest uppercase">Heritage Story</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors text-xl">✕</button>
        </div>
        <p className="text-white/70 text-sm leading-relaxed mb-5">{hotspot.story}</p>
        <div className="flex gap-3">
          <button onClick={speak}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${speaking ? 'bg-[#B07D4F]/20 border border-[#B07D4F]/40 text-[#B07D4F]' : 'bg-[#B07D4F] text-white hover:bg-[#9A6B3F]'}`}>
            {speaking ? <><span className="w-2 h-2 rounded-full bg-[#B07D4F] animate-pulse" /> Stop Audio</> : <>▶ Play Audio Guide</>}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:border-white/30 hover:text-white transition-all">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function VirtualMuseum3D({ avatar, glbUrl, onExit }: {
  avatar: AvatarConfig;
  glbUrl: string | null;
  onExit: () => void;
}) {
  const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0, 1.7, 2));
  const [activeHotspot, setActiveHotspot] = useState<typeof HOTSPOTS[0] | null>(null);
  const [minimap, setMinimap] = useState(true);

  return (
    <div className="fixed inset-0 bg-black z-40">
      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 200, position: [0, 1.7, 2] }}
        gl={{ antialias: true, shadowMapType: THREE.PCFSoftShadowMap } as any}
        style={{ cursor: 'grab' }}
      >
        <color attach="background" args={['#0a0604']} />
        <fog attach="fog" args={['#0a0604', 10, 40]} />
        <ambientLight intensity={0.5} color="#fff5e0" />
        <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
        <PlayerController
          avatar={avatar}
          onPositionChange={setPlayerPos}
          onHotspotActivate={setActiveHotspot}
          glbUrl={glbUrl}
        />
      </Canvas>

      {/* HUD */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
        <button onClick={onExit}
          className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur border border-white/10 rounded-full text-white/70 text-xs hover:text-white hover:border-white/30 transition-all">
          ← Exit Museum
        </button>
        <div className="flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur border border-white/10 rounded-full text-white/50 text-xs">
          {avatar.photoUrl && (
            <img src={avatar.photoUrl} alt="" className="w-5 h-5 rounded-full object-cover border border-white/20" />
          )}
          {avatar.name} · Hallwyl Museum
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20">
        <button onClick={() => setMinimap(m => !m)}
          className="px-3 py-2 bg-black/60 backdrop-blur border border-white/10 rounded-full text-white/50 text-xs hover:text-white transition-all">
          {minimap ? 'Hide Map' : 'Show Map'}
        </button>
      </div>

      {/* Minimap */}
      {minimap && (
        <div className="absolute bottom-6 right-6 z-20 w-36 h-36 bg-black/70 backdrop-blur border border-white/10 rounded-xl overflow-hidden">
          <svg viewBox="-12 -12 24 24" className="w-full h-full">
            <rect x="-10" y="-10" width="20" height="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" />
            {HOTSPOTS.map(h => <circle key={h.id} cx={h.position[0]} cy={h.position[2]} r="0.6" fill="#B07D4F" opacity="0.7" />)}
            <circle cx={playerPos.x} cy={playerPos.z} r="0.8" fill="#fff" />
            <circle cx={playerPos.x} cy={playerPos.z} r="0.4" fill="#B07D4F" />
          </svg>
          <p className="absolute bottom-1 left-0 right-0 text-center text-[9px] text-white/30">Minimap</p>
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2 bg-black/50 backdrop-blur border border-white/10 rounded-full text-white/30 text-xs">
        <span>WASD — Move</span>
        <span className="w-px h-3 bg-white/10" />
        <span>🖱️ Drag — Look</span>
        <span className="w-px h-3 bg-white/10" />
        <span>🔶 Approach & click markers</span>
      </div>

      {activeHotspot && <StoryPanel hotspot={activeHotspot} onClose={() => setActiveHotspot(null)} />}

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
