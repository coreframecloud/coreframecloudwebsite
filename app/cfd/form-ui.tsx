/** Shared form pieces for the CFD intake form and every category's fields. */

export const fieldBase =
  "w-full min-w-0 rounded-cf border border-rule bg-paper px-3 text-base text-ink outline-none transition placeholder:text-ink-3 focus:border-blue focus:ring-2 focus:ring-blue/20 md:text-sm";
export const inputCls = `${fieldBase} h-11 md:h-10`;
export const textareaCls = `${fieldBase} min-h-[80px] resize-y py-2.5 leading-6`;

export function Field({ label, hint, htmlFor, children, full }: {
  label: string; hint?: string; htmlFor?: string; children: React.ReactNode; full?: boolean;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <label htmlFor={htmlFor} className="text-[13.5px] leading-5 font-medium text-ink">{label}</label>
      {children}
      {hint ? <p className="text-[12.5px] leading-5 text-ink-3">{hint}</p> : null}
    </div>
  );
}

export function Choice({ name, value, options, onChange }: {
  name: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((o) => (
        <label
          key={o.value}
          className={`flex min-h-11 cursor-pointer items-center rounded-cf border px-4 text-sm transition ${
            value === o.value ? "border-blue bg-blue-soft font-semibold text-ink" : "border-rule text-ink-2 hover:border-rule-strong"
          }`}
        >
          <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="sr-only" />
          {o.label}
        </label>
      ))}
    </div>
  );
}
