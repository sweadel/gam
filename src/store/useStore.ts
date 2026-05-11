import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EngineConfig {
  crankshaft: string;
  intakeType: string;
  turboSize: string;
  pistons: 'stock' | 'forged';
  nitro: boolean;
}

interface VisualConfig {
  bodyKit: 'stock' | 'widebody' | 'drift-spec';
  rims: 'standard' | 'deep-dish';
  neon: string; 
  paintColor: string;
}

interface CarType {
  id: string;
  name: string;
  brand: 'BMW' | 'Nissan' | 'Toyota';
  color: string;
  stats: { speed: number, drift: number, accel: number };
}

export const CARS_DATABASE: CarType[] = [
  { id: 'm3', name: 'M3 Drift King', brand: 'BMW', color: '#ff4d4d', stats: { speed: 85, drift: 95, accel: 80 } },
  { id: 's15', name: 'Silvia S15 Spec-D', brand: 'Nissan', color: '#4d4dff', stats: { speed: 75, drift: 100, accel: 85 } },
  { id: 'supra', name: 'Supra MK4 Legend', brand: 'Toyota', color: '#ffffff', stats: { speed: 100, drift: 80, accel: 95 } },
];

export const PARTS_DATABASE: any = {
  crankshaft: {
    'heavy-duty': { hp: 0, rpmLimit: 7000, label: 'ستاندرد (Heavy Duty)', price: 0 },
    'sport': { hp: 50, rpmLimit: 8500, label: 'رياضي (Sport)', price: 5000 },
    'race': { hp: 120, rpmLimit: 10000, label: 'سباقات (Ultra Light)', price: 15000 },
  },
  intake: {
    'standard': { hp: 0, label: 'فلتر الوكالة', price: 0 },
    'cold-air': { hp: 15, label: 'فلتر بارد (Cold Air)', price: 1200 },
    'short-ram': { hp: 10, label: 'Short Ram (صوت مرتفع)', price: 800 },
  },
  turbo: {
    'none': { hp: 0, torque: 0, label: 'تنفس طبيعي (NA)', price: 0 },
    'small': { hp: 200, torque: 300, label: 'تربو صغير (Quick Response)', price: 8000 },
    'large': { hp: 500, torque: 600, label: 'تربو عملاق (Big Power)', price: 25000 },
  },
  pistons: {
    'stock': { hp: 0, durability: 100, label: 'بستون الوكالة', price: 0 },
    'forged': { hp: 40, durability: 200, label: 'بستون رياضي (Forged)', price: 4000 },
  },
  bodyKit: {
    'stock': { label: 'الشكل الأصلي', price: 0 },
    'widebody': { label: 'عرض عريض (Widebody)', price: 10000 },
    'drift-spec': { label: 'تجهيز تفحيط (Drift Spec)', price: 18000 },
  },
  neon: {
    'none': { label: 'بدون نيون', color: 'none', price: 0 },
    'red': { label: 'نيون أحمر', color: '#ff0000', price: 2000 },
    'blue': { label: 'نيون أزرق', color: '#0000ff', price: 2000 },
  }
};

interface GameState {
  mode: 'menu' | 'garage' | 'drive';
  selectedCar: CarType;
  environment: 'circle' | 'city' | 'drag' | 'touge';
  weather: 'clear' | 'rain' | 'fog';
  camera: 'chase' | 'cockpit';
  engine: EngineConfig;
  visuals: VisualConfig;
  suspension: { stiffness: number, height: number, camber: number, steeringAngle: number };
  tires: { temp: number, wear: number };
  damage: number;
  money: number;
  nitroLevel: number;
  ownedParts: string[];
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
  activeMission: { id: string, title: string, reward: number, target: number, progress: number } | null;
  
