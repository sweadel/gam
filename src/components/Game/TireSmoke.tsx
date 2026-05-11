import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function TireSmoke({ active, position }: { active: boolean, position: [number, number, number] }) {
  const count = 100;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        t: Math.random(),
        speed: 0.01 + Math.random() * 0.02,
        pos: new THREE.Vector3(),
        offset: new THREE.Vector3((Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.5)
      });
    }
    return temp;
  }, []);

  const dummy = new THREE.Object3D();

  useFrame(() => {
    if (!meshRef.current) return;

    particles.forEach((p, i) => {
      p.t += p.speed;
      if (p.t > 1) {
        p.t = 0;
        p.pos.set(position[0] + p.offset.x, position[1], position[2] + p.offset.z);
      }

      const scale = p.t * 3;
      // const opacity = active ? (1 - p.t) * 0.3 : 0; // Not used in this version
      
      dummy.position.copy(p.pos).add(new THREE.Vector3(0, p.t * 3, -p.t * 2));
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.set(p.t * 5, p.t * 2, p.t);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      
      // Note: Setting individual instance color/opacity is hard with StandardMaterial 
      // but we can scale them to 0 to "hide" them
      if (!active) dummy.scale.set(0, 0, 0);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.3, 12, 12]} />
      <meshStandardMaterial 
        color="#ffffff" 
        transparent 
        opacity={0.15} 
        depthWrite={false} 
        roughness={1}
      />
    </instancedMesh>
  );
}
