import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Sky, Stars, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, ColorAverage } from '@react-three/postprocessing';
import { useStore } from './store/useStore';
import { Vehicle } from './physics/Vehicle';
import { EnvironmentMap } from './physics/EnvironmentMap';
import { GarageUI } from './components/Garage/GarageUI';
import { EngineSound } from './components/Game/EngineSound';
import { DragHUD } from './components/Game/DragHUD';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Target } from 'lucide-react';
import './index.css';

function DriveHUD() {
  const { rpm, gear, stylePoints, money, damage, nitroLevel, activeMission, setCamera, camera } = useStore();
  
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'c') setCamera(camera === 'chase' ? 'cockpit' : 'chase');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [camera, setCamera]);

  return (
    <div className="drive-hud-container">
      <div className="hud-top-left glass-panel">
         <div className="stat-row"><span>الرصيد:</span> <span style={{ color: '#4ade80' }}>${money.toLocaleString()}</span></div>
         <div className="stat-row"><span>النقاط:</span> <span>{stylePoints.toLocaleString()}</span></div>
      </div>

      {activeMission ? (
        <div className="mission-hud glass-panel">
           <div className="mission-title"><Target size={14} /> {activeMission.title}</div>
           <div className="mission-progress">
              <div className="progress-bar"><div className="fill" style={{ width: `${(activeMission.progress / activeMission.target) * 100}%` }}></div></div>
           </div>
        </div>
      ) : <></>}

      <div className="speedo-container">
         <div className="gear-display">{gear}</div>
         <div className="rpm-bar-container">
            <div className="rpm-bar" style={{ width: `${(rpm / 10000) * 100}%`, background: rpm > 8500 ? '#ff4d4d' : '#fff' }}></div>
         </div>
      </div>

      <div className="hud-bottom-left">
         <div className="hud-bar-group">
            <div className="bar-icon"><Shield size={16} color={damage > 70 ? '#ff4d4d' : '#fff'} /></div>
            <div className="status-bar-bg"><div className="fill damage" style={{ width: `${damage}%` }}></div></div>
         </div>
         <div className="hud-bar-group">
            <div className="bar-icon"><Zap size={16} color="#3b82f6" /></div>
            <div className="status-bar-bg"><div className="fill nitro" style={{ width: `${nitroLevel}%` }}></div></div>
         </div>
      </div>

      <div className="camera-hint">اضغط C لتغيير الكاميرا ({camera === 'chase' ? 'خارجي' : 'داخلي'})</div>
    </div>
  );
}

function MainMenu() {
  const setMode = useStore((state) => state.setMode);
  return (
    <div className="menu-overlay">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="menu-card glass-panel">
        <h1>HARDCORE DRIFT SIM</h1>
        <p>المحاكي الواقعي الأول للسيارات</p>
        <div className="menu-buttons">
          <button className="btn-primary" onClick={() => setMode('drive')}>انطلاق سريع</button>
          <button className="btn-secondary" onClick={() => setMode('garage')}>المرآب (Garage)</button>
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const { mode, weather } = useStore();

  return (
    <div className="app-container">
      <Suspense fallback={<div className="loading">جاري تحميل المحرك...</div>}>
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 45 }}>
          <fog attach="fog" args={[weather === 'fog' ? '#111' : '#000', 0, weather === 'fog' ? 50 : 150]} />
          <Sky sunPosition={[100, 10, 100]} turbidity={weather === 'fog' ? 10 : 0.1} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <ambientLight intensity={weather === 'clear' ? 0.4 : 0.1} />
          <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />

          <Physics gravity={[0, -9.81, 0]} tolerance={0.001}>
            <EnvironmentMap />
            {mode !== 'menu' ? <Vehicle /> : <></>}
          </Physics>

          {mode === 'menu' ? <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={false} /> : <></>}

          <EffectComposer>
            <Bloom intensity={weather === 'clear' ? 1.5 : 0.5} luminanceThreshold={0.8} />
            <Vignette eskil={false} offset={0.1} darkness={0.8} />
            {weather === 'rain' ? <Noise opacity={0.2} /> : <></>}
            {weather === 'fog' ? <ColorAverage /> : <></>}
          </EffectComposer>
        </Canvas>

        <AnimatePresence>
          {mode === 'menu' ? <MainMenu key="menu" /> : <></>}
          {mode === 'garage' ? <GarageUI key="garage" /> : <></>}
          {mode === 'drive' ? <DriveHUD key="hud" /> : <></>}
        </AnimatePresence>
        
        <DragHUD />
        <EngineSound />
      </Suspense>
    </div>
  );
}
