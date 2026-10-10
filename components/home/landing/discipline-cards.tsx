/**
 * Four audiences, four different reasons the same machine matters.
 *
 * A single "for architects and engineers" line speaks to nobody. These are
 * written so a reader recognises their own week in one of them and skips the
 * rest — which is why each card names the constraint, not the feature.
 *
 * Claim discipline, because these are the sentences most likely to drift:
 *   - The multiple is Blender Open Data, 4.5.0, Cycles, re-read 20 Sep 2026:
 *     RTX 5080 9,138.43 (1,429 results), 4060 3,181.54 (441), 3060 2,153.81
 *     (634). That is 2.87x and 4.24x, published as 3x and 4x — ALWAYS ROUNDED
 *     DOWN, never up. The earlier figures on this site (9,142 / 3,132 / 2,288)
 *     were stale and gave 3.99x for the 3060; these numbers drift, so re-read
 *     them before reuse rather than copying from here.
 *
 *     Never state the multiple without the medians, the sample counts, the
 *     Blender version, the date read and the source beside it — the rate-card
 *     block at the foot of the page carries all five. And it is Cycles: D5,
 *     Lumion and Enscape are different renderers and may not scale the same
 *     way, which the block says out loud.
 *   - The simulation card says the solver may be CPU-bound BECAUSE IT USUALLY
 *     IS. OpenFOAM, Fluent standard and Star-CCM+ are MPI jobs; claiming GPU
 *     speed-up for them would destroy our credibility with the exact reader
 *     we want. Post-processing and viewport work are the honest claim.
 *   - The HVAC card blames memory rather than GPU, which is what actually
 *     kills a federated Revit or Navisworks model on a work laptop.
 */
const CARDS = [
  {
    who: "Interior design & archviz",
    title: "Present at 8K, not 2K",
    body: (
      <>
        16 GB of VRAM holds a scene that an 8 GB card drops. You can render stills big enough to
        print, and show a client a walkthrough instead of a still. On Blender Open Data medians the
        5080 does 3× the work of a 4060 and 4× a 3060. We rounded both down, and the raw figures are
        in the rate card below.
      </>
    ),
  },
  {
    who: "Students & freelancers",
    title: "Rent a GPU for the weeks you need one",
    body: (
      <>
        A thesis or a competition entry needs a serious GPU for about four weeks, and you&rsquo;d
        be buying one for four years. Rent it for those weeks, and your laptop stops deciding how
        ambitious your portfolio piece can be.
      </>
    ),
  },
  {
    who: "Mechanical & simulation",
    title: "A workstation for the week you need it",
    body: (
      <>
        Your solver may well be CPU-bound (most still are), but post-processing and visualisation
        aren&rsquo;t. ParaView, EnSight, CAD viewports and any GPU solver your tool supports run on a machine you
        didn&rsquo;t have to buy, for as long as the project lasts.
      </>
    ),
  },
  {
    who: "HVAC & building services",
    title: "Heavy models, thin laptop",
    body: (
      <>
        A full services model in Revit or Navisworks will bring a work laptop to its knees, and
        it&rsquo;s usually memory that runs out, not the GPU. With 64 GB of RAM behind a 5080 it
        opens from that same laptop the same afternoon, and you can hand the client a rendered
        walkthrough instead of a plan set.
      </>
    ),
  },
];

export function DisciplineCards() {
  return (
    <section className="cf-section px-5 pt-0">
      <div className="cf-wide">
        <div className="grid grid-cols-1 gap-x-10 gap-y-[26px] sm:grid-cols-2">
          {CARDS.map((c) => (
            <div key={c.who} className="cf-card">
              <p className="cf-card-label">{c.who}</p>
              <h3 className="mb-2 text-[17px] font-semibold tracking-[-0.005em] text-ink">
                {c.title}
              </h3>
              <p className="text-[15px] leading-[1.62] text-ink-2">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
