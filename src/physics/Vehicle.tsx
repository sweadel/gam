import { useBox, useRaycastVehicle } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
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
    mass: 1500,
    onCollide: (e) => {
      const impact = e.contact.impactVelocity;
      if (impact > 5) addDamage(Math.floor(impact / 2));
    },
    position: [0, 1, 0],
  }));

  const velocity = useRef([0, 0, 0]);
  useEffect(() => chassisApi.velocity.subscribe((v) => (velocity.current = v)), [chassisApi]);

  const wheelInfo = {
    radius: 0.38,
    directionLocal: [0, -1, 0] as [number, number, number],
    suspensionStiffness: suspension.stiffness + 20,
    suspensionRestLength: 0.25,
    maxSuspensionForce: 100000,
    maxSuspensionTravel: 0.3,
    dampingRelaxation: 2.5,
    dampingCompression: 4.5,
    axleLocal: [-1, 0, 0] as [number, number, number],
    chassisConnectionPointLocal: [1, 0, 1] as [number, number, number],
    useCustomSlidingFrictionForce: true,
    customSlidingFrictionForce: 0.8,
    frictionSlip: 1.5,
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
    wheels: [useRef(null), useRef(null), useRef(null), useRef(null)] as any,
    wheelInfos,
  }));

  const controls = useRef({ forward: false, backward: false, left: false, right: false, brake: false, reset: false, nitro: false });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'ArrowUp') controls.current.forward = true;
      if (e.key === 's' || e.key === 'ArrowDown') controls.current.backward = true;
      if (e.key === 'a' || e.key === 'ArrowLeft') controls.current.left = true;
      if (e.key === 'd' || e.key === 'ArrowRight') controls.current.right = true;
      if (e.key === ' ') controls.current.brake = true;
      if (e.key === 'r') controls.current.reset = true;
      if (e.key === 'Shift') controls.current.nitro = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'ArrowUp') controls.current.forward = false;
      if (e.key === 's' || e.key === 'ArrowDown') controls.current.backward = false;
      if (e.key === 'a' || e.key === 'ArrowLeft') controls.current.left = false;
      if (e.key === 'd' || e.key === 'ArrowRight') controls.current.right = false;
      if (e.key === ' ') controls.current.brake = false;
      if (e.key === 'r') controls.current.reset = false;
      if (e.key === 'Shift') controls.current.nitro = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (mode !== 'drive') return;

    const { forward, backward, left, right, brake, reset, nitro } = controls.current;
    
    // Performance Penalty from Damage
    const damageFactor = 1 - (damage / 200); 
    let engineForce = (forward ? 2000 : backward ? -1000 : 0) * damageFactor;
    
    // Nitro Boost
    if (nitro && nitroLevel > 0 && forward) {
       engineForce += 3000;
       useNitro(0.5);
    }

    const steerAngle = (left ? 1 : right ? -1 : 0) * (suspension.steeringAngle * (Math.PI / 180));

    vehicleApi.applyEngineForce(engineForce, 2);
    vehicleApi.applyEngineForce(engineForce, 3);
    vehicleApi.setSteeringValue(steerAngle, 0);
    vehicleApi.setSteeringValue(steerAngle, 1);
    vehicleApi.setBrake(brake ? 100 : 0, 0);
    vehicleApi.setBrake(brake ? 100 : 1, 1);
    vehicleApi.setBrake(brake ? 50 : 2, 2);
    vehicleApi.setBrake(brake ? 50 : 3, 3);

    if (reset) {
      chassisApi.position.set(0, 2, 0);
      chassisApi.rotation.set(0, 0, 0);
      chassisApi.velocity.set(0, 0, 0);
      chassisApi.angularVelocity.set(0, 0, 0);
    }

    const speed = Math.sqrt(velocity.current[0]**2 + velocity.current[2]**2) * 3.6;
    const currentRPM = 800 + (speed % 50) * 150 + (forward ? 2000 : 0);
    updateRPM(currentRPM, Math.floor(speed / 40) + 1);

    const driftFactor = Math.abs(velocity.current[0]);
    checkMissions(speed, driftFactor);
  });

  const steerValue = useRef(0);
  useFrame(() => {
    const { left, right } = controls.current;
    steerValue.current = (left ? 1 : right ? -1 : 0) * (suspension.steeringAngle * (Math.PI / 180));
  });

  const isDrifting = Math.abs(velocity.current[0]) > 2.5 && (Math.sqrt(velocity.current[0]**2 + velocity.current[2]**2)) > 5;

  return (
    <group ref={vehicle as any}>
      <group ref={chassisBody as any}>
        <CarVisual steeringAngle={steerValue.current} />
        {camera === 'chase' ? <ChaseCamera targetRef={chassisBody} /> : <CockpitCamera />}
        <DragController chassisApi={chassisApi} />
        <TireSmoke active={isDrifting} position={[-0.8, -0.4, -1.4]} />
        <TireSmoke active={isDrifting} position={[0.8, -0.4, -1.4]} />
      </group>
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
import * as THREE from 'three';
