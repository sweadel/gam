import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Sky, OrbitControls, Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { Vehicle } from './physics/Vehicle';
import { EnvironmentMap } from './physics/EnvironmentMap';
import { useStore } from './store/useStore';
import { GarageUI } from './components/Garage/GarageUI';
import { EngineSound } from './components/Game/EngineSound';
import { MainMenu } from './components/Game/MainMenu';
import { DragHUD } from './components/Game/DragHUD';
import { Home } from 'lucide-react';
import './index.css';

function App() {
  const mode = useStore((state) => state.mode);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#020202' }}>
      <Canvas shadows camera={{ fov: 50 }}>
        {/* Atmosphere */}
        <color attach="background" args={["#020202"]} />
        <fog attach="fog" args={["#020202", 10, 100]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Sky sunPosition={[100, 10, 100]} turbidity={0.1} rayleigh={0.5} />
        <Environment preset="night" />

        <PerspectiveCamera makeDefault position={[5, 3, 5]} fov={50} />
        
        {mode === 'drive' && <OrbitControls target={[0, 0, 0]} maxPolarAngle={Math.PI / 2.1} />}
        {mode === 'garage' && <OrbitControls autoRotate autoRotateSpeed={0.5} enablePan={false} />}
        {mode === 'menu' && <OrbitControls autoRotate autoRotateSpeed={0.2} enablePan={false} />}

        <EngineSound />

        <Physics gravity={[0, -9.81, 0]} iterations={20}>
          <Vehicle />
          <EnvironmentMap />
        </Physics>
        
        <ambientLight intensity={0.2} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[0, 10, 0]} intensity={10} color="#fff" />

        {/* Post Processing for Premium Look */}
        <EffectComposer>
          <Bloom 
            intensity={1.5} 
            luminanceThreshold={0.6} 
            luminanceSmoothing={0.9} 
          />
          <Noise opacity={0.02} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>

      {mode === 'menu' && <MainMenu />}
      <GarageUI />
      
      <div className="game-hud">
        {mode === 'drive' && <DriveHUD />}
        {mode === 'drive' && <DragHUD />}
        {mode !== 'menu' && (
          <button className="nav-btn" onClick={() => useStore.getState().setMode('menu')}>
            <Home size={18} /> العودة للرئيسية
          </button>
        )}
      </div>
    </div>
  );
}

function DriveHUD() {
  const rpm = useStore((state) => state.rpm);
  const gear = useStore((state) => state.gear);
  const stylePoints = useStore((state) => state.stylePoints);
  const money = useStore((state) => state.money);
  
  return (
    <div className="drive-hud-container">
      <div className="style-score glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 5 }}>
           <span className="score-label">الرصيد</span>
           <span className="score-label" style={{ color: '#4ade80' }}>${money.toLocaleString()}</span>
        </div>
        <span className="score-label">نقاط الأسلوب</span>
        <span className="score-value">{stylePoints.toLocaleString()}</span>
      </div>
      
      <div className="drive-hud glass-panel">
        <div className="rpm-meter">
          <div className="rpm-bar" style={{ width: `${(rpm / 8000) * 100}%`, background: rpm > 7000 ? '#ff4d4d' : '#fff' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
          <span>{Math.round(rpm)} RPM</span>
          <span style={{ fontSize: 24, fontWeight: 900 }}>G{gear}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
