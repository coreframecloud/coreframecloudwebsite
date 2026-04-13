"use client";

type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(
  eventName: string,
  params: EventParams = {}
): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("event", eventName, params);
}

export function trackClarityEvent(tag: string): void {
  if (typeof window === "undefined") return;
  if (typeof window.clarity !== "function") return;

  window.clarity("event", tag);
}
