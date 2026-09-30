import { SpecBlock, B, K } from "@/components/home/spec-block";

/**
 * The differentiator, stated as a comparison the reader can check.
 *
 * The competitor here is not another brand — it is the arrangement almost
 * every Indian CSP offers: a Windows box sold by the month, reached over RDP.
 * Naming the arrangement rather than a company keeps this honest and keeps it
 * true next year.
 *
 * "desktop-grade" is a deliberately fair description of RDP. It is genuinely
 * fine for spreadsheets; what it is not is a 3D viewport, and that is the
 * distinction worth drawing rather than calling it bad.
 */
export function VersusSection({ trialMinutes }: { trialMinutes?: number }) {
  return (
    <>
      <section className="cf-section px-5">
        <div className="cf-col">
          <p className="cf-eyebrow mb-5">What makes us different</p>
          <h2 className="cf-section-title">
            A Windows GPU box is usually sold by the month, behind RDP. This isn&rsquo;t that.
          </h2>
          <p className="cf-section-copy mt-4">
            The usual arrangement gets you an IP address, a remote desktop session and an invoice
            that arrives whether you opened it or not. Then you spend the first hour moving files
            onto it and the last hour moving them off — over a protocol built for spreadsheets,
            not for a 3D viewport.
          </p>
          <p className="cf-section-copy mt-4">
            We sell the opposite of that: a machine that behaves like it&rsquo;s under your desk,
            for exactly as long as you have it open.
          </p>
        </div>
      </section>

      <section className="cf-section px-5 pt-0">
        <div className="cf-wide">
          <SpecBlock>
            {"                      "}<K>the usual arrangement</K>{"      "}<B>coreframe</B>
            {"\n\n"}
            {"  how it's sold       by the month               "}<B>by the minute</B>{"\n"}
            {"  to try it           commit first               "}
            <B>{trialMinutes ? `${trialMinutes} minutes, no card` : "no card to start"}</B>{"\n"}
            {"  access              RDP / VNC                  "}<B>Coreframe Connect app</B>{"\n"}
            {"  stream quality      desktop-grade              "}<B>4K · 60 fps · low latency</B>{"\n"}
            {"  viewport feel       laggy, dropped frames      "}<B>works like a local machine</B>{"\n"}
            {"  moving files        FTP / S3 / your own VPN    "}<B>built in, both directions</B>{"\n"}
            {"  setup before work   drivers, licences, config  "}<B>none</B>{"\n"}
            {"  from anywhere       needs your VPN             "}<B>the app, any connection</B>{"\n"}
            {"  when you stop       the month runs on          "}<B>the billing stops</B>
          </SpecBlock>
        </div>
      </section>
    </>
  );
}
