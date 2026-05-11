import { Box, Cylinder, Sphere, Torus } from '@react-three/drei';
import * as THREE from 'three';

export function CarVisual({ color, brand, steeringAngle = 0 }: { color: string, brand: string, steeringAngle?: number }) {
  return (
    <group>
      {/* --- EXTERIOR --- */}
      {/* Lower Body / Chassis */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.4, 4.2]} />
        <meshPhysicalMaterial 
          color={color} 
          metalness={0.9} 
          roughness={0.1} 
          clearcoat={1} 
          clearcoatRoughness={0.1} 
        />
      </mesh>

      {/* Wheel Arches - Front */}
      <mesh position={[0.9, -0.1, 1.4]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.45, 0.45, 0.1, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-0.9, -0.1, 1.4]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.45, 0.45, 0.1, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Cabin / Roof */}
      <mesh position={[0, 0.6, -0.3]} castShadow>
        <boxGeometry args={[1.5, 0.7, 1.8]} />
        <meshPhysicalMaterial 
          color={color} 
          metalness={0.8} 
          roughness={0.1} 
          clearcoat={1}
        />
      </mesh>

      {/* Glass (Windows) */}
      <mesh position={[0, 0.65, -0.3]}>
        <boxGeometry args={[1.45, 0.6, 1.7]} />
        <meshStandardMaterial 
          color="#111" 
          metalness={1} 
          roughness={0} 
          transparent 
          opacity={0.7} 
        />
      </mesh>

      {/* Hood */}
      <mesh position={[0, 0.35, 1.2]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[1.7, 0.1, 1.5]} />
        <meshPhysicalMaterial color={color} metalness={0.8} clearcoat={1} />
      </mesh>

      {/* Front Bumper / Grill */}
      <group position={[0, 0, 2.1]}>
        <mesh>
          <boxGeometry args={[1.8, 0.5, 0.2]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        {/* Grill Mesh */}
        <mesh position={[0, -0.1, 0.05]}>
          <planeGeometry args={[1, 0.3]} />
          <meshStandardMaterial color="#222" wireframe />
        </mesh>
      </group>

      {/* Rear Wing / Spoiler (Drift Style) */}
      <group position={[0, 0.4, -1.9]}>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[1.9, 0.05, 0.5]} />
          <meshStandardMaterial color="#111" metalness={1} />
        </mesh>
        <mesh position={[-0.8, 0.2, 0]}>
          <boxGeometry args={[0.05, 0.4, 0.1]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0.8, 0.2, 0]}>
          <boxGeometry args={[0.05, 0.4, 0.1]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </group>

      {/* --- INTERIOR --- */}
      <group position={[0, 0.4, 0.2]}>
        {/* Dashboard */}
        <mesh position={[0, 0.2, 0.5]}>
          <boxGeometry args={[1.4, 0.3, 0.4]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        {/* Steering Wheel */}
        <group position={[0.4, 0.25, 0.4]} rotation={[-0.4, 0, steeringAngle * 2]}>
          <mesh>
            <torusGeometry args={[0.15, 0.02, 16, 32]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <mesh rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.3]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        </group>
        {/* Seats */}
        <mesh position={[0.4, -0.1, -0.2]}>
          <boxGeometry args={[0.5, 0.6, 0.5]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[-0.4, -0.1, -0.2]}>
          <boxGeometry args={[0.5, 0.6, 0.5]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </group>

      {/* --- LIGHTS --- */}
      {/* Front LED Headlights */}
      <mesh position={[0.7, 0.15, 2.11]}>
        <planeGeometry args={[0.4, 0.1]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={10} />
      </mesh>
      <mesh position={[-0.7, 0.15, 2.11]}>
        <planeGeometry args={[0.4, 0.1]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={10} />
      </mesh>

      {/* Rear Taillights */}
      <mesh position={[0.7, 0.15, -2.11]}>
        <planeGeometry args={[0.5, 0.1]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={5} />
      </mesh>
      <mesh position={[-0.7, 0.15, -2.11]}>
        <planeGeometry args={[0.5, 0.1]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={5} />
      </mesh>
    </group>
  );
}
