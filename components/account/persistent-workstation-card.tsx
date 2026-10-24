"use client";

import { useCallback, useEffect, useState } from "react";
import { formatMoney, parseCurrency, type Currency } from "@/lib/money";
import { errMsg, errorText, inputCls, jsonBody, okMsg, quietBtn, readJson, shortDate, solidBtn, teamApi } from "@/lib/team";

/**
 * My Activity: "Persistent workstation" (owner, 22 Oct 2026). The customer's own
 * Windows disk on the per-session workstations: set it up once (size chosen
 * once, first month taken from the wallet now), see its status, remove it.
 *
 * Reads GET /me/persistent-workstation and renders nothing when the API says
 * the feature is off or predates it. Wording never says "cloud" or names a
 * provider; the card lists the workstations it is available on and says
 * nothing about why another is not (owner, 21 Oct 2026). One account, one
 * dashboard: Connect shows the same status from the same endpoint.
 *
 * v2 (owner, 24 Oct 2026): the disk alone by default; "Also keep a backup" is a
 * paid add-on (a copy of the disk from the last session end), at setup or later
 * (the rest of the month charged now). Without it there is one copy only.
 */

interface Option {
  size_gb: number;
  price: number;
  backup_price?: number;
  currency: string;
}

interface Workstation {
  id: number;
  status: string;
  size_gb: number;
  currency: string;
  monthly_price: number;
  backup?: boolean;
  backup_monthly_price?: number | null;
  monthly_total?: number;
  paid_through: string | null;
  period_start: string | null;
  grace_until: string | null;
  in_use: boolean;
  saving?: boolean;
  boots: number;
  message?: string;
}

interface Status {
  enabled: boolean;
  name: string;
  line: string;
  currency: string;
  options: Option[];
  backup_line?: string;
  available_on: string[];
  available_on_text: string;
  grace_days: number;
  remove_confirm_word?: string;
  workstation: Workstation | null;
  wallet_pooled: boolean;
}

const STATUS_TEXT: Record<string, string> = {
  requested: "Being prepared",
  cloning: "Being prepared",
  snapshotting: "Being prepared",
  ready: "Ready",
  in_use: "In use",
  grace: "Payment due",
  quarantined: "Needs a check",
  deleting: "Being removed",
};

