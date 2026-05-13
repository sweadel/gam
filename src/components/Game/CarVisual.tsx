import { useStore } from '../../store/useStore';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshStandardMaterial, MeshPhysicalMaterial } from 'three';

export function CarVisual({ steeringAngle = 0 }: { steeringAngle?: number }) {
  const { selectedCar, visuals, damage, rpm } = useStore();
  const paintColor = visuals.paintColor;
  
  const isWide = visuals.bodyKit === 'widebody' || visuals.bodyKit === 'drift-spec';
  const archWidth = isWide ? 0.2 : 0.05;
  const damageShift = (damage / 100) * 0.1;

  const [showFlame, setShowFlame] = useState(false);
  const lastRPM = useRef(rpm);

  useFrame(() => {
    if (lastRPM.current > rpm + 1000 && rpm > 5000) {
      setShowFlame(true);
      setTimeout(() => setShowFlame(false), 100);
    }
    lastRPM.current = rpm;
  });

  // --- HIGH QUALITY MATERIALS ---
  const paintMaterial = new MeshPhysicalMaterial({
    color: paintColor,
    metalness: 0.9,
    roughness: 0.1 + (damage / 200),
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 1.0,
    envMapIntensity: 1.5,
  });

  const glassMaterial = new MeshPhysicalMaterial({
    color: "#111",
    metalness: 1,
    roughness: 0,
    transparent: true,
    opacity: 0.4,
    transmission: 0.9,
    thickness: 1,
  });

  const chromeMaterial = new MeshStandardMaterial({
    color: "#fff",
    metalness: 1,
    roughness: 0.05,
  });

  return (
    <group>
      {/* --- REAL HEADLIGHTS --- */}
      <group position={[0, 0.2, 2.1]}>
        <SpotLight position={[0.7, 0.1, 0]} color="#fff" />
        <SpotLight position={[-0.7, 0.1, 0]} color="#fff" />
        {/* LED Strip */}
        <mesh position={[0, 0.1, 0.01]}><boxGeometry args={[1.6, 0.05, 0.01]} /><meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} /></mesh>
      </group>

      {/* --- EXHAUST FLAME --- */}
      {showFlame && (
        <group position={[0.6, -0.2, -2.1]}>
          <mesh>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={50} />
          </mesh>
          <pointLight color="#ff4400" intensity={30} distance={8} />
        </group>
      )}

      {/* --- NEON UNDERGLOW --- */}
      {visuals.neon !== 'none' && (
        <group position={[0, -0.45, 0]}>
           <mesh rotation={[-Math.PI / 2, 0, 0]}>
             <planeGeometry args={[2.4, 4.8]} />
             <meshStandardMaterial color={visuals.neon} emissive={visuals.neon} emissiveIntensity={15} transparent opacity={0.4} />
           </mesh>
           <pointLight position={[0, 0.2, 0]} intensity={20} color={visuals.neon} distance={6} />
        </group>
      )}

      {/* --- CHASSIS & BODY --- */}
      <mesh castShadow receiveShadow position={[0, -damageShift, damageShift]} material={paintMaterial}>
        <boxGeometry args={[1.8 + (isWide ? 0.2 : 0), 0.45, 4.2]} />
      </mesh>

      {/* --- WINDOWS (REAL GLASS) --- */}
      <group position={[0, 0.7, -0.2]}>
        <mesh material={glassMaterial} castShadow>
          <boxGeometry args={[1.6, 0.6, 2.2]} />
        </mesh>
      </group>

      {/* --- WHEEL ARCHES --- */}
      <mesh position={[0.9 + archWidth, -0.1, 1.4]} rotation={[0, 0, Math.PI/2]} material={paintMaterial}><cylinderGeometry args={[0.48, 0.48, 0.2, 32]} /></mesh>
      <mesh position={[-0.9 - archWidth, -0.1, 1.4]} rotation={[0, 0, Math.PI/2]} material={paintMaterial}><cylinderGeometry args={[0.48, 0.48, 0.2, 32]} /></mesh>
      <mesh position={[0.9 + archWidth, -0.1, -1.4]} rotation={[0, 0, Math.PI/2]} material={paintMaterial}><cylinderGeometry args={[0.48, 0.48, 0.2, 32]} /></mesh>
      <mesh position={[-0.9 - archWidth, -0.1, -1.4]} rotation={[0, 0, Math.PI/2]} material={paintMaterial}><cylinderGeometry args={[0.48, 0.48, 0.2, 32]} /></mesh>

      {/* --- SPECIFIC CAR DETAILS --- */}
      {selectedCar.id === 'ae86' && (
        <group position={[0, 0.4, 0]}>
           <mesh position={[0, 0.35, -0.2]} castShadow material={paintMaterial}><boxGeometry args={[1.55, 0.65, 2.6]} /></mesh>
           <mesh position={[0, 0.1, 1.9]} material={chromeMaterial}><boxGeometry args={[1.8, 0.2, 0.1]} /></mesh>
        </group>
      )}

      {selectedCar.id === 'r34' && (
        <group position={[0, 0.4, 0]}>
           <mesh position={[0, 0.45, -0.1]} castShadow material={paintMaterial}><boxGeometry args={[1.75, 0.75, 4.0]} /></mesh>
           <mesh position={[0, 1.1, -1.8]} castShadow material={paintMaterial}><boxGeometry args={[1.8, 0.05, 0.6]} /></mesh>
           <mesh position={[0.8, 0.9, -1.8]} material={chromeMaterial}><boxGeometry args={[0.05, 0.4, 0.1]} /></mesh>
           <mesh position={[-0.8, 0.9, -1.8]} material={chromeMaterial}><boxGeometry args={[0.05, 0.4, 0.1]} /></mesh>
        </group>
      )}

      {selectedCar.id === 'supra' && (
        <group position={[0, 0.4, 0]}>
           <mesh position={[0, 0.5, -0.4]} castShadow material={paintMaterial} scale={[1.45, 0.65, 2.1]}><sphereGeometry args={[1, 32, 32]} /></mesh>
           <mesh position={[0, 0.3, 1.3]} rotation={[-0.1, 0, 0]} material={paintMaterial}><boxGeometry args={[1.7, 0.2, 1.8]} /></mesh>
           <mesh position={[0, 0.9, -1.9]} rotation={[0.2, 0, 0]} material={paintMaterial}><torusGeometry args={[0.8, 0.05, 16, 32, Math.PI]} /></mesh>
        </group>
      )}

      {/* --- RIMS (CHROME) --- */}
      <group position={[0, -0.1, 0]}>
        <mesh position={[0.95 + archWidth, 0, 1.4]} rotation={[0, 0, Math.PI/2]} material={chromeMaterial}><cylinderGeometry args={[0.3, 0.35, 0.1, 16]} /></mesh>
        <mesh position={[-0.95 - archWidth, 0, 1.4]} rotation={[0, 0, Math.PI/2]} material={chromeMaterial}><cylinderGeometry args={[0.3, 0.35, 0.1, 16]} /></mesh>
        <mesh position={[0.95 + archWidth, 0, -1.4]} rotation={[0, 0, Math.PI/2]} material={chromeMaterial}><cylinderGeometry args={[0.3, 0.35, 0.1, 16]} /></mesh>
        <mesh position={[-0.95 - archWidth, 0, -1.4]} rotation={[0, 0, Math.PI/2]} material={chromeMaterial}><cylinderGeometry args={[0.3, 0.35, 0.1, 16]} /></mesh>
      </group>

      {/* --- INTERIOR --- */}
      <group position={[0, 0.4, 0.2]}>
        <mesh position={[0, 0.2, 0.5]}><boxGeometry args={[1.4, 0.4, 0.6]} /><meshStandardMaterial color="#0a0a0a" roughness={0.9} /></mesh>
        <group position={[0.4, 0.25, 0.4]} rotation={[-0.4, 0, steeringAngle * 2]}>
          <mesh><torusGeometry args={[0.15, 0.02, 16, 32]} /><meshStandardMaterial color="#222" /></mesh>
        </group>
      </group>
    </group>
  );
}

function SpotLight({ position, color }: any) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[0.3, 0.15]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={20} />
      </mesh>
      <spotLight 
        position={[0, 0, 0.1]} 
        angle={0.5} 
        penumbra={0.3} 
        intensity={150} 
        distance={60} 
        castShadow 
        color={color} 
      />
    </group>
  );
}
