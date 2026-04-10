const benefits = [
  "Built for rendering, visualization, and AI workloads",
  "Hourly RTX pricing for 3D-heavy teams",
  "Monthly Linux GPU plans for compute and training",
  "Custom configurations can be done as per needs",
];

export function BenefitsBar() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-6 md:py-8">
      <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 md:grid-cols-4 md:p-6">
        {benefits.map((item) => (
          <div
            key={item}
            className="rounded-2xl bg-slate-900/70 p-4 text-sm text-slate-200"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
