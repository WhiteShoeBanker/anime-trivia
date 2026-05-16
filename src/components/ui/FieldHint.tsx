import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldHintProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

// Per-field helper text. Utility-bound composition (not a YAML token) per
// DESIGN.md's Forms register: text-xs (12px DM Sans 400) at full
// text-text-muted alpha — deliberately distinct from the /60 placeholder
// alpha so hint text reads above placeholder weight. `id` flows through the
// HTMLAttributes spread; the <Field> wrapper sets `{id}-hint` for the
// input's aria-describedby wiring.
const baseClasses = "text-xs text-text-muted mt-1";

export const FieldHint = forwardRef<HTMLParagraphElement, FieldHintProps>(
  function FieldHint({ className, children, ...rest }, ref) {
    return (
      <p ref={ref} className={cn(baseClasses, className)} {...rest}>
        {children}
      </p>
    );
  },
);
