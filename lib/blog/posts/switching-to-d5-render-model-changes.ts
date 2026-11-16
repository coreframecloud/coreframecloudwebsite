import type { BlogPost } from "../types";

const SLUG = "switching-to-d5-render-model-changes";
const IMG = `/blog/${SLUG}`;

/**
 * Written 16 Nov 2026 (weekly loop, owner-approved): the pain point that kept
 * coming back in that week's Reddit digests (marketing-reddit/digest-202611
 * 11, 12, 15, 16): designers moving to D5 from Twinmotion, or from Enscape +
 * V-Ray, asking what happens to their D5 work when the Revit or SketchUp model
 * changes; a Blender user with exploded meshes after a sync; V-Ray perpetual
 * licence holders weighing a move to D5. No Reddit quotes or links, by rule.
 *
 * VENDOR FACTS, read 16 Nov 2026:
 *   docs.d5render.com/model/how-to-restore-the-imported-models-built-in-materials
 *       ... on sync, material parameters NOT changed in D5 follow the modelling
 *       app; parameters changed in D5 take precedence; renaming a material in
 *       the modelling app makes it a new material, which syncs fresh; a
 *       material replaced from D5's asset library replaces the imported one
 *       completely and can't be reset.
 *   docs.d5render.com/workflow/sketchup/feature-introduction-or-d5-livesync-for-sketchup
 *       ... live sync and Sync Once (incremental model + material updates);
 *       Send Scenes; lights added with the plugin's light toolbar: a resync
 *       resets their position, rotation and size to SketchUp's but keeps the
 *       names and grouping set in D5; lights deleted in D5 are not resynced.
 *   docs.d5render.com/workflow ... sync plugins for SketchUp, 3ds Max, Rhino,
 *       Revit, Cinema 4D, Archicad, Blender and Vectorworks; LiveSync pages
 *       for SketchUp, Rhino, Archicad, Blender, Vectorworks and 3ds Max (beta).
 *   dev.epicgames.com ... Datasmith Direct Link for Twinmotion: Auto Sync;
 *       links break when the source file is renamed or moved or isn't open.
 *   chaos.com/enscape ... Enscape runs inside Revit, SketchUp, Rhino,
 *       Archicad and Vectorworks.
 *
 * NOT CLAIMED: that D5 is faster or better looking than V-Ray, Enscape or
 * Twinmotion; any render time; anything about objects placed in D5 beyond the
 * plain fact that they aren't part of the synced model. Coreframe appears
 * once, in the last section.
 */
const CHECKED = "16 November 2026";
const D5_MATERIALS_URL = "https://docs.d5render.com/model/how-to-restore-the-imported-models-built-in-materials";
const D5_SKETCHUP_URL = "https://docs.d5render.com/workflow/sketchup/feature-introduction-or-d5-livesync-for-sketchup";
const D5_WORKFLOW_URL = "https://docs.d5render.com/workflow";
const TM_DIRECT_LINK_URL = "https://dev.epicgames.com/documentation/twinmotion/datasmith-direct-link-workflow-in-twinmotion";
const ENSCAPE_URL = "https://www.chaos.com/enscape";

