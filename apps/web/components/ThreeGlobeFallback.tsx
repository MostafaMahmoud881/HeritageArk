'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { HERITAGE_SITES, type HeritageSite } from '@/lib/heritage-sites';
import { CULTURES, CULTURE_DETAILS } from '@/lib/data';

interface ThreeGlobeFallbackProps {
  onSiteClick?: (site: HeritageSite) => void;
  initialCultureId?: string;
}

interface CulturePopup {
  cultureId: string;
  name: string;
  emoji: string;
  description: string;
  x: number;
  y: number;
}

export default function ThreeGlobeFallback({ onSiteClick, initialCultureId }: ThreeGlobeFallbackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    earth: THREE.Mesh;
    atmosphere: THREE.Mesh;
    markers: { mesh: THREE.Mesh; glow: THREE.Mesh; site: HeritageSite }[];
    rotationVelocityX: number;
    isDragging: boolean;
    prevX: number;
    prevY: number;
    animId: number;
    targetRotationY?: number;
    targetRotationX?: number;
    isAnimatingToTarget?: boolean;
    animationFrameCount?: number;
  } | null>(null);
  const [culturePopup, setCulturePopup] = useState<CulturePopup | null>(null);
  const initialSiteSelected = useRef(false);

  const getMarkerScreenPosition = useCallback((site: HeritageSite, earth: THREE.Mesh, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer): { x: number; y: number } | null => {
    const phi = (90 - site.lat) * (Math.PI / 180);
    const theta = site.lng * (Math.PI / 180);
    const r = 1.25;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);

    const worldPos = new THREE.Vector3(x, y, z);
    worldPos.applyEuler(earth.rotation);
    const screenPos = worldPos.clone().project(camera);

    if (screenPos.z > 1) return null;

    const rect = renderer.domElement.getBoundingClientRect();
    return {
      x: (screenPos.x * 0.5 + 0.5) * rect.width,
      y: (-screenPos.y * 0.5 + 0.5) * rect.height,
    };
  }, []);

  const flyToCulture = useCallback((cultureId: string, retries = 0) => {
    const ctx = sceneRef.current;
    if (!ctx) {
      if (retries < 20) {
        setTimeout(() => flyToCulture(cultureId, retries + 1), 100);
      }
      return;
    }

    const sitesForCulture = HERITAGE_SITES.filter(s => s.cultureId === cultureId);
    if (sitesForCulture.length === 0) return;

    const avgLat = sitesForCulture.reduce((sum, s) => sum + s.lat, 0) / sitesForCulture.length;
    const avgLng = sitesForCulture.reduce((sum, s) => sum + s.lng, 0) / sitesForCulture.length;

    const phi = (90 - avgLat) * (Math.PI / 180);
    const theta = avgLng * (Math.PI / 180);

    const currentRotationY = ctx.earth.rotation.y % (Math.PI * 2);
    const targetRotationY = -theta + Math.PI / 2;
    let diff = targetRotationY - currentRotationY;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    ctx.targetRotationY = ctx.earth.rotation.y + diff;
    ctx.targetRotationX = phi - Math.PI / 2;
    ctx.isAnimatingToTarget = true;
    ctx.animationFrameCount = 0;

    const firstSite = sitesForCulture[0];
    if (!firstSite) return;
    if (onSiteClick) onSiteClick(firstSite);

    const culture = CULTURES.find(c => c.id === cultureId);
    const details = CULTURE_DETAILS[cultureId];
    if (culture && details) {
      const screenPos = getMarkerScreenPosition(firstSite, ctx.earth, ctx.camera, ctx.renderer);
      if (screenPos) {
        setCulturePopup({
          cultureId,
          name: culture.name,
          emoji: culture.flag,
          description: details.summary,
          x: screenPos.x,
          y: screenPos.y,
        });
      }
    }
  }, [onSiteClick, getMarkerScreenPosition]);

  useEffect(() => {
    const wrap = containerRef.current;
    if (!wrap) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, wrap.clientWidth / wrap.clientHeight, 0.1, 1000);
    camera.position.z = 3.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    wrap.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    const starsGeo = new THREE.BufferGeometry();
    const starCount = 1500;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 60;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    const loader = new THREE.TextureLoader();
    const earthTextureUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg';

    const geometry = new THREE.SphereGeometry(1.2, 64, 64);
    const material = new THREE.MeshPhongMaterial({ color: 0x3a6ea5 });
    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    loader.load(
      earthTextureUrl,
      (texture) => {
        material.map = texture;
        material.color.set(0xffffff);
        material.needsUpdate = true;
      },
      undefined,
      () => {}
    );

    const atmosGeo = new THREE.SphereGeometry(1.25, 64, 64);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x4fd1ff,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosphere);

    const markers: { mesh: THREE.Mesh; glow: THREE.Mesh; site: HeritageSite }[] = [];
    HERITAGE_SITES.forEach((site) => {
      const phi = (90 - site.lat) * (Math.PI / 180);
      const theta = site.lng * (Math.PI / 180);
      const r = 1.25;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);

      const markerGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const markerMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(site.color) });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(x, y, z);
      marker.userData = { site };
      scene.add(marker);

      const glowGeo = new THREE.SphereGeometry(0.07, 8, 8);
      const glowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(site.color),
        transparent: true,
        opacity: 0.3,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.set(x, y, z);
      scene.add(glow);

      markers.push({ mesh: marker, glow, site });
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let rotationVelocityX = 0.0015;
    let clickStartX = 0;
    let clickStartY = 0;
    let wasDragged = false;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      wasDragged = false;
      prevX = e.clientX;
      prevY = e.clientY;
      clickStartX = e.clientX;
      clickStartY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      const dx = Math.abs(e.clientX - clickStartX);
      const dy = Math.abs(e.clientY - clickStartY);
      if (dx < 5 && dy < 5) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const meshes = markers.map((m) => m.mesh);
        const intersects = raycaster.intersectObjects(meshes);
        if (intersects.length > 0) {
          const hit = intersects[0]?.object;
          const site = hit?.userData?.site as HeritageSite | undefined;
          if (site && onSiteClick) onSiteClick(site);
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) wasDragged = true;
      earth.rotation.y += dx * 0.005;
      earth.rotation.x += dy * 0.005;
      atmosphere.rotation.y = earth.rotation.y;
      atmosphere.rotation.x = earth.rotation.x;
      rotationVelocityX = dx * 0.0003;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.002;
      camera.position.z = Math.max(1.8, Math.min(6, camera.position.z));
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    let animId = 0;
    function animate() {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        const ctx = sceneRef.current;
        if (ctx?.isAnimatingToTarget && ctx.targetRotationY !== undefined && ctx.targetRotationX !== undefined) {
          const lerpFactor = 0.04;
          earth.rotation.y += (ctx.targetRotationY - earth.rotation.y) * lerpFactor;
          earth.rotation.x += (ctx.targetRotationX - earth.rotation.x) * lerpFactor;
          atmosphere.rotation.y = earth.rotation.y;
          atmosphere.rotation.x = earth.rotation.x;

          ctx.animationFrameCount = (ctx.animationFrameCount || 0) + 1;
          if (Math.abs(ctx.targetRotationY - earth.rotation.y) < 0.001 && Math.abs(ctx.targetRotationX - earth.rotation.x) < 0.001) {
            ctx.isAnimatingToTarget = false;
            ctx.animationFrameCount = 0;
          } else if ((ctx.animationFrameCount || 0) > 600) {
            ctx.isAnimatingToTarget = false;
            ctx.animationFrameCount = 0;
          }
        } else {
          earth.rotation.y += rotationVelocityX || 0.0015;
          atmosphere.rotation.y = earth.rotation.y;
        }
      }
      renderer.render(scene, camera);
    }
    animate();

    const onResize = () => {
      camera.aspect = wrap.clientWidth / wrap.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(wrap.clientWidth, wrap.clientHeight);
    };
    window.addEventListener('resize', onResize);

    sceneRef.current = {
      scene, camera, renderer, earth, atmosphere, markers,
      rotationVelocityX, isDragging: false, prevX: 0, prevY: 0, animId,
      targetRotationY: undefined,
      targetRotationX: undefined,
      isAnimatingToTarget: false,
      animationFrameCount: 0,
    } as any;

    if (initialCultureId && !initialSiteSelected.current) {
      initialSiteSelected.current = true;
      setTimeout(() => flyToCulture(initialCultureId), 500);
    }

    return () => {
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('wheel', onWheel);
      wrap.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [onSiteClick, initialCultureId, flyToCulture, getMarkerScreenPosition]);

  return (
    <div className="relative w-full h-full min-h-[600px]">
      <div
        ref={containerRef}
        className="w-full h-full rounded-xl overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at center, #0a0e1a 0%, #05070d 100%)' }}
      />
      {culturePopup && (
        <div
          className="absolute z-20 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-4 pointer-events-none"
          style={{
            left: culturePopup.x,
            top: culturePopup.y + 20,
            transform: 'translate(-50%, 0)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{culturePopup.emoji}</span>
            <h4 className="font-serif font-semibold text-navy text-sm">{culturePopup.name}</h4>
          </div>
          <p className="text-xs text-muted leading-relaxed">{culturePopup.description}</p>
          <div className="mt-2 flex items-center gap-1 text-accent">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="text-[10px] font-medium">Heritage Site Selected</span>
          </div>
        </div>
      )}
    </div>
  );
}
