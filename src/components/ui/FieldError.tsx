import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

// Per-field validation message. Utility-bound composition (not a YAML token)
// per DESIGN.md's Forms register: text-xs text-error-strong mt-1. Binds to
// `error-strong` (#f87171), NOT `error` (#991b1b) — the latter falls to
// ~2.38:1 on bg-secondary (sub-AA); error-strong clears AA for body text.
// `error` stays the input border/fill surface token; this is the
// surface-vs-body split codified in DESIGN.md.
//
// aria-live="polite" (not role="alert"): form errors typically surface
// after a submit attempt. polite announces the message without preempting
// focus or interrupting the user mid-action — alert's assertive
// interruption is reserved for time-critical, unexpected notices. The
// <Field> wrapper sets `{id}-error` (via the spread) so the input's
// aria-describedby and aria-invalid point at this node.
const baseClasses = "text-xs text-error-strong mt-1";

export const FieldError = forwardRef<HTMLParagraphElement, FieldErrorProps>(
  function FieldError({ className, children, ...rest }, ref) {
    return (
      <p
        ref={ref}
        aria-live="polite"
        className={cn(baseClasses, className)}
        {...rest}
      >
        {children}
      </p>
    );
  },
);
