import { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';

export function EngineSound() {
  const rpm = useStore((state) => state.rpm);
  const turboSize = useStore((state) => state.engine.turboSize);
  const audioContext = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const filterNode = useRef<BiquadFilterNode | null>(null);

  useEffect(() => {
    // Initialize Audio Context on first interaction
    const initAudio = () => {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        oscillator.current = audioContext.current.createOscillator();
        oscillator.current.type = 'sawtooth';
        
        filterNode.current = audioContext.current.createBiquadFilter();
        filterNode.current.type = 'lowpass';
        filterNode.current.frequency.value = 1000;

        gainNode.current = audioContext.current.createGain();
        gainNode.current.gain.value = 0.1;

        oscillator.current.connect(filterNode.current);
        filterNode.current.connect(gainNode.current);
        gainNode.current.connect(audioContext.current.destination);

        oscillator.current.start();
      }
    };

    window.addEventListener('keydown', initAudio, { once: true });
    return () => window.removeEventListener('keydown', initAudio);
  }, []);

  useEffect(() => {
    if (oscillator.current && audioContext.current) {
      const freq = 20 + (rpm / 8000) * 200;
      oscillator.current.frequency.setTargetAtTime(freq, audioContext.current.currentTime, 0.1);
      
      // Turbo Whistle Simulation
      if (turboSize !== 'none' && filterNode.current) {
        const whistleFreq = 1000 + (rpm / 8000) * 4000;
        filterNode.current.frequency.setTargetAtTime(whistleFreq, audioContext.current.currentTime, 0.1);
        gainNode.current!.gain.setTargetAtTime(0.15, audioContext.current.currentTime, 0.1);
      } else {
        gainNode.current!.gain.setTargetAtTime(0.1, audioContext.current.currentTime, 0.1);
      }
    }
  }, [rpm, turboSize]);

  return null;
}
