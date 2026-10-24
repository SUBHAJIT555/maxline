import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const outDir = join(dirname(fileURLToPath(import.meta.url)), "../public/assets/sfx");

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function env(t, attack, decay) {
  if (t < 0) return 0;
  if (t < attack) return t / attack;
  return Math.exp((-3 * (t - attack)) / Math.max(decay, 0.001));
}

function fadeInOut(t, dur, fadeIn, fadeOut) {
  let g = 1;
  if (t < fadeIn) g *= t / fadeIn;
  if (t > dur - fadeOut) g *= Math.max(0, (dur - t) / fadeOut);
  return g;
}

function normalize(channel, peak = 0.9) {
  let max = 0;
  for (const sample of channel) max = Math.max(max, Math.abs(sample));
  if (max < 1e-6) return channel;
  const scale = peak / max;
  for (let i = 0; i < channel.length; i++) channel[i] *= scale;
  return channel;
}

function writeWav(file, left, right = null) {
  const stereo = right !== null;
  const n = left.length;
  const dataSize = n * (stereo ? 4 : 2);
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(stereo ? 2 : 1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * (stereo ? 4 : 2), 28);
  buf.writeUInt16LE(stereo ? 4 : 2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
  let offset = 44;
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(clamp(Math.round(left[i] * 32767), -32768, 32767), offset);
    offset += 2;
    if (stereo) {
      buf.writeInt16LE(clamp(Math.round(right[i] * 32767), -32768, 32767), offset);
      offset += 2;
    }
  }
  writeFileSync(file, buf);
}

function makeCorrect() {
  const dur = 0.24;
  const n = Math.floor(SR * dur);
  const out = new Float32Array(n);
  const notes = [
    { f: 659.25, t0: 0.0, t1: 0.09, a: 0.52 },
    { f: 880.0, t0: 0.045, t1: 0.16, a: 0.6 },
    { f: 1174.66, t0: 0.09, t1: 0.24, a: 0.46 },
  ];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let sample = 0;
    for (const note of notes) {
      if (t < note.t0 || t > note.t1) continue;
      const u = t - note.t0;
      const gain = env(u, 0.007, note.t1 - note.t0) * note.a;
      sample += Math.sin(2 * Math.PI * note.f * u) * gain;
      sample += Math.sin(4 * Math.PI * note.f * u) * gain * 0.16;
    }
    if (t < 0.01) sample += (Math.random() * 2 - 1) * (1 - t / 0.01) * 0.12;
    out[i] = sample;
  }
  return normalize(out, 0.88);
}

function makeWrong() {
  const dur = 0.34;
  const n = Math.floor(SR * dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 210 * Math.pow(0.42, t / dur);
    const gain = env(t, 0.006, 0.3);
    const saw = 2 * ((t * f) % 1) - 1;
    const square = Math.sign(Math.sin(2 * Math.PI * f * 0.55 * t));
    let sample = (saw * 0.42 + square * 0.22) * gain;
    sample += Math.sin(2 * Math.PI * 68 * t) * Math.exp(-t * 13) * 0.38;
    if (t < 0.035) sample += (Math.random() * 2 - 1) * (1 - t / 0.035) * 0.2;
    out[i] = sample;
  }
  return normalize(out, 0.86);
}

function readWavPcm(file) {
  const buf = readFileSync(file);
  let offset = 12;
  let channels = 2;
  let rate = 44100;
  let bits = 16;
  let data = null;
  while (offset + 8 <= buf.length) {
    const id = buf.toString("ascii", offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (id === "fmt ") {
      channels = buf.readUInt16LE(start + 2);
      rate = buf.readUInt32LE(start + 4);
      bits = buf.readUInt16LE(start + 14);
    } else if (id === "data") {
      data = buf.subarray(start, start + size);
      break;
    }
    offset = start + size + (size % 2);
  }
  if (!data) throw new Error("no data chunk in " + file);
  const frames = Math.floor(data.length / (channels * (bits / 8)));
  const left = new Float32Array(frames);
  const right = new Float32Array(frames);
  for (let i = 0; i < frames; i++) {
    if (bits === 16) {
      left[i] = data.readInt16LE(i * channels * 2) / 32768;
      right[i] =
        data.readInt16LE(i * channels * 2 + (channels > 1 ? 2 : 0)) / 32768;
    }
  }
  return { left, right, rate };
}

function makeApplause() {
  const srcPath = join(dirname(fileURLToPath(import.meta.url)), "applause-src.wav");
  const src = readWavPcm(srcPath);
  const dur = 3.6;
  const n = Math.floor(SR * dur);
  const left = new Float32Array(n);
  const right = new Float32Array(n);

  const layers = [
    { at: 0.0, gain: 1, rate: 1 },
    { at: 0.55, gain: 0.82, rate: 1.03 },
    { at: 1.15, gain: 0.7, rate: 0.97 },
    { at: 1.85, gain: 0.48, rate: 1.01 },
  ];

  for (const layer of layers) {
    const start = Math.floor(layer.at * SR);
    const step = layer.rate;
    for (let i = 0; i < src.left.length; i++) {
      const dest = start + Math.floor(i * step);
      if (dest >= n) break;
      left[dest] += src.left[i] * layer.gain;
      right[dest] += src.right[i] * layer.gain;
    }
  }

  let peak = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const fade = fadeInOut(t, dur, 0.04, 0.55);
    left[i] *= fade;
    right[i] *= fade;
    peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
  }
  const scale = peak > 0 ? 0.88 / peak : 1;
  for (let i = 0; i < n; i++) {
    left[i] *= scale;
    right[i] *= scale;
  }
  return { left, right };
}

mkdirSync(outDir, { recursive: true });
writeWav(join(outDir, "correct.wav"), makeCorrect());
writeWav(join(outDir, "wrong.wav"), makeWrong());
const applause = makeApplause();
writeWav(join(outDir, "applause.wav"), applause.left, applause.right);
console.log("wrote", outDir);
