import { Box, Cylinder } from '@react-three/drei';

export function CarVisual({ color, brand }: { color: string, brand: string }) {
  return (
    <group>
      {/* Lower Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.5, 4]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Cabin */}
      <mesh position={[0, 0.5, -0.2]} castShadow>
        <boxGeometry args={[1.5, 0.6, 1.8]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Windows */}
      <mesh position={[0, 0.6, -0.2]} castShadow>
        <boxGeometry args={[1.4, 0.4, 1.6]} />
        <meshStandardMaterial color="#111" metalness={1} roughness={0} />
      </mesh>

      {/* Hood */}
      <mesh position={[0, 0.3, 1.2]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[1.6, 0.1, 1.4]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Trunk / Spoiler */}
      <group position={[0, 0.3, -1.8]}>
        <mesh>
          <boxGeometry args={[1.6, 0.1, 0.8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* Actual Spoiler */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[1.7, 0.05, 0.4]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[-0.7, 0.2, 0]}>
          <boxGeometry args={[0.05, 0.4, 0.1]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0.7, 0.2, 0]}>
          <boxGeometry args={[0.05, 0.4, 0.1]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </group>

      {/* Headlights */}
      <mesh position={[0.6, 0.1, 2.01]}>
        <planeGeometry args={[0.4, 0.2]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} />
      </mesh>
      <mesh position={[-0.6, 0.1, 2.01]}>
        <planeGeometry args={[0.4, 0.2]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} />
      </mesh>

      {/* Taillights */}
      <mesh position={[0.6, 0.1, -2.01]}>
        <planeGeometry args={[0.4, 0.15]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-0.6, 0.1, -2.01]}>
        <planeGeometry args={[0.4, 0.15]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}
