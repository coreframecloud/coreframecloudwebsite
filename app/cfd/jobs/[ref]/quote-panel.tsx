"use client";

/**
 * The quote (owner, 16 Oct 2026): one table, simple words, the whole
 * calculation visible. Columns are the packages (pick one by its heading);
 * rows go base fee → compute → subtotal → introductory discount → price
 * before GST → GST → total held, then the compute time, when it counts as
 * converged, and the two delivery speeds with their estimated start and
 * results in the viewer's own time zone. Every number comes from the API
 * (quote.packages[].breakdown); nothing is recomputed here.
 *
 * Phones (360 px): the table shows the label column and the chosen package
 * only; the package switch sits above it. No sideways page scroll.
 *
 * Same POST /pay body as before: {package, stop_when_settled, express}.
 */
import { useState } from "react";
import Link from "next/link";
import { type Currency } from "@/lib/money";
import {
  fmtDate,
  fmtNumber,
  money,
  moneyValue,
  rupeeWords,
  type CfdJob,
  type ExpressDeliveryPkg,
  type NormalDeliveryPkg,
  type Quote,
  type QuotePackage,
} from "@/lib/cfd-job";
import { type WalletLine } from "@/lib/cfd-job";
import { ActionErrorView, Body, Card, Fine, More, PrimaryButton, WalletRow, When, signInHref, type ActionError } from "./parts";

export function hoursWords(h: { low: number; high: number }): string {
  const f = (x: number) => (x < 1 ? `${Math.max(5, Math.round((x * 60) / 5) * 5)} min` : `${Number(x.toFixed(1))} h`);
  return `${f(h.low)}–${f(h.high)}`;
}

/** 1.2 → "1.2", 1 → "1": cells in millions, written simply. */
function millions(m: number): string {
  return Number(m.toPrecision(3)).toLocaleString("en-IN");
}

type Row = {
  key: string;
  label: React.ReactNode;
  cell: (p: QuotePackage, i: number) => React.ReactNode;
  strong?: boolean;
  /** a section heading row ("Delivery") */
  section?: boolean;
};

