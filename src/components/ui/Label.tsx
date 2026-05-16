"use client";

import { forwardRef } from "react";
import type { LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: ReactNode;
}

// Form-context label. Binds to the `field-label` typography token (DM Sans
// 14/500, lineHeight 1.4) per DESIGN.md — text-sm (14px) + font-medium (500)
// + leading-[1.4]. leading-[1.4] is the exact-spec arbitrary value: Tailwind
// v4's default leading-snug resolves to 1.375, not the spec's 1.4. Distinct
// from the pill-chrome `label` token (12/700/tracked eyebrow) — see the
// field-label vs label split in DESIGN.md's Forms register.
const baseClasses =
  "block text-sm font-medium leading-[1.4] text-text mb-1";

// Required asterisk renders in text-text-muted — required is normal form
// state, not a warning (no text-accent / text-primary, no "Required"
// string suffix) per DESIGN.md's "Required fields" Do rule.
const requiredAsteriskClasses = "text-text-muted";

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { required = false, className, children, ...rest },
  ref,
) {
  return (
    <label ref={ref} className={cn(baseClasses, className)} {...rest}>
      {children}
      {required && (
        <span className={requiredAsteriskClasses}> *</span>
      )}
    </label>
  );
});
