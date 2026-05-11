import { useStore, PARTS_DATABASE } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Tool, Wind, Activity, Save, Wallet, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export function GarageUI() {
  const { mode, engine, suspension, money, ownedParts, updateEngine, updateSuspension, buyPart } = useStore();
  const [activeTab, setActiveTab] = useState<'engine' | 'suspension' | 'stats'>('engine');

  if (mode !== 'garage') return null;

  // Calculate current HP
  const hp = 150 + 
    (PARTS_DATABASE.crankshaft as any)[engine.crankshaft]?.hp + 
    (PARTS_DATABASE.intake as any)[engine.intakeType]?.hp + 
    (PARTS_DATABASE.turbo as any)[engine.turboSize]?.hp;

  const PartSelector = ({ title, category, currentId, onSelect }: any) => {
    return (
      <div className="part-section">
        <label>{title}</label>
        <div className="part-grid">
          {Object.entries(PARTS_DATABASE[category]).map(([id, data]: [string, any]) => {
            const isOwned = ownedParts.includes(id);
            const isActive = currentId === id;
            
            return (
              <button 
                key={id}
                className={`part-card ${isActive ? 'active' : ''} ${!isOwned ? 'locked' : ''}`}
                onClick={() => {
                  if (isOwned) {
                    onSelect(id);
                  } else {
                    if (buyPart(id, data.price)) {
                       onSelect(id);
                    }
                  }
                }}
              >
                <div className="part-info">
                  <span className="part-label">{data.label}</span>
                  {!isOwned && <span className="part-price">${data.price.toLocaleString()}</span>}
                  {isOwned && isActive && <CheckCircle size={14} className="owned-icon" />}
                </div>
                {data.hp > 0 && <div className="part-stat">+{data.hp} HP</div>}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="garage-overlay">
      <motion.div 
        initial={{ x: -450 }}
        animate={{ x: 0 }}
        className="garage-sidebar glass-panel"
      >
        <div className="garage-header">
          <div className="header-top">
            <h2><Tool /> المختبر الميكانيكي</h2>
            <div className="money-display">
               <Wallet size={16} /> ${money.toLocaleString()}
            </div>
          </div>
          <div className="hp-meter">
             <div className="hp-value">{hp} <span>HP</span></div>
             <div className="hp-bar-bg"><div className="hp-bar-fill" style={{ width: `${(hp/1000)*100}%` }}></div></div>
          </div>
        </div>

        <div className="garage-tabs">
          <button className={activeTab === 'engine' ? 'active' : ''} onClick={() => setActiveTab('engine')}>المحرك</button>
          <button className={activeTab === 'suspension' ? 'active' : ''} onClick={() => setActiveTab('suspension')}>التعليق</button>
          <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>الأداء</button>
        </div>

        <div className="garage-content">
          {activeTab === 'engine' && (
            <div className="parts-scroll">
              <PartSelector 
                title="الكرنك (Crankshaft)" 
                category="crankshaft" 
                currentId={engine.crankshaft}
                onSelect={(id: string) => updateEngine({ crankshaft: id })}
              />
              <PartSelector 
                title="نظام التنفس (Intake)" 
                category="intake" 
                currentId={engine.intakeType}
                onSelect={(id: string) => updateEngine({ intakeType: id })}
              />
              <PartSelector 
                title="نظام التربو (Turbocharger)" 
                category="turbo" 
                currentId={engine.turboSize}
                onSelect={(id: string) => updateEngine({ turboSize: id })}
              />
            </div>
          )}

          {activeTab === 'suspension' && (
            <div className="parts-list">
              <div className="part-item">
                <div className="stat-header">
                  <label>زاوية الالتفاف</label>
                  <span>{suspension.steeringAngle}°</span>
                </div>
                <input 
                  type="range" min="30" max="75" step="5" 
                  value={suspension.steeringAngle}
                  onChange={(e) => updateSuspension({ steeringAngle: parseInt(e.target.value) })}
                />
              </div>
              <div className="part-item">
                <div className="stat-header">
                  <label>قساوة المساعدات</label>
                  <span>{suspension.stiffness}</span>
                </div>
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
