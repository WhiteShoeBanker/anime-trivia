import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CountBadgeSize = "sm" | "md";

// Circular notification numeric indicator. Sibling primitive to <Pill> —
// shares rounded-pill but the 1:1 aspect ratio + numeric content register
// makes it a different shape primitive. Sizes match the count-badge-sm/md
// tokens in DESIGN.md (16 / 20 px square).
const sizeClasses: Record<CountBadgeSize, string> = {
  sm: "w-4 h-4 text-[10px]",
  md: "w-5 h-5 text-xs",
};

const baseClasses =
  "inline-flex items-center justify-center rounded-pill bg-accent text-white font-bold leading-none";

export interface CountBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  size?: CountBadgeSize;
  children: ReactNode;
}

export const CountBadge = forwardRef<HTMLSpanElement, CountBadgeProps>(
  function CountBadge({ size = "sm", className, children, ...rest }, ref) {
    return (
      <span
        {...rest}
        ref={ref}
        className={cn(baseClasses, sizeClasses[size], className)}
      >
        {children}
      </span>
    );
  },
);
