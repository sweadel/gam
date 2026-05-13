import { useStore, PARTS_DATABASE, CARS_DATABASE } from '../../store/useStore';
import { motion } from 'framer-motion';
import { Wrench, Wallet, CheckCircle, Car, Palette, Zap, Cloud, Settings, Trophy, Volume2, Sliders } from 'lucide-react';
import { useState } from 'react';

export function GarageUI() {
  const { 
    money, 
    ownedParts, 
    buyPart, 
    engine, 
    visuals, 
    selectedCar,
    damage,
    records,
    settings,
    updateSettings,
    repairCar,
    setSelectedCar,
    updateEngine, 
    updateVisuals, 
    setMode 
  } = useStore();
  
  const [tab, setTab] = useState<'car' | 'engine' | 'visual' | 'world' | 'settings' | 'records'>('car');

  const renderPart = (category: string, partKey: string, data: any) => {
    const isOwned = ownedParts.includes(partKey);
    const isEquipped = 
       engine.crankshaft === partKey || 
       engine.intakeType === partKey || 
       engine.turboSize === partKey ||
       engine.pistons === partKey ||
       visuals.bodyKit === partKey ||
       visuals.neon === data.color;

    return (
      <div 
        key={partKey} 
        className={`part-card ${isEquipped ? 'equipped' : ''}`}
        onClick={() => {
          if (isOwned) {
            if (category === 'crankshaft') updateEngine({ crankshaft: partKey });
            if (category === 'intake') updateEngine({ intakeType: partKey });
            if (category === 'turbo') updateEngine({ turboSize: partKey });
            if (category === 'pistons') updateEngine({ pistons: partKey as 'stock' | 'forged' });
            if (category === 'bodyKit') updateVisuals({ bodyKit: partKey as any });
            if (category === 'neon') updateVisuals({ neon: data.color });
          } else {
            buyPart(partKey, data.price);
          }
        }}
      >
        <div className="part-info">
          <span className="part-label">{data.label}</span>
          {!isOwned && <span className="part-price">${data.price}</span>}
          {isOwned && isEquipped && <span className="equipped-badge"><CheckCircle size={12} /> مجهز</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="garage-overlay">
      <motion.div className="garage-panel glass-panel" initial={{ x: -400 }} animate={{ x: 0 }}>
        <div className="garage-header">
          <div className="header-top">
            <h2><Wrench /> المرآب الاحترافي</h2>
            <div className="money-display"><Wallet size={16} /> ${money.toLocaleString()}</div>
          </div>
          <div className="garage-tabs">
            <button className={tab === 'car' ? 'active' : ''} onClick={() => setTab('car')}><Car size={16} /></button>
            <button className={tab === 'engine' ? 'active' : ''} onClick={() => setTab('engine')}><Zap size={16} /></button>
            <button className={tab === 'visual' ? 'active' : ''} onClick={() => setTab('visual')}><Palette size={16} /></button>
            <button className={tab === 'world' ? 'active' : ''} onClick={() => setTab('world')}><Cloud size={16} /></button>
            <button className={tab === 'records' ? 'active' : ''} onClick={() => setTab('records')}><Trophy size={16} /></button>
            <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}><Settings size={16} /></button>
          </div>
        </div>

        <div className="garage-content scrollable">
          {tab === 'car' && (
            <div className="section">
              <h3>السيارات المتوفرة</h3>
              <div className="car-grid">
                {CARS_DATABASE.map(car => (
                  <div key={car.id} className={`car-selector ${selectedCar.id === car.id ? 'active' : ''}`} onClick={() => setSelectedCar(car)}>
                    <span className="car-name">{car.name}</span>
                  </div>
                ))}
              </div>
              {damage > 0 && (
                <div className="repair-section" style={{ marginTop: 20 }}>
                   <p style={{ color: '#ff4d4d' }}>نسبة الضرر: {damage}%</p>
                   <button className="btn-primary" onClick={repairCar}>إصلاح ($1,000)</button>
                </div>
              )}
            </div>
          )}

          {tab === 'records' && (
            <div className="section">
               <h3>الأرقام القياسية</h3>
               <div className="record-card"><span>أعلى سرعة:</span> <span>{Math.floor(records.topSpeed)} كم/س</span></div>
               <div className="record-card"><span>أطول درفت:</span> <span>{records.longestDrift} نقطة</span></div>
               <div className="record-card"><span>إجمالي النقاط:</span> <span>{records.totalStylePoints}</span></div>
            </div>
          )}

          {tab === 'settings' && (
            <div className="section">
               <h3>الإعدادات</h3>
               <div className="setting-row"><label><Volume2 size={14}/> الصوت</label>
               <input type="range" min="0" max="1" step="0.1" value={settings.soundVolume} onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })} /></div>
               <div className="setting-row"><label><Sliders size={14}/> حساسية التوجيه</label>
               <input type="range" min="0.5" max="2" step="0.1" value={settings.steeringSensitivity} onChange={(e) => updateSettings({ steeringSensitivity: parseFloat(e.target.value) })} /></div>
            </div>
          )}

          {tab === 'engine' && (
             <div className="section"><h3>التيربو والمحرك</h3><div className="parts-list">{Object.entries(PARTS_DATABASE.turbo).map(([k, v]) => renderPart('turbo', k, v))}</div></div>
          )}

          {tab === 'visual' && (
            <div className="section">
               <h3>الدهان والنيون</h3>
               <input type="color" value={visuals.paintColor} onChange={(e) => updateVisuals({ paintColor: e.target.value })} style={{ width: '100%', height: 40, border: 'none', borderRadius: 8 }} />
               <div className="parts-list" style={{ marginTop: 15 }}>{Object.entries(PARTS_DATABASE.neon).map(([k, v]) => renderPart('neon', k, v))}</div>
            </div>
          )}
        </div>

        <div className="garage-footer"><button className="btn-primary" onClick={() => setMode('drive')}>دخول السباق</button></div>
      </motion.div>
    </div>
  );
}
