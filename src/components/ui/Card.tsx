import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CardVariant = "default" | "elevated";

const variantClasses: Record<CardVariant, string> = {
  default: "bg-surface rounded-card",
  elevated: "bg-surface rounded-card shadow-ink",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children?: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "default", className, children, ...rest },
  ref,
) {
  return (
    <div
      {...rest}
      ref={ref}
      className={cn(variantClasses[variant], className)}
    >
      {children}
    </div>
  );
});
