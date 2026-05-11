import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EngineConfig {
  crankshaft: 'lightweight' | 'heavy-duty';
  compressionRatio: number;
  camshaftTiming: number;
  intakeType: 'cold-air' | 'short-ram';
  throttleSize: number;
  turboSize: 'small' | 'large' | 'none';
  boostPressure: number;
}

interface CarType {
  id: string;
  name: string;
  brand: 'BMW' | 'Mercedes' | 'Toyota';
  color: string;
}

export const PARTS_DATABASE = {
  crankshaft: {
    'heavy-duty': { hp: 0, rpmLimit: 7000, label: 'ستاندرد (Heavy Duty)' },
    'sport': { hp: 50, rpmLimit: 8500, label: 'رياضي (Sport)' },
    'race': { hp: 120, rpmLimit: 10000, label: 'سباقات (Ultra Light)' },
  },
  intake: {
    'standard': { hp: 0, soundPitch: 1.0, label: 'فلتر الوكالة' },
    'cold-air': { hp: 15, soundPitch: 1.1, label: 'فلتر بارد (Cold Air)' },
    'short-ram': { hp: 10, soundPitch: 1.3, label: 'Short Ram (صوت مرتفع)' },
  },
  turbo: {
    'none': { hp: 0, torque: 0, label: 'تنفس طبيعي (NA)' },
    'small': { hp: 200, torque: 300, label: 'تربو صغير (Quick Response)' },
    'large': { hp: 500, torque: 600, label: 'تربو عملاق (Big Power)' },
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
  updateDragStats: (updates: Partial<GameState['dragStats']>) => void;
}

export const useStore = create<GameState>()(
  persist(
    (set) => ({
      mode: 'menu',
      selectedCar: { id: 'm3', name: 'M3 Drift Edition', brand: 'BMW', color: '#ff4d4d' },
      environment: 'circle',
      engine: {
        crankshaft: 'heavy-duty',
        compressionRatio: 9.5,
        camshaftTiming: 0,
        intakeType: 'cold-air',
        throttleSize: 70,
        turboSize: 'none',
        boostPressure: 0,
      },
      suspension: {
        stiffness: 50,
        height: 0.2,
        camber: -2,
        steeringAngle: 60, // Set to 60 as per user request
        diffType: 'LSD',
      },
      tires: {
        temp: 25,
        wear: 100,
      },
      rpm: 800,
      gear: 1,
      stylePoints: 0,
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
      addStylePoints: (points) => set((state) => ({ stylePoints: state.stylePoints + points })),
      updateDragStats: (updates) => set((state) => ({ dragStats: { ...state.dragStats, ...updates } })),
    }),
    {
      name: 'hardcore-sim-storage',
      partialize: (state) => ({ 
        engine: state.engine, 
        suspension: state.suspension, 
        selectedCar: state.selectedCar 
      }),
    }
  )
);
