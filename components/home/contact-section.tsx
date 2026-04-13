"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { trackClarityEvent, trackEvent } from "@/lib/analytics";

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

const renderingGpuOptions = [
  "RTX A4000 16GB — ₹90/hr",
  "RTX 4000 Ada 20GB — ₹119/hr",
  "RTX A5000 24GB — ₹155/hr",
  "RTX A6000 48GB — ₹299/hr",
];

const aiGpuOptions = [
  "NVIDIA L4 24GB — Starting from ₹120/hr",
  "RTX 6000 Ada 48GB — Starting from ₹299/hr",
  "H100 94GB — Custom pricing",
];

export function ContactSection() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const startedRef = useRef(false);

  const gpuOptions = useMemo(() => {
    if (form.workload === "AI") return aiGpuOptions;
    if (form.workload === "3D Rendering") return renderingGpuOptions;
    return [];
  }, [form.workload]);

  useEffect(() => {
    const hasAnyValue = Object.values(form).some((value) => value.trim() !== "");
    if (!hasAnyValue || submitted) return;

    const handleBeforeUnload = () => {
      trackEvent("form_abandoned", { location: "reserve_access" });
      trackClarityEvent("form_abandoned");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form, submitted]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "workload") next.gpu = "";
      return next;
    });
  }

  function handleFormStart() {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent("form_started", { location: "reserve_access" });
    trackClarityEvent("form_started");
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setSubmitted(false);
    setIsSubmitting(true);

    try {
      trackEvent("form_submit_attempt", {
        location: "reserve_access",
        workload: form.workload || "unknown",
      });
      trackClarityEvent("form_submit_attempt");

      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          source: "coreframecloud.com",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save your details.");
      }

      trackEvent("form_submitted", {
        location: "reserve_access",
        workload: form.workload || "unknown",
        gpu: form.gpu || "unknown",
      });
      trackClarityEvent("form_submitted");

      setSubmitted(true);

      const message = buildWhatsAppMessage(form);
      const whatsappUrl = `https://wa.me/916366889488?text=${message}`;

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      setForm(initialState);
      startedRef.current = false;
    } catch (error) {
      trackEvent("form_submit_error", { location: "reserve_access" });
      trackClarityEvent("form_submit_error");

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
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
            Choose your workload, pick the right server profile, and continue the conversation on WhatsApp.
          </p>
        </div>

        <div>
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={form.name}
                    onFocus={handleFormStart}
                    onChange={(e) => update("name", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#07121e] px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-emerald-300/35"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                    Company
                  </label>
                  <input
                    id="company"
                    type="text"
                    value={form.company}
                    onFocus={handleFormStart}
                    onChange={(e) => update("company", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#07121e] px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-emerald-300/35"
                    placeholder="Studio or company"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onFocus={handleFormStart}
                    onChange={(e) => update("email", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#07121e] px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-emerald-300/35"
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                    Phone / WhatsApp
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onFocus={handleFormStart}
                    onChange={(e) => update("phone", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#07121e] px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-emerald-300/35"
                    placeholder="+91 ..."
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="workload" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                    Primary workload
                  </label>
                  <select
                    id="workload"
                    required
                    value={form.workload}
                    onFocus={handleFormStart}
                    onChange={(e) => update("workload", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#07121e] px-4 py-3 text-white outline-none transition focus:border-emerald-300/35"
                  >
                    <option value="">Select workload</option>
                    <option value="3D Rendering">3D Rendering</option>
                    <option value="AI">AI</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="gpu" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                    Preferred GPU / Node
                  </label>
                  <select
                    id="gpu"
                    required
                    value={form.gpu}
                    onFocus={handleFormStart}
                    onChange={(e) => update("gpu", e.target.value)}
                    disabled={!form.workload}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#07121e] px-4 py-3 text-white outline-none transition focus:border-emerald-300/35 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">
                      {form.workload ? "Select option" : "Choose workload first"}
                    </option>
                    {gpuOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={5}
                  value={form.notes}
                  onFocus={handleFormStart}
                  onChange={(e) => update("notes", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#07121e] px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-emerald-300/35"
                  placeholder="Tell us about your project, scene size, AI use case, timing, or questions."
                />
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-white/50">
                  Submit the form and continue on WhatsApp.
                </div>

                <button
                  type="submit"
                  className="cf-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Reserve Access"}
                </button>
              </div>

              {submitted && (
                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3 text-sm text-emerald-300">
                  Lead recorded successfully. Opening WhatsApp.
                </div>
              )}

              {errorMessage && (
                <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
                  {errorMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
