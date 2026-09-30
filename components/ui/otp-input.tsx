import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The 6-digit code field, shared by every flow that asks for one:
 * email sign-in, signup verification and the WhatsApp identity check.
 *
 * WHY THIS IS NOT `<Input className="text-3xl">`:
 *
 * components/ui/input.tsx ends its class list with `md:text-sm`. Tailwind-merge
 * does not treat `md:text-sm` and `text-3xl` as conflicting -- they are
 * different variants, so both survive -- and at >=768px the media-query rule
 * wins on cascade order. Every OTP field on the site therefore rendered at 30px
 * on a phone and 14px on a laptop, which is what made a six-digit code people
 * are copying from another window nearly unreadable on the device most of them
 * sign in from.
 *
 * The fix is to state the size at BOTH breakpoints. If you ever restyle this,
 * keep the `md:` variant: a bare `text-3xl` silently loses on desktop again.
 *
 * Also load-bearing:
 *   inputMode="numeric"          - numeric keypad on mobile
 *   autoComplete="one-time-code" - iOS/Android offer the code from the SMS or
 *                                  mail app; without it the user retypes it
 *   pattern + maxLength          - browser-level guard
 *   digits-only onChange         - a pasted code with spaces still works
 */
export function OtpInput({
  value,
  onChange,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "onChange" | "value"> & {
  value: string;
  onChange: (digits: string) => void;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="\d{6}"
      maxLength={6}
      autoComplete="one-time-code"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
      className={cn(
        "h-16 w-full rounded-cf border border-rule bg-paper-2 px-4",
        "text-center font-bold tracking-[0.4em] text-ink",
        "text-3xl md:text-3xl",
        "tabular-nums",
        "placeholder:font-normal placeholder:tracking-[0.4em] placeholder:text-ink-3/50",
        "outline-none transition-colors focus-visible:border-blue focus-visible:ring-3 focus-visible:ring-blue/25",
        className,
      )}
      placeholder="000000"
      {...props}
    />
  );
}
