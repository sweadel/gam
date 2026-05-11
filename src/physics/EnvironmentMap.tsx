import { Box, Cylinder, Plane, Sphere } from '@react-three/drei';
import { usePlane } from '@react-three/cannon';
import { useStore } from '../store/useStore';
import * as THREE from 'three';

export function EnvironmentMap() {
  const env = useStore((state) => state.environment);
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -0.5, 0],
  }));

  // Create a simplified city
  const buildings = [];
  const roadWidth = 20;
  const blockSize = 50;

  if (env === 'city') {
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        if (x === 0 && z === 0) continue;

        const posX = x * (blockSize + roadWidth);
        const posZ = z * (blockSize + roadWidth);
        const height = 20 + Math.random() * 40;
        const color = Math.random() > 0.5 ? "#111" : "#0a0a0a";

        buildings.push(
          <group key={`${x}-${z}`} position={[posX, height / 2 - 0.5, posZ]}>
            <mesh>
              <boxGeometry args={[blockSize, height, blockSize]} />
              <meshStandardMaterial color={color} roughness={0.1} metalness={0.5} />
            </mesh>
            {/* Neon Accent */}
            <mesh position={[0, height / 2 - 2, blockSize / 2 + 0.1]}>
              <boxGeometry args={[blockSize - 10, 1, 0.2]} />
              <meshStandardMaterial color={Math.random() > 0.5 ? "#ff4d4d" : "#4d4dff"} emissive={Math.random() > 0.5 ? "#ff4d4d" : "#4d4dff"} emissiveIntensity={5} />
            </mesh>
          </group>
        );
      }
    }
  }

  return (
    <group>
      {/* Floor */}
      <mesh ref={ref as any} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#050505" />
      </mesh>

      {/* Road Markings */}
      <gridHelper args={[1000, 50, "#222", "#111"]} position={[0, -0.48, 0]} />

      {/* Environment specific visuals */}
      {env === 'city' && buildings}
      
      {env === 'circle' && (
        <group>
          {/* Main Circle Ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
            <ringGeometry args={[15, 15.5, 64]} />
            <meshStandardMaterial color="#ff4d4d" emissive="#ff4d4d" emissiveIntensity={5} />
          </mesh>
          
          {/* Limited number of lights for stability */}
          {[0, 90, 180, 270].map((angle) => (
            <pointLight 
              key={angle}
              position={[Math.cos(angle * Math.PI / 180) * 30, 5, Math.sin(angle * Math.PI / 180) * 30]}
              intensity={100}
              color="#ff4d4d"
              distance={60}
            />
          ))}
        </group>
      )}

      {/* Global Ambient and Directional Light is in App.tsx */}
    </group>
  );
}