  setMode: (mode: 'menu' | 'garage' | 'drive') => void;
  setSelectedCar: (car: CarType) => void;
  setEnvironment: (env: 'circle' | 'city' | 'drag' | 'touge') => void;
  setWeather: (w: 'clear' | 'rain' | 'fog') => void;
  setCamera: (c: 'chase' | 'cockpit') => void;
  updateEngine: (updates: Partial<EngineConfig>) => void;
  updateVisuals: (updates: Partial<VisualConfig>) => void;
  updateSuspension: (updates: any) => void;
  updateTireStats: (updates: Partial<{ temp: number, wear: number }>) => void;
  addStylePoints: (points: number) => void;
  addDamage: (amount: number) => void;
  repairCar: () => void;
  useNitro: (amount: number) => void;
  buyPart: (id: string, price: number) => boolean;
  updateRPM: (rpm: number, gear: number) => void;
  updateDragStats: (updates: Partial<{ active: boolean; startTime: number | null; finishTime: number | null; time0to100: number | null; quarterMileTime: number | null; }>) => void;
  checkMissions: (currentSpeed: number, currentDrift: number) => void;
}

export const useStore = create<GameState>()(
  persist(
    (set, get) => ({
      mode: 'menu',
      selectedCar: CARS_DATABASE[0],
      environment: 'city',
      weather: 'clear',
      camera: 'chase',
      engine: {
        crankshaft: 'heavy-duty',
        intakeType: 'standard',
        turboSize: 'none',
        pistons: 'stock',
        nitro: false,
      },
      visuals: {
        bodyKit: 'stock',
        rims: 'standard',
        neon: 'none',
        paintColor: '#ff4d4d',
      },
      suspension: { stiffness: 50, height: 0.2, camber: -2, steeringAngle: 60 },
      tires: { temp: 25, wear: 100 },
      damage: 0,
      money: 100000,
      nitroLevel: 100,
      ownedParts: ['heavy-duty', 'standard', 'none', 'stock'],
      rpm: 800,
      gear: 1,
      stylePoints: 0,
      dragStats: { active: false, startTime: null, finishTime: null, time0to100: null, quarterMileTime: null },
      activeMission: { id: 'drift-master', title: 'درفت لمسافة 50 متر', reward: 5000, target: 50, progress: 0 },

      setMode: (mode) => set({ mode }),
      setSelectedCar: (car) => set({ selectedCar: car, visuals: { ...get().visuals, paintColor: car.color } }),
      setEnvironment: (env) => set({ environment: env }),
      setWeather: (weather) => set({ weather }),
      setCamera: (camera) => set({ camera }),
      updateEngine: (updates) => set((state) => ({ engine: { ...state.engine, ...updates } })),
      updateVisuals: (updates) => set((state) => ({ visuals: { ...state.visuals, ...updates } })),
      updateSuspension: (updates) => set((state) => ({ suspension: { ...state.suspension, ...updates } })),
      updateTireStats: (updates) => set((state) => ({ tires: { ...state.tires, ...updates } })),
      addDamage: (amount) => set((state) => ({ damage: Math.min(100, state.damage + amount) })),
      repairCar: () => set((state) => ({ damage: 0, money: state.money - 1000 })),
      useNitro: (amount) => set((state) => ({ nitroLevel: Math.max(0, state.nitroLevel - amount) })),
      updateRPM: (rpm, gear) => set({ rpm, gear }),
      updateDragStats: (updates) => set((state) => ({ dragStats: { ...state.dragStats, ...updates } })),
      
      addStylePoints: (points) => set((state) => {
         const newPoints = state.stylePoints + points;
         const cashBonus = Math.floor(points / 10);
         return { stylePoints: newPoints, money: state.money + cashBonus };
      }),

      checkMissions: (_speed, drift) => {
        const { activeMission } = get();
        if (!activeMission) return;
        if (drift > 10) {
           set({ activeMission: { ...activeMission, progress: Math.min(activeMission.target, activeMission.progress + 1) } });
           if (get().activeMission && get().activeMission!.progress >= activeMission.target) {
              set({ money: get().money + activeMission.reward, activeMission: null });
           }
        }
      },

      buyPart: (id, price) => {
         const state = get();
         if (state.money >= price && !state.ownedParts.includes(id)) {
            set({ money: state.money - price, ownedParts: [...state.ownedParts, id] });
            return true;
         }
         return state.ownedParts.includes(id);
      },
    }),
    { name: 'hardcore-sim-storage-ultimate-v2' }
  )
);
