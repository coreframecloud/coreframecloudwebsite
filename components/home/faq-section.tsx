import { InPageLink } from "@/components/ui/in-page-link";

const faqs = [
  {
    question: "What GPU do the workstations use?",
    answer:
      "Every instance runs an NVIDIA RTX 5070 Ti with 16 GB GDDR7 VRAM and 64 GB ECC system RAM. It's a consumer-grade RTX card with full WDDM display drivers — exactly what D5 Render, Lumion, and Enscape require.",
  },
  {
    question: "Do I need to install D5 Render / Lumion / Enscape myself?",
    answer:
      "Yes — all software is BYOL (Bring Your Own Licence). You install your app on the workstation and activate your existing named-user licence. No additional software fees from Coreframe.",
  },
  {
    question: "How does file transfer work?",
    answer:
      "You upload project files directly to Coreframe's secure storage layer over an encrypted transfer. On committed plans your files live on persistent NAS storage and are accessible to your whole team any time. On ad-hoc, files land on session scratch storage and you download outputs before shutting down.",
  },
  {
    question: "Is my project data isolated?",
    answer:
      "Yes. Your workstation is a dedicated VM — other customers cannot access it. On ad-hoc, all session data is deleted when you shut down. Committed-plan customers get private persistent NAS storage hosted in Bengaluru.",
  },
  {
    question: "How am I charged?",
    answer:
      "Ad-hoc sessions are ₹400/GPU-hour, charged per full hour. Committed plans start at ₹24,000/month and include a block of GPU-hours — extra hours vary by plan tier (₹200–₹350/hr). All prices exclude GST.",
  },
  {
    question: "How quickly can I start rendering?",
    answer:
      "The workstation is ready in under 2 minutes. Create your account, add credit, and launch — the instance boots and you connect from anywhere.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="max-w-3xl">
          <div className="cf-eyebrow">FAQ</div>
          <h2 className="mt-4 cf-section-title">
            Questions teams usually ask before they launch
          </h2>
          <p className="mt-5 cf-section-copy">
            Clear answers on GPU specs, licensing, file storage, and billing for Coreframe Cloud workstations.
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
