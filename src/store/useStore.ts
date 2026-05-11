import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EngineConfig {
  crankshaft: string;
  compressionRatio: number;
  camshaftTiming: number;
  intakeType: string;
  throttleSize: number;
  turboSize: string;
  boostPressure: number;
}

interface CarType {
  id: string;
  name: string;
  brand: 'BMW' | 'Mercedes' | 'Toyota';
  color: string;
}

export const PARTS_DATABASE: any = {
  crankshaft: {
    'heavy-duty': { hp: 0, rpmLimit: 7000, label: 'ستاندرد (Heavy Duty)', price: 0 },
    'sport': { hp: 50, rpmLimit: 8500, label: 'رياضي (Sport)', price: 5000 },
    'race': { hp: 120, rpmLimit: 10000, label: 'سباقات (Ultra Light)', price: 15000 },
  },
  intake: {
    'standard': { hp: 0, soundPitch: 1.0, label: 'فلتر الوكالة', price: 0 },
    'cold-air': { hp: 15, soundPitch: 1.1, label: 'فلتر بارد (Cold Air)', price: 1200 },
    'short-ram': { hp: 10, soundPitch: 1.3, label: 'Short Ram (صوت مرتفع)', price: 800 },
  },
  turbo: {
    'none': { hp: 0, torque: 0, label: 'تنفس طبيعي (NA)', price: 0 },
    'small': { hp: 200, torque: 300, label: 'تربو صغير (Quick Response)', price: 8000 },
    'large': { hp: 500, torque: 600, label: 'تربو عملاق (Big Power)', price: 25000 },
  }
};

interface SuspensionConfig {
  stiffness: number;
  height: number;
  camber: number;
  steeringAngle: number;
  diffType: 'LSD' | 'welded';
}

interface TireStats {
  temp: number;
  wear: number;
}

interface GameState {
  mode: 'menu' | 'garage' | 'drive';
  selectedCar: CarType;
  environment: 'circle' | 'city' | 'drag';
  engine: EngineConfig;
  suspension: SuspensionConfig;
  tires: TireStats;
  rpm: number;
  gear: number;
  stylePoints: number;
  money: number;
  ownedParts: string[];
  dragStats: {
    active: boolean;
    startTime: number | null;
    finishTime: number | null;
    time0to100: number | null;
    quarterMileTime: number | null;
  };
  setMode: (mode: 'menu' | 'garage' | 'drive') => void;
  setSelectedCar: (car: CarType) => void;
  setEnvironment: (env: 'circle' | 'city' | 'drag') => void;
  updateEngine: (updates: Partial<EngineConfig>) => void;
  updateSuspension: (updates: Partial<SuspensionConfig>) => void;
  updateTireStats: (updates: Partial<TireStats>) => void;
  updateRPM: (rpm: number, gear: number) => void;
  addStylePoints: (points: number) => void;
  buyPart: (id: string, price: number) => boolean;
  updateDragStats: (updates: Partial<GameState['dragStats']>) => void;
}

export const useStore = create<GameState>()(
  persist(
    (set, get) => ({
      mode: 'menu',
      selectedCar: { id: 'm3', name: 'M3 Drift Edition', brand: 'BMW', color: '#ff4d4d' },
      environment: 'circle',
      engine: {
        crankshaft: 'heavy-duty',
        compressionRatio: 9.5,
        camshaftTiming: 0,
        intakeType: 'standard',
        throttleSize: 70,
        turboSize: 'none',
        boostPressure: 0,
      },
      suspension: {
        stiffness: 50,
        height: 0.2,
        camber: -2,
        steeringAngle: 60,
        diffType: 'LSD',
      },
      tires: {
        temp: 25,
        wear: 100,
      },
      rpm: 800,
      gear: 1,
      stylePoints: 0,
      money: 1000, // Initial cash
      ownedParts: ['heavy-duty', 'standard', 'none'],
      dragStats: {
        active: false,
        startTime: null,
        finishTime: null,
        time0to100: null,
        quarterMileTime: null,
      },
      setMode: (mode) => set({ mode }),
      setSelectedCar: (car) => set({ selectedCar: car }),
      setEnvironment: (env) => set({ environment: env }),
      updateEngine: (updates) => set((state) => ({ engine: { ...state.engine, ...updates } })),
      updateSuspension: (updates) => set((state) => ({ suspension: { ...state.suspension, ...updates } })),
      updateTireStats: (updates) => set((state) => ({ tires: { ...state.tires, ...updates } })),
      updateRPM: (rpm, gear) => set({ rpm, gear }),
      addStylePoints: (points) => set((state) => {
         const newPoints = state.stylePoints + points;
         // Every 100 style points = $10
         const cashBonus = Math.floor(points / 10); 
         return { stylePoints: newPoints, money: state.money + cashBonus };
      }),
      buyPart: (id, price) => {
         const state = get();
         if (state.money >= price && !state.ownedParts.includes(id)) {
            set({ 
               money: state.money - price, 
               ownedParts: [...state.ownedParts, id] 
            });
            return true;
         }
         return state.ownedParts.includes(id);
      },
      updateDragStats: (updates) => set((state) => ({ dragStats: { ...state.dragStats, ...updates } })),
    }),
    {
      name: 'hardcore-sim-storage-v2',
      partialize: (state) => ({ 
        engine: state.engine, 
        suspension: state.suspension, 
        selectedCar: state.selectedCar,
        money: state.money,
        ownedParts: state.ownedParts,
        stylePoints: state.stylePoints
      }),
    }
  )
);
