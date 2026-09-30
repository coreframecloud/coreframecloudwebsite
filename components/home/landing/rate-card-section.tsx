import Link from "next/link";
import { SpecBlock, K, V } from "@/components/home/spec-block";

/**
 * The close: the whole commercial offer in one block, then two doors.
 *
 * Every figure here is passed in from the live rate card. NOTHING on this
 * page may be typed as a price — a number that disagrees with what billing
 * charges is the one error here that costs money rather than credibility, and
 * a figure that survives a rate change in the control plane is worse than no
 * figure at all. When a value is missing its line disappears.
 *
 * The identity-check line is stated plainly rather than buried. It is the most
 * common reason someone abandons signup, and finding out about it after
 * entering an email feels like a trap; saying it here costs a few visitors and
 * keeps the ones who stay.
 *
 * The benchmark line exists so the 3-4x claim in the discipline cards has its
 * source printed on the same page. A speed multiple without its source is the
 * claim we do not make.
 */
export function RateCardSection({
  adhocRate,
  trialMinutes,
}: {
  adhocRate?: string;
  trialMinutes?: number;
}) {
  return (
    <section className="cf-section px-5">
      <div className="cf-wide">
        <SpecBlock label="The rate card">
          {adhocRate ? (
            <>
              {"  "}<K>price</K>{"            "}<V>{adhocRate} / hour</V> · GST included · billed per minute{"\n"}
            </>
          ) : null}
          {trialMinutes ? (
            <>
              {"  "}<K>free to start</K>{"    "}<V>{trialMinutes} GPU minutes</V> · no card · no commitment{"\n"}
            </>
          ) : null}
          {"  "}<K>commitment</K>{"       "}none. no seats, no tiers, nothing to cancel{"\n"}
          {"  "}<K>required</K>{"         "}Aadhaar or passport check before GPU access,{"\n"}
          {"                   "}as it is for every cloud provider in India{"\n"}
          {"  "}<K>the machine</K>{"      "}RTX 5080 · 16 GB GDDR7 · 64 GB RAM ·{"\n"}
          {"                   "}1 TB NVMe Gen 5 · 4K 60 fps stream{"\n"}
          {"  "}<K>benchmarks</K>{"       "}Blender Open Data medians, Sep 2026 —{"\n"}
          {"                   "}RTX 5080 <V>9,142</V> · RTX 4060 3,132 · RTX 3060 2,288
        </SpecBlock>

        <div className="mt-7 flex flex-wrap gap-3.5">
          <Link href="/signup" className="cf-btn-primary">
            {trialMinutes ? `Start free — ${trialMinutes} minutes` : "Create an account"}
          </Link>
          <Link href="/floor-plan-to-render" className="cf-btn-secondary">
            See Coreframe Studio
          </Link>
        </div>
      </div>
    </section>
  );
}
