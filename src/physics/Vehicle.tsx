import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useRaycastVehicle, useBox } from '@react-three/cannon';
import { useStore, PARTS_DATABASE } from '../store/useStore';
import { useKeyboard } from '../hooks/useKeyboard';
import { CarVisual } from '../components/Game/CarVisual';
import { ChaseCamera } from '../components/Game/ChaseCamera';
import { TireSmoke } from '../components/Game/TireSmoke';
import { DragController } from '../components/Game/DragController';
import * as THREE from 'three';

export function Vehicle() {
  const { engine, suspension, mode } = useStore();
  const controls = useKeyboard();

  // 1. Precise Physics Body
  const [chassisBody, chassisApi] = useBox(() => ({
    allowSleep: false,
    args: [1.8, 0.6, 4],
    mass: 1400, // Heavier for better stability
    position: [0, 2, 0],
    linearDamping: 0.1,
    angularDamping: 0.5,
  }), useRef<THREE.Group>(null));

  const wheels = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];

  // 2. Advanced Wheel Physics
  const wheelInfo = {
    radius: 0.38,
    directionLocal: [0, -1, 0],
    suspensionStiffness: suspension.stiffness + 20, // Stiffer for drift
    suspensionRestLength: 0.25,
    maxSuspensionForce: 100000,
    maxSuspensionTravel: 0.3,
    dampingRelaxation: 2.5,
    dampingCompression: 4.5,
    axleLocal: [-1, 0, 0],
    chassisConnectionPointLocal: [1, 0, 1],
    useCustomSlidingFrictionForce: true,
    customSlidingFrictionForce: 0.8,
    frictionSlip: 1.5, // Lower for more drift
    rollInfluence: 0.01,
  };

  const wheelInfos = [
    { ...wheelInfo, chassisConnectionPointLocal: [-0.85, -0.1, 1.4], isFrontWheel: true },
    { ...wheelInfo, chassisConnectionPointLocal: [0.85, -0.1, 1.4], isFrontWheel: true },
    { ...wheelInfo, chassisConnectionPointLocal: [-0.85, -0.1, -1.4], isFrontWheel: false },
    { ...wheelInfo, chassisConnectionPointLocal: [0.85, -0.1, -1.4], isFrontWheel: false },
  ];

  const [vehicle, vehicleApi] = useRaycastVehicle(() => ({
    chassisBody,
    wheels,
    wheelInfos,
  }), useRef<THREE.Group>(null));

  const velocity = useRef([0, 0, 0]);
  useEffect(() => {
    return chassisApi.velocity.subscribe((v) => (velocity.current = v));
  }, [chassisApi]);

  // Transmission Logic
  const gearRatios = [3.5, 2.3, 1.5, 1.2, 1.0, 0.8];
  const currentGear = useRef(0);

  useFrame((state, delta) => {
    if (mode !== 'drive') return;

    const { forward, backward, left, right, brake, reset } = controls;

    if (reset) {
      chassisApi.position.set(0, 2, 0);
      chassisApi.velocity.set(0, 0, 0);
      chassisApi.rotation.set(0, 0, 0);
    }

    const speed = Math.sqrt(velocity.current[0] ** 2 + velocity.current[1] ** 2 + velocity.current[2] ** 2);
    const kmh = speed * 3.6;

    // Advanced Mechanical Equation
    const crankBonus = (PARTS_DATABASE.crankshaft as any)[engine.crankshaft]?.hp || 0;
    const intakeBonus = (PARTS_DATABASE.intake as any)[engine.intakeType]?.hp || 0;
    const turboBonus = (PARTS_DATABASE.turbo as any)[engine.turboSize]?.torque || 0;
    
    const basePower = 150 + crankBonus + intakeBonus;
    const totalTorque = (basePower + turboBonus) * 1.5; // Scale factor

    const idealGear = Math.floor(kmh / 40);
    currentGear.current = Math.min(gearRatios.length - 1, Math.max(0, idealGear));
    const gearRatio = gearRatios[currentGear.current];
    
    const force = (forward ? 1 : backward ? -1 : 0) * totalTorque * gearRatio;
    const steer = (left ? 1 : right ? -1 : 0) * (suspension.steeringAngle * (Math.PI / 180));

    // Apply Engine Force (RWD)
    for (let i = 2; i < 4; i++) vehicleApi.applyEngineForce(force, i);
    for (let i = 0; i < 2; i++) vehicleApi.setSteeringValue(steer, i);
    
    // Handbrake / Brake Logic
    if (brake) {
      // Handbrake (Spacebar) reduces friction on rear wheels for drift initiation
      vehicleApi.setBrake(1000, 2);
      vehicleApi.setBrake(1000, 3);
    } else {
      for (let i = 0; i < 4; i++) vehicleApi.setBrake(0, i);
    }

    // Update Store
    let rpm = 800 + (kmh % 40) * 150;
    if (forward && rpm < 7500) rpm += 500;
    
    const gameStore = useStore.getState();
    gameStore.updateRPM(Math.min(8000, rpm), currentGear.current + 1);

    const lateralSpeed = Math.abs(velocity.current[0]); 
    if (lateralSpeed > 2.5 && speed > 5) {
      gameStore.addStylePoints(Math.floor(speed * 2));
      gameStore.updateTireStats({ temp: Math.min(130, gameStore.tires.temp + 0.3) });
    } else {
      gameStore.updateTireStats({ temp: Math.max(25, gameStore.tires.temp - 0.15) });
    }
  });

  const carColor = useStore((state) => state.selectedCar.color);
  const carBrand = useStore((state) => state.selectedCar.brand);
  const isDrifting = Math.abs(velocity.current[0]) > 2.5 && (Math.sqrt(velocity.current[0]**2 + velocity.current[2]**2)) > 5;

  const steerValue = useRef(0);
  useFrame(() => {
    const { left, right } = controls;
    steerValue.current = (left ? 1 : right ? -1 : 0) * (suspension.steeringAngle * (Math.PI / 180));
  });

  return (
    <group ref={vehicle}>
      <group ref={chassisBody}>
        <CarVisual color={carColor} brand={carBrand} steeringAngle={steerValue.current} />
        <ChaseCamera targetRef={chassisBody} />
        <DragController chassisApi={chassisApi} />
        
        <TireSmoke active={isDrifting} position={[-0.8, -0.4, -1.4]} />
        <TireSmoke active={isDrifting} position={[0.8, -0.4, -1.4]} />
        
        <spotLight
          position={[0, 0, 2]}
          angle={0.6}
          penumbra={0.5}
          intensity={mode === 'drive' ? 400 : 0}
          distance={60}
          castShadow
          target-position={[0, 0, 10]}
        />
      </group>

      {wheels.map((wheel, index) => (
        <group key={index} ref={wheel as any}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.38, 0.38, 0.3, 24]} />
            <meshStandardMaterial color="#050505" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
