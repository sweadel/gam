import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Sky, OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { Vehicle } from './physics/Vehicle';
import { EnvironmentMap } from './physics/EnvironmentMap';
import { useStore } from './store/useStore';
import { GarageUI } from './components/Garage/GarageUI';
import { EngineSound } from './components/Game/EngineSound';
import { MainMenu } from './components/Game/MainMenu';
import { Home } from 'lucide-react';
import './index.css';

function App() {
  const mode = useStore((state) => state.mode);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505' }}>
      <Canvas shadows>
        <Sky sunPosition={[100, 10, 100]} />
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
        
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
      </Canvas>

      {mode === 'menu' && <MainMenu />}
      <GarageUI />
      
      <div className="game-hud">
        {mode === 'drive' && <DriveHUD />}
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
  
  return (
    <div className="drive-hud-container">
      <div className="style-score glass-panel">
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
