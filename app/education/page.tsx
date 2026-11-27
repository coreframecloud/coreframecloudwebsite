import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, HardDrive, LayoutDashboard, MonitorSmartphone } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { PageByline } from "@/components/seo/page-byline";
import { GenImage } from "@/components/visuals/media";
import { breadcrumbList, faqPage } from "@/lib/seo";
import { FaqList } from "@/components/ui/faq-list";

/**
 * /education: GPU workstations for colleges, universities, design schools and
 * training institutes (owner, 17 Nov 2026). Never name a client institute on
 * this page. No prices (owner decision): institutional deals are quoted on the
 * number of students, hours per day and storage, so the one CTA is a quote
 * request. No currency is shown, so this route has no /usd copy.
 */

const QUOTE_HREF = "/request-demo?type=Education%20%2F%20student%20labs";

export const metadata: Metadata = {
  title: { absolute: "GPU Workstations for Colleges and Universities | Coreframe" },
  description:
    "A cloud computer lab for your students: a Windows RTX workstation each, on the laptops they already have. Shared shifts, per-student storage, an admin dashboard.",
  keywords: [
    "gpu workstations for colleges",
    "cloud computer lab for universities",
    "virtual computer lab for students",
    "cloud lab for architecture students",
    "gpu lab for design schools",
    "remote workstations for students",
  ],
  alternates: { canonical: "/education" },
};

const IDEAS = [
  {
    icon: MonitorSmartphone,
    title: "A workstation for each student",
    line: "A full Windows desktop with an RTX GPU, streamed to a student laptop or an old lab PC.",
  },
  {
    icon: CalendarClock,
    title: "Batches share machines across shifts",
    line: "Morning and evening batches use the same workstations, so you pay for hours in use, not empty seats.",
  },
  {
    icon: HardDrive,
    title: "Storage for every student and batch",
    line: "Each student keeps their own files. Each batch gets a shared drive for projects and libraries.",
  },
  {
    icon: LayoutDashboard,
    title: "One dashboard for the institute",
    line: "Add and remove students, see who used what, and set a spending limit for each student.",
  },
];

const STEPS = [
  { n: "1", title: "Tell us about your batches", line: "How many students, how many hours a day, and which software they need." },
  { n: "2", title: "We set up the lab", line: "Workstations, storage and logins for every student, with your logo on the app." },
  { n: "3", title: "Students sign in", line: "From their own laptop or a lab PC. Work saves to their storage when they log off." },
];

const FAQS = [
  {
    q: "What do students need on their side?",
    a: "A laptop or lab PC with a steady internet connection and the Coreframe Connect app for Windows or Mac. The heavy work runs on our workstations, not on the student's machine.",
  },
  {
    q: "Can two batches share the same workstations?",
    a: "Yes. A morning batch and an evening batch can use the same machines in turn. Each student still has their own login and their own storage.",
  },
  {
    q: "Which software is ready to use?",
    a: "D5 Render, Twinmotion, Blender and Unreal Engine come installed. Lumion and other paid software run on the institute's own licence.",
  },
  {
    q: "Can the app carry our institute's name?",
    a: "Yes. Students sign in to an app with your logo, so the lab feels like part of your campus.",
  },
  {
    q: "Where are the workstations and student data?",
    a: "In a Tier III data centre in India. Student work and data stay in India.",
  },
  {
    q: "How is it priced?",
    a: "We quote per institute, based on the number of students, hours per day and storage. The institute gets one bill and sets limits from the dashboard.",
  },
];

export default function EducationPage() {
  return (
    <div className="relative min-h-screen bg-paper text-ink">
      <JsonLd data={breadcrumbList([{ name: "For colleges and universities", path: "/education" }])} />
      <JsonLd data={faqPage(FAQS)} />

      <main className="relative">
        <section className="cf-section cf-pagehero px-5">
          <div className="cf-wide grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="min-w-0">
              <div className="cf-eyebrow">For colleges and universities</div>
              <h1 className="cf-display mt-3">A GPU workstation for every student, without building a lab.</h1>
              <p className="cf-lead mt-5">
                Colleges, universities, design schools and training institutes give each student a full Windows RTX
                workstation, on the laptop or lab PC they already have.
              </p>
              <PageByline path="/education" className="mt-3 text-ink-3" />
              <div className="mt-8">
                <Link href={QUOTE_HREF} className="cf-btn-primary">Request a quote</Link>
              </div>
            </div>
            <GenImage
              src="/visuals/gen-student-architecture-4x5.webp"
              alt="An architecture student working on a laptop"
              width={1000}
              height={1286}
              className="mx-auto w-full max-w-[420px]"
              sizes="(max-width: 1024px) 100vw, 420px"
              parallax
              priority
            />
          </div>
        </section>

        <section className="cf-section px-5">
          <div className="cf-wide">
            <h2 className="cf-section-title">A computer lab that runs in the cloud.</h2>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {IDEAS.map((f) => (
                <div key={f.title} className="cf-card cfh-lift">
                  <f.icon aria-hidden className="h-7 w-7 text-blue" strokeWidth={1.6} />
                  <h3 className="mt-4 font-heading text-[18px] leading-6 font-medium text-ink">{f.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-6 text-ink-2">{f.line}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide grid items-start gap-10 lg:grid-cols-2">
            <div className="min-w-0">
              <h2 className="cf-section-title">Software ready on day one.</h2>
              <p className="cf-section-copy mt-3">
                D5 Render, Twinmotion, Blender and Unreal Engine come installed. Lumion runs on your own licence.
                Hosted in a Tier III data centre in India, so student work stays in India.
              </p>
            </div>
            <div className="min-w-0">
              <h2 className="cf-section-title">Your logo on the app.</h2>
              <p className="cf-section-copy mt-3">
                Students sign in to an app that carries your institute&apos;s name and logo, and you manage the lab
                from your own dashboard.
              </p>
            </div>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <h2 className="cf-section-title">How it starts.</h2>
            <ol className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              {STEPS.map((s) => (
                <li key={s.n} className="rounded-[24px] bg-paper-2 p-6 sm:p-7">
                  <span className="font-heading text-[28px] leading-none font-medium text-blue">{s.n}</span>
                  <h3 className="mt-3 font-heading text-[18px] leading-6 font-medium text-ink">{s.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-6 text-ink-2">{s.line}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-col">
            <h2 className="cf-section-title">Questions</h2>
            <FaqList items={FAQS} className="mt-6" />
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <div className="relative isolate overflow-hidden rounded-[32px] bg-night px-7 py-14 text-white sm:px-14">
              <h2 className="font-heading text-[30px] leading-tight font-medium sm:text-[38px]">Plan your student lab.</h2>
              <p className="mt-3 max-w-md text-white/70">
                Tell us how many students and hours you need. We reply with a quote, usually the same day.
              </p>
              <div className="mt-8">
                <Link href={QUOTE_HREF} className="cfh-pill-light">Request a quote</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
