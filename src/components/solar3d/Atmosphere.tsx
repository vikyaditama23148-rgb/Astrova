'use client';

import * as THREE from 'three';

/** Lapisan cahaya tipis di tepi planet (efek atmosfer), murah secara render: bola terbalik dengan blending aditif. */
export default function Atmosphere({ size, color, opacity = 0.16 }: { size: number; color: string; opacity?: number }) {
  return (
    <mesh scale={1.07}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}