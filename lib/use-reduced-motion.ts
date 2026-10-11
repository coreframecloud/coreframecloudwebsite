"use client";

import { useSyncExternalStore } from "react";

/**
 * prefers-reduced-motion, hydration-safe. The server snapshot is always
 * `false`, so the first client render matches the server HTML exactly and
 * React switches to the real value straight after hydration.
 *
 * Why this exists (11 Oct 2026): components used framer's useReducedMotion
 * and rendered DIFFERENT markup when it was true. On a machine with
 * animations turned off in the OS, that was a hydration mismatch (React
 * #418) and the homepage ticker froze. Use this hook, keep the markup the
 * same in both modes, and change only timing/transitions.
 */
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
