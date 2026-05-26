import {
  DEFAULT_MUSIC_TRACK,
  type MusicTrackKey,
} from "@/constants/simulatorPlayback";

type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let musicEnabled = false;
let activeTrack: MusicTrackKey = DEFAULT_MUSIC_TRACK;
let melodyTimer: number | null = null;
let scheduledNodes: Array<OscillatorNode | AudioBufferSourceNode> = [];

const NOTE_FREQS: Record<string, number> = {
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
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
  B5: 987.77,
  C6: 1046.5,
  D6: 1174.66,
};

type Note = { note: string | null; dur: number };

interface TrackDefinition {
  bpm: number;
  melodyWave: OscillatorType;
  bassWave: OscillatorType;
  padWave: OscillatorType | null;
  melody: Note[];
  bass: Note[];
  pad?: Note[];
  melodyGain: number;
  bassGain: number;
  padGain: number;
}

// Cuatro pistas originales: distinto modo/tempo/timbre.
const TRACKS: Record<MusicTrackKey, TrackDefinition> = {
  aurora: {
    bpm: 132,
    melodyWave: "square",
    bassWave: "triangle",
    padWave: null,
    melodyGain: 0.12,
    bassGain: 0.16,
    padGain: 0,
    melody: [
      { note: "E5", dur: 0.22 },
      { note: "G5", dur: 0.22 },
      { note: "B5", dur: 0.22 },
      { note: "G5", dur: 0.22 },
      { note: "A5", dur: 0.22 },
      { note: "G5", dur: 0.22 },
      { note: "E5", dur: 0.22 },
      { note: "D5", dur: 0.22 },
      { note: "C5", dur: 0.22 },
      { note: "E5", dur: 0.22 },
      { note: "G5", dur: 0.22 },
      { note: "C6", dur: 0.22 },
      { note: "B5", dur: 0.22 },
      { note: "A5", dur: 0.22 },
      { note: "G5", dur: 0.22 },
      { note: "F5", dur: 0.22 },
    ],
    bass: [
      { note: "C4", dur: 0.44 },
      { note: "G3", dur: 0.44 },
      { note: "A3", dur: 0.44 },
      { note: "F3", dur: 0.44 },
    ],
  },
  voltage: {
    bpm: 168,
    melodyWave: "sawtooth",
    bassWave: "square",
    padWave: null,
    melodyGain: 0.1,
    bassGain: 0.18,
    padGain: 0,
    melody: [
      { note: "A4", dur: 0.14 },
      { note: "C5", dur: 0.14 },
      { note: "E5", dur: 0.14 },
      { note: "A5", dur: 0.14 },
      { note: "G5", dur: 0.14 },
      { note: "E5", dur: 0.14 },
      { note: "C5", dur: 0.14 },
      { note: "A4", dur: 0.14 },
      { note: "D5", dur: 0.14 },
      { note: "F5", dur: 0.14 },
      { note: "A5", dur: 0.14 },
      { note: "D6", dur: 0.14 },
      { note: "C6", dur: 0.14 },
      { note: "A5", dur: 0.14 },
      { note: "E5", dur: 0.14 },
      { note: "A4", dur: 0.14 },
    ],
    bass: [
      { note: "A3", dur: 0.28 },
      { note: "A3", dur: 0.28 },
      { note: "F3", dur: 0.28 },
      { note: "G3", dur: 0.28 },
    ],
  },
  canopy: {
    bpm: 96,
    melodyWave: "triangle",
    bassWave: "sine",
    padWave: "sine",
    melodyGain: 0.14,
    bassGain: 0.2,
    padGain: 0.05,
    melody: [
      { note: "G4", dur: 0.32 },
      { note: "B4", dur: 0.32 },
      { note: "D5", dur: 0.32 },
      { note: "G5", dur: 0.32 },
      { note: "D5", dur: 0.32 },
      { note: "B4", dur: 0.32 },
      { note: "C5", dur: 0.32 },
      { note: "A4", dur: 0.32 },
      { note: "D5", dur: 0.32 },
      { note: "F5", dur: 0.32 },
      { note: "A5", dur: 0.32 },
      { note: "F5", dur: 0.32 },
      { note: "E5", dur: 0.32 },
      { note: "D5", dur: 0.32 },
      { note: "C5", dur: 0.32 },
      { note: "B4", dur: 0.32 },
    ],
    bass: [
      { note: "G3", dur: 0.64 },
      { note: "D4", dur: 0.64 },
      { note: "C4", dur: 0.64 },
      { note: "G3", dur: 0.64 },
    ],
    pad: [
      { note: "B3", dur: 2.56 },
      { note: "A3", dur: 2.56 },
    ],
  },
  horizon: {
    bpm: 110,
    melodyWave: "triangle",
    bassWave: "triangle",
    padWave: "sine",
    melodyGain: 0.13,
    bassGain: 0.18,
    padGain: 0.04,
    melody: [
      { note: "D5", dur: 0.27 },
      { note: "F5", dur: 0.27 },
      { note: "A5", dur: 0.27 },
      { note: "D6", dur: 0.27 },
      { note: "A5", dur: 0.27 },
      { note: "F5", dur: 0.27 },
      { note: "D5", dur: 0.27 },
      { note: "A4", dur: 0.27 },
      { note: "C5", dur: 0.27 },
      { note: "E5", dur: 0.27 },
      { note: "G5", dur: 0.27 },
      { note: "C6", dur: 0.27 },
      { note: "G5", dur: 0.27 },
      { note: "E5", dur: 0.27 },
      { note: "C5", dur: 0.27 },
      { note: "G4", dur: 0.27 },
    ],
    bass: [
      { note: "D3", dur: 0.54 },
      { note: "A3", dur: 0.54 },
      { note: "F3", dur: 0.54 },
      { note: "G3", dur: 0.54 },
    ],
    pad: [
      { note: "F4", dur: 2.16 },
      { note: "E4", dur: 2.16 },
    ],
  },
};

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
    musicGain.gain.value = 0.22;
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

