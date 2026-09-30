import { WaitingCalculator } from "@/components/home/waiting-calculator";

/**
 * The turn in the argument.
 *
 * Everything above this point describes a machine. This is where the page
 * stops talking about hardware and starts talking about the visitor's week —
 * "you are not paid to watch a progress bar" — and then hands them the
 * arithmetic rather than making a claim on their behalf.
 *
 * The four-lakh line is deliberate and is the only comparison we draw: it is
 * the real landed cost of the workstation an Indian studio would otherwise
 * buy, and it reframes the rate from an expense into an alternative to a
 * capital purchase. We do not compare against a laptop; that comparison was
 * dishonest and was removed.
 */
export function CostOfWaitingSection({ ratePerHour }: { ratePerHour: number | null }) {
  return (
    <>
      <section className="cf-section px-5">
        <div className="cf-col">
          <p className="cf-eyebrow mb-5">What it&apos;s for</p>
          <h2 className="cf-section-title">You are not paid to watch a progress bar.</h2>
          <p className="cf-section-copy mt-4">
            The machine under your desk was the right call three years ago. Since then your
            scenes got heavier, your clients got faster, and the bottleneck stopped being your
            ideas. Every hour a frame is cooking is an hour you are not designing, not
            presenting, and not starting the next project.
          </p>
          <p className="cf-section-copy mt-4">
            You can buy your way out of that for four lakhs. Or you can rent the machine for the
            afternoon you need it.
          </p>
        </div>
      </section>

      <section className="cf-section px-5 pt-0">
        <div className="cf-wide">
          <p className="cf-eyebrow mb-5">Your arithmetic, not ours</p>
          <h2 className="cf-section-title">What is the waiting costing you?</h2>
          <p className="cf-section-copy mt-4 max-w-[62ch]">
            Put in your own numbers. We have deliberately not invented a figure to put here —
            the only one that matters is yours.
          </p>
          <div className="mt-7">
            <WaitingCalculator ratePerHour={ratePerHour} />
          </div>
          <p className="mt-4 text-[13px] leading-[1.65] text-ink-3">
            This is an estimate built entirely from what you entered. It assumes 48 working weeks
            and that recovered hours are hours you can actually bill.
          </p>
        </div>
      </section>
    </>
  );
}
