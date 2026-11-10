"use client";

import Image from "next/image";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { track as trackWebEvent } from "@/lib/web-events";

/**
 * "Try with a sample plan" (owner, 10 Nov 2026), and the "Try it with your
 * plan" link beside it: the hero's two actions on /floor-plan-to-render.
 *
 * Funnel evidence (plans/funnel-debug-20261110.md): 7 of 68 visitors clicked
 * "Try it", and Studio then asked for a sign-in and a DXF before showing
 * anything. This runs the REAL free preview on our sample 3BHK with no
 * sign-in: POST /api/studio/sample/run (same origin; next.config rewrites
 * /api/studio/* to the control plane; apps/tools/app/samplerun.py). The images
 * come back through the run's own token. Past the daily caps, or when the GPU
 * is busy, the API shows a recent run of the same sample, marked cached, and
 * we say so.
 */

type Room = "living" | "bedroom" | "kitchen";
const ROOMS: { key: Room; label: string }[] = [
  { key: "living", label: "Living & dining" },
  { key: "bedroom", label: "Master bedroom" },
  { key: "kitchen", label: "Kitchen" },
];

type Result = {
  room: Room;
  images: { url: string }[];
  cached: boolean;
  message?: string | null;
};

export function SamplePlanTry({ where = "floor_plan_hero" }: { where?: string }) {
  const [busy, setBusy] = useState<Room | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function run(room: Room) {
    setBusy(room);
    setError("");
    trackWebEvent("cta_click", { cta: "studio_sample_run", where });
    trackEvent("studio_sample_run", { location: where, room });
    try {
      const r = await fetch("/api/studio/sample/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        const msg = (d as { detail?: { detail?: string } })?.detail?.detail;
        throw new Error(msg || "The sample did not run. Try again in a minute.");
      }
      setResult(d as Result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The sample did not run. Try again in a minute.");
    } finally {
      setBusy(null);
    }
  }

  const label = (k: Room) => ROOMS.find((r) => r.key === k)?.label ?? k;

  return (
    <div className="w-full">
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <button
          type="button"
          onClick={() => run(result?.room === "living" ? "bedroom" : "living")}
          disabled={busy !== null}
          className="cfh-pill-light w-full disabled:opacity-70 sm:w-auto"
        >
          {busy ? "Furnishing the room…" : result ? "Try another room" : "Try with a sample plan"}
        </button>
        <a
          href="/studio"
          className="cfh-pill-ghost w-full text-white! sm:w-auto"
          onClick={() => trackWebEvent("cta_click", { cta: "studio_own_plan", href: "/studio", where })}
        >
          Try it with your plan
        </a>
      </div>
      <p className="mt-3 text-[13.5px]">No sign-in for the sample. It takes about a minute.</p>

      {busy && !result ? (
        <p className="mt-4 text-[14px]" aria-live="polite">
          Reading the sample plan and furnishing the {label(busy).toLowerCase()}…
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-4 text-[14px]">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-5" aria-live="polite">
          <div className="grid grid-cols-3 gap-2">
            {result.images.map((im, i) => (
              <a key={im.url} href={im.url} target="_blank" rel="noopener" className="relative block overflow-hidden rounded-[12px] bg-black/20">
                <Image
                  src={im.url}
                  alt={`${label(result.room)} from our sample 3BHK plan, view ${i + 1} (generated image)`}
                  width={640}
                  height={480}
                  unoptimized
                  className="h-auto w-full"
                />
                <span className="absolute top-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  Generated image
                </span>
              </a>
            ))}
          </div>
          <p className="mt-2 text-[13px]">
            {label(result.room)} from our sample 3BHK. Walls, doors and windows come from the drawing; the furniture and
            light are generated.{result.cached ? ` ${result.message || "A recent run of this sample."}` : ""}
          </p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13.5px]">
            {ROOMS.filter((r) => r.key !== result.room).map((r) => (
              <button
                key={r.key}
                type="button"
                disabled={busy !== null}
                onClick={() => run(r.key)}
                className="underline underline-offset-4 disabled:opacity-60"
              >
                {busy === r.key ? "Furnishing…" : `Try the ${r.label.toLowerCase()}`}
              </button>
            ))}
          </p>
        </div>
      ) : null}
    </div>
  );
}
