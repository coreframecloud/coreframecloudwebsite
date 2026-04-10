import { Card, CardContent } from "@/components/ui/card";
import { features } from "@/lib/home-data";

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-4 md:py-10">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {features.map(({ icon: Icon, title, text }) => (
          <Card
            key={title}
            className="rounded-[1.5rem] border-white/10 bg-slate-900/80"
          >
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
