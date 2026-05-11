import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function TireSmoke({ active, position }: { active: boolean, position: [number, number, number] }) {
  const count = 50;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        t: Math.random() * 100,
        speed: 0.1 + Math.random() * 0.2,
        pos: new THREE.Vector3(),
      });
    }
    return temp;
  }, []);

  const dummy = new THREE.Object3D();

  useFrame((state) => {
    if (!meshRef.current) return;

    particles.forEach((p, i) => {
      if (active) {
        p.t += p.speed;
        if (p.t > 1) {
          p.t = 0;
          p.pos.set(position[0] + (Math.random() - 0.5) * 0.5, position[1], position[2] + (Math.random() - 0.5) * 0.5);
        }
      } else {
        p.t = 2; // Hide
      }

      const scale = p.t * 2;
      dummy.position.copy(p.pos).add(new THREE.Vector3(0, p.t * 2, -p.t * 1));
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.set(p.t, p.t, p.t);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.2, 8, 8]} />
      <meshStandardMaterial color="#fff" transparent opacity={0.2} depthWrite={false} />
    </instancedMesh>
  );
}
