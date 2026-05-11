import { useBox, usePlane, useCylinder } from '@react-three/cannon';
import { useStore } from '../store/useStore';
import { useMemo } from 'react';

export function EnvironmentMap() {
  const env = useStore((state) => state.environment);
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -0.5, 0],
  }));

  const roadWidth = 20;
  const blockSize = 60;

  const Building = ({ position, args, color }: { position: [number, number, number], args: [number, number, number], color: string }) => {
    return (
      <group position={position}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={args} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
        </mesh>
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh key={i} position={[(Math.random() - 0.5) * args[0], (Math.random() - 0.5) * args[1], args[2]/2 + 0.1]}>
            <planeGeometry args={[1.5, 0.8]} />
            <meshStandardMaterial color="#fff" emissive="#ffcc00" emissiveIntensity={Math.random() * 3} transparent opacity={0.9} />
          </mesh>
        ))}
      </group>
    );
  };

  const ParkedCar = ({ position, rotation = [0, 0, 0] }: any) => {
    const [carRef] = useBox(() => ({ mass: 1500, position, rotation, args: [1.8, 0.6, 4] }));
    return (
      <group ref={carRef as any}>
        <mesh castShadow><boxGeometry args={[1.8, 0.6, 4]} /><meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} /></mesh>
        <mesh position={[0, 0.6, -0.2]}><boxGeometry args={[1.5, 0.6, 1.8]} /><meshStandardMaterial color="#111" /></mesh>
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

  const StreetLight = ({ position }: { position: [number, number, number] }) => {
    return (
      <group position={position}>
        <mesh position={[0, 4, 0]}><cylinderGeometry args={[0.1, 0.15, 8]} /><meshStandardMaterial color="#222" metalness={0.8} /></mesh>
        <mesh position={[1, 8, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.05, 2]} /><meshStandardMaterial color="#222" /></mesh>
        <mesh position={[2, 8, 0]}><boxGeometry args={[0.6, 0.2, 0.8]} /><meshStandardMaterial color="#111" /></mesh>
        <pointLight position={[2, 7.8, 0]} intensity={80} color="#ffaa00" distance={30} decay={2} />
        <mesh position={[2, 7.9, 0]}><boxGeometry args={[0.5, 0.05, 0.7]} /><meshStandardMaterial color="#fff" emissive="#ffaa00" emissiveIntensity={15} /></mesh>
      </group>
    );
  };

  const assets = useMemo(() => {
    const items = [];
    if (env === 'city') {
      for (let x = -2; x <= 2; x++) {
        for (let z = -2; z <= 2; z++) {
          if (x === 0 && z === 0) continue;
          const posX = x * (blockSize + roadWidth);
          const posZ = z * (blockSize + roadWidth);
          const height = 40 + Math.random() * 80;
          items.push(<Building key={`b-${x}-${z}`} position={[posX, height / 2 - 0.5, posZ]} args={[blockSize, height, blockSize]} color="#222" />);
          items.push(<StreetLight key={`l-${x}-${z}`} position={[posX - blockSize/2 - 2, 0, posZ - blockSize/2 - 2]} />);
          if (Math.random() > 0.6) items.push(<ParkedCar key={`car-${x}-${z}`} position={[posX - blockSize/2 - 6, 0, posZ]} rotation={[0, Math.PI/2, 0]} />);
          
          // Add Cones in random lines
          if (Math.random() > 0.5) {
             items.push(<TrafficCone key={`cone-${x}-${z}`} position={[posX - 10, 1, posZ + 5]} />);
          }
        }
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

      <group position={[0, -0.45, 0]}>
         <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[25, 64]} /><meshStandardMaterial color="#111" /></mesh>
         <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}><ringGeometry args={[24.5, 25, 64]} /><meshStandardMaterial color="#ff4d4d" emissive="#ff4d4d" emissiveIntensity={5} /></mesh>
      </group>
    </group>
  );
}
