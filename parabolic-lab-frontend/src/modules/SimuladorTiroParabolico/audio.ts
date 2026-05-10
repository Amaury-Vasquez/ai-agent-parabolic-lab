type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let musicEnabled = false;
let melodyTimer: number | null = null;

const NOTE_FREQS: Record<string, number> = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
};

const MELODY: Array<{ note: string | null; dur: number }> = [
  { note: "E5", dur: 0.18 },
  { note: "E5", dur: 0.18 },
  { note: null, dur: 0.18 },
  { note: "E5", dur: 0.18 },
  { note: null, dur: 0.18 },
  { note: "C5", dur: 0.18 },
  { note: "E5", dur: 0.18 },
  { note: "G5", dur: 0.36 },
  { note: null, dur: 0.18 },
  { note: "G4", dur: 0.36 },
  { note: null, dur: 0.18 },
  { note: "C5", dur: 0.27 },
  { note: null, dur: 0.18 },
  { note: "G4", dur: 0.27 },
  { note: null, dur: 0.18 },
  { note: "E4", dur: 0.27 },
  { note: null, dur: 0.18 },
  { note: "A4", dur: 0.18 },
  { note: "B4", dur: 0.18 },
  { note: "A4", dur: 0.18 },
  { note: "G4", dur: 0.18 },
  { note: "E5", dur: 0.18 },
  { note: "G5", dur: 0.18 },
  { note: "A5", dur: 0.36 },
  { note: "F5", dur: 0.18 },
  { note: "G5", dur: 0.18 },
  { note: null, dur: 0.18 },
  { note: "E5", dur: 0.18 },
  { note: "C5", dur: 0.18 },
  { note: "D5", dur: 0.18 },
  { note: "B4", dur: 0.36 },
];

const BASS: Array<{ note: string | null; dur: number }> = [
  { note: "C4", dur: 0.36 },
  { note: "C4", dur: 0.36 },
  { note: "G4", dur: 0.36 },
  { note: "G4", dur: 0.36 },
  { note: "A4", dur: 0.36 },
  { note: "A4", dur: 0.36 },
  { note: "F4", dur: 0.36 },
  { note: "G4", dur: 0.36 },
];

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ?? (window as WindowWithWebkit).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.18;
    musicGain.connect(masterGain);
  }
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  return ctx;
}

export function unlockAudio(): void {
  getCtx();
}

function envelope(
  audioCtx: AudioContext,
  start: number,
  dur: number,
  peak: number,
  destination: AudioNode
): GainNode {
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peak, start + Math.min(0.01, dur * 0.1));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  gain.connect(destination);
  return gain;
}

export function playLaunch(): void {
  const c = getCtx();
  if (!c || !masterGain) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(380, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.28);
  const gain = envelope(c, now, 0.3, 0.35, masterGain);
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.32);

  const sub = c.createOscillator();
  sub.type = "square";
  sub.frequency.setValueAtTime(120, now);
  sub.frequency.exponentialRampToValueAtTime(40, now + 0.25);
  const subGain = envelope(c, now, 0.25, 0.2, masterGain);
  sub.connect(subGain);
  sub.start(now);
  sub.stop(now + 0.27);
}

export function playHit(strength = 1): void {
  const c = getCtx();
  if (!c || !masterGain) return;
  const now = c.currentTime;
  const buf = c.createBuffer(1, c.sampleRate * 0.4, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.08));
  }
  const noise = c.createBufferSource();
  noise.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 600;
  const noiseGain = envelope(c, now, 0.4, 0.55 * strength, masterGain);
  noise.connect(filter).connect(noiseGain);
  noise.start(now);

  const chime = c.createOscillator();
  chime.type = "triangle";
  chime.frequency.setValueAtTime(880, now);
  chime.frequency.exponentialRampToValueAtTime(1760, now + 0.18);
  const chimeGain = envelope(c, now + 0.05, 0.35, 0.25, masterGain);
  chime.connect(chimeGain);
  chime.start(now + 0.05);
  chime.stop(now + 0.42);
}

export function playMiss(): void {
  const c = getCtx();
  if (!c || !masterGain) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(260, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.32);
  const gain = envelope(c, now, 0.35, 0.18, masterGain);
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.36);
}

export function playClick(): void {
  const c = getCtx();
  if (!c || !masterGain) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  osc.type = "square";
  osc.frequency.setValueAtTime(660, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);
  const gain = envelope(c, now, 0.06, 0.1, masterGain);
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.07);
}

function scheduleLoop(audioCtx: AudioContext): void {
  if (!musicEnabled || !musicGain) return;
  const startTime = audioCtx.currentTime + 0.05;
  let t = startTime;

  for (const { note, dur } of MELODY) {
    if (note) {
      const osc = audioCtx.createOscillator();
      osc.type = "square";
      osc.frequency.value = NOTE_FREQS[note];
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.01);
      gain.gain.linearRampToValueAtTime(0.12, t + dur - 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(musicGain);
      osc.start(t);
      osc.stop(t + dur);
    }
    t += dur;
  }
  const melodyEnd = t;

  let bt = startTime;
  while (bt < melodyEnd) {
    for (const { note, dur } of BASS) {
      if (bt >= melodyEnd) break;
      if (note) {
        const osc = audioCtx.createOscillator();
        osc.type = "triangle";
        osc.frequency.value = NOTE_FREQS[note] / 2;
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0, bt);
        gain.gain.linearRampToValueAtTime(0.18, bt + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, bt + dur);
        osc.connect(gain).connect(musicGain);
        osc.start(bt);
        osc.stop(bt + dur);
      }
      bt += dur;
    }
  }

  const loopMs = (melodyEnd - audioCtx.currentTime) * 1000;
  melodyTimer = window.setTimeout(() => scheduleLoop(audioCtx), loopMs - 50);
}

export function startMusic(): void {
  const c = getCtx();
  if (!c || musicEnabled) return;
  musicEnabled = true;
  scheduleLoop(c);
}

export function stopMusic(): void {
  musicEnabled = false;
  if (melodyTimer !== null) {
    clearTimeout(melodyTimer);
    melodyTimer = null;
  }
}

export function isMusicPlaying(): boolean {
  return musicEnabled;
}
