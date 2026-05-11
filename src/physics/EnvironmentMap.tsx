import { useBox, usePlane, useCylinder } from '@react-three/cannon';
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
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
        </mesh>
      </group>
    );
  };

  const TrafficCone = ({ position }: any) => {
    const [coneRef] = useCylinder(() => ({ mass: 5, position, args: [0.1, 0.3, 0.8, 8] }));
    return (
      <group ref={coneRef as any}>
        <mesh castShadow><cylinderGeometry args={[0.1, 0.3, 0.8, 8]} /><meshStandardMaterial color="#ff4400" /></mesh>
        <mesh position={[0, -0.35, 0]}><boxGeometry args={[0.5, 0.1, 0.5]} /><meshStandardMaterial color="#222" /></mesh>
      </group>
    );
  };

  const assets = useMemo(() => {
    const items = [];
    if (env === 'city') {
       // City generation logic
       for (let x = -2; x <= 2; x++) {
         for (let z = -2; z <= 2; z++) {
           if (x === 0 && z === 0) continue;
           const height = 40 + Math.random() * 80;
           items.push(<Building key={`b-${x}-${z}`} position={[x * 80, height/2 - 0.5, z * 80]} args={[60, height, 60]} color="#222" />);
         }
       }
    }
    
    if (env === 'circuit') {
       // Circuit grandstands and walls
       for (let i = 0; i < 20; i++) {
          const angle = (i / 20) * Math.PI * 2;
          const x = Math.sin(angle) * 100;
          const z = Math.cos(angle) * 100;
          items.push(<Building key={`gs-${i}`} position={[x, 5, z]} args={[20, 10, 5]} color="#444" />);
          items.push(<TrafficCone key={`c-${i}`} position={[Math.sin(angle) * 30, 0, Math.cos(angle) * 30]} />);
       }
    }
    return items;
  }, [env]);

  return (
    <group>
      <mesh ref={ref as any} receiveShadow><planeGeometry args={[2000, 2000]} /><meshStandardMaterial color="#080808" roughness={0.9} /></mesh>
      <gridHelper args={[2000, 100, "#111", "#0a0a0a"]} position={[0, -0.49, 0]} />
      {assets}
      
      {env === 'touge' && (
        <group>
          {Array.from({ length: 40 }).map((_, i) => {
            const angle = (i / 40) * Math.PI * 4;
            const x = Math.sin(angle) * 100;
            const z = -i * 15;
            return (
              <group key={i} position={[x, -0.4, z]} rotation={[0, Math.cos(angle) * 0.5, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[12, 16]} /><meshStandardMaterial color="#111" /></mesh>
                <mesh position={[6.5, 1, 0]}><boxGeometry args={[0.2, 1, 16]} /><meshStandardMaterial color="#888" /></mesh>
                <mesh position={[-6.5, 1, 0]}><boxGeometry args={[0.2, 1, 16]} /><meshStandardMaterial color="#888" /></mesh>
              </group>
            );
          })}
        </group>
      )}

      {env === 'circuit' && (
        <group position={[0, -0.45, 0]}>
           <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[100, 64]} /><meshStandardMaterial color="#111" /></mesh>
           <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}><ringGeometry args={[98, 100, 64]} /><meshStandardMaterial color="#ff4d4d" emissive="#ff4d4d" emissiveIntensity={5} /></mesh>
           <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}><ringGeometry args={[28, 30, 64]} /><meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} /></mesh>
        </group>
      )}
    </group>
  );
}
