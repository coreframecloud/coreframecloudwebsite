/**
 * Per-software "what fits" (owner, 11 Nov 2026: software landing pages).
 *
 * For every software landing page: which applications are already on the
 * machine and which you bring a licence for, and the GPU we recommend for that
 * software with a one-line reason.
 *
 * FACTS ONLY FROM WHAT THE OWNER HAS CONFIRMED.
 *   - Preinstalled on the cloud image (golden v5, owner 4 Nov 2026): D5 Render,
 *     Twinmotion, Unreal Engine 5.8 and Blender. Nothing else is claimed as
 *     preinstalled on these pages. Lumion is NOT installed (customer's licence).
 *   - Everything else is bring your own licence: the session user can install
 *     software, and the machine resets after the session unless the customer
 *     has a persistent workstation (wording as on /virtual-workstation-vs-gpu-server).
 *
 * THE RECOMMENDATION NEVER NAMES A PRICE OR A FIXED CARD. It names a minimum
 * VRAM (and optionally a preferred public slug); lib/software-start.ts picks
 * the cheapest live card on the public ladder that meets it, so a card that is
 * withdrawn or repriced never leaves a stale recommendation. The reason is
 * about memory and where the work runs, never an unmeasured speed claim.
 */

/** What is on every cloud workstation the moment the desktop appears. */
export const ON_EVERY_WORKSTATION = ["D5 Render", "Twinmotion", "Unreal Engine", "Blender"] as const;

/** Approved wording for software you install yourself (see the file comment). */
export const BYOL_RESET_NOTE =
  "Each session starts from a clean machine, so software you install is removed when it ends, unless you choose a persistent workstation (available on selected GPUs), which keeps your own Windows disk between sessions.";

export type SoftwareFit = {
  /** The application(s) the page is about, as a buyer types them. */
  app: string;
  /** On the image, ready to open (subset of ON_EVERY_WORKSTATION). */
  preinstalled: string[];
  /** Installed by the customer and signed in with their own licence. */
  byol: string[];
  /** Short licence line under the two lists. */
  licenceNote: string;
  gpu: {
    /** The least VRAM we would recommend for this software. */
    minVram: number;
    /** A public card slug to prefer when it is live and meets minVram. */
    prefer?: string;
    /** One line: why that card. Memory and workload, no speed claims. */
    why: string;
  };
};

const fit = (f: SoftwareFit) => f;

