import { useStore, PARTS_DATABASE, CARS_DATABASE } from '../../store/useStore';
import { motion } from 'framer-motion';
import { Wrench, Save, Wallet, CheckCircle, Car, Palette, Zap } from 'lucide-react';
import { useState } from 'react';

export function GarageUI() {
  const { 
    money, 
    ownedParts, 
    buyPart, 
    engine, 
    visuals, 
    selectedCar,
    setSelectedCar,
    updateEngine, 
    updateVisuals, 
    setMode 
  } = useStore();
  
  const [tab, setTab] = useState<'car' | 'engine' | 'visual'>('car');

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
            if (category === 'pistons') updateEngine({ pistons: partKey });
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
      <motion.div 
        className="garage-panel glass-panel"
        initial={{ x: -400 }}
        animate={{ x: 0 }}
      >
        <div className="garage-header">
          <div className="header-top">
            <h2><Wrench /> المختبر الميكانيكي</h2>
            <div className="money-display">
               <Wallet size={16} /> ${money.toLocaleString()}
            </div>
          </div>
          
          <div className="garage-tabs">
            <button className={tab === 'car' ? 'active' : ''} onClick={() => setTab('car')}><Car size={18} /> السيارات</button>
            <button className={tab === 'engine' ? 'active' : ''} onClick={() => setTab('engine')}><Zap size={18} /> المحرك</button>
            <button className={tab === 'visual' ? 'active' : ''} onClick={() => setTab('visual')}><Palette size={18} /> المظهر</button>
          </div>
        </div>

        <div className="garage-content scrollable">
          {tab === 'car' && (
            <div className="section">
              <h3>اختر الوحش</h3>
              <div className="car-grid">
                {CARS_DATABASE.map(car => (
                  <div 
                    key={car.id} 
                    className={`car-selector ${selectedCar.id === car.id ? 'active' : ''}`}
                    onClick={() => setSelectedCar(car)}
                  >
                    <span className="car-name">{car.name}</span>
                    <div className="car-stats">
                       <div className="stat-bar"><div className="fill" style={{ width: `${car.stats.speed}%` }}></div></div>
                       <div className="stat-bar drift"><div className="fill" style={{ width: `${car.stats.drift}%` }}></div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'engine' && (
            <>
              <div className="section">
                <h3>عمود الكرنك (Crankshaft)</h3>
                <div className="parts-list">{Object.entries(PARTS_DATABASE.crankshaft).map(([k, v]) => renderPart('crankshaft', k, v))}</div>
              </div>
              <div className="section">
                <h3>نظام السحب (Intake)</h3>
                <div className="parts-list">{Object.entries(PARTS_DATABASE.intake).map(([k, v]) => renderPart('intake', k, v))}</div>
              </div>
              <div className="section">
                <h3>الشاحن (Turbocharger)</h3>
                <div className="parts-list">{Object.entries(PARTS_DATABASE.turbo).map(([k, v]) => renderPart('turbo', k, v))}</div>
              </div>
            </>
          )}

          {tab === 'visual' && (
            <>
              <div className="section">
                <h3>هيكل السيارة (Body Kit)</h3>
                <div className="parts-list">{Object.entries(PARTS_DATABASE.bodyKit).map(([k, v]) => renderPart('bodyKit', k, v))}</div>
              </div>
              <div className="section">
                <h3>إضاءة النيون (Underglow)</h3>
                <div className="parts-list">{Object.entries(PARTS_DATABASE.neon).map(([k, v]) => renderPart('neon', k, v))}</div>
              </div>
            </>
          )}
        </div>

        <div className="garage-footer">
          <button className="btn-primary" onClick={() => setMode('drive')}>
            <Save size={18} /> انطلاق إلى الحلبة
          </button>
        </div>
      </motion.div>
    </div>
  );
}
