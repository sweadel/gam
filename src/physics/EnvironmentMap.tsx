import { usePlane } from '@react-three/cannon';
import { useStore } from '../store/useStore';
import { useMemo } from 'react';

export function EnvironmentMap() {
  const env = useStore((state) => state.environment);
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -0.5, 0],
  }));

  const Building = ({ position, args, color }: { position: [number, number, number], args: [number, number, number], color: string }) => {
    return (
      <group position={position}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={args} />
          <meshPhysicalMaterial 
            color={color} 
            roughness={0.5} 
            metalness={0.5} 
            reflectivity={0.5}
          />
        </mesh>
        {/* Windows */}
        <mesh position={[0, 0, args[2]/2 + 0.1]}>
          <planeGeometry args={[args[0] * 0.8, args[1] * 0.8]} />
          <meshStandardMaterial color="#222" emissive="#111" emissiveIntensity={2} />
        </mesh>
      </group>
    );
  };

  const StreetLight = ({ position }: { position: [number, number, number] }) => {
    return (
      <group position={position}>
        <mesh castShadow><cylinderGeometry args={[0.1, 0.15, 8]} /><meshStandardMaterial color="#222" /></mesh>
        <mesh position={[1, 4, 0]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.05, 0.05, 2]} /><meshStandardMaterial color="#222" /></mesh>
        <group position={[2, 4, 0]}>
          <mesh><boxGeometry args={[0.5, 0.2, 0.5]} /><meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={10} /></mesh>
          <pointLight intensity={20} distance={25} color="#ffccaa" castShadow />
        </group>
      </group>
    );
  };

  const assets = useMemo(() => {
    const items = [];
    if (env === 'city') {
       for (let x = -2; x <= 2; x++) {
         for (let z = -2; z <= 2; z++) {
           if (x === 0 && z === 0) continue;
           const height = 60 + Math.random() * 100;
           items.push(<Building key={`b-${x}-${z}`} position={[x * 80, height/2 - 0.5, z * 80]} args={[60, height, 60]} color="#151515" />);
           // Add street lights along the road
           items.push(<StreetLight key={`l-${x}-${z}`} position={[x * 80 - 15, 4, z * 80 - 40]} />);
         }
       }
    }
    
    if (env === 'circuit') {
       for (let i = 0; i < 20; i++) {
          const angle = (i / 20) * Math.PI * 2;
          const x = Math.sin(angle) * 105;
          const z = Math.cos(angle) * 105;
          items.push(<Building key={`gs-${i}`} position={[x, 5, z]} args={[20, 15, 10]} color="#222" />);
          // Flags/Lights
          items.push(<StreetLight key={`cl-${i}`} position={[Math.sin(angle) * 115, 4, Math.cos(angle) * 115]} />);
       }
    }
    return items;
  }, [env]);

  return (
    <group>
      {/* --- REALISTIC ASPHALT GROUND --- */}
      <mesh ref={ref as any} receiveShadow>
        <planeGeometry args={[2000, 2000]} />
        <meshPhysicalMaterial 
          color="#0a0a0a" 
          roughness={0.8} 
          metalness={0.2} 
          clearcoat={0.1}
          reflectivity={0.5}
        />
      </mesh>

      <gridHelper args={[2000, 200, "#111", "#050505"]} position={[0, -0.49, 0]} />
      {assets}
      
      {/* Ambient Props */}
      <group>
         <StreetLight position={[15, 4, 15]} />
         <StreetLight position={[-15, 4, -15]} />
      </group>

      {env === 'touge' && (
        <group>
          {Array.from({ length: 40 }).map((_, i) => {
            const angle = (i / 40) * Math.PI * 4;
            const x = Math.sin(angle) * 100;
            const z = -i * 15;
            return (
              <group key={i} position={[x, -0.4, z]} rotation={[0, Math.cos(angle) * 0.5, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[14, 16]} /><meshStandardMaterial color="#080808" /></mesh>
                <mesh position={[7.5, 1, 0]}><boxGeometry args={[0.3, 1.2, 16]} /><meshStandardMaterial color="#333" /></mesh>
                <mesh position={[-7.5, 1, 0]}><boxGeometry args={[0.3, 1.2, 16]} /><meshStandardMaterial color="#333" /></mesh>
                {/* Touge lights */}
                {i % 4 === 0 && <StreetLight position={[8, 4, 0]} />}
              </group>
            );
          })}
        </group>
      )}
    </group>
  );
}
