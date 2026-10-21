import Link from "next/link";
import { SpecBlock, K, V } from "@/components/home/spec-block";
import { hoursLabel, type IntroOffer, type LadderRanges, introMoreGpusNote, introPrice } from "@/lib/rate-card";

/**
 * The close: the whole commercial offer in one block, then two doors.
 *
 * Every figure here is passed in from the live rate card. NOTHING on this
 * page may be typed as a price — a number that disagrees with what billing
 * charges is the one error here that costs money rather than credibility, and
 * a figure that survives a rate change in the control plane is worse than no
 * figure at all. When a value is missing its line disappears.
 *
 * What sign-up asks for is stated plainly: email and a WhatsApp code to the
 * mobile, no ID documents (paid-first onboarding, 10 Oct 2026). The intro
 * offer line comes from the rate card and disappears when there is none.
 *
 * The benchmark line exists so the 3-4x claim in the discipline cards has its
 * source printed on the same page. A speed multiple without its source is the
 * claim we do not make.
 */
export function RateCardSection({
  adhocRate,
  intro,
  ladder = null,
}: {
  adhocRate?: string;
  intro?: IntroOffer | null;
  /** The GPU ladder as ranges from the live rate card (owner, 21 Oct 2026). */
  ladder?: LadderRanges | null;
}) {
  const machine = ladder ? `${ladder.gpu} · ${ladder.vram} VRAM · ${ladder.cpu} · ${ladder.ram} RAM` : null;
  return (
    <section className="cf-section px-5">
      <div className="cf-wide">
        <SpecBlock label="The rate card">
          {adhocRate ? (
            <>
              {"  "}<K>price</K>{"            "}<V>{adhocRate} / hour</V> · GST included · billed per minute{"\n"}
            </>
          ) : null}
          {intro ? (
            <>
              {"  "}<K>first top-up</K>{"     "}<V>{introPrice(intro)} = {hoursLabel(intro.hours)}</V>{intro.gpuName ? ` on the ${intro.gpuName}` : ""}{introMoreGpusNote(intro)}
              {intro.validityDays ? ` · use within ${intro.validityDays} days` : ""}{"\n"}
            </>
          ) : null}
          {"  "}<K>commitment</K>{"       "}none. no seats, no tiers, nothing to cancel{"\n"}
          {"  "}<K>sign-up</K>{"          "}email + a WhatsApp code to your mobile.{"\n"}
          {"                   "}no ID documents · international cards accepted{"\n"}
          {machine ? (
            <>
              {"  "}<K>the machine</K>{"      "}{machine} ·{"\n"}
              {"                   "}1 TB NVMe · 4K 60 fps stream{"\n"}
            </>
          ) : null}
          {"  "}<K>benchmarks</K>{"       "}Blender Open Data, 4.5.0, Cycles, read 20 Sep 2026{"\n"}
          {"                   "}RTX 5080 (our base node) <V>9,138</V> median · 1,429 results{"\n"}
          {"                   "}RTX 4060 3,182 · 441   ·   RTX 3060 2,154 · 634{"\n"}
          {"                   "}= 2.87x a 4060 and 4.24x a 3060, published as 3x/4x{"\n"}
          {"                   "}opendata.blender.org. Cycles only: D5, Lumion and{"\n"}
          {"                   "}Enscape are different renderers and may not scale so
        </SpecBlock>

        <div className="mt-7 flex flex-wrap gap-3.5">
          <Link href="/signup" className="cf-btn-primary">
            {intro ? `Get started: ${introPrice(intro)} for ${hoursLabel(intro.hours)}` : "Create an account"}
          </Link>
          <Link href="/floor-plan-to-render" className="cf-btn-secondary">
            Studio: floor plan to render
          </Link>
        </div>
      </div>
    </section>
  );
}
