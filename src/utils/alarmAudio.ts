// Web Audio API emergency synthesizer for accident / vehicular disaster alarms

let audioCtx: AudioContext | null = null;
let alarmOscillator1: OscillatorNode | null = null;
let alarmOscillator2: OscillatorNode | null = null;
let alarmGain: GainNode | null = null;
let alarmInterval: any = null;
let isAlarmPlaying = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays an urgent multi-tone emergency accident alarm siren
 */
export function playAccidentAlarmSound(): void {
  try {
    const ctx = getAudioContext();
    if (isAlarmPlaying) return;

    isAlarmPlaying = true;

    // Create gain node for volume
    alarmGain = ctx.createGain();
    alarmGain.gain.setValueAtTime(0.18, ctx.currentTime);
    alarmGain.connect(ctx.destination);

    // Tone switching logic (880Hz A5 <-> 587Hz D5 alternating emergency pulse)
    let high = true;
    const playChimePulse = () => {
      if (!isAlarmPlaying || !ctx) return;
      try {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        
        osc.type = 'sawtooth';
        const freq = high ? 880 : 660;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        oscGain.gain.setValueAtTime(0.2, ctx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);

        high = !high;
      } catch (e) {
        console.warn('Oscillator error:', e);
      }
    };

    // Immediate first pulse
    playChimePulse();
    // Repeating emergency pulse every 450ms
    alarmInterval = setInterval(playChimePulse, 450);

  } catch (err) {
    console.warn('Web Audio playback error or autoplay policy restricted:', err);
  }
}

/**
 * Stops any playing accident alarm sound
 */
export function stopAccidentAlarmSound(): void {
  isAlarmPlaying = false;
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
  if (alarmOscillator1) {
    try { alarmOscillator1.stop(); } catch {}
    alarmOscillator1 = null;
  }
  if (alarmOscillator2) {
    try { alarmOscillator2.stop(); } catch {}
    alarmOscillator2 = null;
  }
  if (alarmGain) {
    try { alarmGain.disconnect(); } catch {}
    alarmGain = null;
  }
}

/**
 * Plays a single confirmation beep
 */
export function playActionBeep(freq = 520, duration = 0.15): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio beep error:', e);
  }
}
