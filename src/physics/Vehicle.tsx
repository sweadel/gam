import { useBox, useRaycastVehicle } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { CarVisual } from '../components/Game/CarVisual';
import { ChaseCamera } from '../components/Game/ChaseCamera';
import { TireSmoke } from '../components/Game/TireSmoke';
import { DragController } from '../components/Game/DragController';

export function Vehicle() {
  const { 
    mode, 
    suspension,
    damage, 
    addDamage, 
    nitroLevel, 
    useNitro, 
    checkMissions, 
    camera,
    updateRPM
  } = useStore();

  const [chassisBody, chassisApi] = useBox(() => ({
    allowSleep: false,
    args: [1.8, 0.6, 4],
    mass: 1200,
    onCollide: (e) => {
      const impact = e.contact.impactVelocity;
      if (impact > 6) addDamage(Math.floor(impact / 3));
    },
    position: [0, 2, 0],
  }));

  const wheelRefs = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];

  const wheelInfo = {
    radius: 0.38,
    directionLocal: [0, -1, 0] as [number, number, number],
    suspensionStiffness: 30,
    suspensionRestLength: 0.3,
    maxSuspensionForce: 100000,
    maxSuspensionTravel: 0.3,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    axleLocal: [-1, 0, 0] as [number, number, number],
    chassisConnectionPointLocal: [1, 0, 1] as [number, number, number],
    useCustomSlidingFrictionForce: true,
    customSlidingFrictionForce: 0.6,
    frictionSlip: 2.5,
    rollInfluence: 0.01,
  };

  const wheelInfos = [
    { ...wheelInfo, chassisConnectionPointLocal: [-0.85, -0.1, 1.4] as [number, number, number], isFrontWheel: true },
    { ...wheelInfo, chassisConnectionPointLocal: [0.85, -0.1, 1.4] as [number, number, number], isFrontWheel: true },
    { ...wheelInfo, chassisConnectionPointLocal: [-0.85, -0.1, -1.4] as [number, number, number], isFrontWheel: false },
    { ...wheelInfo, chassisConnectionPointLocal: [0.85, -0.1, -1.4] as [number, number, number], isFrontWheel: false },
  ];

  const [vehicle, vehicleApi] = useRaycastVehicle(() => ({
    chassisBody,
    wheels: wheelRefs,
    wheelInfos,
  }));

  const controls = useRef({ forward: false, backward: false, left: false, right: false, brake: false, reset: false, nitro: false });
  const velocity = useRef([0, 0, 0]);

  useEffect(() => {
    const vSub = chassisApi.velocity.subscribe(v => velocity.current = v);
    const handleKey = (e: KeyboardEvent) => {
      if (['w', 'ArrowUp'].includes(e.key)) controls.current.forward = true;
      if (['s', 'ArrowDown'].includes(e.key)) controls.current.backward = true;
      if (['a', 'ArrowLeft'].includes(e.key)) controls.current.left = true;
      if (['d', 'ArrowRight'].includes(e.key)) controls.current.right = true;
      if (e.key === ' ') controls.current.brake = true;
      if (e.key === 'r') controls.current.reset = true;
      if (e.key === 'Shift') controls.current.nitro = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (['w', 'ArrowUp'].includes(e.key)) controls.current.forward = false;
      if (['s', 'ArrowDown'].includes(e.key)) controls.current.backward = false;
      if (['a', 'ArrowLeft'].includes(e.key)) controls.current.left = false;
      if (['d', 'ArrowRight'].includes(e.key)) controls.current.right = false;
      if (e.key === ' ') controls.current.brake = false;
      if (e.key === 'r') controls.current.reset = false;
      if (e.key === 'Shift') controls.current.nitro = false;
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      vSub();
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [chassisApi]);

  useFrame(() => {
    if (mode !== 'drive') return;
    const { forward, backward, left, right, brake, reset, nitro } = controls.current;
    
    const damagePenalty = 1 - (damage / 250);
    let engineForce = (forward ? 2500 : backward ? -1500 : 0) * damagePenalty;
    
    if (nitro && nitroLevel > 0 && forward) {
       engineForce += 3500;
       useNitro(0.4);
    }

    const steerAngle = (left ? 1 : right ? -1 : 0) * (suspension.steeringAngle * (Math.PI / 180));

    vehicleApi.applyEngineForce(engineForce, 2);
    vehicleApi.applyEngineForce(engineForce, 3);
    vehicleApi.setSteeringValue(steerAngle, 0);
    vehicleApi.setSteeringValue(steerAngle, 1);
    vehicleApi.setBrake(brake ? 120 : 0, 2);
    vehicleApi.setBrake(brake ? 120 : 0, 3);

    if (reset) {
      chassisApi.position.set(0, 2, 0);
      chassisApi.rotation.set(0, 0, 0);
      chassisApi.velocity.set(0, 0, 0);
    }

    const speed = Math.sqrt(velocity.current[0]**2 + velocity.current[2]**2) * 3.6;
    updateRPM(800 + (speed % 60) * 120 + (forward ? 1500 : 0), Math.floor(speed / 40) + 1);
    checkMissions(speed, Math.abs(velocity.current[0]));
  });

  const isDrifting = Math.abs(velocity.current[0]) > 2.5 && (Math.sqrt(velocity.current[0]**2 + velocity.current[2]**2)) > 5;

  const steerValue = useRef(0);
  useFrame(() => {
    const { left, right } = controls.current;
    steerValue.current = (left ? 1 : right ? -1 : 0) * (suspension.steeringAngle * (Math.PI / 180));
  });

  return (
    <group ref={vehicle as any}>
      <group ref={chassisBody as any}>
        <CarVisual steeringAngle={steerValue.current} />
        {camera === 'chase' ? <ChaseCamera targetRef={chassisBody} /> : <CockpitCamera />}
        <DragController chassisApi={chassisApi} />
        <TireSmoke active={isDrifting} position={[-0.8, -0.4, -1.4]} />
        <TireSmoke active={isDrifting} position={[0.8, -0.4, -1.4]} />
      </group>
      {/* Visual Wheels (needed for RaycastVehicle to update their positions) */}
      {wheelRefs.map((ref, i) => (
        <group key={i} ref={ref}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.38, 0.38, 0.25, 24]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CockpitCamera() {
  useFrame((state) => {
    state.camera.position.set(0, 0.8, 0.4);
    state.camera.lookAt(new THREE.Vector3(0, 0.5, 10));
  });
  return null;
}
