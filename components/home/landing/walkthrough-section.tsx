/**
 * The id, exported so the page and the schema cannot disagree about which
 * video this is. https://youtu.be/WlAbunHAGdE
 */
export const WALKTHROUGH_YOUTUBE_ID = "WlAbunHAGdE";

/**
 * The walkthrough.
 *
 * Deliberately described as one unedited session. The whole page argues that
 * the machine behaves like a local one, and the only honest proof of that is
 * uncut footage — a montage would undo the claim it is meant to support.
 *
 * `youtubeId` is optional and the section renders a labelled placeholder
 * without it, rather than an empty frame or a broken embed. Pass the id once
 * the walkthrough is published.
 */
export function WalkthroughSection({ youtubeId }: { youtubeId?: string }) {
  return (
    <section className="cf-section px-5">
      {/* VideoObject, so the walkthrough can surface in search on its own
          rather than only as a thing embedded on this page. Google wants a
          name, description, thumbnail, upload date and either contentUrl or
          embedUrl — the embed URL is the one we can state truthfully without
          hosting the file.

          duration is ISO 8601: PT4M39S is 4:39, the length of the cut. If the
          video is ever re-cut, change it here too; a duration that disagrees
          with the file is the kind of mismatch that gets rich results dropped
          silently. */}
      {youtubeId ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "VideoObject",
              // Must match the published YouTube title character for character. A
              // VideoObject whose name disagrees with the video it points at is a
              // mismatch Google resolves by dropping the rich result, silently.
              name: "Coreframe Cloud - Renting an RTX 5080 by the minute — a full session, start to finish",
              description:
                "A full Coreframe session, uncut: sign in, pick a workstation, upload a scene, render it, pull the result back down and close the machine. Recorded on an RTX 5080 workstation hosted in Bengaluru.",
              thumbnailUrl: [`https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`],
              uploadDate: "2026-09-30",
              duration: "PT4M39S",
              embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
              publisher: {
                "@type": "Organization",
                name: "Coreframe Compute Labs Private Limited",
              },
            }),
          }}
        />
      ) : null}

      <div className="cf-wide">
        <p className="cf-eyebrow mb-5">Walkthrough</p>
        <h2 className="cf-section-title">The whole thing, start to finish.</h2>
        <p className="cf-section-copy mt-4 max-w-[62ch]">
          One unedited session: launching a workstation, loading a scene, rendering it, and
          pulling the output back down. No cuts.
        </p>

        <div className="mt-7 overflow-hidden rounded-cf border border-rule">
          {youtubeId ? (
            <iframe
              className="aspect-video w-full"
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
              title="Coreframe Cloud — a full session, start to finish"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <div className="grid aspect-video place-items-center bg-term p-6 text-center">
              <p className="font-mono text-xs leading-[1.9] tracking-[0.14em] text-term-dim uppercase">
                Walkthrough coming shortly
                <br />
                coreframe connect · full session
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
