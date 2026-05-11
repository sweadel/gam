import { useStore, PARTS_DATABASE } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Tool, Wind, Activity, Save } from 'lucide-react';
import { useState } from 'react';

export function GarageUI() {
  const { mode, engine, suspension, updateEngine, updateSuspension } = useStore();
  const [activeTab, setActiveTab] = useState<'engine' | 'suspension' | 'stats'>('engine');

  if (mode !== 'garage') return null;

  // Calculate current HP
  const hp = 150 + 
    (PARTS_DATABASE.crankshaft as any)[engine.crankshaft]?.hp + 
    (PARTS_DATABASE.intake as any)[engine.intakeType]?.hp + 
    (PARTS_DATABASE.turbo as any)[engine.turboSize]?.hp;

  return (
    <div className="garage-overlay">
      <motion.div 
        initial={{ x: -400 }}
        animate={{ x: 0 }}
        className="garage-sidebar glass-panel"
      >
        <div className="garage-header">
          <h2><Tool /> المختبر الميكانيكي</h2>
          <div className="hp-badge">{hp} HP</div>
        </div>

        <div className="garage-tabs">
          <button className={activeTab === 'engine' ? 'active' : ''} onClick={() => setActiveTab('engine')}>المحرك</button>
          <button className={activeTab === 'suspension' ? 'active' : ''} onClick={() => setActiveTab('suspension')}>التعليق</button>
          <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>الأداء</button>
        </div>

        <div className="garage-content">
          {activeTab === 'engine' && (
            <div className="parts-list">
              <div className="part-item">
                <label>الكرنك (Crankshaft)</label>
                <select 
                  value={engine.crankshaft} 
                  onChange={(e) => updateEngine({ crankshaft: e.target.value as any })}
                >
                  {Object.entries(PARTS_DATABASE.crankshaft).map(([id, data]) => (
                    <option key={id} value={id}>{data.label}</option>
                  ))}
                </select>
              </div>

              <div className="part-item">
                <label>نظام التنفس (Intake)</label>
                <select 
                  value={engine.intakeType} 
                  onChange={(e) => updateEngine({ intakeType: e.target.value as any })}
                >
                  {Object.entries(PARTS_DATABASE.intake).map(([id, data]) => (
                    <option key={id} value={id}>{data.label}</option>
                  ))}
                </select>
              </div>

              <div className="part-item">
                <label>نظام التربو (Turbocharger)</label>
                <select 
                  value={engine.turboSize} 
                  onChange={(e) => updateEngine({ turboSize: e.target.value as any })}
                >
                  {Object.entries(PARTS_DATABASE.turbo).map(([id, data]) => (
                    <option key={id} value={id}>{data.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {activeTab === 'suspension' && (
            <div className="parts-list">
              <div className="part-item">
                <label>زاوية الالتفاف: {suspension.steeringAngle}°</label>
                <input 
                  type="range" min="30" max="75" step="5" 
                  value={suspension.steeringAngle}
                  onChange={(e) => updateSuspension({ steeringAngle: parseInt(e.target.value) })}
                />
              </div>
              <div className="part-item">
                <label>قساوة المساعدات: {suspension.stiffness}</label>
                <input 
                  type="range" min="20" max="100" 
                  value={suspension.stiffness}
                  onChange={(e) => updateSuspension({ stiffness: parseInt(e.target.value) })}
                />
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="stats-dashboard">
              <div className="stat-card">
                <span className="stat-label">توزيع الوزن</span>
                <div className="stat-bar"><div className="stat-fill" style={{ width: '50%' }}></div></div>
              </div>
              <div className="stat-card">
                <span className="stat-label">التماسك الحراري</span>
                <div className="stat-bar"><div className="stat-fill" style={{ width: '80%' }}></div></div>
              </div>
            </div>
          )}
        </div>

        <button className="drive-btn" onClick={() => useStore.getState().setMode('drive')}>
          <Save size={18} /> حفظ وتجربة القيادة
        </button>
      </motion.div>
    </div>
  );
}
