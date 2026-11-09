import type { BlogPost } from "../types";

const SLUG = "check-dwg-dimensions-without-autocad";
const IMG = `/blog/${SLUG}`;

/**
 * Written 9 Nov 2026 (AEO weekly loop, plans/aeo-week-20261109.md): the
 * owner's backlog item "promote the free DWG dimension checker", built from
 * questions drafters actually ask on forums. The questions and the Autodesk
 * help pages used are listed in the plan file with the date they were read.
 *
 * RULES: answer first; facts about AutoCAD only from Autodesk's own help
 * pages (linked inline); no statistics; Coreframe's free checker is the one
 * product mention, and it says plainly what the checker does NOT do.
 */
const CHECKED = "9 November 2026";

export const checkDwgDimensionsWithoutAutocad: BlogPost = {
  slug: SLUG,
  title: "How to check DWG dimensions online for free, without AutoCAD",
  absoluteTitle: "Check DWG Dimensions Online Free, Without AutoCAD",
  description:
    "Find missing dimensions, overridden dimension text and exploded dimensions in a DWG without AutoCAD: a free online check, plus the AutoCAD commands.",
  targetQueries: [
    "how to check dwg dimensions online free",
    "check dwg without autocad",
    "find missing dimensions in dwg",
    "find overridden dimensions autocad",
    "dimension text does not match actual length autocad",
    "open dwg without autocad",
  ],
  datePublished: "2026-11-09",
  dateModified: "2026-11-09",
  draft: false,
  eyebrow: "Guide · Drawings",
  hero: {
    src: `${IMG}/hero-dwg-check-report.webp`,
    alt: "The free DWG dimension checker's report for a sample three-bedroom floor plan, listing the checks it ran and what it found.",
    width: 1200,
    height: 675,
    caption: "A real report from the free checker on Coreframe's own sample 3BHK plan, a test file with no dimensions at all, so every wall position is flagged.",
  },
  answer: () =>
    "To check DWG dimensions online for free without AutoCAD, upload the drawing to a browser-based checker such as Coreframe's free DWG dimension checker (coreframecloud.com/dwg-check). It reads DWG files from AutoCAD 2000 to 2018 and DXF, and lists wall positions that no dimension measures, dimensions whose typed-over text disagrees with the length they span, dimensions printed at a length scale factor, and exploded dimensions that will never update, with no install and no account. To view or measure the drawing yourself, Autodesk's DWG TrueView viewer opens DWG files and measures distances one at a time. In AutoCAD itself, each problem has a manual check with a command or system variable, shown below.",
  body: () => [
    { type: "h2", text: "Why a DWG's dimensions can be wrong while looking right" },
    {
      type: "p",
      text: "A dimension in AutoCAD normally shows the length it measures and updates when the geometry moves. Three habits break that link, and none of them is visible on the printed sheet:",
    },
    {
      type: "ul",
      items: [
        "Typed-over text. A dimension's text can be replaced by a literal value, so the drawing prints 3000 over a wall that measures 2950. The number looks like any other dimension.",
        "Exploded dimensions. Exploding a dimension turns it into plain lines and text. The number is frozen: the wall can move and the drawing keeps printing the old figure.",
        "A length scale factor. A dimension style can multiply every measured length by a factor, which is right for a detail drawn at another scale and wrong everywhere else.",
      ],
    },
    {
      type: "p",
      text: "The fourth problem is the dimension nobody drew: a wall face that no dimension string locates, so whoever sets out from the drawing has to scale it.",
    },

    { type: "h2", text: "Check a DWG without AutoCAD, free and online" },
    {
      type: "ol",
      items: [
        "Open the [free DWG dimension checker](/dwg-check) in any current browser, on Windows, macOS or Linux.",
        "Upload the DWG (AutoCAD 2000 to 2018) or a DXF, up to 95 MB. Nothing to install, no account, email or card.",
        "Read the report: wall positions no dimension measures, dimensions whose printed value disagrees with the geometry (both numbers shown), dimensions at a length scale factor, plain text on a dimension layer that looks like an exploded dimension, and dead weight you can purge.",
        "Fix the drawing in your own CAD program. The checker is read-only: it never changes the file, and the file is deleted as soon as it has been read.",
      ],
    },
    {
      type: "note",
      text: "What it will not do: it measures axis-aligned walls, so curved and angled walls are not checked for missing dimensions; it cannot read Revit (.rvt) or MicroStation (.dgn) files (export a DWG); and a clean report is not an approval. It reports what the drawing does not measure, not whether the building is right.",
    },

    { type: "h2", text: "The same checks inside AutoCAD" },
    {
      type: "p",
      text: "If you have AutoCAD, each problem has a manual check. They work one drawing at a time and are worth knowing:",
    },
    {
      type: "ul",
      items: [
        "Typed-over dimension text: A dimension shows its measured value through the \"<>\" placeholder; text without it replaces the value. The Express Tools command DIMREASSOC restores the measured value to overridden text. Autodesk help: [Override text](https://help.autodesk.com/cloudhelp/2016/ENU/AutoCAD-NET/files/GUID-B33DE16E-8D69-4B6C-A214-F254E69F241E.htm), [DIMREASSOC](https://help.autodesk.com/cloudhelp/2020/ENU/AutoCAD-Core/files/GUID-9D2D79DD-D8A9-4856-8459-4361B5A99655.htm).",
        "Length scale factor: DIMLFAC multiplies every linear dimension distance before it becomes text; its initial value is 1. DIMOVERRIDE can clear a per-dimension override back to the style. Autodesk help: [DIMLFAC](https://help.autodesk.com/cloudhelp/2022/ENU/AutoCAD-LT/files/GUID-B6063785-B199-4A9A-8BD7-2108EB0AB7ED.htm), [DIMOVERRIDE](https://help.autodesk.com/cloudhelp/2022/ENU/AutoCAD-LT/files/GUID-07B907AA-C94D-492C-8C4F-D73CB503F59E.htm).",
        "Exploded dimensions: No single command finds them. Drafters write LISP routines that look for plain text on the dimension layer.",
        "Duplicates and dead weight: OVERKILL removes duplicate or overlapping lines, arcs and polylines; PURGE removes unused named objects such as blocks and layers. Autodesk help: [PURGE and OVERKILL](https://help.autodesk.com/cloudhelp/2024/ENU/AutoCAD-DidYouKnow/files/GUID-5150F6AD-3FEC-4BA0-8905-5154ABBB6E9A.htm).",
        "Units: INSUNITS sets the drawing-units value used to scale blocks, images and xrefs when they are inserted. Autodesk help: [INSUNITS](https://help.autodesk.com/cloudhelp/2026/ENU/AutoCAD-LT/files/GUID-A58A87BB-482B-4042-A00A-EEF55A2B4FD8.htm).",
        "Missing dimensions: No built-in check. You compare the plan against the dimension strings by eye.",
      ],
    },
    {
      type: "p",
      text: "Without AutoCAD, Autodesk's DWG TrueView viewer opens DWG files, and its Distance command with object snaps measures between two points ([TrueView help](https://help.autodesk.com/cloudhelp/2023/ENU/DWGTrueView/files/GUID-24D129A2-19DA-449F-982E-C8E8FC4C12BA.htm)). That checks one length at a time; it does not compare a drawing's dimensions with its geometry.",
    },

    { type: "h2", text: "What drafters ask" },
    {
      type: "p",
      text: "These are real questions from drafting forums, paraphrased, each with the short answer.",
    },
    {
      type: "ul",
      items: [
        "\"Is there a quick way of finding all dimensions with a text override?\" (an AutoCAD LT user checking several hundred dimensions, [CADTutor](https://www.cadtutor.net/forum/topic/41112-finding-all-dimensions-with-text-overrides/)). Upload the drawing to the [free checker](/dwg-check): each dimension whose printed number disagrees with its geometry is listed with both numbers. Overrides that agree with the geometry, such as a repeat note, are not flagged.",
        "\"Is there any exploded dimension on the dimension layer?\" ([CADTutor](https://www.cadtutor.net/forum/topic/16277-check-explode-dimension)). The checker reports plain text on a dimension layer that reads like a measurement, which is what an exploded dimension leaves behind.",
        "\"My dimensions are all off by the same ratio\" in a drawing someone else sent ([Bricsys forum](https://forum.bricsys.com/discussion/13784/dimensions-turn-out-wrong-how-to-fix)). A constant ratio usually points to a length scale factor (DIMLFAC) in the dimension style. The checker lists every dimension printed at one.",
        "\"Blocks come in 25.4 times too small\" ([CADTutor](https://www.cadtutor.net/forum/topic/55909-block-insertion-scale-x-254-wrong-size/)). In that thread the two drawings declared different insertion units. The checker reports what a drawing declares and whether its other unit settings agree.",
        "\"Do you run OVERKILL before issuing a drawing, or find overlapping geometry by hand?\" ([CADTutor](https://www.cadtutor.net/forum/topic/99401-finding-overlapping-geometry-without-manually-checking-every-line/)). The checker counts duplicate and zero-length lines first, so you know whether OVERKILL is worth running.",
        "\"DWG TrueView cannot measure distance\" ([CADTutor](https://www.cadtutor.net/forum/topic/64583-autodesk-dwg-trueview-2015-cannot-measure-distance)). It can: the answer in the thread was that the result appears on the command line, or in the text window with F2.",
      ],
    },

    {
      type: "note",
      text: `Autodesk help pages and forum threads read on ${CHECKED}. Commands and variables can change between releases: check the help for your version.`,
    },
  ],
  faqs: () => [
    {
      q: "How do I check DWG dimensions online for free?",
      a: "Upload the DWG or DXF to a free browser-based checker such as coreframecloud.com/dwg-check. It lists wall positions that no dimension measures, dimensions whose typed-over text disagrees with the geometry, dimensions at a length scale factor and exploded dimensions. No AutoCAD, install or account is needed.",
    },
    {
      q: "Can I check a DWG without AutoCAD?",
      a: "Yes. An online checker reads the DWG on its own server, so you need no AutoCAD. To view the drawing and measure single distances yourself, Autodesk's DWG TrueView viewer opens DWG files.",
    },
    {
      q: "How do I find dimensions with overridden text in AutoCAD?",
      a: "A dimension shows its measured value through the \"<>\" placeholder; text without it replaces the value. The Express Tools command DIMREASSOC restores measured values. Without AutoCAD, a free online checker lists every dimension whose printed number disagrees with its geometry, with both numbers.",
    },
    {
      q: "Why are all my dimensions off by the same ratio?",
      a: "Usually a length scale factor: DIMLFAC multiplies every linear dimension distance before it is printed. Check the dimension style, or run the drawing through a checker that lists dimensions printed at a scale factor.",
    },
    {
      q: "Does the free checker add the missing dimensions?",
      a: "No. It is read-only: it lists what is missing and deletes the file once read. You add the dimensions in your own CAD program.",
    },
  ],
  related: [
    { href: "/dwg-check", label: "Free DWG dimension checker" },
    { href: "/tools", label: "No-install IFC model checker" },
    { href: "/floor-plan-to-render", label: "Floor plan to interior render (from DXF)" },
    { href: "/software/revit-cloud-workstation", label: "Revit on a cloud workstation" },
  ],
};
