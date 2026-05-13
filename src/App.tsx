import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Sky, Environment, ContactShadows, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import { Suspense, useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { Vehicle } from './physics/Vehicle';
import { EnvironmentMap } from './physics/EnvironmentMap';
import { GarageUI } from './components/Garage/GarageUI';
import { MainMenu } from './components/Game/MainMenu';
import { HUD } from './components/Game/HUD';
import { EngineSound } from './components/Game/EngineSound';

export default function App() {
  const { mode, weather } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="loading">جاري تشغيل المحاكي...</div>;

  return (
    <div className="app-container">
      <Canvas
        shadows
        camera={{ position: [5, 5, 5], fov: 50 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          powerPreference: "high-performance",
          alpha: false
        }}
      >
        <color attach="background" args={[weather === 'clear' ? '#050505' : '#111']} />
        
        <Suspense fallback={null}>
          {weather === 'clear' && <Sky sunPosition={[100, 10, 100]} turbidity={0.1} rayleigh={2} />}
          {weather === 'fog' && <fog attach="fog" args={['#202020', 5, 50]} />}
          {weather === 'clear' && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
          
          <ambientLight intensity={0.2} />
          <directionalLight
            position={[50, 50, 50]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          
          <Environment preset="city" />

          <Physics gravity={[0, -9.81, 0]} tolerance={0.001}>
            <EnvironmentMap />
            {mode === 'drive' && <Vehicle />}
          </Physics>

          <EffectComposer>
            <Bloom 
              intensity={1.5} 
              luminanceThreshold={0.9} 
              luminanceSmoothing={0.025} 
            />
            <ToneMapping />
          </EffectComposer>
          
          <ContactShadows 
            position={[0, -0.49, 0]} 
            opacity={0.5} 
            scale={20} 
            blur={2} 
            far={4.5} 
          />
        </Suspense>
      </Canvas>

      {mode === 'menu' && <MainMenu />}
      {mode === 'garage' && <GarageUI />}
      {mode === 'drive' && (
        <>
          <HUD />
          <EngineSound />
        </>
      )}
    </div>
  );
}
