/**
 * Interface sounds (owner, 19 Nov 2026): "subtle, not disturbing".
 *
 * Synthesised with Web Audio, so there are no files to download and nothing
 * for the CSP to allow. The same engine ships in Connect
 * (apps/desktop-client/src/lib/ui-sound.js); keep the two in step.
 *
 * Rules that keep it quiet:
 *  - Peak gain 0.02-0.05 (a tap is ~-30 dBFS): felt more than heard.
 *  - Only in answer to the visitor's own action. No sound on page load, hover,
 *    scroll or a background poll. Browsers also refuse audio before the first
 *    gesture; we never try to get around that.
 *  - Under 260 ms each, soft attack, no sharp click. Taps are throttled.
 *  - Warm notes (sine/triangle, low-passed) in the brand's gong register for
 *    success; never a bell or an alarm (sonic-logo rule).
 *  - One switch turns everything off and is remembered on this device.
 */

export type UiSound = "tap" | "toggleOn" | "toggleOff" | "open" | "close" | "success" | "error" | "ready" | "end";

const PREF_KEY = "cf_ui_sound";
const MASTER = 0.9;
const TAP_GAP_MS = 45;

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let lastTap = 0;

export function soundEnabled(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(on: boolean): void {
  try {
    localStorage.setItem(PREF_KEY, on ? "on" : "off");
  } catch {
    /* per-device preference only */
  }
  if (on) playSound("toggleOn", { force: true });
}

function audio(): { ctx: AudioContext; out: GainNode } | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    try {
      ctx = new AC({ latencyHint: "interactive" });
    } catch {
      return null;
    }
    out = ctx.createGain();
    out.gain.value = MASTER;
    // A gentle low-pass on the whole bus: nothing above ~6 kHz, so no sound is sharp.
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 6000;
    out.connect(lp);
    lp.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return { ctx, out: out! };
}

/** Wake the audio engine on a real gesture (browsers need one). Safe to call often. */
export function unlockSound(): void {
  if (soundEnabled()) audio();
}

function tone(
  a: { ctx: AudioContext; out: GainNode },
  { freq, to, start = 0, dur, peak, type = "sine", attack = 0.004 }:
  { freq: number; to?: number; start?: number; dur: number; peak: number; type?: OscillatorType; attack?: number },
): void {
  const t0 = a.ctx.currentTime + 0.005 + start;
  const osc = a.ctx.createOscillator();
  const g = a.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(a.out);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export function playSound(kind: UiSound, opts: { force?: boolean } = {}): void {
  if (!opts.force && !soundEnabled()) return;
  if (kind === "tap") {
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    if (now - lastTap < TAP_GAP_MS) return;
    lastTap = now;
  }
  const a = audio();
  if (!a || a.ctx.state !== "running") return;
  switch (kind) {
    case "tap": // a soft, short "tik" - a key under a fingertip
      tone(a, { freq: 1500, to: 900, dur: 0.035, peak: 0.022, attack: 0.002 });
      break;
    case "toggleOn":
      tone(a, { freq: 900, dur: 0.04, peak: 0.02, attack: 0.002 });
      tone(a, { freq: 1350, start: 0.045, dur: 0.05, peak: 0.02, attack: 0.002 });
      break;
    case "toggleOff":
      tone(a, { freq: 1350, dur: 0.04, peak: 0.018, attack: 0.002 });
      tone(a, { freq: 900, start: 0.045, dur: 0.05, peak: 0.018, attack: 0.002 });
      break;
    case "open": // a soft upward breath
      tone(a, { freq: 520, to: 780, dur: 0.09, peak: 0.018, type: "triangle", attack: 0.012 });
      break;
    case "close":
      tone(a, { freq: 700, to: 480, dur: 0.08, peak: 0.015, type: "triangle", attack: 0.01 });
      break;
    case "success": // two warm notes, a fifth apart (G5 -> D6)
      tone(a, { freq: 784, dur: 0.16, peak: 0.035, attack: 0.008 });
      tone(a, { freq: 1175, start: 0.09, dur: 0.22, peak: 0.03, attack: 0.008 });
      break;
    case "ready": // the workstation is ready: success, a touch fuller, with a low root
      tone(a, { freq: 392, dur: 0.26, peak: 0.02, type: "triangle", attack: 0.01 });
      tone(a, { freq: 784, dur: 0.18, peak: 0.035, attack: 0.008 });
      tone(a, { freq: 1175, start: 0.1, dur: 0.24, peak: 0.032, attack: 0.008 });
      break;
    case "end": // a session ended: one soft falling note
      tone(a, { freq: 660, to: 494, dur: 0.22, peak: 0.025, attack: 0.01 });
      break;
    case "error": // low and soft - "look here", not "alarm"
      tone(a, { freq: 300, dur: 0.11, peak: 0.03, type: "triangle", attack: 0.006 });
      tone(a, { freq: 240, start: 0.11, dur: 0.14, peak: 0.028, type: "triangle", attack: 0.006 });
      break;
  }
}
