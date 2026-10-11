/**
 * What customers have said, word for word.
 *
 * EMPTY ON PURPOSE. Only the owner's exact comments from real freelancers and
 * studio owners go here, with their permission to be named the way they are
 * shown. Never invent, paraphrase into a quote, or "tidy up" a testimonial:
 * the homepage section renders nothing at all while this list is empty.
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

export const TESTIMONIALS: Testimonial[] = [];
