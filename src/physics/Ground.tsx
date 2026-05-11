import { usePlane } from '@react-three/cannon';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export function Ground() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -0.5, 0],
  }));

  return (
    <group>
      {/* Main Track Area */}
      <mesh ref={ref as any} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Drift Circle Center Markings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
        <ringGeometry args={[15, 16, 64]} />
        <meshStandardMaterial color="#ffffff" opacity={0.5} transparent />
      </mesh>

      {/* Decorative Lights / Barriers around the circle */}
      {Array.from({ length: 12 }).map((_, i) => (
        <group key={i} rotation={[0, (i / 12) * Math.PI * 2, 0]}>
          <mesh position={[40, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 2, 8]} />
            <meshStandardMaterial color="#ff4d4d" emissive="#ff0000" emissiveIntensity={2} />
          </mesh>
        </group>
      ))}

      {/* Grid helper for scale */}
      <gridHelper args={[100, 50, "#333", "#222"]} position={[0, -0.48, 0]} />
    </group>
  );
}
