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