export const switchingToD5RenderModelChanges: BlogPost = {
  slug: SLUG,
  title: "Switching to D5 Render: what breaks when your model changes",
  absoluteTitle: "Switching to D5 Render? What Breaks When the Model Changes",
  description:
    "D5 keeps your material edits through a sync if the material keeps its name. Hand-placed trees, furniture and lights don't follow a moved wall. Setup habits.",
  targetQueries: [
    "switching from twinmotion to d5",
    "d5 render livesync materials reset",
    "d5 render model update keep materials",
    "enscape vray or d5 render",
    "d5 livesync revit sketchup changes",
    "d5 render exploded meshes blender sync",
  ],
  datePublished: "2026-11-16",
  draft: false,
  eyebrow: "Guide · Workflow",
  hero: {
    src: `${IMG}/file-on-workstation.webp`,
    alt: "A remote Windows desktop with D5 Launcher, Twinmotion, 3ds Max, Revit and other application icons, and File Explorer open on the Coreframe Datalake (N:) drive.",
    width: 1546,
    height: 782,
    caption:
      "D5 Launcher next to Revit, 3ds Max and Twinmotion on one Windows desktop. The modelling app and D5 stay linked through D5's sync plugin.",
  },
  answer: () =>
    "When you move to D5 Render from Twinmotion, or from Enscape and V-Ray, the main change is that D5 keeps its own scene, linked to your Revit, SketchUp, Rhino, Archicad, Blender or 3ds Max model by a sync plugin. Each sync brings the new geometry and materials across. Settings you change on a material in D5 survive the sync as long as that material keeps its name in the modelling app. What needs checking after a revision is everything you added inside D5: trees, furniture, people and lights don't move when a wall moves. A material you swapped for one from D5's library no longer follows the model either. Keep material names stable, make design changes in the model, and check hand-placed items after every big change.",
  body: () => [
    { type: "h2", text: "What D5 keeps when the model changes" },
    {
      type: "p",
      text: `D5 publishes plugins for SketchUp, Revit, Rhino, Archicad, 3ds Max, Cinema 4D, Blender and Vectorworks ([D5's workflow pages](${D5_WORKFLOW_URL})). Most of them can sync live, so a change in the model shows up in D5 without a manual update; the 3ds Max live plugin is still marked beta. D5's own rules for what happens to materials on a sync are short, and they explain most of the surprises people run into:`,
    },
    {
      type: "ul",
      items: [
        "You left a material's settings alone in D5: it follows the modelling app, so a colour changed there changes in D5.",
        "You changed a material's settings in D5: your D5 settings win, and the modelling app no longer overrides them.",
        "You renamed the material in the modelling app: D5 treats it as a new material and syncs it fresh, without your D5 edits.",
        "You replaced it with a material from D5's library: the library material replaces the imported one completely and can't be reset.",
      ],
    },
    {
      type: "p",
      text: `Source: [D5's guide to restoring imported materials](${D5_MATERIALS_URL}), read on ${CHECKED}. The renaming rule is also the way back: to throw away your D5 edits and start again from the modelling app's material, give it a new name and sync.`,
    },

    { type: "h2", text: "What breaks after a revision, and how to avoid it" },
    { type: "h3", text: "Renamed materials" },
    {
      type: "p",
      text: "Renaming a material in Revit or SketchUp quietly drops the work you did on it in D5, because D5 sees a new material. Agree a naming scheme for materials before the first sync and leave it alone. If the office template renames materials on export, fix that first.",
    },
    { type: "h3", text: "Library swaps" },
    {
      type: "p",
      text: "Swapping an imported material for a D5 library material is fine for a finish that won't change, such as a hero timber floor. It's the wrong choice for anything still under design, because that surface stops following the model. While the design is moving, edit the imported material's settings instead of replacing it.",
    },
    { type: "h3", text: "Things you placed in D5" },
    {
      type: "p",
      text: "Trees, furniture, people and props from D5's asset library live in the D5 scene, not in your model. When a wall moves 300 mm, the sofa you placed against it stays where it was, now floating or buried. After any change to walls, floors or openings, walk the saved views and check the placed items. If a piece of furniture is part of the design, model it in the modelling app so it moves with the room.",
    },
    { type: "h3", text: "Lights" },
    {
      type: "p",
      text: `In SketchUp, lights added through the D5 plugin's light toolbar are part of the model. D5's [SketchUp LiveSync page](${D5_SKETCHUP_URL}) says a resync resets their position, rotation and size to SketchUp's, keeps the names and grouping you set in D5, and doesn't bring back lights you deleted in D5. Lights placed directly in D5 behave like the furniture above: they stay where you put them.`,
    },
    { type: "h3", text: "Merged or exploded groups" },
    {
      type: "p",
      text: "Exploding a group, merging objects or rebuilding a component between revisions changes what the plugin sends across. If you do, check the material assignments on those objects after the next sync instead of assuming they held.",
    },

    { type: "h2", text: "Setup habits that keep revisions cheap" },
    {
      type: "ol",
      items: [
        "Name materials by what they are (Floor_Oak, Wall_Paint_White) in the modelling app before the first sync, and keep those names.",
        "Make design changes in the model. Use D5 for materials, light, entourage and cameras.",
        "Save every client view as a D5 camera, or send SketchUp scenes across with the plugin's Send Scenes button, so you can check every angle quickly after a sync.",
        "Keep one D5 file per design option instead of one large file with everything hidden and shown.",
        "After each big change, sync, then walk the saved views looking for floating furniture, lights in the wrong place and materials that went back to plain colours.",
      ],
    },

    { type: "h2", text: "Coming from Twinmotion" },
    {
      type: "p",
      text: `The habits carry over. Twinmotion also keeps its own scene and links it to the model, through [Datasmith Direct Link](${TM_DIRECT_LINK_URL}), with an Auto Sync option. Epic's page lists the usual reasons a link breaks: the source file was renamed or moved, or it isn't open in the modelling app. The same care applies to D5: keep the model in one place under one name for the life of the project.`,
    },

    { type: "h2", text: "Coming from Enscape and V-Ray: move everything to D5?" },
    {
      type: "p",
      text: `This is the bigger change. [Enscape](${ENSCAPE_URL}) runs inside Revit, SketchUp, Rhino, Archicad and Vectorworks, and V-Ray runs inside its host app too, so there is no second scene to keep in step. Moving to D5 trades that for a separate scene with its own asset library and lighting tools, plus the sync habits above.`,
    },
    {
      type: "ul",
      items: [
        "If V-Ray only produces your final stills, try D5 for them on one live project and compare the images and the hours you spent.",
        "If you rely on V-Ray's render elements for post-production, or on detailed lighting studies, keep V-Ray for those shots, even if D5 takes over the rest.",
        "Keep your existing V-Ray licence active while you test, so archived scenes still open.",
      ],
    },
    {
      type: "p",
      text: "Run one real project through both workflows, including at least one round of client changes, before you commit the office. The second revision tells you more than the first render.",
    },

    { type: "h2", text: "Blender: meshes look exploded after a sync" },
    {
      type: "p",
      text: "When geometry arrives in D5 scattered or stretched, the usual causes are unapplied transforms and modifiers. On a copy of the file:",
    },
    {
      type: "ul",
      items: [
        "Select everything and apply rotation and scale (Ctrl+A in Blender).",
        "Apply or switch off Array, Mirror and Geometry Nodes modifiers.",
        "Look for objects parented to an empty with an unusual scale.",
        "Test with a plain cube. If the cube syncs correctly and the scene doesn't, export the scene as FBX and import that into D5 to see whether the problem is the file or the plugin.",
      ],
    },

    { type: "h2", text: "If your laptop slows the test down" },
    {
      type: "p",
      text: "A fair test needs a machine that runs D5 smoothly, otherwise you're judging the laptop. D5 needs a dedicated ray-tracing graphics card; the full list is in [D5 Render system requirements](/blog/d5-render-system-requirements-laptop). If yours falls short, a Coreframe workstation has D5 Render installed (you sign in with your own D5 account) and is billed per minute, so a two-week trial project costs only the hours you work. More on that setup is on [D5 Render on a cloud workstation](/d5-render-cloud-workstation).",
    },
  ],
  faqs: () => [
    {
      q: "Does D5 Render keep my materials when the Revit or SketchUp model changes?",
      a: `Yes, for settings you changed in D5, as long as the material keeps the same name in the modelling app. Settings you didn't touch follow the modelling app. A renamed material syncs as a new one, and a material swapped for one from D5's library no longer follows the model (D5 documentation, read ${CHECKED}).`,
    },
    {
      q: "Why did my D5 materials reset after a sync?",
      a: "The most common reason is that the material was renamed in the modelling app, so D5 treated it as a new material. Check the name first. To reset a material on purpose, rename it in the modelling app and sync.",
    },
    {
      q: "Do trees and furniture placed in D5 move when I change the model?",
      a: "No. Anything placed from D5's asset library belongs to the D5 scene, not to your model, so it stays where you put it. Check placed items in your saved views after any change to walls, floors or openings.",
    },
    {
      q: "Is switching from Twinmotion to D5 hard?",
      a: "The workflow is similar: both keep their own scene linked to the model and update it on a sync. The habits that matter are the same too: stable material names, design changes made in the model, and a check of hand-placed items after each revision.",
    },
    {
      q: "Should I replace Enscape and V-Ray with D5?",
      a: "Test it on one live project first, including a round of client changes. Enscape and V-Ray work inside the modelling app, while D5 is a separate scene you keep in sync. Keep V-Ray for shots that depend on its render elements or lighting studies.",
    },
  ],
  related: [
    { href: "/blog/d5-render-system-requirements-laptop", label: "D5 Render system requirements" },
    { href: "/blog/realistic-interior-renders-design-options", label: "Which renderer has the most realistic lighting?" },
    { href: "/d5-render-cloud-workstation", label: "D5 Render on a cloud workstation" },
    { href: "/software/twinmotion-cloud-workstation", label: "Twinmotion on a cloud workstation" },
    { href: "/architectural-visualization", label: "Every archviz tool, by job" },
  ],
};
