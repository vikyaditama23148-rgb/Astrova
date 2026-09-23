'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Html, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import Atmosphere from '@/components/solar3d/Atmosphere';
import { PLANETS_3D, type P3D } from '@/components/solar3d/data';
import { getPlanetTexture } from '@/components/solar3d/textures';
import { getPlanet, type PlanetHotspot } from '@/lib/planets';

const DEG = Math.PI / 180;
/** Ubah lintang/bujur (derajat) menjadi posisi 3D di permukaan bola. */
function latLonToVec3(lat: number, lon: number, r: number): [number, number, number] {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  return [r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)];
}

/** Jarak kamera "pas" untuk tiap planet — planet kecil didekati lebih rapat, planet besar diberi ruang lebih. */
export function defaultDistance(p: P3D) { return p.size * 3.3 + 1.6; }

interface FocusState { id: string | null; showOrbit: boolean; running: boolean; onHotspot: (h: PlanetHotspot | null) => void; activeHotspot: string | null }

function RingPath({ radius }: { radius: number }) {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) { const a = (i / 128) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius)); }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);
  return <primitive object={new THREE.LineLoop(geo, new THREE.LineBasicMaterial({ color: '#9b8f7a', transparent: true, opacity: 0.3 }))} />;
}

function SaturnRings({ size }: { size: number }) {
  return (
    <mesh rotation-x={Math.PI / 2.25}>
      <ringGeometry args={[size * 1.35, size * 2.2, 64]} />
      <meshStandardMaterial color="#e8d5a3" side={THREE.DoubleSide} transparent opacity={0.85} roughness={1} />
    </mesh>
  );
}

function Body({ p, focus, onPick, worldRef }: { p: P3D; focus: FocusState; onPick: (id: string, world: THREE.Object3D) => void; worldRef: (id: string, o: THREE.Object3D | null) => void }) {
  const orbitRef = useRef<THREE.Group>(null);
  const worldGroup = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Mesh>(null);
  const angle = useRef(Math.random() * Math.PI * 2);
  const texture = useMemo(() => getPlanetTexture(p.id), [p.id]);
  const info = useMemo(() => getPlanet(p.id), [p.id]);
  const rough = p.id === 'saturnus' || p.id === 'jupiter' ? 0.55 : p.id === 'uranus' || p.id === 'neptunus' ? 0.4 : 0.85;
  const isFocused = focus.id === p.id;
  const frozen = isFocused && !focus.showOrbit;

  useFrame((_, delta) => {
    if (focus.running && !frozen) angle.current += delta * p.speed * 0.3;
    if (orbitRef.current) orbitRef.current.rotation.y = angle.current;
    if (spinRef.current && focus.running) spinRef.current.rotation.y += delta * p.rotSpeed * 0.8;
  });

  useEffect(() => { worldRef(p.id, worldGroup.current); return () => worldRef(p.id, null); }, [p.id, worldRef]);

  return (
    <group ref={orbitRef}>
      <group ref={worldGroup} position={[p.distance, 0, 0]} rotation-z={p.tilt ?? 0}>
        <mesh
          ref={spinRef}
          onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onPick(p.id, worldGroup.current!); }}
        >
          <sphereGeometry args={[p.size, isFocused ? 72 : 40, isFocused ? 72 : 40]} />
          <meshStandardMaterial map={texture} roughness={rough} metalness={0.04} emissive={p.color} emissiveIntensity={isFocused ? 0.16 : 0.04} />
        </mesh>
        <Atmosphere size={p.size} color={p.color} opacity={p.id === 'bumi' ? 0.24 : 0.13} />
        {p.rings && <SaturnRings size={p.size} />}

        {isFocused && info.hotspots.map((h) => {
          const pos = latLonToVec3(h.lat, h.lon, p.size * 1.03);
          const active = focus.activeHotspot === h.id;
          return (
            <group key={h.id} position={pos}>
              <mesh onClick={(e) => { e.stopPropagation(); focus.onHotspot(active ? null : h); }}>
                <sphereGeometry args={[p.size * 0.045, 12, 12]} />
                <meshBasicMaterial color={active ? '#ff6b4a' : '#ffc93c'} />
              </mesh>
              <Html distanceFactor={8} style={{ pointerEvents: 'none' }}>
                <span className={`block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ${active ? 'bg-[#ff6b4a]' : 'bg-[#ffc93c]'} animate-ping`} style={{ animationDuration: active ? '0s' : '1.8s' }} />
              </Html>
            </group>
          );
        })}
      </group>
    </group>
  );
}

