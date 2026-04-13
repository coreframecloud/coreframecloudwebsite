export {};

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (
      command: "config" | "event" | "js",
      targetIdOrEventName: string | Date,
      params?: Record<string, string | number | boolean | undefined>
    ) => void;
    clarity?: (...args: unknown[]) => void;
  }
}
