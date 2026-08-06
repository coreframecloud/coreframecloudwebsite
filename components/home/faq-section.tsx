import { InPageLink } from "@/components/ui/in-page-link";

const faqs = [
  {
    question: "What GPU do the workstations use?",
    answer:
      "Every instance runs an NVIDIA RTX 5080 with 16 GB GDDR7 VRAM (960 GB/s bandwidth, 10,752 CUDA cores, 256-bit bus, Blackwell architecture) and 64 GB ECC system RAM. It's a consumer-grade RTX card with full WDDM display drivers — exactly what D5 Render, Lumion, and Enscape require.",
  },
  {
    question: "Do I need to install D5 Render / Lumion / Enscape myself?",
    answer:
      "Yes — all software is BYOL (Bring Your Own Licence). You install your app on the workstation and activate your existing named-user licence. No additional software fees from Coreframe.",
  },
  {
    question: "How does file transfer work?",
    answer:
      "You upload project files directly to Coreframe's secure storage layer over an encrypted transfer. On committed plans your files live on persistent NAS storage and are accessible to your whole team any time — retained for 30 days on Studio, 90 days on Medium Firm, and 365 days on Big Firm. On ad-hoc, files land on session scratch storage with 7-day retention, so download outputs before shutting down. Persistent NAS storage can also be added to any account for ₹1,999/TB/month, retained for as long as you keep the subscription.",
  },
  {
    question: "Is my project data isolated?",
    answer:
      "Yes. Your workstation is a dedicated VM — other customers cannot access it. On ad-hoc, all session data is deleted when you shut down. Committed-plan customers get private persistent NAS storage hosted in Bengaluru.",
  },
  {
    question: "How am I charged?",
    answer:
      "Ad-hoc sessions are ₹399/GPU-hour, charged per full hour. Committed plans start at ₹19,000/month and include a block of GPU-hours — extra hours are cheaper than ad-hoc at every tier (₹379/hr on Studio, ₹359/hr on Medium Firm, ₹339/hr on Big Firm). Persistent NAS storage is a separate add-on at ₹1,999/TB/month. All prices include 18% GST — what you see is what you pay, and every business customer gets a GST invoice showing the tax split.",
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
