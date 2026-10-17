/**
 * The workstation spec as a real HTML table (SEO review 18 Oct 2026, open
 * since the 13 Oct audit): a <dl> of div rows reads fine to a person but is
 * not a table to a crawler or an answer engine that lifts tabular facts.
 * Same look as the old list: one bordered card, a rule between rows.
 */
export function SpecTable({ rows, caption, showCaption = false }: { rows: [string, string][]; caption?: string; showCaption?: boolean }) {
  return (
    <div className="mt-8 overflow-hidden rounded-cf border border-rule bg-paper-2">
      <table className="block w-full border-collapse text-sm sm:table">
        {caption ? (
          <caption className={showCaption ? "px-5 pt-4 text-left text-[13px] font-semibold tracking-[0.06em] text-ink-2 uppercase" : "sr-only"}>{caption}</caption>
        ) : null}
        <tbody className="block sm:table-row-group">
          {rows.map(([k, v], i) => (
            <tr key={k} className={`block sm:table-row ${i > 0 ? "border-t border-rule" : ""}`}>
              <th scope="row" className="block px-5 pt-4 pb-1 text-left sm:table-cell align-baseline font-normal text-ink-2 sm:py-4">
                {k}
              </th>
              <td className="block px-5 pb-4 font-medium sm:table-cell break-words text-ink sm:py-4 sm:text-right">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Visible content date, small and quiet, for pages answer engines quote. */
export function LastUpdated({ date, className = "" }: { date: string; className?: string }) {
  return <p className={`text-[13px] leading-5 text-ink-3 ${className}`}>Last updated {date}</p>;
}
