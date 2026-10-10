import { SpecBlock, K, V, C } from "@/components/home/spec-block";
import { NODE } from "@/lib/node-spec";
import type { StorageTerms } from "@/lib/storage-terms";
import { BANDWIDTH_SENTENCE } from "@/lib/streaming-terms";

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
          {"  "}<K>gpu</K>{"             "}{NODE.gpu} · <V>{NODE.vram}</V> · current generation{"\n"}
          {"  "}<K>memory</K>{"          "}<V>{NODE.ram}</V> system RAM, enough for big scenes and a lot open{"\n"}
          {"  "}<K>bandwidth</K>{"       "}<V>{NODE.memoryBandwidth}</V> memory bandwidth on the card{"\n"}
          {"  "}<K>working disk</K>{"    "}<V>{NODE.disk}</V> on the workstation for scratch,{"\n"}
          {"                  "}cache and the project files you&rsquo;re working on{"\n"}
          {"  "}<K>transfer</K>{"        "}<V>{storage.paidGb} GB</V> kept between sessions, for moving{"\n"}
          {"                  "}files in and out{"\n"}
          {"  "}<K>stream</K>{"          "}<V>4K at 60 fps</V>, low latency, so it feels local{"\n"}
          {"  "}<K>software licence</K> <V>yours</V>: Blender, Twinmotion, D5, Lumion,{"\n"}
          {"                  "}Enscape, 3ds Max, Revit, SolidWorks{"\n"}
          {"  "}<K>files</K>{"           "}drag them in and out. no VPN or FTP to set up{"\n"}
          {adhocRate ? (
            <>
              {"  "}<K>billing</K>{"         "}<V>{adhocRate} / hour</V> incl. GST · <V>charged per minute</V>{"\n"}
            </>
          ) : null}
          {"  "}<K>commitment</K>{"      "}none. no monthly plan, no seats, nothing to cancel{"\n"}
          {"  "}<K>to stop</K>{"         "}close the window
        </SpecBlock>

        <div className="cf-note mt-[26px]">
          <p className="text-base leading-[1.62] text-ink">
            <strong className="font-semibold">
              What you need at your end: a laptop and ordinary broadband.
            </strong>{" "}
            {BANDWIDTH_SENTENCE}
          </p>
          <p className="mt-2 text-[14.5px] leading-[1.62] text-ink-2">
            A steady connection matters more than a fast one, so a wired link or 5&nbsp;GHz Wi-Fi
            will do better than a quicker line that drops packets. You don&rsquo;t need a graphics
            card, a dedicated line or an office network, and the app is the only thing you
            install.
          </p>
        </div>
      </div>
    </section>
  );
}
