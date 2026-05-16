"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  error?: boolean;
  leadingIcon?: ReactNode;
}

// Base input chrome — the `input-default` component token from DESIGN.md.
// Sharp corners (action surface, L398 sharp-defaults list), bg-surface
// fill, 44px touch floor (COPPA), bone text. Placeholder binds to
// text-text-muted/60 (the /60 keeps it distinct from hint/label full
// alpha). px-4 py-3 == the token's 12px×16px padding. No text-size class:
// inherits body-sm at use-time; call sites override via className (e.g.
// OTP's text-2xl).
const baseClasses =
  "w-full px-4 py-3 min-h-[44px] rounded-sharp border bg-surface text-text transition-colors placeholder:text-text-muted/60 disabled:opacity-50 disabled:cursor-not-allowed";

// Focus-visible is additive on top of base, per DESIGN.md: border-primary
// swap + thin ring-1 ring-primary/30, NO ring-offset, NO ring-2. The
// thin-ring + border-swap is intentionally distinct from the chunky
// ring-2 ring-offset-2 signature on pill-interactive / button-* — dwell
// text-entry fields get the quiet "active field" treatment.
const focusClasses =
  "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/30";

// Static-string lookup (no template composition) so Tailwind v4's
// build-time extractor sees every class. default → input-default's
// border-rule hairline; error → input-error's border-error surface token
// (#991b1b). Error red lives on the sibling <FieldError> body text, not
// the input border — see DESIGN.md's surface-vs-body split.
const stateClasses = {
  default: "border-rule",
  error: "border-error",
};

// Leading-icon padding: with an icon overlay the input needs extra left
// room. pl-10 layers over base px-4 (Tailwind sorts the more-specific
// pl-* after px-* so the larger left padding wins). Applied only when
// leadingIcon is present.
const leadingIconPadding = "pl-10";

const iconWrapperClasses = "relative";

const iconClasses =
  "absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none";

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { error = false, leadingIcon, className, ...rest },
  ref,
) {
  const inputClassName = cn(
    baseClasses,
    error ? stateClasses.error : stateClasses.default,
    focusClasses,
    leadingIcon ? leadingIconPadding : undefined,
    className,
  );

  if (leadingIcon) {
    return (
      <div className={iconWrapperClasses}>
        <span className={iconClasses}>{leadingIcon}</span>
        <input ref={ref} className={inputClassName} {...rest} />
      </div>
    );
  }

  return <input ref={ref} className={inputClassName} {...rest} />;
});

export type { InputProps };
