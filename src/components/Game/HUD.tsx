import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Gauge, Zap, AlertTriangle, Target, Trophy } from 'lucide-react';

export function HUD() {
  const { rpm, gear, nitroLevel, damage, activeMission, stylePoints, records } = useStore();
  
  return (
    <div className="drive-hud-container">
      {/* Top Stats */}
      <div className="hud-top-left glass-panel">
         <div className="stat-row">
            <span><Trophy size={14} /> إجمالي النقاط</span>
            <span>{stylePoints.toLocaleString()}</span>
         </div>
         <div className="stat-row">
            <span>أفضل درفت</span>
            <span>{records.longestDrift}</span>
         </div>
      </div>

      {/* Mission Progress */}
      <AnimatePresence>
        {activeMission && (
          <motion.div 
            className="mission-hud glass-panel"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
          >
            <div className="mission-title">
               <Target size={14} /> {activeMission.title}
            </div>
            <div className="progress-bar">
               <div className="fill" style={{ width: `${(activeMission.progress / activeMission.target) * 100}%` }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speedo & RPM */}
      <div className="speedo-container">
         <div className="gear-display">{gear}</div>
         <div className="rpm-bar-container">
            <div 
              className="rpm-bar" 
              style={{ 
                width: `${(rpm / 10000) * 100}%`,
                background: rpm > 8500 ? '#ff4d4d' : '#fff'
              }} 
            />
         </div>
         <div className="speed-text" style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: 5 }}>
            <Gauge size={16} style={{ verticalAlign: 'middle', marginRight: 5 }} />
            {Math.floor((rpm % 250) + (gear * 40))} <small>كم/س</small>
         </div>
      </div>

      {/* Bottom Status Bars */}
      <div className="hud-bottom-left">
         <div className="hud-bar-group">
            <Zap size={18} color="#3b82f6" />
            <div className="status-bar-bg">
               <div className="fill nitro" style={{ width: `${nitroLevel}%` }} />
            </div>
         </div>
         <div className="hud-bar-group">
            <AlertTriangle size={18} color="#ff4d4d" />
            <div className="status-bar-bg">
               <div className="fill damage" style={{ width: `${damage}%` }} />
            </div>
         </div>
      </div>

      <div className="camera-hint">اضغط C لتغيير الكاميرا | Shift للنيتروجين</div>
    </div>
  );
}
