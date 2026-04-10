"use client";

import { FormEvent, useState } from "react";

type FormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  workload: string;
  gpu: string;
  notes: string;
};

const initialState: FormState = {
  name: "",
  company: "",
  email: "",
  phone: "",
  workload: "",
  gpu: "",
  notes: "",
};

export function ContactSection() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function buildWhatsAppMessage(values: FormState) {
    const lines = [
      "Hi CoreFrame Cloud, I want to reserve access.",
      `Name: ${values.name || "-"}`,
      `Company: ${values.company || "-"}`,
      `Email: ${values.email || "-"}`,
      `Phone: ${values.phone || "-"}`,
      `Workload: ${values.workload || "-"}`,
      `Preferred GPU: ${values.gpu || "-"}`,
      `Notes: ${values.notes || "-"}`,
    ];

    return encodeURIComponent(lines.join("\n"));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);

    const message = buildWhatsAppMessage(form);
    const whatsappUrl = `https://wa.me/916366889488?text=${message}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    setForm(initialState);
  }

  return (
    <section id="reserve-access" className="border-b border-white/10">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="max-w-xl">
          <div className="cf-eyebrow">RESERVE ACCESS</div>

          <h2 className="mt-4 cf-section-title">
            Reserve GPU access in minutes.
          </h2>

          <p className="mt-5 cf-section-copy">
            Tell us what you want to run, choose your preferred GPU tier, and
            continue the conversation on WhatsApp. Fast intake. Clear follow-up.
          </p>

          <div className="mt-8 space-y-6 border-t border-white/10 pt-8">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
                STEP 1
              </div>
              <div className="mt-2 text-lg text-white/84">
                Fill the quick intake form
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
                STEP 2
              </div>
              <div className="mt-2 text-lg text-white/84">
                We open a WhatsApp thread with your requirements pre-filled
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
                STEP 3
              </div>
              <div className="mt-2 text-lg text-white/84">
                We confirm availability and next steps
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-[24px] border border-emerald-400/15 bg-emerald-400/[0.04] p-5">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Fastest path
            </div>
            <p className="mt-3 text-base leading-7 text-white/72">
              Best for D5 rendering, Revit visualization, one-off GPU sessions,
              and teams evaluating hourly access.
            </p>
          </div>
        </div>

        <div>
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#07121e] px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-emerald-300/35"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="company"
                    className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45"
                  >
                    Company
                  </label>
                  <input
                    id="company"
                    type="text"
                    value={form.company}
                    onChange={(e) => update("company", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#07121e] px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-emerald-300/35"
                    placeholder="Studio or company"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#07121e] px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-emerald-300/35"
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45"
                  >
                    Phone / WhatsApp
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#07121e] px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-emerald-300/35"
                    placeholder="+91 ..."
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="workload"
                    className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45"
                  >
                    Primary workload
                  </label>
                  <select
                    id="workload"
                    required
                    value={form.workload}
                    onChange={(e) => update("workload", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#07121e] px-4 py-3 text-white outline-none transition focus:border-emerald-300/35"
                  >
                    <option value="">Select workload</option>
                    <option value="D5 Render">D5 Render</option>
                    <option value="Revit visualization">Revit visualization</option>
                    <option value="3D rendering">3D rendering</option>
                    <option value="AI workloads">AI workloads</option>
                    <option value="Mixed rendering + AI">Mixed rendering + AI</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="gpu"
                    className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45"
                  >
                    Preferred GPU
                  </label>
                  <select
                    id="gpu"
                    required
                    value={form.gpu}
                    onChange={(e) => update("gpu", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#07121e] px-4 py-3 text-white outline-none transition focus:border-emerald-300/35"
                  >
                    <option value="">Select GPU</option>
                    <option value="RTX A4000 16GB — ₹75/hr">RTX A4000 16GB — ₹75/hr</option>
                    <option value="RTX 4000 Ada 20GB — ₹99/hr">RTX 4000 Ada 20GB — ₹99/hr</option>
                    <option value="RTX A5000 24GB — ₹129/hr">RTX A5000 24GB — ₹129/hr</option>
                    <option value="RTX A6000 48GB — ₹249/hr">RTX A6000 48GB — ₹249/hr</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45"
                >
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={5}
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#07121e] px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-emerald-300/35"
                  placeholder="Tell us about your project, render scene size, timing, or questions."
                />
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-white/50">
                  Submit this form to continue on WhatsApp.
                </div>

                <button type="submit" className="cf-btn-primary">
                  Reserve Access
                </button>
              </div>

              {submitted && (
                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3 text-sm text-emerald-300">
                  Form captured. Opening WhatsApp with your details.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
