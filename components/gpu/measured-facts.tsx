import Link from "next/link";
import type { MeasuredFact } from "@/lib/software-facts";

/**
 * "Measured here" on a software page: an HTML table of the figures a buyer
 * asks for, each either a value we measured on our own workstation (with the
 * GPU and date beside it) or "measured on request".
 *
 * The wording is the rule: we publish only numbers measured on our own
 * hardware. A null value is not hidden, it is shown as not-yet-measured, with
 * a way to ask for it. Nothing here is schema'd until it is measured, so an
 * answer engine cannot lift a placeholder as a fact.
 */
export function MeasuredFacts({ app, rows, className = "" }: { app: string; rows: MeasuredFact[]; className?: string }) {
  if (!rows.length) return null;
  const measured = rows.filter((r) => r.value && r.measuredOn && r.measuredAt);
  return (
    <section className={className}>
      <h2 className="cf-section-title">How {app} runs here: measured, not quoted.</h2>
      <p className="cf-section-copy mt-4">
        {measured.length
          ? `The figures below were measured on our own workstation, with the GPU and date beside each one. Your scene and settings will differ; these are the reference runs.`
          : `We publish only figures we have measured on our own workstation, and we have not published ${app} timings yet. Each row says so. Ask and we will run your scene, or a reference one, and send the numbers.`}
      </p>
      <div className="mt-6 overflow-hidden rounded-cf border border-rule bg-paper-2">
        <table className="block w-full border-collapse text-sm sm:table">
          <caption className="sr-only">{app} on a Coreframe workstation: measured figures and what has not been measured yet</caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">What was measured</th>
              <th scope="col">Result</th>
            </tr>
          </thead>
          <tbody className="block sm:table-row-group">
            {rows.map((r, i) => {
              const done = !!(r.value && r.measuredOn && r.measuredAt);
              return (
                <tr key={r.label} className={`block sm:table-row ${i > 0 ? "border-t border-rule" : ""}`}>
                  <th scope="row" className="block px-5 pt-4 pb-1 text-left align-baseline font-normal text-ink-2 sm:table-cell sm:py-4">
                    {r.label}
                  </th>
                  <td className="block px-5 pb-4 sm:table-cell sm:py-4 sm:text-right">
                    {done ? (
                      <>
                        <span className="font-medium text-ink">{r.value}</span>
                        <span className="block text-[12px] leading-5 text-ink-3">
                          {r.measuredOn} · <time dateTime={r.measuredAt}>{r.measuredAt}</time>
                          {r.method ? ` · ${r.method}` : ""}
                        </span>
                      </>
                    ) : (
                      <span className="text-ink-3">Measured on request</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-[13px] leading-5 text-ink-3">
        Want a number before you top up?{" "}
        <Link href="/request-demo" className="underline underline-offset-4">
          Ask for a measured run
        </Link>
        . We will tell you the GPU, the scene and the settings with every figure.
      </p>
    </section>
  );
}
