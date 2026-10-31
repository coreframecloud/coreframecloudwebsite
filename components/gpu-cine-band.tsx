import type { ReactNode } from "react";
import { Testimonials } from "@/components/home/redesign/testimonials";
import { testimonialsFor } from "@/lib/testimonials";

/**
 * The GPU pages' cinema band (owner, 16 Oct 2026): graphite and glass under
 * the sci-fi hero, holding the page's cards and diagrams (children) and the
 * approved customer quotes, most relevant first. Styles: .cf-cine in globals.css.
 */
export function GpuCineBand({ page, children, className = "", testimonials = true }: { page: string; children?: ReactNode; className?: string; testimonials?: boolean }) {
  return (
    <div className={`mt-6 sm:px-3 ${className}`}>
      <div className="cf-cine cf-cine--band">
        {children ? <div className="px-5">{children}</div> : null}
        {testimonials ? (
          <Testimonials items={testimonialsFor(page)} title="What our customers say" className={children ? "pt-20 sm:pt-24" : ""} />
        ) : null}
      </div>
    </div>
  );
}