export default function PersistentWorkstationCard({ onChanged }: { onChanged?: () => void }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [size, setSize] = useState<number | null>(null);
  const [backup, setBackup] = useState(false);
  const [confirmSetup, setConfirmSetup] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await teamApi("/me/persistent-workstation");
      const s = res.ok ? ((await res.json()) as Status) : null;
      setStatus(s);
      if (s && size == null && s.options.length) setSize(s.options[0].size_gb);
    } catch {
      setStatus(null);
    } finally {
      setLoaded(true);
    }
  }, [size]);

  useEffect(() => {
    void load();
  }, [load]);

  // A disk being prepared or saved changes state on its own: re-read now and then.
  useEffect(() => {
    const st = status?.workstation?.status;
    if (!st || !(["requested", "cloning", "snapshotting", "deleting"].includes(st) || status?.workstation?.saving)) return;
    const t = setInterval(() => void load(), 15000);
    return () => clearInterval(t);
  }, [status, load]);

  if (!loaded || !status || !status.enabled) return null;

  const cur: Currency = parseCurrency(status.currency) ?? "INR";
  const ws = status.workstation;
  const chosen = status.options.find((o) => o.size_gb === size) ?? status.options[0];
  const backupPrice = (o: Option | undefined) => Number(o?.backup_price ?? 0);
  const hasBackupPrices = status.options.some((o) => o.backup_price != null);
  const setupTotal = chosen ? chosen.price + (backup ? backupPrice(chosen) : 0) : 0;

  const toggleBackup = async (on: boolean) => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await teamApi("/me/persistent-workstation/backup", jsonBody("POST", { backup: on }));
      const body = await readJson(res);
      if (!res.ok) {
        setMsg({ ok: false, text: errorText(body, "The backup could not be changed.") });
        return;
      }
      setStatus(body as Status);
      const charged = Number((body as { charged?: number }).charged ?? 0);
      setMsg({
        ok: true,
        text: on
          ? charged > 0 ? `Backup on. ${formatMoney(charged, cur)} was taken for the rest of this month.` : "Backup on."
          : "Backup off. The backup copy is deleted after your next session ends; this month is not refunded.",
      });
      onChanged?.();
    } catch {
      setMsg({ ok: false, text: "Something went wrong. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  const setup = async () => {
    if (!chosen) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await teamApi("/me/persistent-workstation", jsonBody("POST", { size_gb: chosen.size_gb, backup }));
      const body = await readJson(res);
      if (!res.ok) {
        setMsg({ ok: false, text: errorText(body, "The persistent workstation could not be set up.") });
        return;
      }
      setStatus(body as Status);
      setConfirmSetup(false);
      setMsg({ ok: true, text: `Set up. ${formatMoney(setupTotal, cur)} was taken from your wallet for the first month.` });
      onChanged?.();
    } catch {
      setMsg({ ok: false, text: "Something went wrong. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  const confirmWord = status?.remove_confirm_word ?? "DELETE";

  const remove = async () => {
    if (typed.trim() !== confirmWord) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await teamApi("/me/persistent-workstation", jsonBody("DELETE", { confirm: typed.trim() }));
      const body = await readJson(res);
      if (!res.ok) {
        setMsg({ ok: false, text: errorText(body, "The persistent workstation could not be removed.") });
        return;
      }
      setStatus(body as Status);
      setConfirmRemove(false);
      setTyped("");
      setMsg({ ok: true, text: "Removed. Everything on the disk is deleted; the month already paid is not refunded." });
      onChanged?.();
    } catch {
      setMsg({ ok: false, text: "Something went wrong. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="cf-glass mt-4 p-5 sm:p-6" aria-labelledby="pw-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id="pw-heading" className="cf-eyebrow">
          {status.name}
        </h2>
        {ws && (
          <span className="font-mono text-[11px] whitespace-nowrap text-ink-2">
            {ws.size_gb} GB · {STATUS_TEXT[ws.status] ?? ws.status}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm leading-6 text-ink-2">{status.line}</p>
      {status.available_on_text && (
        <p className="mt-1 text-xs leading-5 text-ink-3">{status.available_on_text}.</p>
      )}

      {ws ? (
        <div className="mt-4 space-y-3">
          <div className="cf-glass-inset flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-4 py-3">
            <span className="text-sm text-ink">
              <b>{formatMoney(ws.monthly_total ?? ws.monthly_price, parseCurrency(ws.currency) ?? cur)} a month</b>
              {ws.paid_through ? <> · paid through {shortDate(ws.paid_through)}</> : null}
            </span>
            {ws.boots > 0 && (
              <span className="font-mono text-xs tabular-nums text-ink-2">
                {ws.boots} session{ws.boots === 1 ? "" : "s"}
              </span>
            )}
          </div>
          {ws.message && (
            <div className={`cf-glass-inset border-l-2! px-4 py-3 text-xs leading-5 ${ws.status === "grace" ? "border-l-destructive! text-ink" : "border-l-blue! text-ink-2"}`}>
              {ws.message}
            </div>
          )}
          {ws.status !== "deleting" && ws.status !== "quarantined" && !["requested", "cloning", "snapshotting"].includes(ws.status) && hasBackupPrices && (
            <div className="cf-glass-inset flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <span className="text-sm text-ink">
                {ws.backup
                  ? <>Backup on · {formatMoney(Number(ws.backup_monthly_price ?? backupPrice(status.options.find((o) => o.size_gb === ws.size_gb))), cur)}/month</>
                  : <>Backup off</>}
              </span>
              <button type="button" className={quietBtn} disabled={busy} onClick={() => void toggleBackup(!ws.backup)}>
                {ws.backup
                  ? "Turn backup off"
                  : `Turn backup on (+${formatMoney(backupPrice(status.options.find((o) => o.size_gb === ws.size_gb)), cur)}/month)`}
              </button>
              <p className="w-full text-xs leading-5 text-ink-3">
                {ws.backup
                  ? "A copy of the disk from your last session end is kept. Turning it off deletes that copy after your next session; no refund for this month."
                  : "Without a backup there is one copy of the disk: if it fails, the apps and files on it are lost (files in your Coreframe drive (N:) are separate). Turning it on charges the rest of this month now."}
              </p>
            </div>
          )}
          <p className="text-xs leading-5 text-ink-3">
            Renews each month from your wallet. If the wallet cannot cover it you have {status.grace_days} days to add funds;
            after that the disk, with everything on it, is deleted. To change the size, remove the disk and set up a new one;
            files are not kept.
          </p>
          {ws.status !== "deleting" && ws.status !== "quarantined" && (
            confirmRemove ? (
              <div className="cf-glass-inset border-l-2! border-l-destructive! px-4 py-3">
                <p className="text-sm font-semibold text-ink">Remove this persistent workstation?</p>
                <p className="mt-1 text-xs leading-5 text-ink-2">
                  Everything on it is deleted: the applications you installed and any files saved on it. Your Coreframe
                  drive (N:) is not affected. The month already paid is not refunded.
                </p>
                <label className="mt-3 block text-xs text-ink-2">
                  Type <b className="font-mono text-ink">{confirmWord}</b> to confirm
                  <input
                    className={`${inputCls} mt-1 font-mono`}
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    aria-label={`Type ${confirmWord} to confirm`}
                  />
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`${solidBtn} bg-destructive! hover:bg-destructive!`}
                    disabled={busy || typed.trim() !== confirmWord}
                    onClick={() => void remove()}
                  >
                    {busy ? "Removing…" : "Remove it"}
                  </button>
                  <button type="button" className={quietBtn} disabled={busy} onClick={() => { setConfirmRemove(false); setTyped(""); }}>
                    Keep it
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className={quietBtn} disabled={busy || ws.in_use || Boolean(ws.saving)} onClick={() => setConfirmRemove(true)}>
                Remove
              </button>
            )
          )}
          {ws.in_use && <p className="text-xs text-ink-3">End your session to remove it.</p>}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Disk size">
            {status.options.map((o) => (
              <button
                key={o.size_gb}
                type="button"
                role="radio"
                aria-checked={chosen?.size_gb === o.size_gb}
                onClick={() => {
                  setSize(o.size_gb);
                  setConfirmSetup(false);
                }}
                className={`rounded-cf border px-3 py-3 text-left transition ${
                  chosen?.size_gb === o.size_gb ? "border-blue bg-blue-soft" : "border-rule hover:bg-paper-2"
                }`}
              >
                <div className="font-display text-lg font-bold tabular-nums text-ink">{o.size_gb} GB</div>
                <div className="font-mono text-xs tabular-nums text-ink-2">{formatMoney(o.price, cur)}/month</div>
              </button>
            ))}
          </div>
          {hasBackupPrices && chosen && (
            <label className="flex items-start gap-2 text-sm text-ink">
              <input type="checkbox" className="mt-1" checked={backup} onChange={(e) => { setBackup(e.target.checked); setConfirmSetup(false); }} />
              <span>
                Also keep a backup (+{formatMoney(backupPrice(chosen), cur)}/month)
                <span className="block text-xs leading-5 text-ink-3">
                  {status.backup_line ?? "A copy of the disk from your last session end, so a disk failure does not lose your apps and files."}
                </span>
              </span>
            </label>
          )}
          <p className="text-xs leading-5 text-ink-3">
            Set it up from Coreframe Connect (Profile) or here. The size is chosen once; there is no resize. Windows and the preinstalled applications use about 30 GB of it.
            The first month is taken from your wallet now and it renews each month; if the wallet cannot cover a renewal you
            have {status.grace_days} days to add funds before the disk is deleted. You can remove it at any time (no refund
            of the current month).
          </p>
          {confirmSetup && chosen ? (
            <div className="cf-glass-inset border-l-2! border-l-blue! px-4 py-3">
              <p className="text-sm font-semibold text-ink">
                Set up a {chosen.size_gb} GB persistent workstation{backup ? " with backup" : ""} for {formatMoney(setupTotal, cur)} a month?
              </p>
              <p className="mt-1 text-xs leading-5 text-ink-2">
                {formatMoney(setupTotal, cur)} is taken from {status.wallet_pooled ? "your team's wallet" : "your wallet"} now
                for the first month. It is ready in about 10 minutes.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className={solidBtn} disabled={busy} onClick={() => void setup()}>
                  {busy ? "Setting up…" : `Confirm · ${formatMoney(setupTotal, cur)}`}
                </button>
                <button type="button" className={quietBtn} disabled={busy} onClick={() => setConfirmSetup(false)}>
                  Not now
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className={solidBtn} disabled={!chosen} onClick={() => setConfirmSetup(true)}>
              Set up persistent workstation
            </button>
          )}
        </div>
      )}
      {msg && <p className={`mt-3 ${msg.ok ? okMsg : errMsg}`}>{msg.text}</p>}
    </section>
  );
}
