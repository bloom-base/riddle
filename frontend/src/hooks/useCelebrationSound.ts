import { useEffect, useState } from 'react';

/**
 * Hook to play a celebration sound using Web Audio API
 * Sound can be toggled on/off, preference is saved to localStorage
 */
export const useCelebrationSound = () => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('riddleSoundEnabled');
    return saved !== null ? saved === 'true' : true; // Default enabled
  });

  useEffect(() => {
    localStorage.setItem('riddleSoundEnabled', String(soundEnabled));
  }, [soundEnabled]);

  const playCelebrationSound = () => {
    if (!soundEnabled) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioContext.currentTime;

      // Create a simple celebratory melody using oscillators
      const playNote = (frequency: number, startTime: number, duration: number, type: OscillatorType = 'sine') => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        // Envelope for smooth sound
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // Play a cheerful ascending arpeggio
      playNote(523.25, now, 0.15); // C5
      playNote(659.25, now + 0.1, 0.15); // E5
      playNote(783.99, now + 0.2, 0.15); // G5
      playNote(1046.50, now + 0.3, 0.3); // C6

      // Close audio context after sound completes
      setTimeout(() => {
        audioContext.close();
      }, 1000);
    } catch (error) {
      console.error('Error playing celebration sound:', error);
    }
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  return {
    soundEnabled,
    toggleSound,
    playCelebrationSound,
  };
};
