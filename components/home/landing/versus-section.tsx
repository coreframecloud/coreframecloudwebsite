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
 *
 * Cut from three paragraphs to one. The long version explained the billing
 * model, the file shuffling and the protocol before it got to the point, and
 * the table below already makes every one of those arguments line by line.
 * Prose that restates a table is prose nobody reads.
 */
export function VersusSection({ trialMinutes }: { trialMinutes?: number }) {
  return (
    <>
      <section className="cf-section px-5">
        <div className="cf-col">
          <p className="cf-eyebrow mb-5">What makes us different</p>
          <h2 className="cf-section-title">
            Even when you find a GPU to rent, what you get is RDP.
          </h2>
          <p className="cf-section-copy mt-4">
            We stream a real workstation at 4K and 60 frames a second, so the viewport moves when
            you move it. Remote desktop was built for spreadsheets — it drops frames the moment a
            scene starts orbiting, and you feel every one of them.
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