function scheduleVoice(
  audioCtx: AudioContext,
  destination: AudioNode,
  notes: Note[],
  startTime: number,
  wave: OscillatorType,
  peakGain: number,
  octaveShift = 0,
  loopUntil?: number
): number {
  let t = startTime;
  const playOnce = () => {
    for (const { note, dur } of notes) {
      if (note) {
        const osc = audioCtx.createOscillator();
        osc.type = wave;
        const baseFreq = NOTE_FREQS[note] ?? 440;
        osc.frequency.value = baseFreq * Math.pow(2, octaveShift);
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(peakGain, t + 0.012);
        gain.gain.linearRampToValueAtTime(
          peakGain * 0.85,
          t + Math.max(0.02, dur - 0.05)
        );
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(gain).connect(destination);
        osc.start(t);
        osc.stop(t + dur);
        scheduledNodes.push(osc);
      }
      t += dur;
    }
  };
  if (loopUntil === undefined) {
    playOnce();
  } else {
    while (t < loopUntil) {
      playOnce();
    }
  }
  return t;
}

function scheduleLoop(audioCtx: AudioContext): void {
  if (!musicEnabled || !musicGain) return;
  const track = TRACKS[activeTrack];
  const startTime = audioCtx.currentTime + 0.05;

  const melodyEnd = scheduleVoice(
    audioCtx,
    musicGain,
    track.melody,
    startTime,
    track.melodyWave,
    track.melodyGain
  );

  scheduleVoice(
    audioCtx,
    musicGain,
    track.bass,
    startTime,
    track.bassWave,
    track.bassGain,
    -1,
    melodyEnd
  );

  if (track.pad && track.padWave) {
    scheduleVoice(
      audioCtx,
      musicGain,
      track.pad,
      startTime,
      track.padWave,
      track.padGain,
      -1,
      melodyEnd
    );
  }

  const loopMs = (melodyEnd - audioCtx.currentTime) * 1000;
  melodyTimer = window.setTimeout(() => {
    scheduledNodes = scheduledNodes.filter(() => false);
    scheduleLoop(audioCtx);
  }, loopMs - 60);
}

export function startMusic(track?: MusicTrackKey): void {
  const c = getCtx();
  if (!c) return;
  if (track) activeTrack = track;
  if (musicEnabled) return;
  musicEnabled = true;
  scheduleLoop(c);
}

export function stopMusic(): void {
  musicEnabled = false;
  if (melodyTimer !== null) {
    clearTimeout(melodyTimer);
    melodyTimer = null;
  }
  if (ctx) {
    const now = ctx.currentTime;
    for (const node of scheduledNodes) {
      try {
        node.stop(now);
      } catch {
        // ya detenido
      }
    }
  }
  scheduledNodes = [];
}

export function setMusicTrack(track: MusicTrackKey): void {
  if (activeTrack === track) return;
  const wasPlaying = musicEnabled;
  if (wasPlaying) stopMusic();
  activeTrack = track;
  if (wasPlaying) startMusic(track);
}

export function getMusicTrack(): MusicTrackKey {
  return activeTrack;
}

export function isMusicPlaying(): boolean {
  return musicEnabled;
}
