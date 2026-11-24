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
    // The current page's Meta PageView event id (pv.<uuid>): set by the first
    // of components/analytics/web-events.tsx or the pixel snippet in
    // app/layout.tsx, read by the other, so the init PageView and its server
    // copy carry one id.
    __cfPvId?: string;
  }
}
