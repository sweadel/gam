import { Box, Cylinder, Plane, Sphere } from '@react-three/drei';
import { usePlane, useBox } from '@react-three/cannon';
import { useStore } from '../store/useStore';
import * as THREE from 'three';
import { useMemo } from 'react';

export function EnvironmentMap() {
  const env = useStore((state) => state.environment);
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -0.5, 0],
  }));

  const roadWidth = 20;
  const blockSize = 60;
  const sidewalkWidth = 3;

  // 1. Enhanced Buildings with Windows
  const Building = ({ position, args, color }: { position: [number, number, number], args: [number, number, number], color: string }) => {
    return (
      <group position={position}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={args} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Window Lights */}
        {Array.from({ length: 15 }).map((_, i) => (
          <mesh 
            key={i} 
            position={[
              (Math.random() - 0.5) * args[0], 
              (Math.random() - 0.5) * args[1], 
              args[2]/2 + 0.05
            ]}
          >
            <planeGeometry args={[1, 0.6]} />
            <meshStandardMaterial 
              color="#fff" 
              emissive="#ffcc00" 
              emissiveIntensity={Math.random() * 2} 
              transparent 
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>
    );
  };

  // 2. Street Light Component
  const StreetLight = ({ position }: { position: [number, number, number] }) => {
    return (
      <group position={position}>
        {/* Pole */}
        <mesh position={[0, 4, 0]}>
          <cylinderGeometry args={[0.1, 0.15, 8]} />
          <meshStandardMaterial color="#222" metalness={0.8} />
        </mesh>
        {/* Arm */}
        <mesh position={[1, 8, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 2]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        {/* Head */}
        <mesh position={[2, 8, 0]}>
          <boxGeometry args={[0.5, 0.2, 0.8]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        {/* Light Source */}
        <pointLight position={[2, 7.8, 0]} intensity={50} color="#ffaa00" distance={25} />
        <mesh position={[2, 7.9, 0]}>
          <boxGeometry args={[0.4, 0.05, 0.7]} />
          <meshStandardMaterial color="#fff" emissive="#ffaa00" emissiveIntensity={10} />
        </mesh>
      </group>
    );
  };

  const buildings = useMemo(() => {
    const items = [];
    for (let x = -3; x <= 3; x++) {
      for (let z = -3; z <= 3; z++) {
        if (x === 0 && z === 0) continue;

        const posX = x * (blockSize + roadWidth);
        const posZ = z * (blockSize + roadWidth);
        const height = 30 + Math.random() * 60;
        const color = ["#1a1a1a", "#222", "#0f0f0f"][Math.floor(Math.random() * 3)];

        items.push(
          <Building 
            key={`b-${x}-${z}`} 
            position={[posX, height / 2 - 0.5, posZ]} 
            args={[blockSize, height, blockSize]} 
            color={color} 
          />
        );

        // Add Sidewalks around the building block
        items.push(
          <mesh 
            key={`s-${x}-${z}`} 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[posX, -0.48, posZ]}
          >
            <planeGeometry args={[blockSize + sidewalkWidth * 2, blockSize + sidewalkWidth * 2]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        );

        // Add Street Lights at corners
        items.push(<StreetLight key={`l1-${x}-${z}`} position={[posX - blockSize/2 - 2, 0, posZ - blockSize/2 - 2]} />);
      }
    }
    return items;
  }, []);

  return (
    <group>
      {/* Floor - Real Asphalt Look */}
      <mesh ref={ref as any} receiveShadow>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
      </mesh>

      {/* Road Grid / Lines */}
      <gridHelper args={[2000, 100, "#1a1a1a", "#111"]} position={[0, -0.49, 0]} />

      {/* Main Drifting Area Center (The Pit) */}
      <group position={[0, -0.45, 0]}>
         <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[20, 64]} />
            <meshStandardMaterial color="#111" />
         </mesh>
         <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[19.5, 20, 64]} />
            <meshStandardMaterial color="#ff4d4d" emissive="#ff4d4d" emissiveIntensity={2} />
         </mesh>
      </group>

      {/* Environment specific visuals */}
      {env === 'city' && buildings}
      
      {env === 'drag' && (
        <group>
          {/* Long Drag Strip */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, -200]}>
            <planeGeometry args={[18, 800]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh position={[0, -0.39, -200]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.2, 800]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
          
          {/* Concrete Walls */}
          <mesh position={[10, 1, -200]}>
            <boxGeometry args={[1, 3, 800]} />
            <meshStandardMaterial color="#444" />
          </mesh>
          <mesh position={[-10, 1, -200]}>
            <boxGeometry args={[1, 3, 800]} />
            <meshStandardMaterial color="#444" />
          </mesh>
        </group>
      )}

      {/* Props */}
      <group position={[10, 0, 10]}>
         <Cylinder args={[0.5, 0.7, 1]} position={[0, 0, 0]} castShadow>
            <meshStandardMaterial color="#ff6600" />
         </Cylinder>
      </group>
    </group>
  );
}
