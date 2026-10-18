/**
 * The shape of a blog post.
 *
 * Posts are typed TS modules rather than MDX on purpose: MDX would mean three
 * new packages and a compile step for five articles, and the articles need
 * live values (the hourly rate, the intro offer, storage terms) that must come
 * from the rate card at build time. A post's body is therefore a FUNCTION of
 * that context, so no article can carry a hand-typed price. See
 * lib/rate-card.ts for why that rule exists.
 */
import type { IntroOffer, RateCardPlan } from "@/lib/rate-card";
import type { Currency } from "@/lib/money";

export type BlogImage = {
  /** Site-relative, under /blog/<slug>/. */
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Shown under the image. Must say honestly what the image is. */
  caption?: string;
};

/**
 * One block of an article. Strings in `p`, `li` and `note` may contain
 * [label](href) links; nothing else is parsed.
 */
export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "note"; text: string }
  | ({ type: "figure" } & BlogImage)
  | { type: "video"; youtubeId: string; title: string; caption?: string }
  /** The monospace fact block: specs and figures live here, per globals.css. */
  | { type: "spec"; label?: string; rows: [string, string][] }
  | { type: "table"; head: string[]; rows: string[][] }
  /**
   * The CFD explainer blocks (16 Oct 2026, components/cfd-explainer). Strings
   * may contain [label](href) links; `hl` is the ONE yellow-highlighted phrase
   * (it must occur verbatim in `text`). Sketches are illustrations: say so in
   * the alt text and never caption one as a result.
   */
  | { type: "sectionHead"; n?: number; tint?: "teal" | "blue" | "coral"; eyebrow?: string; title: string; text?: string }
  | { type: "callout"; text: string; hl?: string; source?: string }
  | { type: "statement"; big: string; caption?: string }
  | ({ type: "explainFigure"; maxWidth?: number; stamp?: string; labels?: [string, string] } & BlogImage);

/** A block or a deliberate gap (a sentence that needs a live value which is missing). */
export type MaybeBlock = Block | null | false | undefined;

export type Faq = { q: string; a: string };

/** Everything an article may say about money or terms, resolved from the rate card. */
export type BlogContext = {
  /** The page's display currency: every figure below is in it, and only it. */
  currency: Currency;
  /** "with GST included" / "with no GST", after a price. */
  taxIncl: string;
  /** "GST included" / "no GST", in brackets after a price. */
  taxShort: string;
  /** "₹399/hr" / "$5.99/hr", or null when the control plane is unreachable. */
  hourly: string | null;
  rate: number | null;
  /** "₹6.65", or null unless billing is per minute. */
  perMinute: string | null;
  /** One sentence on how billing works, from the API's own fields. */
  billing: string;
  intro: IntroOffer | null;
  /** "₹1,000", or null. */
  introPrice: string | null;
  /** "8 hours", or null. */
  introHours: string | null;
  storageGb: number;
  plans: RateCardPlan[];
  /** A plan's monthly fee / overage rate in the page's currency, or null. */
  planFee: (p: RateCardPlan) => string | null;
  planOverage: (p: RateCardPlan) => string | null;
  /** Every plan bills extra hours below the pay-as-you-go rate, in this currency. */
  plansBelowAdhoc: boolean;
  /** "₹N" / "$N" for `hours` at the ad-hoc rate, or null. */
  cost: (hours: number) => string | null;
  /** Rented hours that add up to the price of buying a comparable machine. */
  breakEvenHours: number | null;
  /** "₹6,00,000": our own estimate of buying an equivalent machine (lib/node-spec.ts).
   *  Null on the dollar view: the estimate is in rupees only. */
  replacementCost: string | null;
};

export type BlogPost = {
  slug: string;
  /** H1 and og:title. */
  title: string;
  /** <title>, when `title` would run past ~60 chars with the suffix. */
  metaTitle?: string;
  description: string;
  /** The description for the dollar view, when `description` talks rupees. */
  descriptionUsd?: string;
  /** The searches this post is written to answer. Used for keywords. */
  targetQueries: string[];
  /** ISO date. */
  datePublished: string;
  dateModified?: string;
  /**
   * TRUE KEEPS IT OFF THE LIVE SITE. A draft 404s on the production
   * deployment, is left out of /blog and the sitemap, and is noindex
   * everywhere. The owner flips this to false, per post, to publish.
   */
  draft: boolean;
  eyebrow: string;
  hero: BlogImage;
  /** Small credit line under the hero image, e.g. for a third-party scene. */
  credit?: string;
  /**
   * The answer-first opening paragraph. Written so an answer engine can lift
   * it whole: it answers the title's question before anything else.
   */
  answer: (ctx: BlogContext) => string;
  body: (ctx: BlogContext) => MaybeBlock[];
  faqs: (ctx: BlogContext) => (Faq | null)[];
  related: { href: string; label: string }[];
};
