/**
 * /llms.txt -- the brief for AI answer engines. Built in lib/llms.ts so that
 * /llms-full.txt can extend it without a second copy drifting.
 */
import { getRateCard } from "@/lib/rate-card";
import { buildLlmsTxt } from "@/lib/llms";

export const revalidate = 3600; // an hour, matching the rate card's own cache

export async function GET(): Promise<Response> {
  const card = await getRateCard().catch(() => null);
  return new Response(buildLlmsTxt(card).join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
