export type SfxName = "correct" | "wrong" | "applause";

const SRC: Record<SfxName, string> = {
  correct: "/assets/sfx/correct.wav",
  wrong: "/assets/sfx/wrong.wav",
  applause: "/assets/sfx/cheer.ogg",
};

let ctx: AudioContext | null = null;
const buffers = new Map<SfxName, AudioBuffer>();
let loadPromise: Promise<void> | null = null;
let applauseNode: AudioBufferSourceNode | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
  }
  return ctx;
}

async function loadAll(): Promise<void> {
  const audio = getCtx();
  if (!audio) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    await Promise.all(
      (Object.entries(SRC) as [SfxName, string][]).map(async ([name, url]) => {
        const res = await fetch(url);
        const raw = await res.arrayBuffer();
        const buffer = await audio.decodeAudioData(raw.slice(0));
        buffers.set(name, buffer);
      }),
    );
  })().catch(() => {
    loadPromise = null;
  });

  return loadPromise;
}

export function unlockSfx(): void {
  const audio = getCtx();
  if (!audio) return;
  if (audio.state === "suspended") void audio.resume();
  void loadAll();
}

export function playSfx(
  name: SfxName,
  opts?: { volume?: number; rate?: number },
): void {
  const audio = getCtx();
  if (!audio) return;
  if (audio.state === "suspended") void audio.resume();

  const play = () => {
    const buffer = buffers.get(name);
    if (!buffer) return;
    const source = audio.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = opts?.rate ?? 1;
    const gain = audio.createGain();
    gain.gain.value = opts?.volume ?? 1;
    source.connect(gain).connect(audio.destination);
    if (name === "applause") {
      applauseNode?.stop();
      applauseNode = source;
      source.onended = () => {
        if (applauseNode === source) applauseNode = null;
      };
    }
    source.start();
  };

  if (buffers.has(name)) {
    play();
    return;
  }
  void loadAll().then(play);
}

export function playCorrectTap(): void {
  playSfx("correct", {
    volume: 0.9,
    rate: 0.96 + Math.random() * 0.1,
  });
}

export function playWrongTap(): void {
  playSfx("wrong", {
    volume: 0.86,
    rate: 0.94 + Math.random() * 0.08,
  });
}

export function playApplause(): void {
  playSfx("applause", { volume: 0.82, rate: 1 });
}

export function stopApplause(): void {
  try {
    applauseNode?.stop();
  } catch {
    /* already stopped */
  }
  applauseNode = null;
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