function Sun({ onPick }: { onPick: (id: string, world: THREE.Object3D) => void }) {
  const ref = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);
  const texture = useMemo(() => getPlanetTexture('matahari'), []);
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.05; });
  return (
    <group ref={group}>
      <pointLight color="#fff3b0" intensity={260} distance={70} decay={1.6} />
      <mesh ref={ref} onClick={(e) => { e.stopPropagation(); onPick('matahari', group.current!); }}>
        <sphereGeometry args={[1.7, 64, 64]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      <mesh scale={2.4}><sphereGeometry args={[1.7, 24, 24]} /><meshBasicMaterial color="#ffb300" transparent opacity={0.16} /></mesh>
    </group>
  );
}

/** Kamera bebas: terbang halus ke target saat memilih planet, lalu OrbitControls bebas di sekitarnya. */
function CameraRig({ target, distance, controlsRef }: { target: THREE.Object3D | null; distance: number; controlsRef: React.RefObject<any> }) {
  const { camera } = useThree();
  const desired = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    let goalLook = new THREE.Vector3(0, 0, 0);
    if (target) target.getWorldPosition(goalLook);
    lookAt.current.lerp(goalLook, 0.06);

    if (target) {
      const dir = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
      if (dir.lengthSq() < 0.001) dir.set(0.4, 0.25, 1).normalize();
      desired.current.copy(goalLook).addScaledVector(dir, distance);
      camera.position.lerp(desired.current, 0.05);
    }
    controls.target.copy(lookAt.current);
    controls.update();
  });
  return null;
}

/**
 * Sesuaikan jarak kamera tampilan-keseluruhan (belum fokus ke planet mana pun)
 * mengikuti rasio lebar:tinggi layar sesungguhnya. Tanpa ini, kamera dengan
 * jarak tetap membuat tata surya terlihat kecil dan "memanjang ke samping"
 * di layar laptop/monitor lebar, karena banyak ruang kosong muncul di kiri-kanan.
 */
function FitOverview({ active }: { active: boolean }) {
  const { camera, size } = useThree();
  useEffect(() => {
    if (!active) return;
    const aspect = size.width / Math.max(1, size.height);
    // Makin lebar layarnya, makin dekat kamera ditarik, supaya tata surya
    // tetap memenuhi bingkai alih-alih makin "tenggelam" di tengah.
    const distance = 13 / (0.55 + 0.45 * Math.max(0.6, Math.min(aspect, 2.6)));
    camera.position.set(0, distance * 0.42, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [active, size.width, size.height, camera]);
  return null;
}

export interface ObservatoriumSceneProps {
  focusId: string | null; showOrbit: boolean; running: boolean; activeHotspot: string | null;
  onPickPlanet: (id: string) => void; onHotspot: (h: PlanetHotspot | null) => void; controlsRef: React.RefObject<any>;
}

export default function ObservatoriumScene({ focusId, showOrbit, running, activeHotspot, onPickPlanet, onHotspot, controlsRef }: ObservatoriumSceneProps) {
  const worldObjs = useRef<Record<string, THREE.Object3D | null>>({});
  const sunGroup = useRef<THREE.Group | null>(null);

  const setWorld = (id: string, o: THREE.Object3D | null) => { worldObjs.current[id] = o; };
  const focusObj = focusId === 'matahari' ? sunGroup.current : focusId ? worldObjs.current[focusId] ?? null : null;
  const focusP = PLANETS_3D.find((p) => p.id === focusId);
  const distance = focusId === 'matahari' ? 6 : focusP ? defaultDistance(focusP) : 22;

  const focus: FocusState = { id: focusId, showOrbit, running, onHotspot, activeHotspot };

  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 6, 14], fov: 50 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.35} />
      <Stars radius={100} depth={50} count={2600} factor={2.2} saturation={0} fade speed={0.35} />
      <group ref={(g) => { sunGroup.current = g; }}><Sun onPick={onPickPlanet} /></group>
      {PLANETS_3D.map((p) => <RingPath key={`r-${p.id}`} radius={p.distance} />)}
      {PLANETS_3D.map((p) => <Body key={p.id} p={p} focus={focus} onPick={onPickPlanet} worldRef={setWorld} />)}
      <FitOverview active={!focusId} />
      <CameraRig target={focusObj} distance={distance} controlsRef={controlsRef} />
      <OrbitControls ref={controlsRef} enablePan={!focusId} enableZoom minDistance={2.5} maxDistance={45} rotateSpeed={0.55} zoomSpeed={0.7} makeDefault />
    </Canvas>
  );
}