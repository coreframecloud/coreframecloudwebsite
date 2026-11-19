"use client";

/**
 * Site-wide interface sounds (owner, 19 Nov 2026) - see lib/ui-sound.ts for
 * the rules. One listener for the whole site, so no page has to opt in:
 *  - buttons, tabs, menu items, accordions and checkboxes answer a click;
 *  - an error message ([role=alert]) that appears within 4 s of the
 *    visitor's own action gets the soft error note, never one shown on load;
 *  - anything rendered with data-sound="success" plays the success note once.
 * data-sound="off" on an element (or an ancestor) silences it.
 */
import { useEffect, useSyncExternalStore } from "react";
import { playSound, setSoundEnabled, soundEnabled, unlockSound } from "@/lib/ui-sound";

const TAPPABLE =
  'button, [data-slot="button"], [role="button"], [role="tab"], [role="menuitem"], [role="option"], summary';
const RECENT_ACTION_MS = 4000;

export function UiSounds() {
  useEffect(() => {
    let lastAction = 0;

    const onPointer = () => unlockSound();
    const onClick = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target : null;
      if (!el || el.closest('[data-sound="off"]')) return;
      lastAction = Date.now();

      const input = el.closest("input");
      if (input && (input.type === "checkbox" || input.type === "radio")) {
        playSound(input.type === "radio" || input.checked ? "toggleOn" : "toggleOff");
        return;
      }
      const sw = el.closest('[role="switch"]');
      if (sw) {
        // aria-checked flips after this click, so read it on the next frame
        requestAnimationFrame(() => playSound(sw.getAttribute("aria-checked") === "true" ? "toggleOn" : "toggleOff"));
        return;
      }
      const summary = el.closest("summary");
      if (summary) {
        const details = summary.parentElement as HTMLDetailsElement | null;
        playSound(details?.open ? "close" : "open");
        return;
      }
      const target = el.closest(TAPPABLE) as HTMLButtonElement | null;
      if (!target || target.disabled || target.getAttribute("aria-disabled") === "true") return;
      playSound("tap");
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") lastAction = Date.now();
    };

    const seen = new WeakSet<Element>();
    const check = (node: Node) => {
      if (!(node instanceof Element)) return;
      const hits = [
        ...(node.matches('[role="alert"], [data-sound="success"]') ? [node] : []),
        ...node.querySelectorAll('[role="alert"], [data-sound="success"]'),
      ];
      for (const h of hits) {
        if (seen.has(h) || h.closest('[data-sound="off"]')) continue;
        seen.add(h);
        if (Date.now() - lastAction > RECENT_ACTION_MS) continue; // not an answer to the visitor
        if (!(h.textContent || "").trim()) continue;
        playSound(h.getAttribute("data-sound") === "success" ? "success" : "error");
        return; // one note per change, however many messages appeared
      }
    };
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "childList") r.addedNodes.forEach(check);
        else if (r.type === "characterData" && r.target.parentElement) {
          const alert = r.target.parentElement.closest('[role="alert"]');
          if (alert) { seen.delete(alert); check(alert); }
        }
      }
    });
    // Messages already on the page at load are marked as seen, so they never sound.
    document.querySelectorAll('[role="alert"], [data-sound="success"]').forEach((el) => seen.add(el));
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });

    document.addEventListener("pointerdown", onPointer, { capture: true, passive: true });
    document.addEventListener("click", onClick, { capture: true, passive: true });
    document.addEventListener("keydown", onKey, { capture: true, passive: true });
    return () => {
      mo.disconnect();
      document.removeEventListener("pointerdown", onPointer, { capture: true });
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("keydown", onKey, { capture: true });
    };
  }, []);
  return null;
}

const PREF_EVENT = "cf-ui-sound-pref";
function subscribePref(cb: () => void) {
  window.addEventListener(PREF_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(PREF_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** The footer switch: one place to turn every interface sound off, per device. */
export function SoundToggle({ className = "" }: { className?: string }) {
  const on = useSyncExternalStore(subscribePref, soundEnabled, () => null);
  if (on === null) return <span className={className} aria-hidden="true" />;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      data-sound="off"
      onClick={() => {
        setSoundEnabled(!on);
        window.dispatchEvent(new Event(PREF_EVENT));
      }}
      className={`inline-flex items-center gap-1.5 text-[12.5px] leading-5 text-ink-2 hover:text-white ${className}`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H2v6h4l5 4V5z" />
        {on ? <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /> : <path d="m22 9-6 6M16 9l6 6" />}
      </svg>
      {on ? "Sounds on" : "Sounds off"}
    </button>
  );
}
