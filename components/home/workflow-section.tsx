import { InPageLink } from "@/components/ui/in-page-link";

const steps = [
  {
    step: "01",
    title: "Launch your workstation",
    copy: "Start a D5 Render ready Windows machine with WDDM enabled and the VRAM tier that fits your scene.",
  },
  {
    step: "02",
    title: "Send project files",
    copy: "Use the client application to move project files and assets to the provisioned machine through the managed transfer path.",
  },
  {
    step: "03",
    title: "Render on the server",
    copy: "Run D5 with your own license, complete the render job, and use the machine only for the hours you need.",
  },
  {
    step: "04",
    title: "Download results and terminate",
    copy: "Pull output back to your local workstation and shut down the server when the job is complete.",
  },
];

export function WorkflowSection() {
  return (
    <section className="border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="cf-eyebrow">WORKFLOW</div>
          <h2 className="mt-4 cf-section-title">
            Built for render jobs, not infrastructure management.
          </h2>
          <p className="mt-5 cf-section-copy">
            Your team gets a direct launch-to-download workflow. We handle the workstation layer and the file movement path around the session.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-4">
          {steps.map((item) => (
            <div
              key={item.step}
              className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300/85">
                Step {item.step}
              </div>
              <div className="mt-3 text-2xl font-semibold text-white">
                {item.title}
              </div>
              <p className="mt-4 text-base leading-7 text-white/62">
                {item.copy}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-[28px] border border-emerald-400/15 bg-emerald-400/[0.04] p-6">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Secure transfer, clean teardown
          </div>
          <p className="mt-3 max-w-3xl text-base leading-7 text-white/72">
            Files are delivered to the provisioned workstation only through the managed transfer path. Session data is removed when the instance is terminated.
          </p>

          <div className="mt-6">
            <InPageLink targetId="reserve-access" className="cf-btn-primary">
              Reserve Access
            </InPageLink>
          </div>
        </div>
      </div>
    </section>
  );
}
