/**
 * /llms-full.txt -- /llms.txt plus the full text of every per-application
 * guide, so an assistant that wants the detail ("does Corona get faster on
 * it?", "how do I get footage onto it?") has it in one fetch instead of
 * crawling twenty pages of navigation and markup.
 *
 * Same sources as the pages themselves: lib/software-pages.ts for the copy,
 * the live rate card for any price. Nothing is typed twice.
 */
import { getRateCard, pricingFaqAnswer } from "@/lib/rate-card";
import { buildLlmsTxt, SITE } from "@/lib/llms";
import { SOFTWARE_PAGES } from "@/lib/software-pages";

export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const card = await getRateCard().catch(() => null);
  const out = buildLlmsTxt(card);
  const price = pricingFaqAnswer(card);

  out.push("");
  out.push("# Per-application guides, in full");
  out.push("");
  for (const page of SOFTWARE_PAGES) {
    out.push(`## ${page.title}`);
    out.push("");
    out.push(`Source: ${SITE}/software/${page.slug}`);
    out.push("");
    out.push(page.intro);
    out.push("");
    out.push(`The problem: ${page.problem}`);
    out.push("");
    for (const w of page.why) out.push(`- ${w}`);
    out.push("");
    for (const sec of page.sections ?? []) {
      out.push(`### ${sec.h2}`);
      out.push("");
      for (const para of sec.body) {
        out.push(para);
        out.push("");
      }
    }
    for (const c of page.callouts ?? []) {
      out.push(`### ${c.h2}`);
      out.push("");
      out.push(c.body + (c.link ? ` (${SITE}${c.link.href})` : ""));
      out.push("");
    }
    out.push(`Licensing: ${page.licence}`);
    out.push("");
    for (const f of page.faqs) {
      out.push(`**Q: ${f.q}**`);
      out.push(f.a);
      out.push("");
    }
  }
  if (price) {
    out.push("## Price, in one paragraph");
    out.push("");
    out.push(price);
    out.push("");
  }

  return new Response(out.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
