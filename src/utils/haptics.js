const getAudioContext = () => {
  if (!window.audioCtx) {
    window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return window.audioCtx;
};

export const vibrate = (pattern) => {
  if (navigator.vibrate) {
    // Only vibrate on mobile/supported devices
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn('Vibration API not allowed or supported');
    }
  }
};

const playTone = (frequency, type, duration, volume = 0.1) => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio API failed', e);
  }
};

export const playClick = () => {
  vibrate(10);
  playTone(600, 'sine', 0.1, 0.05);
};

export const playSuccess = () => {
  vibrate([30, 50, 30]);
  playTone(400, 'sine', 0.1, 0.1);
  setTimeout(() => playTone(600, 'sine', 0.2, 0.1), 100);
};

export const playError = () => {
  vibrate([50, 50, 50]);
  playTone(200, 'sawtooth', 0.2, 0.1);
  setTimeout(() => playTone(150, 'sawtooth', 0.3, 0.1), 150);
};

export const playCash = () => {
  vibrate([20, 30, 20, 30, 50]);
  // Fast joyful arpeggio
  playTone(880, 'sine', 0.1, 0.1);
  setTimeout(() => playTone(1108, 'sine', 0.1, 0.1), 50);
  setTimeout(() => playTone(1318, 'sine', 0.2, 0.1), 100);
  setTimeout(() => playTone(1760, 'sine', 0.3, 0.1), 150);
};

export const playSwoosh = () => {
  vibrate(30);
  playTone(300, 'triangle', 0.1, 0.05);
  setTimeout(() => playTone(400, 'triangle', 0.2, 0.05), 50);
};
