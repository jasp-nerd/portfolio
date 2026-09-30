// Tiny synthesized UI sounds (no audio files). Off by default, opt-in via a visible toggle,
// only after a user gesture, hover sounds only for fine pointers, throttled.
type Kind = "tick" | "pop" | "open" | "close" | "type";

const KEY = "jn-sound";
let ctx: AudioContext | null = null;
let last = 0;

export const sound = {
  get enabled(): boolean {
    try {
      return localStorage.getItem(KEY) === "on";
    } catch {
      return false;
    }
  },
  set enabled(on: boolean) {
    try {
      localStorage.setItem(KEY, on ? "on" : "off");
    } catch {}
    document.documentElement.dataset.sound = on ? "on" : "off";
  },
  play(kind: Kind = "tick") {
    if (!this.enabled || !navigator.userActivation?.hasBeenActive) return;
    const t = performance.now();
    if (t - last < 60) return;
    last = t;
    ctx ??= new AudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const spec: Record<Kind, [OscillatorType, number, number, number]> = {
      tick: ["square", 1800, 1200, 0.025],
      pop: ["sine", 520, 880, 0.08],
      open: ["triangle", 440, 660, 0.12],
      close: ["triangle", 660, 330, 0.1],
      type: ["square", 2400 + Math.random() * 600, 2000, 0.015],
    };
    const [type, f0, f1, dur] = spec[kind];
    osc.type = type;
    osc.frequency.setValueAtTime(f0, now);
    osc.frequency.exponentialRampToValueAtTime(f1, now + dur);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  },
};
