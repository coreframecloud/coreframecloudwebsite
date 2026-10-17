"use client";

import { apiFetch } from "@/lib/session";
import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api-base";
import { formatMoney, parseCurrency } from "@/lib/money";

/**
 * "Studio projects" on /my-activity (owner, 16 Oct 2026: one account, one
 * sign-in, one dashboard). One row per floor plan the account uploaded to
 * Studio: name, plan thumbnail, date, how many images it holds, the last thing
 * done and what it has been charged. A row opens that project in Studio
 * (/studio?project=<id>, same site, same sign-in).
 *
 * Read from GET <control>/api/studio/activity with this page's own bearer:
 * Studio's account IS the site account (the token's `sub` is the users row),
 * so there is nothing to link or migrate. The plan thumbnails are owner-only,
 * so they are fetched with the header and shown as blob: URLs (an <img src>
 * cannot carry a token, and a token in a URL would leak into logs).
 */

interface StudioProject {
  job_id: string;
  name: string;
  created_at: number;
  rooms: number;
  renders: number;
  last_action: string;
  last_action_at: number;
  charged: number;
  has_plan: boolean;
}

const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE).origin;
  } catch {
    return "https://control.coreframecloud.com";
  }
})();

function day(ts: number): string {
  const d = new Date(ts * 1000);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function Thumb({ token, project }: { token: string; project: StudioProject }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    if (!project.has_plan) return;
    let url: string | null = null;
    let gone = false;
    apiFetch(`${API_ORIGIN}/api/studio/jobs/${encodeURIComponent(project.job_id)}/plan-thumb.svg`, {
      })
      .then((r) => (r.ok ? r.blob() : null))
      .then((b) => {
        if (!b || gone) return;
        url = URL.createObjectURL(b);
        setSrc(url);
      })
      .catch(() => {});
    return () => {
      gone = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [token, project.job_id, project.has_plan]);
  return (
    <span className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-rule bg-white">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- a blob: URL, not an optimisable asset
        <img src={src} alt={`Plan: ${project.name}`} className="h-full w-full object-contain p-1" />
      ) : (
        <span className="text-[10px] text-ink-3">Plan</span>
      )}
    </span>
  );
}

export default function MyStudioProjects({ token }: { token: string | null }) {
  const [rows, setRows] = useState<StudioProject[]>([]);
  const [currency, setCurrency] = useState("INR");
  const [state, setState] = useState<"loading" | "error" | "ok">("loading");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!token) return;
    let gone = false;
    apiFetch(`${API_ORIGIN}/api/studio/activity`)
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        const d = (await r.json()) as { projects?: StudioProject[]; currency?: string };
        if (gone) return;
        setRows(d.projects ?? []);
        setCurrency(d.currency || "INR");
        setState("ok");
      })
      .catch(() => {
        if (!gone) setState("error");
      });
    return () => {
      gone = true;
    };
  }, [token]);

  if (!token) return null;
  const cur = parseCurrency(currency) ?? "INR";
  const shown = showAll ? rows : rows.slice(0, 10);

  return (
    <section id="studio-projects" className="cf-glass scroll-mt-24 overflow-hidden" aria-labelledby="studio-projects-title">
      <div className="border-b border-rule px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="studio-projects-title" className="cf-section-title">Studio projects.</h2>
          <a href="/studio" className="text-xs font-medium text-blue underline-offset-2 hover:text-blue-ink hover:underline">
            Open Studio
          </a>
        </div>
      </div>
      {state === "loading" ? (
        <p className="px-4 py-8 text-sm text-ink-3 sm:px-6">Loading your Studio projects…</p>
      ) : state === "error" ? (
        <p className="px-4 py-8 text-sm text-ink-2 sm:px-6">We could not load your Studio projects. Reload the page to try again.</p>
      ) : rows.length === 0 ? (
        <p className="px-4 py-8 text-sm text-ink-2 sm:px-6">
          No Studio projects yet.{" "}
          <a href="/studio" className="font-medium text-blue underline-offset-2 hover:text-blue-ink hover:underline">
            Upload a DXF floor plan
          </a>{" "}
          to get free previews of its rooms.
        </p>
      ) : (
        <>
          <ul className="divide-y divide-rule">
            {shown.map((p) => (
              <li key={p.job_id}>
                <a
                  href={`/studio?project=${encodeURIComponent(p.job_id)}`}
                  className="flex items-center justify-between gap-4 px-4 py-3.5 transition hover:bg-paper-2 focus-visible:bg-paper-2 sm:px-6"
                >
                  <span className="flex min-w-0 items-center gap-3.5">
                    <Thumb token={token} project={p} />
                    <span className="min-w-0">
                      <span className="block text-[15px] leading-6 font-medium break-words text-ink">{p.name}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-ink-2">
                        <span className="whitespace-nowrap">{day(p.created_at)}</span>
                        <span className="text-ink-3"> · </span>
                        <span className="whitespace-nowrap">
                          {p.renders} {p.renders === 1 ? "image" : "images"}
                        </span>
                        {p.rooms ? (
                          <>
                            <span className="text-ink-3"> · </span>
                            <span className="whitespace-nowrap">
                              {p.rooms} {p.rooms === 1 ? "room" : "rooms"}
                            </span>
                          </>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-ink-3">
                        Last: {p.last_action}, {day(p.last_action_at)}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-[15px] leading-6 font-medium whitespace-nowrap tabular-nums text-ink">
                      {p.charged > 0 ? formatMoney(p.charged, cur) : "—"}
                    </span>
                    <span className="mt-0.5 block text-xs whitespace-nowrap text-ink-3">
                      {p.charged > 0 ? "charged" : "free previews only"}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          {rows.length > 10 && !showAll ? (
            <div className="border-t border-rule px-4 py-3 sm:px-6">
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="min-h-9 text-[13px] font-medium text-ink-2 transition hover:text-ink"
              >
                Show all {rows.length}
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
