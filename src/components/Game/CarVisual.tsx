import { useStore } from '../../store/useStore';

export function CarVisual({ steeringAngle = 0 }: { steeringAngle?: number }) {
  const { selectedCar, visuals, damage } = useStore();
  const brand = selectedCar.brand;
  const paintColor = visuals.paintColor;
  
  const isWide = visuals.bodyKit === 'widebody' || visuals.bodyKit === 'drift-spec';
  const archWidth = isWide ? 0.2 : 0.05;

  // Damage representation (visual shift)
  const damageShift = (damage / 100) * 0.1;

  return (
    <group>
      {/* --- NEON UNDERGLOW --- */}
      {visuals.neon !== 'none' && (
        <group position={[0, -0.4, 0]}>
           <mesh rotation={[-Math.PI / 2, 0, 0]}>
             <planeGeometry args={[2.2, 4.5]} />
             <meshStandardMaterial 
                color={visuals.neon} 
                emissive={visuals.neon} 
                emissiveIntensity={10} 
                transparent 
                opacity={0.6} 
             />
           </mesh>
           <pointLight position={[0, 0.1, 0]} intensity={10} color={visuals.neon} distance={5} />
        </group>
      )}

      {/* --- CHASSIS BASE --- */}
      <mesh castShadow receiveShadow position={[0, -damageShift, damageShift]}>
        <boxGeometry args={[1.8 + (isWide ? 0.2 : 0), 0.4, 4.2]} />
        <meshPhysicalMaterial 
          color={paintColor} 
          metalness={0.9} 
          roughness={0.1 + (damage / 200)} 
          clearcoat={1 - (damage / 100)} 
        />
      </mesh>

      {/* --- WHEEL ARCHES --- */}
      <mesh position={[0.9 + archWidth, -0.1, 1.4]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.48, 0.48, 0.2, 16]} />
        <meshStandardMaterial color={brand === 'Nissan' ? '#111' : paintColor} />
      </mesh>
      <mesh position={[-0.9 - archWidth, -0.1, 1.4]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.48, 0.48, 0.2, 16]} />
        <meshStandardMaterial color={brand === 'Nissan' ? '#111' : paintColor} />
      </mesh>
      <mesh position={[0.9 + archWidth, -0.1, -1.4]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.48, 0.48, 0.2, 16]} />
        <meshStandardMaterial color={brand === 'Nissan' ? '#111' : paintColor} />
      </mesh>
      <mesh position={[-0.9 - archWidth, -0.1, -1.4]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.48, 0.48, 0.2, 16]} />
        <meshStandardMaterial color={brand === 'Nissan' ? '#111' : paintColor} />
      </mesh>

      {/* --- BRAND SPECIFIC BODIES --- */}
      {brand === 'BMW' && (
        <group position={[0, 0, -damageShift]}>
          <mesh position={[0, 0.6, -0.3]} castShadow>
            <boxGeometry args={[1.5, 0.7, 1.8]} />
            <meshPhysicalMaterial color={paintColor} metalness={0.8} clearcoat={1} />
          </mesh>
          <mesh position={[0, 0.35, 1.2]} rotation={[-0.1, 0, 0]}>
            <boxGeometry args={[1.7, 0.1, 1.5]} />
            <meshPhysicalMaterial color={paintColor} metalness={0.8} clearcoat={1} />
          </mesh>
        </group>
      )}

      {brand === 'Nissan' && (
        <group>
          <mesh position={[0, 0.5, -0.3]} castShadow scale={[1, 1 - (damage/200), 1]}>
             <sphereGeometry args={[1, 32, 32]} />
             <meshPhysicalMaterial color={paintColor} metalness={0.8} clearcoat={1} />
          </mesh>
          <mesh position={[0, 0.35, 1.1]} rotation={[-0.15, 0, 0]}>
            <boxGeometry args={[1.6, 0.1, 1.6]} />
            <meshPhysicalMaterial color={paintColor} metalness={0.8} clearcoat={1} />
          </mesh>
        </group>
      )}

      {brand === 'Toyota' && (
        <group>
          <mesh position={[0, 0.55, -0.5]} castShadow scale={[1.4, 0.6, 2]}>
             <sphereGeometry args={[1, 32, 32]} />
             <meshPhysicalMaterial color={paintColor} metalness={0.8} clearcoat={1} />
          </mesh>
          <mesh position={[0, 0.35, 1.4]} rotation={[-0.05, 0, 0]}>
            <boxGeometry args={[1.7, 0.1, 1.8]} />
            <meshPhysicalMaterial color={paintColor} metalness={0.8} clearcoat={1} />
          </mesh>
        </group>
      )}

      {/* --- INTERIOR / COCKPIT --- */}
      <group position={[0, 0.4, 0.2]}>
        <mesh position={[0, 0.2, 0.5]}><boxGeometry args={[1.4, 0.4, 0.6]} /><meshStandardMaterial color="#111" /></mesh>
        {/* Speedo Dashboard */}
        <mesh position={[0.4, 0.4, 0.7]} rotation={[-0.5, 0, 0]}>
           <planeGeometry args={[0.4, 0.2]} />
           <meshStandardMaterial color="#000" emissive="#00ff00" emissiveIntensity={2} />
        </mesh>
        
        <group position={[0.4, 0.25, 0.4]} rotation={[-0.4, 0, steeringAngle * 2]}>
          <mesh><torusGeometry args={[0.15, 0.02, 16, 32]} /><meshStandardMaterial color="#222" /></mesh>
          <mesh rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 0.3]} /><meshStandardMaterial color="#222" /></mesh>
        </group>
      </group>

      {/* --- LIGHTS --- */}
      <mesh position={[0.7, 0.15, 2.11]}>
        <planeGeometry args={[0.5, 0.15]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={damage < 80 ? 10 : 0} />
      </mesh>
      <mesh position={[-0.7, 0.15, 2.11]}>
        <planeGeometry args={[0.5, 0.15]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={damage < 50 ? 10 : 0} />
      </mesh>
      
      <group position={[0, 0.4, -1.9]}>
        <mesh position={[0, 0.4, 0]}><boxGeometry args={[1.95, 0.05, 0.6]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh position={[-0.8, 0.2, 0]}><boxGeometry args={[0.05, 0.4, 0.1]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh position={[0.8, 0.2, 0]}><boxGeometry args={[0.05, 0.4, 0.1]} /><meshStandardMaterial color="#111" /></mesh>
      </group>
    </group>
  );
}
