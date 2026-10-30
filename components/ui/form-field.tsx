/**
 * Form spacing system (owner's standing rule, 30 Oct 2026). Every sign-up-type
 * form on the site uses these so a new form gets the same rhythm for free.
 *
 *   title -> subtitle            8px  (header: mt-2)
 *   subtitle -> first field     24px  (header: mb-6)
 *   label -> its input           8px  FormField          gap-2
 *   input -> helper/hint/error   4px  FormField control  gap-1
 *   field -> next field         20px  FormFields         gap-5
 *   last field -> primary btn   24px  FormStack          gap-6
 *   button -> "or" divider      24px  FormStack          gap-6
 *   divider -> social buttons   24px  FormStack          gap-6
 *   social -> social button      8px  SocialButtons      gap-2
 *
 * Shape of a form:
 *   <form className={FORM.stack}>          // gap-6
 *     <FormFields>                         // gap-5
 *       <FormField label="Email" hint="...">  <Input/>  </FormField>
 *       ...
 *     </FormFields>
 *     <Button type="submit" />
 *     <FormDivider />
 *     <SocialButtons> ... </SocialButtons>
 *   </form>
 *
 * Spacing only: no colours, type or behaviour live here.
 */

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** The class sets, for places that cannot take a component (a <form> itself). */
export const FORM = {
  /** Header block: title -> subtitle 8px, subtitle -> first field 24px. */
  header: "mb-6",
  sub: "mt-2",
  /** Fields group -> primary button -> divider -> social: 24px. */
  stack: "flex flex-col gap-6",
  /** Field -> field: 20px. */
  fields: "flex flex-col gap-5",
  /** Label -> input: 8px. */
  field: "flex flex-col gap-2",
  /** Input -> helper / hint / error: 4px. */
  control: "flex flex-col gap-1",
  /** Social button -> social button: 8px. */
  social: "flex flex-col gap-2",
  label: "text-[13px] font-medium text-ink",
  hint: "text-xs leading-5 text-ink-3",
} as const;

export function FormStack({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn(FORM.stack, className)}>{children}</div>;
}

export function FormFields({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn(FORM.fields, className)}>{children}</div>;
}

/**
 * Label + control + optional helper. `hint` is plain helper text in the
 * default style; anything richer (an error line, a conditional note) can be
 * passed as extra children after the control and gets the same 4px.
 */
export function FormField({
  label,
  htmlFor,
  hint,
  labelClassName,
  className,
  children,
}: {
  label?: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  labelClassName?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn(FORM.field, className)}>
      {label != null && (
        <label htmlFor={htmlFor} className={labelClassName ?? FORM.label}>
          {label}
        </label>
      )}
      <div className={FORM.control}>
        {children}
        {hint != null && hint !== false && <p className={FORM.hint}>{hint}</p>}
      </div>
    </div>
  );
}

/** The "or" rule between the primary button and the social buttons. */
export function FormDivider({ label = "or" }: { label?: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-rule" />
      <span className="text-xs text-ink-3">{label}</span>
      <div className="h-px flex-1 bg-rule" />
    </div>
  );
}

export function SocialButtons({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn(FORM.social, className)}>{children}</div>;
}
