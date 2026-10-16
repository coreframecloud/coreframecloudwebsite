import type { HeroImage } from "@/components/page-hero-bg";

/**
 * One cinematic sci-fi still per GPU page (owner, 16 Oct 2026: "science
 * fiction movie scenes ... with a jet, with a lot of action"; then "every
 * software page gets its own"). Made on our own RTX 5080 with Z-Image Turbo
 * and upscaled with RealESRGAN; prompts and seeds in
 * marketing-20261016-site-explainer/gen/runs.jsonl. Invented designs only:
 * no real aircraft, brands, text or characters. NO CAPTION on any of them:
 * never "Rendered in Blender" for a generated still, and no "generated with
 * AI" line (owner).
 */
const H = (name: string, alt: string, pos: string, posMobile = "50% 50%", strongScrim = false): HeroImage => ({
  src: `/heroes/${name}-2560.webp`,
  w: 2560,
  h: 1440,
  mobile: { src: `/heroes/${name}-m780.webp`, w: 780, h: 1040 },
  alt,
  pos,
  posMobile,
  strongScrim,
});

export const GPU_HEROES: Record<string, HeroImage> = {
  "gpu-workstation-rental-india": H("hero-gpu-jet", "A sci-fi jet banking hard between night-lit towers at dusk, trailing sparks and light streaks", "60% 50%"),
  "blender-cloud-workstation": H("hero-anim-jet", "An animated-film style hover-jet racing past floating sky islands at sunset, with flame trails", "62% 50%"),
  "after-effects-premiere-cloud-workstation": H("hero-ae", "Two glowing neon racers speeding through a holographic tunnel", "65% 50%"),
  "revit-cloud-workstation": H("hero-revit", "A sleek craft gliding between towering night-lit skyscrapers in the mist", "70% 50%"),
  "3ds-max-cloud-workstation": H("hero-3dsmax", "A hover-speeder tearing through a red desert canyon, kicking up dust", "65% 50%"),
  "sketchup-cloud-workstation": H("hero-sketchup", "A floating island town and a small airship among pink clouds at dusk", "80% 50%", "50% 50%", true),
  "twinmotion-cloud-workstation": H("hero-twinmotion", "A VTOL craft skimming a river past open pavilions in a green valley at golden hour", "65% 50%"),
  "vray-cloud-rendering": H("hero-vray", "A long starship skimming the rings of a giant planet", "70% 50%"),
  "rhino-cloud-workstation": H("hero-rhino", "A curved, sculpted aircraft flying low over the sea beside a long bridge at sunset", "55% 50%"),
  "d5-render-cloud-workstation": H("hero-d5", "Flying cars and light trails on a rain-soaked street between neon-lit towers at night", "72% 50%"),
  "lumion-cloud-gpu": H("hero-lumion", "A small craft flying through mist past green, waterfall-covered towers in morning light", "60% 50%"),
  "enscape-cloud-gpu": H("hero-enscape", "The glass atrium of a future building, with a craft passing the window outside", "65% 50%"),
};
