import { SpecBlock, K, V, C } from "@/components/home/spec-block";
import type { StorageTerms } from "@/lib/storage-terms";

/**
 * The machine, as a terminal session rather than a spec table.
 *
 * Two decisions worth keeping:
 *
 * `bandwidth` is the RTX 5080's 960 GB/s MEMORY bandwidth, not a disk figure.
 * An earlier draft carried "800 GB/s" against the NVMe, which is off by two
 * orders of magnitude — Gen 4 is about 7 GB/s and Gen 5 about 14 — and would
 * have been spotted instantly by exactly the engineers this page is courting.
 *
 * The rate and the transfer allowance are passed in from the live rate card,
 * never typed. A price that disagrees with what billing charges is the one
 * mistake on this page that costs money rather than credibility.
 */
export function MachineSection({
  adhocRate,
  storage,
}: {
  adhocRate?: string;
  storage: StorageTerms;
}) {
  return (
    <section className="cf-section px-5">
      <div className="cf-wide">
        <SpecBlock label="The machine">
          <C># a session, start to finish</C>
          {"\n"}
          <span className="b">$</span> coreframe connect &rarr; <V>Launch workstation</V>
          {"\n\n"}
          {"  "}<K>node</K>{"            "}gpu-node-01 · Bengaluru{"\n"}
          {"  "}<K>gpu</K>{"             "}RTX 5080 · <V>16 GB GDDR7</V> · current generation{"\n"}
          {"  "}<K>memory</K>{"          "}<V>64 GB</V> system RAM — big scenes, many apps open{"\n"}
          {"  "}<K>bandwidth</K>{"       "}<V>960 GB/s</V> memory bandwidth on the card{"\n"}
          {"  "}<K>working disk</K>{"    "}<V>1 TB NVMe Gen 5</V> on the workstation — your scratch,{"\n"}
          {"                  "}your cache, your project files while you work{"\n"}
          {"  "}<K>transfer</K>{"        "}<V>{storage.trialGb} GB</V> kept between sessions, for moving{"\n"}
          {"                  "}files in and out{"\n"}
          {"  "}<K>stream</K>{"          "}<V>4K at 60 fps</V>, low latency — it feels local{"\n"}
          {"  "}<K>software licence</K> <V>yours</V> — Blender, Twinmotion, D5, Lumion,{"\n"}
          {"                  "}Enscape, 3ds Max, Revit, SolidWorks{"\n"}
          {"  "}<K>files</K>{"           "}drag in, drag out. no VPN, no FTP, no setup{"\n"}
          {adhocRate ? (
            <>
              {"  "}<K>billing</K>{"         "}<V>{adhocRate} / hour</V> incl. GST · <V>charged per minute</V>{"\n"}
            </>
          ) : null}
          {"  "}<K>commitment</K>{"      "}none. no month, no seat, nothing to cancel{"\n"}
          {"  "}<K>to stop</K>{"         "}close the window
        </SpecBlock>

        <div className="cf-note mt-[26px]">
          <p className="text-base leading-[1.62] text-ink">
            <strong className="font-semibold">
              What you need at your end: a laptop and ordinary broadband.
            </strong>{" "}
            4K at 60&nbsp;fps looks its best on about 50&nbsp;Mbps and still holds up at 35.
            1080p is comfortable on 20.
          </p>
          <p className="mt-2 text-[14.5px] leading-[1.62] text-ink-2">
            Steady matters more than fast — a wired connection or 5&nbsp;GHz Wi-Fi beats a
            quicker link that drops packets. No graphics card, no dedicated line, no office
            network, and nothing to install beyond the app.
          </p>
        </div>
      </div>
    </section>
  );
}
