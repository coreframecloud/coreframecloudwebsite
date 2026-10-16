"use client";

/**
 * The quote: choose a package and a delivery speed, then pay from the wallet.
 * Same choices and the same POST /pay body as the API page
 * ({package, stop_when_settled, express}); the fine print sits in a
 * collapsible below, word for word from the API.
 */
import { useState } from "react";
import Link from "next/link";
import { type Currency } from "@/lib/money";
import {
  firstSentence,
  fmtDate,
  fmtNumber,
  money,
  moneyValue,
  rupeeWords,
  type CfdJob,
  type Quote,
  type QuotePackage,
  type WalletLine,
} from "@/lib/cfd-job";
import { ActionErrorView, Body, Card, Fine, More, PrimaryButton, WalletRow, signInHref, type ActionError } from "./parts";

function cap1(s: string | undefined): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

function hoursWords(h: { low: number; high: number }): string {
  const f = (x: number) => (x < 1 ? `${Math.max(5, Math.round((x * 60) / 5) * 5)} min` : `${Number(x.toFixed(1))} h`);
  return h.high < 1 ? `${f(h.low)}–${f(h.high)}` : `${f(h.low)}–${f(h.high)}`;
}

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
  const exPkg = ex?.packages.find((p) => p.package === choice) ?? null;
  const pkg = pkgs.find((p) => p.package === choice) ?? pkgs[0];
  const useExpress = express && !!exPkg;
  const amount = useExpress ? moneyValue(exPkg!.hold) : moneyValue(pkg?.hold);
  const normalPkg = dv.normal?.packages?.find((p) => p.package === choice);
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

  return (
    <Card tone="action" eyebrow="Next step" title="Choose a package and start">
      <fieldset>
        <legend className="sr-only">Package</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {pkgs.map((p) => (
            <PackageCard
              key={p.package}
              p={p}
              cur={cur}
              selected={p.package === choice}
              suggested={p.package === quote.default_package && pkgs.length > 1}
              expressHold={useExpress ? ex?.packages.find((x) => x.package === p.package)?.hold : undefined}
              onSelect={() => setChoice(p.package)}
            />
          ))}
        </div>
      </fieldset>

      {dv.normal ? (
        <fieldset className="mt-6">
          <legend className="mb-2 font-mono text-[12px] tracking-[0.14em] text-ink-3 uppercase">Delivery</legend>
          <div className={`grid gap-3 ${ex ? "sm:grid-cols-2" : ""}`}>
            <SpeedOption
              name="Normal"
              selected={!useExpress}
              onSelect={() => setExpress(false)}
              lines={
                normalPkg
                  ? [cap1(normalPkg.starts_text), cap1(normalPkg.results_text)]
                  : [rupeeWords(dv.normal.text)]
              }
              price={pkg ? money(pkg.hold, cur) : ""}
            />
            {ex ? (
              <SpeedOption
                name="Express"
                selected={useExpress}
                onSelect={() => setExpress(true)}
                lines={[
                  "Starts now, on a machine for your job alone",
                  cap1(exPkg?.eta_text) || cap1(ex.turnaround),
                ]}
                price={exPkg ? money(exPkg.hold, cur) : ""}
              />
            ) : null}
          </div>
          {dv.express && !dv.express.available && dv.express.unavailable ? (
            <Fine className="mt-2">{dv.express.unavailable}</Fine>
          ) : null}
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
        {quote.expires_at ? <Fine>Quote valid until {fmtDate(quote.expires_at, cur)}.</Fine> : null}
      </div>
      <Fine className="mt-3">{quote.pay_line}</Fine>
      <div className="mt-4">
        <WalletRow wallet={wallet} cur={cur} need={amount} refId={job.ref_id} email={email} />
      </div>
      <ActionErrorView error={error} refId={job.ref_id} email={email} />
    </Card>
  );
}

function PackageCard({
  p,
  cur,
  selected,
  suggested,
  expressHold,
  onSelect,
}: {
  p: QuotePackage;
  cur: Currency;
  selected: boolean;
  suggested: boolean;
  expressHold?: string | number;
  onSelect: () => void;
}) {
  const usd = cur === "USD";
  const price = expressHold ?? p.total;
  return (
    <label
      className={`relative flex min-w-0 cursor-pointer flex-col rounded-[20px] bg-paper p-5 transition-shadow has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink ${
        selected ? "ring-2 ring-ink" : "ring-1 ring-rule-strong hover:ring-ink/40"
      }`}
    >
      <input type="radio" name="package" className="sr-only" checked={selected} onChange={onSelect} />
      <span className="flex items-baseline justify-between gap-2">
        <span className="font-heading text-[20px] font-medium text-ink">{p.label}</span>
        {suggested ? (
          <span className="font-mono text-[11px] tracking-[0.12em] text-ink-3 uppercase">Suggested</span>
        ) : null}
      </span>
      <span className="mt-3 flex flex-wrap items-baseline gap-x-2">
        <span className={`font-heading text-[25px] leading-none font-medium text-ink ${selected ? "rounded bg-hl px-1.5 py-0.5" : ""}`}>
          {money(price, cur)}
        </span>
        {p.list_total && !expressHold ? (
          <s className="text-[13px] text-ink-3">{money(p.list_total, cur)}</s>
        ) : null}
      </span>
      <span className="mt-1.5 text-[13px] text-ink-2">
        {usd ? "No GST (export of services)" : "incl. GST"}
        {p.discount_percent && !expressHold ? ` · introductory price, ${p.discount_percent}% off` : ""}
        {expressHold ? " · express" : ""}
      </span>
      <span className="mt-3 text-[14px] leading-[1.55] text-ink-2">{firstSentence(p.convergence)}</span>
      <span className="mt-2 text-[13px] text-ink-3">
        Up to {p.compute_label ? p.compute_label.replace(/^Compute, up to /, "") : `${fmtNumber(p.iterations)} iterations`} ·
        about {hoursWords(p.estimated_compute_hours)} of compute
      </span>
    </label>
  );
}

function SpeedOption({
  name,
  selected,
  onSelect,
  lines,
  price,
}: {
  name: string;
  selected: boolean;
  onSelect: () => void;
  lines: string[];
  price: string;
}) {
  return (
    <label
      className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-[16px] bg-paper px-4 py-3.5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink ${
        selected ? "ring-2 ring-ink" : "ring-1 ring-rule-strong hover:ring-ink/40"
      }`}
    >
      <input type="radio" name="speed" checked={selected} onChange={onSelect} className="mt-1 size-4 shrink-0 accent-ink" />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="text-[15px] font-medium text-ink">{name}</span>
          <span className="text-[14px] text-ink">{price}</span>
        </span>
        {lines.filter(Boolean).map((l, i) => (
          <span key={i} className="mt-0.5 block text-[13px] leading-[1.5] text-ink-2">
            {l}
          </span>
        ))}
      </span>
    </label>
  );
}

/** The fine print: price lines per package, what you are charged in each outcome, the mesh. */
export function QuoteDetails({ job, quote, cur }: { job: CfdJob; quote: Quote; cur: Currency }) {
  const usd = cur === "USD";
  const o = quote.outcomes ?? {};
  const mq = quote.mesh_quality ?? {};
  const wl = mq.wall_layers;
  const wlWords: Record<string, string> = {
    lowre: "fine wall layers (y+ ≈ 1)",
    wallfn: "wall layers (y+ ≈ 50, wall functions)",
    off: "no wall layers",
  };
  const exPkgs = quote.delivery?.express?.available ? quote.delivery.express.packages : [];
  const rows = (quote.packages ?? []).map((p) => ({
        p,
        lines: [
          ...(usd
            ? []
            : ([
                ["Base fee", money(p.base_fee, cur)],
                [p.compute_label || `Compute, up to ${fmtNumber(p.iterations)} iterations`, money(p.compute_ex_gst, cur)],
              ] as [string, string][])),
          [
            usd ? "Price" : `Price before GST (minimum ${money(p.min_charge, cur)})`,
            money(p.price_ex_gst, cur),
          ] as [string, string],
          [usd ? "GST: none (export of services)" : `GST ${quote.gst_rate_percent ?? 18}%`, money(p.gst, cur)] as [string, string],
          ["Total, held in your wallet when you start", money(p.hold, cur)] as [string, string],
        ],
        express: exPkgs.find((x) => x.package === p.package),
      }));
  return (
    <More summary="Price breakdown, terms and mesh">
      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map(({ p, lines, express }) => (
          <div key={p.package} className="min-w-0">
            <p className="text-[14px] font-medium text-ink">{p.label}</p>
            <table className="mt-1.5 w-full text-[13px] text-ink-2">
              <tbody>
                {lines.map(([k, v]) => (
                  <tr key={k} className="border-b border-rule last:border-0">
                    <td className="py-1.5 pr-3 align-top">{k}</td>
                    <td className="py-1.5 text-right whitespace-nowrap text-ink">{v}</td>
                  </tr>
                ))}
                {express ? (
                  <tr>
                    <td className="py-1.5 pr-3 align-top">Express, held in your wallet</td>
                    <td className="py-1.5 text-right whitespace-nowrap text-ink">{money(express.hold, cur)}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
            <Fine className="mt-2">{p.convergence}</Fine>
            <Fine className="mt-1">
              Estimated compute time {p.estimated_compute_hours.low}–{p.estimated_compute_hours.high} hours.{" "}
              {p.estimated_compute_hours.label}.
            </Fine>
          </div>
        ))}
      </div>
      {quote.delivery?.express?.available && quote.delivery.express.text ? (
        <Fine>{rupeeWords(quote.delivery.express.text)}</Fine>
      ) : null}
      {quote.settle_option?.detail ? <Fine>{quote.settle_option.detail}</Fine> : null}
      <div>
        <p className="text-[14px] font-medium text-ink">What you are charged</p>
        <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[13px] leading-[1.6] text-ink-2">
          {[o.converged, o.not_converged, o.diverged_or_failed, o.cancelled].filter(Boolean).map((t) => (
            <li key={t}>{rupeeWords(t)}</li>
          ))}
        </ul>
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
          {job.quote?.expires_at ? <li>Quote valid until {fmtDate(job.quote.expires_at, cur)}</li> : null}
        </ul>
      </div>
    </More>
  );
}
