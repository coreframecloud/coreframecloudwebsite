"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";
import SpendBar from "@/components/team/spend-bar";
import {
  errMsg,
  errorText,
  inputCls,
  jsonBody,
  limitPercent,
  money,
  okMsg,
  quietBtn,
  readJson,
  roleLabel,
  shortDate,
  solidBtn,
  teamApi,
  teamCurrency,
  type MyTeam,
} from "@/lib/team";

/** The one sentence a join request ever gets back (owner, 20 Oct 2026). */
const GENERIC_SENT =
  "If that email belongs to a Coreframe team admin, they'll get your request. We'll tell you when you're approved.";

/**
 * Account page, Teams v2 (20 Oct 2026): "Your team" for a member, "Connect
 * with my team" for someone in no team, and any invites waiting with
 * Accept / Decline. Reads GET /me/team; renders nothing on an API that
 * predates it.
 */
export default function MyTeamCard({ onTeamChanged }: { onTeamChanged?: (team: MyTeam | null) => void }) {
  const id = useId();
  const [team, setTeam] = useState<MyTeam | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async (): Promise<MyTeam | null> => {
    try {
      const res = await teamApi("/me/team");
      const t = res.ok ? ((await res.json()) as MyTeam) : null;
      setTeam(t);
      return t;
    } catch {
      setTeam(null);
      return null;
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!loaded || !team) return null;

  const cur = teamCurrency(team.currency);
  const inTeam = team.organization != null;
  const pendingTo = team.pending_request?.sent_to_email ?? sentTo;

  async function act(key: string, path: string, init: RequestInit, ok: string | null, fail: string, changesTeam = false) {
    setBusy(key);
    setMsg(null);
    try {
      const res = await teamApi(path, init);
      const body = await readJson(res);
      if (res.status === 429) throw new Error(errorText(body, "You've sent this recently. Try again later."));
      if (!res.ok) throw new Error(errorText(body, fail));
      if (ok) setMsg({ ok: true, text: ok });
      const fresh = await load();
      if (changesTeam) onTeamChanged?.(fresh);
      return true;
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : fail });
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function sendRequest(e: React.FormEvent) {
    e.preventDefault();
    const email = adminEmail.trim();
    if (!email) return;
    setBusy("join");
    setMsg(null);
    try {
      const res = await teamApi("/me/team/join-request", jsonBody("POST", { admin_email: email }));
      if (res.status === 429) {
        throw new Error(errorText(await readJson(res), "Too many requests for now. Try again in an hour."));
      }
      if (!res.ok) throw new Error(errorText(await readJson(res), "The request didn't go through. Try again."));
      // Whatever the API knows, the screen says the same thing.
      setSentTo(email);
      setAdminEmail("");
      await load();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "The request didn't go through." });
    } finally {
      setBusy(null);
    }
  }

  async function cancelRequest() {
    const ok = await act("cancel", "/me/team/join-request", { method: "DELETE" }, null, "Couldn't cancel the request.");
    if (ok) setSentTo(null);
  }

  const invites = team.invites ?? [];
  const invitesBlock = invites.length > 0 && (
    <div className="mt-6">
      <p className="cf-eyebrow">{inTeam ? "Invites" : "Or, if you were invited"}</p>
      <ul className="mt-3 space-y-3">
        {invites.map((inv) => {
          const icur = teamCurrency(inv.currency, cur);
          return (
            <li key={inv.id} className="cf-glass-inset flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1 basis-56">
                <p className="text-sm text-ink">
                  <span className="font-semibold">{inv.organization_name}</span> invited you
                  {inv.role === "org_admin" ? " as an admin" : ""}.
                </p>
                <p className="mt-0.5 text-xs text-ink-2">
                  {inv.monthly_spend_limit != null
                    ? `Monthly limit ${money(inv.monthly_spend_limit, icur)}`
                    : "No monthly limit"}
                  {inv.invited_by_name ? ` · from ${inv.invited_by_name}` : ""}
                  {inv.expires_at ? ` · until ${shortDate(inv.expires_at)}` : ""}
                </p>
                {inTeam && (
                  <p className="mt-1 text-xs text-ink-3">Accepting moves you from {team.organization!.name}.</p>
                )}
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() =>
                    void act("decline", `/me/team/invites/${encodeURIComponent(String(inv.id))}/decline`, { method: "POST" }, "Invite declined.", "Couldn't decline the invite.")
                  }
                  className={`${quietBtn} flex-1 sm:flex-none`}
                  aria-label={`Decline the invite from ${inv.organization_name}`}
                >
                  Decline
                </button>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() =>
                    void act("accept", `/me/team/invites/${encodeURIComponent(String(inv.id))}/accept`, { method: "POST" }, `You're in ${inv.organization_name}.`, "Couldn't accept the invite.", true)
                  }
                  className={`${solidBtn} flex-1 sm:flex-none`}
                  aria-label={`Accept the invite from ${inv.organization_name}`}
                >
                  {busy === "accept" ? "…" : "Accept"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {!inTeam && (
        <p className="mt-3 text-xs leading-5 text-ink-3">
          Invites appear here when you sign in with the email you were invited at.
        </p>
      )}
    </div>
  );

  const status = <div aria-live="polite">{msg && <p className={`mt-4 ${msg.ok ? okMsg : errMsg}`}>{msg.text}</p>}</div>;

  // ── In a team ────────────────────────────────────────────────────────────
  if (inTeam) {
    const org = team.organization!;
    const pct = limitPercent(team.spend_this_month, team.monthly_spend_limit);
    const admins = team.admins ?? [];
    const rows: [string, React.ReactNode][] = [
      ["Company", org.name],
      [
        admins.length > 1 ? "Account admins" : "Account admin",
        admins.length ? (
          <span className="space-y-0.5">
            {admins.map((a) => (
              <span key={a.email} className="block break-all">
                {a.full_name ? `${a.full_name} · ` : ""}
                {a.email}
              </span>
            ))}
          </span>
        ) : (
          "—"
        ),
      ],
      ["Workstation time is paid from", "Company wallet"],
    ];
    return (
      <section className="cf-glass p-5 sm:p-6" aria-labelledby={`${id}-h`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id={`${id}-h`} className="cf-section-title">Your team.</h2>
          <span className="rounded-full border border-rule-strong bg-paper-2 px-2.5 py-0.5 text-xs font-medium text-ink-2">
            {roleLabel(team.role)}
          </span>
        </div>
        <dl className="mt-4 divide-y divide-rule border-t border-rule">
          {rows.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <dt className="text-sm text-ink-2">{k}</dt>
              <dd className="text-sm text-ink sm:text-right">{v}</dd>
            </div>
          ))}
          <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <dt className="text-sm text-ink-2">Your spend this month</dt>
            <dd className="sm:text-right">
              <SpendBar
                spend={team.spend_this_month}
                limit={team.monthly_spend_limit}
                currency={cur}
                className="sm:flex sm:flex-col sm:items-end"
              />
            </dd>
          </div>
        </dl>

        {pct !== null && pct >= 80 && (
          <div className="cf-glass-inset mt-4 border-l-2! border-l-blue! px-4 py-3" role="status">
            <p className="text-sm leading-6 text-ink">
              {pct >= 100
                ? "You've reached your monthly limit. New sessions wait until an admin raises it."
                : "You've used most of your monthly limit."}
            </p>
          </div>
        )}

        {team.is_admin ? (
          <div className="mt-4">
            <Link href="/org-admin" className="text-sm font-medium text-blue transition hover:text-blue-ink">
              Manage the team in the Org Portal →
            </Link>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-xs leading-5 text-ink-2">
              Need a higher limit, or the wallet topped up? Your admin gets an email.
            </p>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() =>
                void act("remind", "/me/team/remind-admin", { method: "POST" }, "Your admin has been emailed.", "Couldn't reach your admin. Try again later.")
              }
              className={`${quietBtn} w-full sm:w-auto`}
            >
              {busy === "remind" ? "Sending…" : "Ask my admin"}
            </button>
          </div>
        )}
        {status}
        {invitesBlock}
      </section>
    );
  }

  // ── No team: request sent ──────────────────────────────────────────────────
  if (pendingTo) {
    return (
      <section className="cf-glass p-5 sm:p-6" aria-labelledby={`${id}-h`}>
        <p className="cf-eyebrow">Your company</p>
        <h2 id={`${id}-h`} className="cf-section-title mt-3">Request sent.</h2>
        <p className="mt-2 text-[15px] leading-7 text-ink-2">{GENERIC_SENT}</p>
        <dl className="mt-4 divide-y divide-rule border-t border-rule">
          <div className="flex flex-wrap justify-between gap-2 py-3">
            <dt className="text-sm text-ink-2">Sent to</dt>
            <dd className="text-sm break-all text-ink">{pendingTo}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2 py-3">
            <dt className="text-sm text-ink-2">Status</dt>
            <dd className="text-sm font-medium text-ink">Waiting for approval</dd>
          </div>
        </dl>
        <button type="button" onClick={() => void cancelRequest()} disabled={busy !== null} className={`${quietBtn} mt-2 w-full sm:w-auto`}>
          {busy === "cancel" ? "Cancelling…" : "Cancel request"}
        </button>
        {status}
        {invitesBlock}
      </section>
    );
  }

  // ── No team: connect ──────────────────────────────────────────────────────
  return (
    <section className="cf-glass p-5 sm:p-6" aria-labelledby={`${id}-h`}>
      <p className="cf-eyebrow">Your company</p>
      <h2 id={`${id}-h`} className="cf-section-title mt-3">Connect with my team.</h2>
      <p className="mt-2 text-[15px] leading-7 text-ink-2">
        Type the email of your company&rsquo;s Coreframe admin. Once they approve, your company pays for
        workstation time and you get the shared project drive.
      </p>
      <form onSubmit={sendRequest} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor={`${id}-admin`} className="mb-1.5 block text-xs font-medium text-ink-2">
            Your admin&rsquo;s email
          </label>
          <input
            id={`${id}-admin`}
            type="email"
            required
            autoComplete="off"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className={inputCls}
          />
        </div>
        <button type="submit" disabled={busy !== null} className={`${quietBtn} w-full sm:w-auto`}>
          {busy === "join" ? "Sending…" : "Send request"}
        </button>
      </form>
      {status}
      {invitesBlock}
    </section>
  );
}
