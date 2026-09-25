"use client";

import { useGame } from "./store";

/** Every sound is synthesized in the browser; there are no audio files. */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let ambient: { stop: () => void } | null = null;

function ac() {
  if (!useGame.getState().sound) return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, opts: { type?: OscillatorType; gain?: number; at?: number; slide?: number } = {}) {
  const c = ac();
  if (!c || !master) return;
  const t0 = c.currentTime + (opts.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(freq, t0);
  if (opts.slide) osc.frequency.exponentialRampToValueAtTime(freq * opts.slide, t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(opts.gain ?? 0.15, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  /** One soft syllable per letter, pitched randomly within the speaker's range. */
  babble(char: string, range: [number, number]) {
    if (!/[a-z0-9]/i.test(char)) return;
    const f = range[0] + Math.random() * (range[1] - range[0]);
    tone(f, 0.07, { type: "triangle", gain: 0.07, slide: 0.92 });
  },
  click() {
    tone(660, 0.06, { type: "sine", gain: 0.06 });
  },
  open() {
    tone(520, 0.12, { type: "sine", gain: 0.08 });
    tone(780, 0.14, { type: "sine", gain: 0.07, at: 0.06 });
  },
  close() {
    tone(620, 0.1, { type: "sine", gain: 0.06, slide: 0.7 });
  },
  pickup() {
    [784, 988, 1319].forEach((f, k) => tone(f, 0.16, { type: "triangle", gain: 0.08, at: k * 0.07 }));
  },
  water() {
    [1200, 1500, 1800, 2200].forEach((f, k) => tone(f, 0.12, { type: "sine", gain: 0.04, at: k * 0.05 }));
  },
  shake() {
    for (let k = 0; k < 5; k++) tone(180 + Math.random() * 60, 0.05, { type: "triangle", gain: 0.05, at: k * 0.05 });
  },
  hop() {
    tone(420, 0.12, { type: "sine", gain: 0.06, slide: 1.6 });
  },
  door() {
    tone(170, 0.32, { type: "triangle", gain: 0.07, slide: 0.72 });
    tone(240, 0.24, { type: "sine", gain: 0.05, at: 0.05, slide: 1.18 });
    tone(92, 0.4, { type: "sine", gain: 0.045 });
  },
  jingle() {
    const notes = [523, 659, 784, 1047, 988, 1047];
    notes.forEach((f, k) => tone(f, 0.22, { type: "triangle", gain: 0.09, at: k * 0.11 }));
    tone(262, 0.8, { type: "sine", gain: 0.05, at: 0 });
  },
};

/** A quiet breeze plus the odd bird chirp. Starts when sound is turned on. */
export function setAmbient(on: boolean) {
  if (!on) {
    ambient?.stop();
    ambient = null;
    return;
  }
  const c = ac();
  if (!c || !master || ambient) return;
  const buffer = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let k = 0; k < data.length; k++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    data[k] = last * 3.5;
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 520;
  const g = c.createGain();
  g.gain.value = 0.05;
  src.connect(filter).connect(g).connect(master);
  src.start();
  const chirp = window.setInterval(() => {
    if (Math.random() < 0.5) return;
    const base = 1800 + Math.random() * 900;
    tone(base, 0.08, { type: "sine", gain: 0.025, slide: 1.3 });
    tone(base * 1.1, 0.08, { type: "sine", gain: 0.02, at: 0.12, slide: 1.25 });
  }, 3800);
  ambient = {
    stop: () => {
      src.stop();
      window.clearInterval(chirp);
    },
  };
}
