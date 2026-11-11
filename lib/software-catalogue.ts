/**
 * The software catalogue, in one place.
 *
 * Rendered by /apps, summarised in /llms.txt, and referenced by /how-to-use.
 * Kept as data rather than prose in three templates, because the moment those
 * drift a customer reads on one page that Lumion is preinstalled and discovers
 * on the machine that it is bring-your-own-licence.
 *
 * PREINSTALLED mirrors the cloud golden image (control-plane
 * apps/node-setup/cloudpe-gpu/, golden v5 confirmed by the owner 4 Nov 2026).
 * If software is added to the image, add it here.
 */

export type SoftwareItem = {
  name: string;
  category: string;
  /** What a customer uses it for, in their words rather than the vendor's. */
  note: string;
  vendorUrl?: string;
};

/**
 * Installed on every workstation. Ready the moment the desktop appears.
 *
 * 11 Nov 2026 (owner): only what is verified on the cloud image (golden v5,
 * 4 Nov 2026) is claimed: Blender, Twinmotion, Unreal Engine and D5 Render.
 * The longer list this replaced (Steam, FreeCAD, ParaView, DWG TrueView,
 * Navisworks Freedom, GIMP, Krita, utilities…) came from the old on-prem
 * node baseline and is not on the cloud build; those moved to FREE_TO_INSTALL.
 */
export const PREINSTALLED: SoftwareItem[] = [
  {
    name: "Blender",
    category: "3D & rendering",
    note: "Full modelling, sculpting and rendering suite. Free and open source, so it is ready to use with no licence of your own.",
    vendorUrl: "https://www.blender.org/",
  },
  {
    name: "Twinmotion",
    category: "3D & rendering",
    note: "Installed and ready. Sign in with your own Epic account when you need a commercial licence; the free tier covers most individual users.",
    vendorUrl: "https://www.twinmotion.com/",
  },
  {
    name: "Unreal Engine",
    category: "3D & rendering",
    note: "Unreal Engine 5.8 with Quixel Bridge, installed and ready. Datasmith imports models from Revit and SketchUp.",
    vendorUrl: "https://www.unrealengine.com/",
  },
  {
    name: "D5 Render",
    category: "3D & rendering",
    note: "Installed and ready — sign in with your own D5 account. The free tier covers a lot of individual work.",
    vendorUrl: "https://www.d5render.com/",
  },
];

/**
 * Free software you can install yourself in a session (11 Nov 2026). Not on
 * the image: like any software you install, it is removed when the session
 * ends unless you keep a persistent workstation.
 */
export const FREE_TO_INSTALL: SoftwareItem[] = [
  { name: "FreeCAD", category: "Free tools", note: "Parametric CAD for the STEP, IGES and DXF files consultants send.", vendorUrl: "https://www.freecad.org/" },
  { name: "ParaView", category: "Free tools", note: "Post-processing and visualisation for CFD and simulation results.", vendorUrl: "https://www.paraview.org/" },
  { name: "Autodesk DWG TrueView", category: "Free tools", note: "Open, measure and plot DWG drawings without an AutoCAD seat.", vendorUrl: "https://www.autodesk.com/products/dwg-trueview/overview" },
  { name: "GIMP", category: "Free tools", note: "Texture work and render post-processing.", vendorUrl: "https://www.gimp.org/" },
  { name: "HandBrake", category: "Free tools", note: "Turn a rendered image sequence into a video file before you download it.", vendorUrl: "https://handbrake.fr/" },
  { name: "7-Zip", category: "Free tools", note: "Unpack the .zip, .rar and .7z scene archives clients send.", vendorUrl: "https://www.7-zip.org/" },
];

/**
 * Install these yourself and sign in with your own subscription. We do not
 * supply licences — these products are licensed to a named user, and yours
 * follows you onto the workstation exactly as it would onto a new PC.
 */
export const BRING_YOUR_OWN_LICENCE: SoftwareItem[] = [
  { name: "Lumion", category: "Rendering", note: "Sign in with your Lumion account.", vendorUrl: "https://lumion.com/" },
  { name: "Enscape", category: "Rendering", note: "A plugin — install its host application (Revit, SketchUp, Rhino or Archicad) first.", vendorUrl: "https://enscape3d.com/" },
  { name: "Chaos V-Ray", category: "Rendering", note: "Chaos account or your licence server.", vendorUrl: "https://www.chaos.com/vray" },
  { name: "Chaos Vantage", category: "Rendering", note: "Real-time ray tracing for large scenes.", vendorUrl: "https://www.chaos.com/vantage" },
  { name: "Chaos Corona", category: "Rendering", note: "For 3ds Max and Cinema 4D workflows.", vendorUrl: "https://www.chaos.com/corona" },
  { name: "KeyShot", category: "Rendering", note: "Product and industrial visualisation.", vendorUrl: "https://www.keyshot.com/" },
  // 11 Nov 2026: pages /software/cinema-4d-cloud-workstation and /software/houdini-cloud-workstation.
  { name: "Maxon Cinema 4D & Redshift", category: "Rendering", note: "Sign in with your Maxon account.", vendorUrl: "https://www.maxon.net/cinema-4d" },
  { name: "SideFX Houdini", category: "Rendering", note: "Your SideFX account or licence server; Karma ships with it.", vendorUrl: "https://www.sidefx.com/products/houdini/" },
  { name: "Autodesk Revit", category: "CAD & BIM", note: "Install from your own Autodesk account.", vendorUrl: "https://manage.autodesk.com/" },
  { name: "Autodesk AutoCAD", category: "CAD & BIM", note: "Install from your own Autodesk account.", vendorUrl: "https://manage.autodesk.com/" },
  { name: "Autodesk 3ds Max", category: "CAD & BIM", note: "Install from your own Autodesk account.", vendorUrl: "https://manage.autodesk.com/" },
  { name: "Autodesk Maya", category: "CAD & BIM", note: "Install from your own Autodesk account.", vendorUrl: "https://manage.autodesk.com/" },
  { name: "SketchUp Pro", category: "CAD & BIM", note: "Sign in with your Trimble account.", vendorUrl: "https://www.sketchup.com/download/all" },
  { name: "Rhino", category: "CAD & BIM", note: "Evaluation available; then your own licence key.", vendorUrl: "https://www.rhino3d.com/download/" },
  { name: "Archicad", category: "CAD & BIM", note: "Graphisoft licence required.", vendorUrl: "https://graphisoft.com/downloads" },
  { name: "Adobe Creative Cloud", category: "Images & textures", note: "Install Creative Cloud and sign in with your own Adobe account.", vendorUrl: "https://creativecloud.adobe.com/apps/download/creative-cloud" },
];

export const CATEGORIES = [
  "3D & rendering",
  "Rendering",
  "CAD & BIM",
  "CAD viewers",
  "Free tools",
  "Real-time",
  "Images & textures",
  "Utilities",
  "System",
] as const;
