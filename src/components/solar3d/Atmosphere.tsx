'use client';

import * as THREE from 'three';

interface Props {
  size: number;
  color: string;
  opacity?: number;
  /** 0 = tidak dirender, 1 = satu lapis lembut (Normal), 2 = dua lapis: rim tipis + halo luar (High, lebih "cinematic"). */
  layers?: 0 | 1 | 2;
}

/** Atmosfer murah secara render: bola terbalik dengan blending aditif. 2 lapis memberi kesan rim-light yang lebih jelas tanpa shader khusus. */
export default function Atmosphere({ size, color, opacity = 0.16, layers = 1 }: Props) {
  if (layers <= 0) return null;
  if (layers === 1) {
    return (
      <mesh scale={1.07}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    );
  }
  // 2 lapis: rim tipis & lebih terang dekat permukaan, plus halo luar yang lebih lebar & lembut — mensimulasikan atmospheric scattering secara murah.
  return (
    <>
      <mesh scale={1.035}>
        <sphereGeometry args={[size, 40, 40]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 1.1} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh scale={1.14}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 0.45} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </>
  );
}