/**
 * What customers have said, word for word.
 *
 * An entry is added ONLY after the named customer has approved the exact
 * wording (all five below were approved 11 Oct 2026). Never invent, edit,
 * paraphrase or reattribute a quote. Role-only attribution with a first name;
 * no city, no photo, no star ratings, and no Review/AggregateRating JSON-LD.
 * The homepage section renders nothing at all if this list is ever empty.
 *
 * `lead` is the sentence shown in bold; `rest` follows it in regular weight.
 * Split the customer's own words; do not add any.
 */
export type Testimonial = {
  lead: string;
  rest?: string;
  name: string;
  /** e.g. "Freelance interior designer, Pune" or "Founder, an architecture studio" */
  role: string;
  /** Path under /public, only with the customer's permission. */
  photo?: string;
  /** Soft card tint, cycled when absent. */
  tint?: "blue" | "lilac" | "mint" | "sand";
};

export const TESTIMONIALS: Testimonial[] = [
  {
    lead: "As a freelancer I can't justify a workstation that sits idle between projects.",
    rest: "When a Twinmotion job comes in, I open an RTX 5080 on Coreframe and stop paying the moment I close it. My files wait on my Coreframe drive, so I pick up right where I left off.",
    name: "Dinesh",
    role: "Freelance visualiser · Twinmotion",
  },
  {
    lead: "Blender and After Effects all day, often for two clients at once.",
    rest: "On Coreframe, 64 GB of RAM keeps long After Effects comps smooth, and Blender renders finish far sooner than on my laptop. It costs more than a basic cloud VM, but a basic VM can't run this.",
    name: "Sai",
    role: "Motion designer · Blender & After Effects",
  },
  {
    lead: "I test heavy Unreal levels and walk scenes in Twinmotion.",
    rest: "The 16 GB card on Coreframe loads what my own machine couldn't, and it streams to my laptop in 4K.",
    name: "Avi",
    role: "Game tester · Unreal Engine & Twinmotion",
  },
  {
    lead: "Before Coreframe I did all of this on an RTX 3060 at home, cutting textures down just to make big projects fit.",
    rest: "Now I open an RTX 5080 when a test pass needs it, and per-minute billing means short sessions cost what they should.",
    name: "Srini",
    role: "Game developer & tester",
  },
  {
    lead: "I'm based in Singapore and paid with my international card: no paperwork, just an email and a mobile number.",
    rest: "On Coreframe I build comps in After Effects and run my FFmpeg batch encodes on the same machine, then pull the finished files down. One proper Windows workstation for the whole job.",
    name: "Jin",
    role: "Video editor · After Effects & FFmpeg, Singapore",
  },
];
