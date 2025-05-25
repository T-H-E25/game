import { useCallback } from 'react';

export const useSoundEffects = () => {
  // Create an audio context lazily when needed
  const getAudioContext = () => {
    if (typeof window === 'undefined') return null;
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  };

  // Helper to play a sound
  const playSound = useCallback((type: 'shoot' | 'hit' | 'miss') => {
    const audioContext = getAudioContext();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure sound based on type
    switch (type) {
      case 'shoot':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
        
      case 'hit':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
        
      case 'miss':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(110, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(55, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
    }
    
    // Create visual feedback for hit effect
    if (type === 'hit') {
      const hitEffect = document.createElement('div');
      hitEffect.className = 'hit-effect';
      hitEffect.style.left = `${event?.clientX - 50}px`;
      hitEffect.style.top = `${event?.clientY - 50}px`;
      hitEffect.style.width = '100px';
      hitEffect.style.height = '100px';
      document.body.appendChild(hitEffect);
      
      // Remove effect after animation completes
      setTimeout(() => {
        document.body.removeChild(hitEffect);
      }, 500);
    }
  }, []);

  const playShootSound = useCallback(() => {
    playSound('shoot');
  }, [playSound]);

  const playHitSound = useCallback(() => {
    playSound('hit');
  }, [playSound]);

  const playMissSound = useCallback(() => {
    playSound('miss');
  }, [playSound]);

  return {
    playShootSound,
    playHitSound,
    playMissSound,
  };
};