export const SOFTWARE_FIT: Record<string, SoftwareFit> = {
  "revit-cloud-workstation": fit({
    app: "Revit",
    preinstalled: ["Twinmotion", "D5 Render", "Unreal Engine"],
    byol: ["Autodesk Revit", "Enscape"],
    licenceNote: "Install Revit from your own Autodesk account; Coreframe never supplies the Autodesk licence.",
    gpu: { minVram: 16, why: "Revit leans on the CPU and RAM; a 16 GB card drives the views and a live link to Twinmotion, D5 or Enscape." },
  }),
  "3ds-max-cloud-workstation": fit({
    app: "3ds Max",
    preinstalled: ["D5 Render", "Twinmotion"],
    byol: ["Autodesk 3ds Max", "V-Ray", "Corona", "Chaos Vantage"],
    licenceNote: "3ds Max installs from your Autodesk account and your renderer from your Chaos account.",
    gpu: { minVram: 24, why: "V-Ray GPU and Vantage have to fit the whole scene in VRAM; 24 GB leaves room for heavy textures." },
  }),
  "sketchup-cloud-workstation": fit({
    app: "SketchUp",
    preinstalled: ["D5 Render", "Twinmotion"],
    byol: ["SketchUp Pro", "Enscape", "V-Ray"],
    licenceNote: "SketchUp Pro signs in with your Trimble account; the D5 plugin connects to the D5 Render already installed.",
    gpu: { minVram: 16, why: "SketchUp itself is light; the 16 GB card is for the renderer you attach, D5, Enscape or V-Ray." },
  }),
  "blender-cloud-workstation": fit({
    app: "Blender",
    preinstalled: ["Blender"],
    byol: [],
    licenceNote: "Blender is free and open source: nothing to license, nothing to install.",
    gpu: { minVram: 16, prefer: "rtx-5080", why: "The card the Cycles timings on this page were measured on; 16 GB held both test scenes at 4K." },
  }),
  "twinmotion-cloud-workstation": fit({
    app: "Twinmotion",
    preinstalled: ["Twinmotion", "Unreal Engine", "D5 Render"],
    byol: ["A paid Twinmotion seat, if you have one"],
    licenceNote: "Twinmotion's free tier covers most individual users; sign in with your Epic account for a paid seat.",
    gpu: { minVram: 16, why: "Twinmotion keeps the scene in VRAM; 16 GB suits most projects, pick 24 GB for dense vegetation." },
  }),
  "vray-cloud-rendering": fit({
    app: "V-Ray",
    preinstalled: ["D5 Render", "Twinmotion"],
    byol: ["Chaos V-Ray", "Your host: 3ds Max, SketchUp, Rhino or Revit"],
    licenceNote: "V-Ray signs in with your Chaos account or your own licence server.",
    gpu: { minVram: 24, why: "V-Ray GPU fails or drops texture resolution when a scene outgrows VRAM; 24 GB gives production headroom." },
  }),
  "rhino-cloud-workstation": fit({
    app: "Rhino",
    preinstalled: ["D5 Render", "Twinmotion"],
    byol: ["Rhino 8 (Grasshopper included)", "V-Ray or Enscape"],
    licenceNote: "Rhino uses your own licence key; Grasshopper comes with Rhino 8.",
    gpu: { minVram: 16, why: "Rhino and Grasshopper solve on the CPU; 16 GB covers the viewport and an attached GPU renderer." },
  }),
  "after-effects-premiere-cloud-workstation": fit({
    app: "After Effects and Premiere Pro",
    preinstalled: ["Blender"],
    byol: ["Adobe After Effects", "Adobe Premiere Pro", "Media Encoder"],
    licenceNote: "Sign in to Creative Cloud with your own Adobe account; Coreframe never supplies the Adobe licence.",
    gpu: { minVram: 16, why: "GPU effects and encoding fit in 16 GB; RAM preview uses the workstation's system RAM, listed with each card." },
  }),
  "unreal-engine-cloud-workstation": fit({
    app: "Unreal Engine",
    preinstalled: ["Unreal Engine", "Twinmotion", "D5 Render", "Blender"],
    byol: [],
    licenceNote: "Sign in with your own Epic account; Epic's licence terms apply to your project as on your own PC.",
    gpu: { minVram: 24, why: "Nanite, Lumen and high-resolution textures fill VRAM quickly; 24 GB gives a big level room." },
  }),
  "d5-render-cloud-workstation": fit({
    app: "D5 Render",
    preinstalled: ["D5 Render", "Twinmotion", "Unreal Engine", "Blender"],
    byol: ["A paid D5 plan, if you have one"],
    licenceNote: "D5 is installed; you sign in with your own D5 account and your D5 plan applies.",
    gpu: { minVram: 16, why: "D5 keeps the scene in VRAM; 16 GB holds a typical interior, pick 24 GB for large exteriors with dense planting." },
  }),
  "lumion-cloud-gpu": fit({
    app: "Lumion",
    preinstalled: ["D5 Render", "Twinmotion"],
    byol: ["Lumion"],
    licenceNote: "Lumion is not preinstalled: install it and activate your own named-user or floating seat.",
    gpu: { minVram: 16, why: "Lumion needs a WDDM display card with enough VRAM for vegetation and textures; 16 GB is the floor we offer." },
  }),
  "enscape-cloud-gpu": fit({
    app: "Enscape",
    preinstalled: ["D5 Render", "Twinmotion"],
    byol: ["Enscape", "Its host: Revit, SketchUp, Rhino or Archicad"],
    licenceNote: "Enscape is a plugin: install its host application first, then Enscape, with your own licences.",
    gpu: { minVram: 16, why: "Enscape ray-traces on the RT cores and keeps the model in VRAM; 16 GB suits most building models." },
  }),
  // New pages, 11 Nov 2026 (all bring your own licence).
  "cinema-4d-cloud-workstation": fit({
    app: "Cinema 4D",
    preinstalled: ["Blender", "Twinmotion"],
    byol: ["Maxon Cinema 4D", "Redshift", "Octane"],
    licenceNote: "Cinema 4D and Redshift sign in with your Maxon account; Octane with your OTOY account.",
    gpu: { minVram: 24, why: "Redshift and Octane render on the GPU and slow down or fail when the scene outgrows VRAM; 24 GB gives headroom." },
  }),
  "houdini-cloud-workstation": fit({
    app: "Houdini",
    preinstalled: ["Blender"],
    byol: ["SideFX Houdini", "Karma (included with Houdini)", "Redshift, if you use it"],
    licenceNote: "Houdini signs in with your SideFX licence; Karma ships with Houdini.",
    gpu: { minVram: 24, why: "Karma XPU and GPU renderers keep the scene in VRAM; most simulation runs on the CPU and system RAM, listed with each card." },
  }),
  "autocad-cloud-workstation": fit({
    app: "AutoCAD",
    preinstalled: ["D5 Render", "Twinmotion"],
    byol: ["Autodesk AutoCAD"],
    licenceNote: "Install AutoCAD from your own Autodesk account; Coreframe never supplies the Autodesk licence.",
    gpu: { minVram: 16, why: "AutoCAD runs mostly on the CPU; the entry card is all a 2D or 3D drawing needs." },
  }),
  "archicad-cloud-workstation": fit({
    app: "Archicad",
    preinstalled: ["Twinmotion", "D5 Render"],
    byol: ["Graphisoft Archicad", "Enscape, if you use it"],
    licenceNote: "Archicad needs your own Graphisoft licence; Twinmotion and D5 are on the machine for rendering.",
    gpu: { minVram: 16, why: "Archicad's model work is CPU-led; 16 GB drives the 3D window and a Twinmotion or D5 link." },
  }),
  "chaos-vantage-cloud-workstation": fit({
    app: "Chaos Vantage",
    preinstalled: ["D5 Render", "Twinmotion"],
    byol: ["Chaos Vantage", "Your host: 3ds Max, SketchUp, Rhino or Revit"],
    licenceNote: "Vantage signs in with your Chaos account or your own licence server.",
    gpu: { minVram: 24, why: "Vantage ray-traces the whole scene from VRAM; 24 GB fits large archviz scenes; pick more VRAM for the biggest." },
  }),
  "keyshot-cloud-workstation": fit({
    app: "KeyShot",
    preinstalled: ["Blender"],
    byol: ["KeyShot"],
    licenceNote: "KeyShot activates with your own KeyShot licence.",
    gpu: { minVram: 16, why: "KeyShot's GPU mode keeps the scene in VRAM; product models fit in 16 GB, big assemblies want 24 GB." },
  }),
};

export function softwareFit(slug: string): SoftwareFit | undefined {
  return SOFTWARE_FIT[slug];
}
