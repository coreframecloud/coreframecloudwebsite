/**
 * The software catalogue, in one place.
 *
 * Rendered by /apps, summarised in /llms.txt, and referenced by /how-to-use.
 * Kept as data rather than prose in three templates, because the moment those
 * drift a customer reads on one page that Lumion is preinstalled and discovers
 * on the machine that it is bring-your-own-licence.
 *
 * Mirrors apps/node-setup/install-baseline-software.ps1 in the control-plane
 * repo — that script is what actually puts these on the node before the
 * Reboot Restore baseline is taken. If you add software there, add it here.
 */

export type SoftwareItem = {
  name: string;
  category: string;
  /** What a customer uses it for, in their words rather than the vendor's. */
  note: string;
  vendorUrl?: string;
};

/** Installed on every workstation. Ready the moment the desktop appears. */
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
    note: "Real-time architectural visualisation. The free tier covers most individual users.",
    vendorUrl: "https://www.twinmotion.com/",
  },
  {
    name: "Autodesk DWG TrueView",
    category: "CAD viewers",
    note: "Open, measure and plot DWG drawings without needing an AutoCAD seat.",
    vendorUrl: "https://www.autodesk.com/products/dwg-trueview/overview",
  },
  {
    name: "Autodesk Navisworks Freedom",
    category: "CAD viewers",
    note: "Review NWD coordination models from consultants.",
    vendorUrl: "https://www.autodesk.com/products/navisworks/3d-viewers",
  },
  {
    name: "eDrawings Viewer",
    category: "CAD viewers",
    note: "Open SolidWorks, DWG and DXF files sent by engineering teams.",
    vendorUrl: "https://www.edrawingsviewer.com/",
  },
  {
    name: "GIMP",
    category: "Images & textures",
    note: "Texture work and render post-processing without a Photoshop subscription.",
    vendorUrl: "https://www.gimp.org/",
  },
  {
    name: "Krita",
    category: "Images & textures",
    note: "Digital painting and texture authoring.",
    vendorUrl: "https://krita.org/",
  },
  {
    name: "Paint.NET",
    category: "Images & textures",
    note: "Quick crops, resizes and touch-ups.",
    vendorUrl: "https://www.getpaint.net/",
  },
  {
    name: "7-Zip",
    category: "Utilities",
    note: "Unpack the .zip, .rar and .7z scene archives clients send.",
    vendorUrl: "https://www.7-zip.org/",
  },
  {
    name: "Google Chrome & Mozilla Firefox",
    category: "Utilities",
    note: "Sign in to asset libraries and your own software licence portals.",
  },
  {
    name: "Adobe Acrobat Reader",
    category: "Utilities",
    note: "Drawings, specifications and tender documents arrive as PDF.",
    vendorUrl: "https://get.adobe.com/reader/",
  },
  {
    name: "VLC",
    category: "Utilities",
    note: "Play back rendered walkthrough video before you download it.",
    vendorUrl: "https://www.videolan.org/vlc/",
  },
  {
    name: "Notepad++",
    category: "Utilities",
    note: "Edit config, material and script files.",
    vendorUrl: "https://notepad-plus-plus.org/",
  },
  {
    name: "Python",
    category: "Utilities",
    note: "Run Blender and Revit automation scripts.",
    vendorUrl: "https://www.python.org/",
  },
  {
    name: "NVIDIA Studio driver",
    category: "System",
    note: "The GPU driver tuned for creative applications rather than games.",
  },
  {
    name: "Visual C++ & .NET runtimes",
    category: "System",
    note: "The runtime libraries every render engine and CAD add-in expects to find.",
  },
];

/**
 * Install these yourself and sign in with your own subscription. We do not
 * supply licences — these products are licensed to a named user, and yours
 * follows you onto the workstation exactly as it would onto a new PC.
 */
export const BRING_YOUR_OWN_LICENCE: SoftwareItem[] = [
  { name: "D5 Render", category: "Rendering", note: "Free tier available; Pro is per user.", vendorUrl: "https://www.d5render.com/download" },
  { name: "Lumion", category: "Rendering", note: "Sign in with your Lumion account.", vendorUrl: "https://lumion.com/" },
  { name: "Enscape", category: "Rendering", note: "A plugin — install its host application (Revit, SketchUp, Rhino or Archicad) first.", vendorUrl: "https://enscape3d.com/" },
  { name: "Chaos V-Ray", category: "Rendering", note: "Chaos account or your licence server.", vendorUrl: "https://www.chaos.com/vray" },
  { name: "Chaos Vantage", category: "Rendering", note: "Real-time ray tracing for large scenes.", vendorUrl: "https://www.chaos.com/vantage" },
  { name: "Chaos Corona", category: "Rendering", note: "For 3ds Max and Cinema 4D workflows.", vendorUrl: "https://www.chaos.com/corona" },
  { name: "KeyShot", category: "Rendering", note: "Product and industrial visualisation.", vendorUrl: "https://www.keyshot.com/" },
  { name: "Autodesk Revit", category: "CAD & BIM", note: "Install from your own Autodesk account.", vendorUrl: "https://manage.autodesk.com/" },
  { name: "Autodesk AutoCAD", category: "CAD & BIM", note: "Install from your own Autodesk account.", vendorUrl: "https://manage.autodesk.com/" },
  { name: "Autodesk 3ds Max", category: "CAD & BIM", note: "Install from your own Autodesk account.", vendorUrl: "https://manage.autodesk.com/" },
  { name: "Autodesk Maya", category: "CAD & BIM", note: "Install from your own Autodesk account.", vendorUrl: "https://manage.autodesk.com/" },
  { name: "SketchUp Pro", category: "CAD & BIM", note: "Sign in with your Trimble account.", vendorUrl: "https://www.sketchup.com/download/all" },
  { name: "Rhino", category: "CAD & BIM", note: "Evaluation available; then your own licence key.", vendorUrl: "https://www.rhino3d.com/download/" },
  { name: "Archicad", category: "CAD & BIM", note: "Graphisoft licence required.", vendorUrl: "https://graphisoft.com/downloads" },
  { name: "Unreal Engine", category: "Real-time", note: "Free to install; Datasmith imports from Revit and SketchUp.", vendorUrl: "https://www.unrealengine.com/download" },
  { name: "Adobe Creative Cloud", category: "Images & textures", note: "Photoshop, Substance and the rest, on your own subscription.", vendorUrl: "https://creativecloud.adobe.com/apps/download/creative-cloud" },
];

export const CATEGORIES = [
  "3D & rendering",
  "Rendering",
  "CAD & BIM",
  "CAD viewers",
  "Real-time",
  "Images & textures",
  "Utilities",
  "System",
] as const;
