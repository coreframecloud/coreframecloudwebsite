/**
 * Per-application facts shared by every software landing page (SEO plan,
 * 22 Oct 2026: "<App> on a cloud GPU: what it costs per hour and how it runs").
 *
 * Two things live here, keyed by the page slug:
 *
 *   1. The application's identity (name, vendor URL, whether we preinstall
 *      it). The Service JSON-LD on each page names the application through
 *      `about`, so a search engine can tie "D5 Render" the product to the page
 *      that rents a machine for it; the footer and homepage directory use the
 *      short name as link text.
 *
 *   2. MEASURED FACTS: the figures a buyer wants ("how long does a 4K still
 *      take here?") and that we may only publish once someone has measured
 *      them on our own hardware. Every value starts as null and renders as
 *      "measured on request". NEVER type a number here from a vendor page, a
 *      forum or a guess: the owner fills these from gpu-node-01 benchmarks
 *      (CLAUDE.md / memory: never invent numbers; render times come from our
 *      own measured tests). When a value is filled, also fill `measuredOn`
 *      (the GPU) and `measuredAt` (ISO date), or the row stays "on request".
 *
 * Why null rather than leaving the rows out: the page then says, visibly and
 * truthfully, which figures we have not measured yet, which is a better
 * answer than silence and far better than a borrowed number.
 */

export type MeasuredFact = {
  /** What was measured, in the buyer's words. */
  label: string;
  /** The measured result, or null = not measured yet ("measured on request"). */
  value: string | null;
  /** The GPU it was measured on (from the ladder), required when `value` is set. */
  measuredOn?: string;
  /** ISO date of the measurement, required when `value` is set. */
  measuredAt?: string;
  /** One line of method: scene, resolution, settings. Shown under the value. */
  method?: string;
};

export type SoftwareFacts = {
  /** The application as people type it: "D5 Render", "3ds Max". */
  app: string;
  /** Link text in the footer and homepage directory. */
  short: string;
  vendorUrl?: string;
  /** True when it is on the image already (lib/software-catalogue.ts PREINSTALLED). */
  preinstalled: boolean;
  /** The page's path. */
  href: string;
  measured: MeasuredFact[];
};

/** The rows every rendering application gets; a page may add its own. */
const RENDER_ROWS = (app: string): MeasuredFact[] => [
  // TODO(owner): measure on gpu-node-01 and fill value + measuredOn + measuredAt.
  { label: `Time to open a mid-size ${app} project from the project drive`, value: null },
  { label: `${app} 4K still, default quality, on our reference scene`, value: null },
  { label: "Peak VRAM used by that reference scene", value: null },
  { label: "Workstation ready after Launch (sign-in to desktop)", value: null },
];

const VIDEO_ROWS: MeasuredFact[] = [
  // TODO(owner): measure on gpu-node-01 and fill value + measuredOn + measuredAt.
  { label: "After Effects: 10-second 1080p comp render, our reference project", value: null },
  { label: "Premiere Pro: 1-minute 4K H.264 export, our reference timeline", value: null },
  { label: "Workstation ready after Launch (sign-in to desktop)", value: null },
];

/**
 * Keyed by slug. The three older top-level pages (D5, Lumion, Enscape) and
 * the /software pages share this map so the same row set and wording apply.
 */