export function QuotePanel({
  job,
  quote,
  cur,
  wallet,
  signedIn,
  busy,
  error,
  onPay,
  onRequote,
}: {
  job: CfdJob;
  quote: Quote;
  cur: Currency;
  wallet: WalletLine | null | "signed_out";
  signedIn: boolean;
  busy: boolean;
  error: ActionError;
  onPay: (body: { package: string; stop_when_settled: boolean; express: boolean }) => void;
  onRequote: () => void;
}) {
  const pkgs = quote.packages ?? [];
  const [choice, setChoice] = useState<string>(quote.default_package ?? pkgs[0]?.package ?? "");
  const [express, setExpress] = useState(false);
  const [settle, setSettle] = useState(quote.settle_option ? quote.settle_option.default !== false : true);
  const usd = cur === "USD";
  const dv = quote.delivery ?? {};
  const ex = dv.express && dv.express.available ? dv.express : null;
  const exFor = (name: string): ExpressDeliveryPkg | undefined => ex?.packages.find((x) => x.package === name);
  const nmFor = (name: string): NormalDeliveryPkg | undefined => dv.normal?.packages?.find((x) => x.package === name);
  const pkg = pkgs.find((p) => p.package === choice) ?? pkgs[0];
  const exPkg = pkg ? exFor(pkg.package) : undefined;
  const useExpress = express && !!exPkg;
  const amount = useExpress ? moneyValue(exPkg!.hold) : moneyValue(pkg?.hold);
  const email = job.payment?.account_email;

  if (quote.expired) {
    return (
      <Card tone="action" eyebrow="Next step" title="This quote has expired">
        <Body>
          Quotes are valid for seven days. A fresh quote is built from your existing mesh and costs the quote fee
          {job.quote_fee ? ` (${money(job.quote_fee.total, cur)}${usd ? "" : " incl. GST"})` : ""}.
        </Body>
        <div className="mt-5">
          {signedIn ? (
            <PrimaryButton onClick={onRequote} busy={busy}>
              Get a fresh quote{job.quote_fee ? ` · ${money(job.quote_fee.total, cur)}` : ""}
            </PrimaryButton>
          ) : (
            <Link href={signInHref(job.ref_id)} className="cf-btn-primary w-full sm:w-auto">
              Sign in to continue
            </Link>
          )}
        </div>
        <div className="mt-4">
          <WalletRow wallet={wallet} cur={cur} need={moneyValue(job.quote_fee?.total)} refId={job.ref_id} email={email} />
        </div>
        <ActionErrorView error={error} refId={job.ref_id} email={email} />
      </Card>
    );
  }

  const anyDiscount = pkgs.some((p) => p.breakdown?.discount);
  const anyAdjust = pkgs.some((p) => p.breakdown?.adjustment);
  const minimumPkgs = pkgs.filter((p) => p.breakdown?.minimum_applies);
  const promiseH = dv.normal?.promise_hours ?? 24;
  const m = (v: unknown) => money(v as string, cur);

  const rows: Row[] = [
    {
      key: "iter",
      label: "Iterations (up to)",
      cell: (p) =>
        p.compute_label ? p.compute_label.replace(/^Compute, up to /, "") : fmtNumber(p.iterations),
    },
    { key: "base", label: "Base fee", cell: (p) => (p.breakdown ? m(p.breakdown.base_fee) : m(p.base_fee)) },
    {
      key: "compute",
      label: (
        <>
          Compute <span className="text-ink-3">(cells × iterations)</span>
        </>
      ),
      cell: (p) => {
        const b = p.breakdown;
        if (!b) return m(p.compute_ex_gst);
        const f = b.compute_formula;
        return (
          <>
            {m(b.compute)}
            {f.rate_per_mcell_per_kiter && !p.compute_label ? (
              <span className="mt-0.5 block text-[12px] leading-[1.45] text-ink-3">
                {millions(f.mcells)} M cells × {fmtNumber(f.iterations)} it.
                {f.factor !== 1 ? ` × ${f.factor}` : ""} at {m(f.rate_per_mcell_per_kiter)}
              </span>
            ) : null}
          </>
        );
      },
    },
    ...(anyAdjust
      ? [
          {
            key: "adj",
            label: minimumPkgs.length ? "Minimum charge top-up*" : "Rounded up",
            cell: (p: QuotePackage) =>
              p.breakdown?.adjustment ? m(p.breakdown.adjustment) : <span className="text-ink-3">–</span>,
          },
        ]
      : []),
    ...(anyDiscount
      ? [
          { key: "sub", label: "Subtotal", cell: (p: QuotePackage) => m(p.breakdown?.subtotal ?? p.list_price_ex_gst) },
          {
            key: "disc",
            label: `Introductory discount (${pkgs.find((p) => p.breakdown?.discount_percent)?.breakdown?.discount_percent ?? 50}%)`,
            cell: (p: QuotePackage) => (p.breakdown?.discount ? `−${m(p.breakdown.discount)}` : "–"),
          },
        ]
      : []),
    { key: "ex", label: usd ? "Price" : "Price before GST", cell: (p) => m(p.breakdown?.price_ex_gst ?? p.price_ex_gst) },
    {
      key: "gst",
      label: usd ? "No GST (export)" : `GST ${quote.gst_rate_percent ?? 18}%`,
      cell: (p) => (usd ? "–" : m(p.breakdown?.gst ?? p.gst)),
    },
    {
      key: "total",
      label: "Total held in your wallet",
      strong: true,
      cell: (p) => m(p.breakdown?.hold ?? p.hold),
    },
    { key: "time", label: "Compute time (estimate)", cell: (p) => hoursWords(p.estimated_compute_hours) },
    { key: "conv", label: "Converged when", cell: (p) => p.convergence_short ?? "" },
    ...(dv.normal
      ? [
          { key: "dn", label: "Normal delivery", section: true, cell: () => null },
          {
            key: "n-start",
            label: "Estimated start",
            cell: (p: QuotePackage) => {
              const n = nmFor(p.package);
              if (!n?.start_at) return "Joins the queue";
              return n.start_now ? "Now" : <When iso={n.start_at} />;
            },
          },
          {
            key: "n-res",
            label: "Estimated results",
            cell: (p: QuotePackage) => {
              const n = nmFor(p.package);
              return n?.results_at ? <When iso={n.results_at} /> : `Within ${promiseH} h`;
            },
          },
          { key: "n-prom", label: "Guaranteed", cell: () => `Within ${promiseH} h of payment` },
        ]
      : []),
    ...(ex
      ? [
          {
            key: "dx",
            label: `Express (${ex.multiplier ?? 3}× the price)`,
            section: true,
            cell: () => null,
          },
          {
            key: "x-price",
            label: "Total held in your wallet",
            cell: (p: QuotePackage) => {
              const x = exFor(p.package);
              return x ? m(x.hold) : <span className="text-ink-3">Not offered</span>;
            },
          },
          { key: "x-start", label: "Estimated start", cell: (p: QuotePackage) => (exFor(p.package) ? "Now" : "–") },
          {
            key: "x-res",
            label: "Estimated results",
            cell: (p: QuotePackage) => {
              const x = exFor(p.package);
              return x?.results_at ? <When iso={x.results_at} /> : x ? x.eta_text ?? "" : "–";
            },
          },
        ]
      : []),
  ];

  const rate = pkgs.find((p) => p.breakdown?.compute_formula.rate_per_mcell_per_kiter)?.breakdown;

  return (
    <Card tone="action" eyebrow="Next step" title="Your quote">
      {/* phones: pick the package here; the table shows that column only */}
      {pkgs.length > 1 ? (
        <div role="radiogroup" aria-label="Package" className="mb-4 flex gap-2 sm:hidden">
          {pkgs.map((p) => (
            <button
              key={p.package}
              type="button"
              role="radio"
              aria-checked={p.package === choice}
              onClick={() => setChoice(p.package)}
              className={`min-h-11 flex-1 rounded-full px-3 text-[14px] font-medium ${
                p.package === choice ? "bg-ink text-white" : "text-ink ring-1 ring-rule-strong"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full border-collapse text-[14px] text-ink-2">
          <thead>
            <tr>
              <th scope="col" className="w-[44%] pb-3 text-left align-bottom font-mono text-[11px] font-normal tracking-[0.12em] text-ink-3 uppercase sm:w-auto">
                <span className="sr-only">Line</span>
              </th>
              {pkgs.map((p) => {
                const sel = p.package === choice;
                return (
                  <th
                    key={p.package}
                    scope="col"
                    className={`rounded-t-[14px] px-3 pt-3 pb-3 text-right align-bottom font-normal ${sel ? "bg-paper-2" : "hidden sm:table-cell"}`}
                  >
                    <label className="flex cursor-pointer items-center justify-end gap-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink">
                      <input
                        type="radio"
                        name="package"
                        checked={sel}
                        onChange={() => setChoice(p.package)}
                        className="size-4 shrink-0 accent-ink"
                      />
                      <span className="font-heading text-[18px] font-medium text-ink">{p.label}</span>
                    </label>
                    {p.package === quote.default_package && pkgs.length > 1 ? (
                      <span className="mt-1 block font-mono text-[11px] tracking-[0.12em] text-ink-3 uppercase">Suggested</span>
                    ) : null}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) =>
              r.section ? (
                <tr key={r.key}>
                  <th
                    scope="rowgroup"
                    colSpan={pkgs.length + 1}
                    className="pt-5 pb-1.5 text-left font-mono text-[11px] font-normal tracking-[0.12em] text-ink-3 uppercase"
                  >
                    {r.label}
                  </th>
                </tr>
              ) : (
                <tr key={r.key} className="border-t border-rule">
                  <th scope="row" className={`py-2 pr-3 text-left align-top font-normal ${r.strong ? "font-medium text-ink" : ""}`}>
                    {r.label}
                  </th>
                  {pkgs.map((p, i) => {
                    const sel = p.package === choice;
                    return (
                      <td
                        key={p.package}
                        className={`px-3 py-2 text-right align-top ${sel ? "bg-paper-2" : "hidden sm:table-cell"} ${
                          r.strong ? "font-medium text-ink" : "text-ink"
                        }`}
                      >
                        {r.strong && sel ? (
                          <span className="rounded bg-hl px-1.5 py-0.5">{r.cell(p, i)}</span>
                        ) : (
                          r.cell(p, i)
                        )}
                      </td>
                    );
                  })}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 space-y-1">
        {rate ? (
          <Fine>
            Compute = million cells × thousands of iterations × the rate per million cells per 1,000 iterations
            {rate.compute_formula.rate_after_discount
              ? usd
                ? " (at the regular price; the introductory discount halves it)"
                : ` (at the regular price; after the introductory discount the rate is ${m(rate.compute_formula.rate_after_discount)})`
              : ""}
            {usd ? "" : ", before GST"}.
          </Fine>
        ) : null}
        {minimumPkgs.length ? (
          <Fine>
            * {minimumPkgs.map((p) => `${p.label}: the minimum price is ${m(p.breakdown!.minimum_charge)}${usd ? "" : " before GST"}`).join("; ")}.
            Base fee plus compute come to less, so the difference is added.
          </Fine>
        ) : null}
        {dv.express && !dv.express.available && dv.express.unavailable ? <Fine>{dv.express.unavailable}</Fine> : null}
      </div>

      {ex && exPkg ? (
        <fieldset className="mt-6">
          <legend className="mb-2 font-mono text-[12px] tracking-[0.14em] text-ink-3 uppercase">Delivery</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <SpeedOption
              name="Normal"
              selected={!useExpress}
              onSelect={() => setExpress(false)}
              price={pkg ? m(pkg.hold) : ""}
            />
            <SpeedOption name="Express" selected={useExpress} onSelect={() => setExpress(true)} price={m(exPkg.hold)} />
          </div>
        </fieldset>
      ) : null}

      {quote.settle_option ? (
        <label className="mt-5 flex cursor-pointer items-start gap-3 text-[14px] leading-[1.55] text-ink-2">
          <input
            type="checkbox"
            checked={settle}
            onChange={(e) => setSettle(e.target.checked)}
            className="mt-1 size-4 shrink-0 accent-ink"
          />
          <span>{quote.settle_option.text}</span>
        </label>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {signedIn ? (
          <PrimaryButton
            busy={busy}
            onClick={() => pkg && onPay({ package: pkg.package, stop_when_settled: settle, express: useExpress })}
          >
            Pay {money(amount, cur)} and start
          </PrimaryButton>
        ) : (
          <Link href={signInHref(job.ref_id)} className="cf-btn-primary w-full sm:w-auto">
            Sign in to pay
          </Link>
        )}
        {quote.expires_at ? <Fine>Quote valid until {fmtDate(quote.expires_at)}.</Fine> : null}
      </div>
      <Fine className="mt-3">You pay only for the iterations run; the unused part of the hold comes back to your wallet.</Fine>
      <div className="mt-4">
        <WalletRow wallet={wallet} cur={cur} need={amount} refId={job.ref_id} email={email} />
      </div>
      <ActionErrorView error={error} refId={job.ref_id} email={email} />
    </Card>
  );
}

function SpeedOption({
  name,
  selected,
  onSelect,
  price,
}: {
  name: string;
  selected: boolean;
  onSelect: () => void;
  price: string;
}) {
  return (
    <label
      className={`flex min-h-11 min-w-0 cursor-pointer items-center gap-3 rounded-[16px] bg-paper px-4 py-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink ${
        selected ? "ring-2 ring-ink" : "ring-1 ring-rule-strong hover:ring-ink/40"
      }`}
    >
      <input type="radio" name="speed" checked={selected} onChange={onSelect} className="size-4 shrink-0 accent-ink" />
      <span className="flex min-w-0 flex-1 items-baseline justify-between gap-2">
        <span className="text-[15px] font-medium text-ink">{name}</span>
        <span className="text-[14px] text-ink">{price}</span>
      </span>
    </label>
  );
}

/** "How billing works": the full terms, the exact convergence rule, the mesh. Folded away. */
export function QuoteDetails({ job, quote }: { job: CfdJob; quote: Quote; cur?: Currency }) {
  const o = quote.outcomes ?? {};
  const mq = quote.mesh_quality ?? {};
  const wl = mq.wall_layers;
  const wlWords: Record<string, string> = {
    lowre: "fine wall layers (y+ ≈ 1)",
    wallfn: "wall layers (y+ ≈ 50, wall functions)",
    off: "no wall layers",
  };
  return (
    <More summary="How billing works">
      <ul className="list-disc space-y-1 pl-5 text-[13px] leading-[1.6] text-ink-2">
        {quote.pay_line ? <li>{rupeeWords(quote.pay_line)}</li> : null}
        {[o.converged, o.not_converged, o.diverged_or_failed, o.cancelled].filter(Boolean).map((t) => (
          <li key={t}>{rupeeWords(t)}</li>
        ))}
        {quote.delivery?.express?.available && quote.delivery.express.text ? (
          <li>{rupeeWords(quote.delivery.express.text)}</li>
        ) : null}
        {quote.settle_option?.detail ? <li>{quote.settle_option.detail}</li> : null}
      </ul>
      <div>
        <p className="text-[14px] font-medium text-ink">When a run counts as converged</p>
        <ul className="mt-1.5 space-y-1.5 text-[13px] leading-[1.6] text-ink-2">
          {(quote.packages ?? []).map((p) => (
            <li key={p.package}>
              <span className="font-medium text-ink">{p.label}:</span> {p.convergence}
            </li>
          ))}
        </ul>
        <Fine className="mt-1.5">Compute times are estimates of machine time, not a completion date.</Fine>
      </div>
      <div>
        <p className="text-[14px] font-medium text-ink">Mesh and model</p>
        <ul className="mt-1.5 space-y-1 text-[13px] leading-[1.6] text-ink-2">
          {quote.cells ? (
            <li>
              Mesh: {fmtNumber(quote.cells)} cells
              {mq.max_non_orthogonality != null ? ` · max non-orthogonality ${Math.round(mq.max_non_orthogonality)}°` : ""}
              {mq.max_skewness != null ? ` · max skewness ${Number(mq.max_skewness).toFixed(2)}` : ""}
              {mq.mesh_ok ? " · mesh checks passed" : ""}
            </li>
          ) : null}
          {wl?.used ? (
            <li>
              Near-wall mesh: {wlWords[wl.used] ?? wl.used}
              {wl.coverage_pct ? ` on ${fmtNumber(wl.coverage_pct)}% of the wall` : ""}
              {wl.fallback ? " (the finer layers could not be added everywhere, so this is the fallback)" : ""}
            </li>
          ) : null}
          {(mq.warnings ?? []).map((w) => (
            <li key={w}>{w}</li>
          ))}
          {quote.bounding_box_m ? (
            <li>Model size (bounding box): {quote.bounding_box_m.map((v) => Number(v).toPrecision(3)).join(" × ")} m</li>
          ) : null}
          {quote.physics ? <li>Physics: {quote.physics}</li> : null}
          {job.quote?.expires_at ? <li>Quote valid until {fmtDate(job.quote.expires_at)}</li> : null}
        </ul>
      </div>
    </More>
  );
}
