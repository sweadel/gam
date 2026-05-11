import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store/useStore';
import * as THREE from 'three';

export function ChaseCamera({ targetRef }: { targetRef: any }) {
  const mode = useStore((state) => state.mode);
  const cameraOffset = new THREE.Vector3(0, 3, 8);
  const lookAtOffset = new THREE.Vector3(0, 0, -2);

  useFrame((state) => {
    if (mode !== 'drive' || !targetRef.current) return;

    const targetPosition = new THREE.Vector3();
    targetRef.current.getWorldPosition(targetPosition);

    const targetQuaternion = new THREE.Quaternion();
    targetRef.current.getWorldQuaternion(targetQuaternion);

    // Dynamic offset based on speed
    const offset = cameraOffset.clone().applyQuaternion(targetQuaternion);
    const idealPosition = targetPosition.clone().add(offset);
    const lookAt = targetPosition.clone().add(lookAtOffset.clone().applyQuaternion(targetQuaternion));

    state.camera.position.lerp(idealPosition, 0.1);
    state.camera.lookAt(lookAt);
    
    // Ensure the camera doesn't roll
    state.camera.up.set(0, 1, 0);
  });

  return null;
}
