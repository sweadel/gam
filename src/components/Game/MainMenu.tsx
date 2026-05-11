import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';
import { Play, Settings, Car, Map as MapIcon } from 'lucide-react';

const availableCars = [
  { id: 'm3', name: 'BMW M3 (E46)', brand: 'BMW', color: '#ff4d4d' },
  { id: 'c63', name: 'Mercedes C63 AMG', brand: 'Mercedes', color: '#333' },
  { id: 'supra', name: 'Toyota Supra MK4', brand: 'Toyota', color: '#ffaa00' },
];

const environments = [
  { id: 'circle', name: 'ساحة التخميس (The Circle)', icon: <MapIcon /> },
  { id: 'city', name: 'المدينة (Free Roam)', icon: <MapIcon /> },
  { id: 'drag', name: 'سباق الشوارع (Drag)', icon: <MapIcon /> },
];

export function MainMenu() {
  const { setMode, setSelectedCar, selectedCar, environment, setEnvironment } = useStore();

  return (
    <div className="main-menu">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="menu-container glass-panel"
      >
        <h1 className="title-glow">المحاكي الواقعي Pro</h1>
        
        <div className="menu-sections">
          {/* Car Selection */}
          <section className="menu-section">
            <h3><Car size={18} /> اختر سيارتك</h3>
            <div className="car-list">
              {availableCars.map((car) => (
                <button 
                  key={car.id}
                  className={`menu-btn car-item ${selectedCar.id === car.id ? 'active' : ''}`}
                  onClick={() => setSelectedCar(car as any)}
                >
                  {car.name}
                </button>
              ))}
            </div>
          </section>

          {/* Environment Selection */}
          <section className="menu-section">
            <h3><MapIcon size={18} /> اختر البيئة</h3>
            <div className="env-list">
              {environments.map((env) => (
                <button 
                  key={env.id}
                  className={`menu-btn env-item ${environment === env.id ? 'active' : ''}`}
                  onClick={() => setEnvironment(env.id as any)}
                >
                  {env.name}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="menu-actions">
          <button className="action-btn garage-btn" onClick={() => setMode('garage')}>
            <Settings size={20} /> الكراج والتعديل
          </button>
          <button className="action-btn start-btn" onClick={() => setMode('drive')}>
            <Play size={24} /> ابدأ القيادة
          </button>
        </div>
      </motion.div>

      <div className="menu-bg-overlay" />
    </div>
  );
}
