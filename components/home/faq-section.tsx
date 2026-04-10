import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/home/section-heading";
import { faqs } from "@/lib/home-data";

export function FaqSection() {
  return (
    <section id="faq" className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <SectionHeading
        eyebrow="FAQ"
        title="Questions your prospects will likely ask first."
      />

      <div className="mt-10 grid gap-4">
        {faqs.map((item) => (
          <Card
            key={item.q}
            className="rounded-[1.4rem] border-white/10 bg-white/5"
          >
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white md:text-xl">
                {item.q}
              </h3>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300 md:text-base">
                {item.a}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
