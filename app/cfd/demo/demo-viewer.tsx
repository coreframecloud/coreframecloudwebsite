"use client";

/**
 * The /cfd/demo viewer: the customer job viewer (app/cfd/jobs/[ref]/job-viewer.tsx)
 * on the two sample runs, with a poster first.
 *
 * Loading order, so the page is light on a phone and nothing shifts:
 *   1. the box has a fixed aspect ratio (4:3 phone, 16:10 from sm) and shows a
 *      poster: a still of the viewer's own first frame for that case;
 *   2. the viewer code (and three.js inside it) is a separate chunk, fetched
 *      only when the box comes near the screen (or on a tap, when the browser
 *      asks to save data);
 *   3. only the chosen case's model is downloaded (gzip, about 1.5–1.7 MB).
 */
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const noSubscribe = () => () => {};
/** The browser's "save data" request (Chrome on Android, Data Saver); false on the server. */
const readSaveData = () => !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;

const JobViewer = dynamic(() => import("../jobs/[ref]/job-viewer"), { ssr: false });

export type DemoCase = {
  id: string;
  tab: string;
  url: string;
  sizeLabel: string;
  show: string[];
  view?: { target: [number, number, number]; radius: number; dir?: [number, number, number] };
  poster: { desktop: string; phone: string; alt: string };
  label: string;
};

export function DemoViewer({ cases }: { cases: DemoCase[] }) {
  const [id, setId] = useState(cases[0].id);
  const [armed, setArmed] = useState(false);
  const saveData = useSyncExternalStore(noSubscribe, readSaveData, () => false);
  const box = useRef<HTMLDivElement>(null);
  const c = cases.find((x) => x.id === id) ?? cases[0];

  useEffect(() => {
    if (saveData) return;
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setArmed(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [saveData]);

  const poster = (
    <picture>
      <source media="(min-width: 640px)" srcSet={c.poster.desktop} />
      <img src={c.poster.phone} alt={c.poster.alt} className="h-full w-full object-cover" decoding="async" />
    </picture>
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose the sample">
        {cases.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setId(x.id)}
            aria-pressed={x.id === id}
            className={`rounded-full border-[1.5px] px-4 py-2 text-[14px] font-medium transition-colors ${
              x.id === id ? "border-ink bg-ink text-white" : "border-ink/30 bg-paper text-ink hover:border-ink"
            }`}
          >
            {x.tab}
          </button>
        ))}
      </div>
      <div ref={box} className="relative mt-4 aspect-[4/3] w-full sm:aspect-[16/10]">
        {armed ? (
          <JobViewer key={c.id} url={c.url} gzip show={c.show} view={c.view} label={c.label} poster={poster} className="h-full w-full" />
        ) : (
          <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-night">
            {poster}
            {saveData ? (
              <button
                type="button"
                onClick={() => setArmed(true)}
                className="absolute right-3 bottom-3 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-ink"
              >
                Open the 3D view ({c.sizeLabel})
              </button>
            ) : null}
          </div>
        )}
      </div>
      <p className="mt-3 text-[13px] leading-5 text-ink-3">
        Drag to rotate, scroll or pinch to zoom, right-drag or two fingers to pan. The buttons in the corner switch each
        field on and off; the legend shows the last one you switched on.
      </p>
    </div>
  );
}