export const SOFTWARE_FACTS: Record<string, SoftwareFacts> = {
  "d5-render-cloud-workstation": {
    app: "D5 Render",
    short: "D5 Render",
    vendorUrl: "https://www.d5render.com/",
    preinstalled: true,
    href: "/d5-render-cloud-workstation",
    measured: RENDER_ROWS("D5 Render"),
  },
  "lumion-cloud-gpu": {
    app: "Lumion",
    short: "Lumion",
    vendorUrl: "https://lumion.com/",
    preinstalled: false,
    href: "/lumion-cloud-gpu",
    measured: RENDER_ROWS("Lumion"),
  },
  "enscape-cloud-gpu": {
    app: "Enscape",
    short: "Enscape",
    vendorUrl: "https://enscape3d.com/",
    preinstalled: false,
    href: "/enscape-cloud-gpu",
    measured: RENDER_ROWS("Enscape"),
  },
  "twinmotion-cloud-workstation": {
    app: "Twinmotion",
    short: "Twinmotion",
    vendorUrl: "https://www.twinmotion.com/",
    preinstalled: true,
    href: "/software/twinmotion-cloud-workstation",
    measured: RENDER_ROWS("Twinmotion"),
  },
  "revit-cloud-workstation": {
    app: "Autodesk Revit",
    short: "Revit",
    vendorUrl: "https://www.autodesk.com/products/revit/overview",
    preinstalled: false,
    href: "/software/revit-cloud-workstation",
    measured: [
      // TODO(owner): measure on gpu-node-01 and fill value + measuredOn + measuredAt.
      { label: "Time to open a mid-size federated Revit model from the project drive", value: null },
      { label: "Enscape or Twinmotion live link from that model: time to first frame", value: null },
      { label: "Workstation ready after Launch (sign-in to desktop)", value: null },
    ],
  },
  "3ds-max-cloud-workstation": {
    app: "Autodesk 3ds Max",
    short: "3ds Max",
    vendorUrl: "https://www.autodesk.com/products/3ds-max/overview",
    preinstalled: false,
    href: "/software/3ds-max-cloud-workstation",
    measured: [
      // TODO(owner): measure on gpu-node-01 and fill value + measuredOn + measuredAt.
      { label: "V-Ray GPU 4K still, our reference interior scene", value: null },
      { label: "Chaos Vantage: time to first clean frame on that scene", value: null },
      { label: "Peak VRAM used by that reference scene", value: null },
      { label: "Workstation ready after Launch (sign-in to desktop)", value: null },
    ],
  },
  "sketchup-cloud-workstation": {
    app: "SketchUp",
    short: "SketchUp",
    vendorUrl: "https://www.sketchup.com/",
    preinstalled: false,
    href: "/software/sketchup-cloud-workstation",
    measured: RENDER_ROWS("SketchUp + Enscape"),
  },
  "blender-cloud-workstation": {
    app: "Blender",
    short: "Blender",
    vendorUrl: "https://www.blender.org/",
    preinstalled: true,
    href: "/software/blender-cloud-workstation",
    measured: [
      // TODO(owner): measure on gpu-node-01 and fill value + measuredOn + measuredAt.
      // The RenderGrid timings in ~/coreframe/rendergrid-tests-20261007 are
      // RenderGrid (Cycles on node-01), not a Connect session: do not reuse them here.
      { label: "Blender Cycles 4K still, our reference interior scene, OptiX", value: null },
      { label: "Blender Open Data median for this GPU (public benchmark, Cycles)", value: null },
      { label: "Peak VRAM used by that reference scene", value: null },
      { label: "Workstation ready after Launch (sign-in to desktop)", value: null },
    ],
  },
  "vray-cloud-rendering": {
    app: "Chaos V-Ray",
    short: "V-Ray",
    vendorUrl: "https://www.chaos.com/vray",
    preinstalled: false,
    href: "/software/vray-cloud-rendering",
    measured: [
      // TODO(owner): measure on gpu-node-01 and fill value + measuredOn + measuredAt.
      { label: "V-Ray GPU 4K still, our reference interior scene", value: null },
      { label: "Peak VRAM used by that reference scene", value: null },
      { label: "Workstation ready after Launch (sign-in to desktop)", value: null },
    ],
  },
  "rhino-cloud-workstation": {
    app: "Rhino",
    short: "Rhino + Grasshopper",
    vendorUrl: "https://www.rhino3d.com/",
    preinstalled: false,
    href: "/software/rhino-cloud-workstation",
    measured: [
      // TODO(owner): measure on gpu-node-01 and fill value + measuredOn + measuredAt.
      { label: "Time to open a mid-size Rhino model with a Grasshopper definition", value: null },
      { label: "Enscape or Twinmotion live link from Rhino: time to first frame", value: null },
      { label: "Workstation ready after Launch (sign-in to desktop)", value: null },
    ],
  },
  "after-effects-premiere-cloud-workstation": {
    app: "After Effects and Premiere Pro",
    short: "After Effects / Premiere",
    vendorUrl: "https://www.adobe.com/products/aftereffects.html",
    preinstalled: false,
    href: "/software/after-effects-premiere-cloud-workstation",
    measured: VIDEO_ROWS,
  },
  "unreal-engine-cloud-workstation": {
    app: "Unreal Engine",
    short: "Unreal Engine",
    vendorUrl: "https://www.unrealengine.com/",
    preinstalled: true,
    href: "/software/unreal-engine-cloud-workstation",
    measured: [
      // TODO(owner): measure on gpu-node-01 and fill value + measuredOn + measuredAt.
      { label: "Time to open and compile shaders for our reference archviz level", value: null },
      { label: "Movie Render Queue: 10-second 4K sequence from that level", value: null },
      { label: "Peak VRAM used by that level", value: null },
      { label: "Workstation ready after Launch (sign-in to desktop)", value: null },
    ],
  },
};

/** The application pages in footer/directory order: preinstalled first, then by name. */
export const SOFTWARE_DIRECTORY: SoftwareFacts[] = Object.values(SOFTWARE_FACTS).sort(
  (a, b) => Number(b.preinstalled) - Number(a.preinstalled) || a.short.localeCompare(b.short),
);

export function softwareFacts(slug: string): SoftwareFacts | undefined {
  return SOFTWARE_FACTS[slug];
}

/** True when at least one row carries a measured value. */
export function hasMeasured(facts: SoftwareFacts | undefined): boolean {
  return !!facts?.measured.some((m) => m.value && m.measuredOn && m.measuredAt);
}
