"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api-base";
import { apiFetch } from "@/lib/session";

/**
 * The Connect tutorial on My Activity (owner, 26 Oct 2026: "add the tutorial video there").
 *
 * The link is the same one the Connect app's "watch the tutorial" banner uses
 * (settings.connect_tutorial_url, via /me/session-state), so a new tutorial on
 * YouTube shows up here and in the app at once, with no site deploy. Only a
 * YouTube id is ever embedded (youtube-nocookie, allowed by lib/csp.ts), and
 * only after a tap: the thumbnail first, so the page stays light.
 */
function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export function TutorialCard() {
  const [id, setId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let alive = true;
    apiFetch(`${API_BASE}/me/session-state`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive) setId(youtubeId(d?.connect_tutorial_url));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!id) return null;
  return (
    <section className="cf-glass p-5 sm:p-6" data-cf-section="tutorial">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="cf-section-title">How Coreframe works, in 3 minutes.</h2>
        <a
          href={`https://youtu.be/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue hover:underline"
        >
          Open on YouTube
        </a>
      </div>
      <p className="mt-1 text-[15px] leading-6 text-ink-2">
        Install Connect, launch a workstation, where your files are kept, and how to end a session.
      </p>
      <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-cf bg-night">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title="Coreframe Connect tutorial"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 h-full w-full"
            aria-label="Play the Coreframe Connect tutorial"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt=""
              className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
              loading="lazy"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue text-white shadow-lg transition group-hover:scale-105">
                <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-7 w-7" aria-hidden="true">
                  <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.6-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
