import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store/useStore';

export function DragController({ chassisApi }: { chassisApi: any }) {
  const env = useStore((state) => state.environment);
  const { dragStats, updateDragStats } = useStore();
  const velocity = useRef([0, 0, 0]);
  const position = useRef([0, 0, 0]);

  useEffect(() => {
    const unsubVel = chassisApi.velocity.subscribe((v: any) => (velocity.current = v));
    const unsubPos = chassisApi.position.subscribe((p: any) => (position.current = p));
    return () => {
      unsubVel();
      unsubPos();
    };
  }, [chassisApi]);

  useFrame(() => {
    if (env !== 'drag') return;

    const speed = Math.sqrt(velocity.current[0]**2 + velocity.current[2]**2) * 3.6;
    const dist = Math.abs(position.current[2] - 0); // Assuming start at z=0

    // Start Logic
    if (!dragStats.startTime && speed > 1 && position.current[2] < 2) {
      updateDragStats({ startTime: Date.now(), active: true, finishTime: null, time0to100: null, quarterMileTime: null });
    }

    // 0-100 Logic
    if (dragStats.startTime && !dragStats.time0to100 && speed >= 100) {
      const time = (Date.now() - dragStats.startTime) / 1000;
      updateDragStats({ time0to100: time });
    }

    // Finish Logic (1/4 mile = 402m)
    if (dragStats.startTime && !dragStats.finishTime && dist >= 402) {
      const time = (Date.now() - dragStats.startTime) / 1000;
      updateDragStats({ finishTime: Date.now(), quarterMileTime: time, active: false });
    }
  });

  return null;
}
