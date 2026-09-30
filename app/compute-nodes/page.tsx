import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundGlow } from "@/components/home/background-glow";
import { getRateCard, adhocRateHourly, adhocRate, billingSentence } from "@/lib/rate-card";
import { NODE, WORKSTATION_REPLACEMENT_COST } from "@/lib/node-spec";

export const metadata: Metadata = {
  // No price in the title or description: both are cached by search engines
  // and quoted by answer engines for months after a rate changes.
  title: "Compute Nodes — RTX 5080 GPU Workstations in India",
  description:
    "One node, one GPU: NVIDIA RTX 5080 with 16 GB GDDR7, 64 GB of RAM and an 8-core AMD Ryzen 7. Billed per minute from stream start, with GST included. Hosted in Bengaluru, India.",
  alternates: { canonical: "/compute-nodes" },
};

const whatsapp = (message: string) =>
  `https://wa.me/916366889488?text=${encodeURIComponent(message)}`;

/**
 * The spec list is BUILT FROM `lib/node-spec`, not typed here.
 *
 * This page used to carry its own copy — including "500 GB NVMe", which
 * disagreed with the 1 TB Gen 5 drive that is actually in the machine, and a
 * CUDA-core and board-power figure nobody had read off the node. Sixteen pages
 * each kept their own list and they had already drifted apart. One import now,
 * and a fleet change edits one file.
 */
const SPECS: { label: string; value: string }[] = [
  { label: "GPU", value: NODE.gpu },
  { label: "VRAM", value: NODE.vram },
  { label: "Memory bandwidth", value: NODE.memoryBandwidth },
  { label: "System RAM", value: NODE.ram },
  { label: "CPU", value: NODE.cpu },
  { label: "Working disk", value: NODE.disk },
  { label: "Operating system", value: NODE.os },
  { label: "Stream", value: NODE.stream },
  { label: "Location", value: NODE.location },
];

/**
 * NOT "a full Windows desktop over RDP".
 *
 * RDP is the thing the rest of the site positions against — it is what you get
 * from a GPU you rent somewhere else, and it is not a viewport you can model
 * in. The machine is reached through the Coreframe Connect app and streamed at
 * 4K/60. Saying RDP here sold the competitor's product on our own page.
 */
const GOOD_FOR = [
  {
    title: "Design and visualisation.",
    text: `D5 Render, Lumion, Enscape, Revit, AutoCAD, 3ds Max and SolidWorks on a real ${NODE.os} desktop. You open it in the Coreframe Connect app and it streams at ${NODE.stream}, so the viewport moves when you move it.`,
  },
  {
    title: "Long renders and animation output.",
    text: "The render runs on the node. Your own laptop stays free — keep modelling, keep drafting, keep answering email while the frames finish.",
  },
  {
    title: "Client review sessions.",
    text: "Start a node for a walkthrough, close it when the call ends. You pay for the minutes it streamed and nothing after that.",
  },
];

export default async function ComputeNodesPage() {
  const card = await getRateCard();
  const nodePrice = adhocRateHourly(card);
  const rate = adhocRate(card);

  return (
    <div className="relative min-h-screen bg-paper text-ink">
      <BackgroundGlow />

      <main className="relative">
        <section className="cf-section px-5">
          <div className="cf-wide">
            <div className="cf-eyebrow">Compute nodes</div>
            <h1 className="cf-display mt-3">One node. One GPU. Nothing to configure.</h1>
            <p className="cf-lead mt-5 max-w-[680px]">
              Every Coreframe node is the same machine — {NODE.gpu}, {NODE.vram}, {NODE.ram} of RAM,
              an {NODE.cpu}, in {NODE.location}. One machine means one price, and no tier you can
              pick wrong. A workstation like it costs about {WORKSTATION_REPLACEMENT_COST} to buy,
              and then sits under a desk waiting for the weeks you need it.
            </p>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-wide">
            <div className="cf-eyebrow">The machine</div>
            <h2 className="cf-section-title mt-3">What you get when you press connect.</h2>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="min-w-0 lg:col-span-2">
                {/* Label above value, never beside it. A two-column row put
                    "8-core AMD Ryzen 7" opposite its label and ran off a
                    390px screen; stacked, nothing can overflow. */}
                <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                  {SPECS.map((spec) => (
                    <div key={spec.label} className="min-w-0 border-t border-rule pt-3">
                      <dt className="cf-card-label">{spec.label}</dt>
                      <dd className="text-[15px] leading-6 font-medium break-words text-ink">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-10 border-t border-rule pt-6">
                  <div className="cf-card-label">Pay as you go</div>
                  <div className="mt-2 text-[34px] leading-none font-semibold text-ink">
                    {nodePrice ?? "On request"}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-ink-2">
                    Per GPU-hour, GST already inside the number. Billed per minute from the moment
                    the stream starts.
                  </p>
                  <a
                    href={whatsapp(
                      "Hi Coreframe Cloud, I want to reserve an RTX 5080 node for a 3D rendering / visualization workload."
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="cf-btn-primary mt-6 min-h-[44px]"
                  >
                    Reserve a node
                  </a>
                </div>
              </div>

              <div className="min-w-0 border-t-2 border-ink pt-5">
                <div className="cf-card-label">How billing works</div>
                <ul className="space-y-5 text-sm leading-6 text-ink-2">
                  <li>
                    <span className="font-medium text-ink">
                      {rate ? `${rate} per GPU-hour, GST included.` : "GST is inside the published rate."}
                    </span>{" "}
                    What you see is what you pay. Every invoice shows the taxable value and the 18%
                    GST split, so you can claim input credit.
                  </li>
                  <li>
                    <span className="font-medium text-ink">Billed per minute.</span>{" "}
                    {billingSentence(card)}
                  </li>
                  <li>
                    <span className="font-medium text-ink">Nothing to commit to.</span> Start a node
                    when you need it, close it when you are done. If you render every week, a
                    monthly plan bills the hours lower.
                  </li>
                  <li>
                    <span className="font-medium text-ink">
                      20 GB of storage free, 50 GB once you add credit.
                    </span>{" "}
                    Session scratch is wiped when the session ends. Pull your outputs down first, or
                    put the project on persistent NAS storage.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-wide">
            <div className="cf-eyebrow">What it is for</div>
            <h2 className="cf-section-title mt-3">Three ways studios use one.</h2>

            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
              {GOOD_FOR.map((item) => (
                <div key={item.title} className="cf-card">
                  <div className="text-[17px] leading-6 font-semibold text-ink">{item.title}</div>
                  <p className="mt-3 text-sm leading-6 text-ink-2">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <h2 className="cf-section-title">Licences are yours.</h2>
            <p className="cf-section-copy mt-4">
              Bring your own D5 Render, Lumion, Enscape or SolidWorks seat. You install it on the
              workstation and sign in as yourself. We rent you the hardware and the install, never
              the licence.
            </p>
            <p className="cf-section-copy mt-4">
              Need something this configuration does not cover — more storage, a different image, a
              node that stays up for a month? Ask, and we will tell you straight whether we can run
              it.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={whatsapp(
                  "Hi Coreframe Cloud, I'd like to talk about RTX 5080 compute nodes for my team."
                )}
                target="_blank"
                rel="noreferrer"
                className="cf-btn-primary min-h-[44px]"
              >
                Talk to us on WhatsApp
              </a>
              <Link href="/pricing" className="cf-btn-secondary min-h-[44px]">
                See pricing
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
