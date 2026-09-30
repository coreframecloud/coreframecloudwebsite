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
/**
 * What the arithmetic above cannot price.
 */
const BEYOND = [
  {
    title: "Everyone gets their own machine",
    body: "Nobody books the render desk, and nobody waits for the person on it to finish. Four people can be on four workstations at once, from four laptops.",
  },
  {
    title: "Your own laptop stays free",
    body: "The render runs on the rented machine, not yours — so you keep modelling, drafting or answering email while it works.",
  },
  {
    title: "One drive, not a pen drive",
    body: "Project files live on shared storage in our Bengaluru facility, mapped into every session. Sign in from a different laptop in a different city and the same work is there.",
  },
  {
    title: "It is wherever you are",
    body: "A site visit, a client's office, home. A steady connection matters more than a fast one — around 25 Mbps is a sensible floor, and worth testing before you promise a live demo.",
  },
];

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
            Built entirely from what you entered, over 48 working weeks. We have not assumed a
            saving on your behalf.
          </p>

          {/* The money is the easiest part to argue and the smallest part of the
              answer, so it is followed immediately by the things a rupee figure
              cannot hold. All four are structural claims — where the machine is,
              where the files are — not performance ones, which is what keeps
              them true for every scene and every studio.

              Deliberately NOT here: anything about render times or "no more
              overnight renders". That is scene-dependent, unverifiable before
              seeing the file, and the first customer whose scene still takes two
              hours has been mis-sold. */}
          <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
            {BEYOND.map((b) => (
              <div key={b.title} className="border-t border-rule pt-4">
                <h3 className="text-[15px] font-semibold text-ink">{b.title}</h3>
                <p className="mt-1.5 text-[14.5px] leading-[1.6] text-ink-2">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
