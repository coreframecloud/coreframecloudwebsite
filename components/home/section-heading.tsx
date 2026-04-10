type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  text?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  text,
}: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      <div className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
        {title}
      </h2>
      {text ? (
        <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">
          {text}
        </p>
      ) : null}
    </div>
  );
}
