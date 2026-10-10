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
    // Meta pixel. Only present when NEXT_PUBLIC_META_PIXEL_ID is set.
    fbq?: (...args: unknown[]) => void;
  }
}
