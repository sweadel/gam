import { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';

export function EngineSound() {
  const rpm = useStore((state) => state.rpm);
  const gear = useStore((state) => state.gear);
  const turboSize = useStore((state) => state.engine.turboSize);
  const mode = useStore((state) => state.mode);
  
  const audioContext = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const filterNode = useRef<BiquadFilterNode | null>(null);
  
  // Turbo Noise Ref
  const turboOsc = useRef<OscillatorNode | null>(null);
  const turboGain = useRef<GainNode | null>(null);
  
  // Last values for blow-off logic
  const lastRPM = useRef(rpm);
  const lastGear = useRef(gear);

  useEffect(() => {
    const initAudio = () => {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Base Engine
        oscillator.current = audioContext.current.createOscillator();
        oscillator.current.type = 'sawtooth';
        
        filterNode.current = audioContext.current.createBiquadFilter();
        filterNode.current.type = 'lowpass';
        filterNode.current.frequency.value = 1000;

        gainNode.current = audioContext.current.createGain();
        gainNode.current.gain.value = 0.05;

        oscillator.current.connect(filterNode.current);
        filterNode.current.connect(gainNode.current);
        gainNode.current.connect(audioContext.current.destination);

        // Turbo Whistle
        turboOsc.current = audioContext.current.createOscillator();
        turboOsc.current.type = 'sine';
        turboGain.current = audioContext.current.createGain();
        turboGain.current.gain.value = 0;
        turboOsc.current.connect(turboGain.current);
        turboGain.current.connect(audioContext.current.destination);

        oscillator.current.start();
        turboOsc.current.start();
      }
    };

    window.addEventListener('keydown', initAudio, { once: true });
    window.addEventListener('mousedown', initAudio, { once: true });
    return () => {
      window.removeEventListener('keydown', initAudio);
      window.removeEventListener('mousedown', initAudio);
    };
  }, []);

  useEffect(() => {
    if (!oscillator.current || !audioContext.current || mode !== 'drive') {
      if (gainNode.current) gainNode.current.gain.setTargetAtTime(0, audioContext.current?.currentTime || 0, 0.1);
      return;
    }

    const now = audioContext.current.currentTime;
    
    // 1. Base Engine Pitch
    const freq = 30 + (rpm / 8000) * 150;
    oscillator.current.frequency.setTargetAtTime(freq, now, 0.05);
    gainNode.current!.gain.setTargetAtTime(0.1, now, 0.1);

    // 2. Turbo Whistle
    if (turboSize !== 'none' && turboOsc.current && turboGain.current) {
      const tFreq = 2000 + (rpm / 8000) * 3000;
      turboOsc.current.frequency.setTargetAtTime(tFreq, now, 0.1);
      
      const tVolume = (rpm > 3000) ? (rpm / 8000) * 0.1 : 0;
      turboGain.current.gain.setTargetAtTime(tVolume, now, 0.1);

      // 3. Blow-off Logic (Sutututu)
      if (lastRPM.current > rpm + 1000 || lastGear.current !== gear) {
         playBlowOff();
      }
    }

    lastRPM.current = rpm;
    lastGear.current = gear;
  }, [rpm, gear, turboSize, mode]);

  const playBlowOff = () => {
    if (!audioContext.current) return;
    const now = audioContext.current.currentTime;
    
    // Quick bursts of white noise for the "sututu"
    for (let i = 0; i < 4; i++) {
      const time = now + i * 0.08;
      const noise = audioContext.current.createBufferSource();
      const bufferSize = audioContext.current.sampleRate * 0.1;
      const buffer = audioContext.current.createBuffer(1, bufferSize, audioContext.current.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) data[j] = Math.random() * 2 - 1;
      
      noise.buffer = buffer;
      const g = audioContext.current.createGain();
      const f = audioContext.current.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 3000 - i * 400;
      
      g.gain.setValueAtTime(0.15 / (i + 1), time);
      g.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
      
      noise.connect(f);
      f.connect(g);
      g.connect(audioContext.current.destination);
      noise.start(time);
    }
  };

  return null;
}
