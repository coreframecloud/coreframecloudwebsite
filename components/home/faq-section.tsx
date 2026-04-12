import { InPageLink } from "@/components/ui/in-page-link";

const faqs = [
  {
    question: "Do I need to install D5 Render?",
    answer:
      "No. The workstation is prepared for D5 workflows. You bring your own D5 license and start working without environment setup.",
  },
  {
    question: "How does file transfer work?",
    answer:
      "Project files move through the managed transfer path to the provisioned workstation, and rendered output is downloaded back to your local machine after the job is complete.",
  },
  {
    question: "Is my project data isolated?",
    answer:
      "Yes. Files are delivered to the provisioned machine for your session, and workspace contents are removed when the instance is terminated.",
  },
  {
    question: "How am I charged?",
    answer:
      "Pricing is hourly based on the workstation profile you select, from 16GB to 48GB VRAM configurations.",
  },
  {
    question: "How quickly can I start rendering?",
    answer:
      "The D5 Render Ready Server is designed to be ready in under 2 minutes.",
  },
];

export function FaqSection() {
  return (
    <section className="border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="cf-eyebrow">FAQ</div>
          <h2 className="mt-4 cf-section-title">
            Questions teams usually ask before they launch
          </h2>
          <p className="mt-5 cf-section-copy">
            Clear answers on setup, security, transfer flow, and billing for D5 Render Ready Servers.
          </p>
        </div>

        <div className="mt-10 space-y-4">
          {faqs.map((item) => (
            <div
              key={item.question}
              className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6"
            >
              <h3 className="text-lg font-semibold text-white">
                {item.question}
              </h3>
              <p className="mt-3 max-w-4xl text-base leading-7 text-white/62">
                {item.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <InPageLink targetId="reserve-access" className="cf-btn-primary">
            Reserve Access
          </InPageLink>
        </div>
      </div>
    </section>
  );
}
