"use client";

import { Children, cloneElement, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Label } from "./Label";
import { FieldHint } from "./FieldHint";
import { FieldError } from "./FieldError";

interface FieldProps {
  id: string;
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactElement;
  className?: string;
}

// Composes <Label> + a single input child + optional <FieldHint> /
// <FieldError>, auto-wiring htmlFor↔id, aria-describedby↔hint/error ids,
// and aria-invalid↔error per DESIGN.md's Forms register. The wrapper is
// the single source of truth for this ARIA wiring — call sites must not
// hand-write these attributes on the input.
export const Field = ({
  id,
  label,
  required = false,
  hint,
  error,
  children,
  className,
}: FieldProps) => {
  if (
    process.env.NODE_ENV !== "production" &&
    (Children.count(children) !== 1 || !isValidElement(children))
  ) {
    console.warn(
      "[Field] `children` must be exactly one React element (the input). Received multiple or an invalid child — ARIA wiring was skipped.",
    );
  }

  // aria-invalid / aria-required are emitted only in the affirmative
  // (true | undefined), never aria-*="false". DESIGN.md / the test
  // contract require aria-invalid to be ABSENT when there is no error,
  // so the spec's literal `!!error` (which renders aria-invalid="false")
  // is narrowed to `error ? true : undefined`. aria-required follows the
  // same affirmative-only shape for DOM cleanliness + consistency.
  const describedBy =
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const injectedProps = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-required": required ? true : undefined,
    "aria-describedby": describedBy,
    error: !!error,
  };

  const child = isValidElement(children)
    ? cloneElement(
        children as ReactElement<Record<string, unknown>>,
        injectedProps,
      )
    : children;

  return (
    <div className={cn("flex flex-col", className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {child}
      {hint && <FieldHint id={`${id}-hint`}>{hint}</FieldHint>}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
};

export type { FieldProps };
