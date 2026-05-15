"use client";

import { forwardRef } from "react";
import type {
  ButtonHTMLAttributes,
  ForwardedRef,
  HTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export type PillSize = "sm" | "md";

export type PillTone =
  | "pro"
  | "audience-junior"
  | "audience-teen"
  | "audience-mature"
  | "content-rating-e"
  | "content-rating-t"
  | "content-rating-m"
  | "difficulty-easy"
  | "difficulty-medium"
  | "difficulty-hard"
  | "difficulty-impossible"
  | "difficulty-mixed"
  | "status-positive"
  | "status-negative"
  | "status-warning"
  | "status-neutral";

// Tone → utility-class map. Lookup object (not template strings) because
// Tailwind v4's build-time class extraction cannot see strings assembled
// at runtime. Filled tones (pro / audience / content-rating) carry the
// codified pill-{tone} component-token treatment from DESIGN.md; ghost
// tones (difficulty / status) apply /20 alpha to the bg and full alpha
// to the text per the "Filled fill = identity. Ghost (color/20) fill =
// status." Do rule in DESIGN.md.
const toneClasses: Record<PillTone, string> = {
  pro: "bg-primary text-white",
  "audience-junior": "bg-audience-junior text-ink",
  "audience-teen": "bg-audience-teen text-ink",
  "audience-mature": "bg-audience-mature text-ink",
  "content-rating-e": "bg-audience-junior text-ink",
  "content-rating-t": "bg-audience-teen text-ink",
  "content-rating-m": "bg-audience-mature text-ink",
  "difficulty-easy": "bg-audience-junior/20 text-audience-junior",
  "difficulty-medium": "bg-audience-teen/20 text-audience-teen",
  "difficulty-hard": "bg-audience-mature/20 text-audience-mature",
  "difficulty-impossible":
    "bg-difficulty-impossible/20 text-difficulty-impossible",
  "difficulty-mixed": "bg-difficulty-mixed/20 text-difficulty-mixed",
  "status-positive": "bg-success/20 text-success",
  "status-negative": "bg-accent/20 text-accent",
  "status-warning": "bg-warning/20 text-warning",
  "status-neutral": "bg-text-muted/20 text-text-muted",
};

const sizeClasses: Record<PillSize, string> = {
  sm: "px-2 py-0.5 text-[10px] font-bold leading-none tracking-[0.06em]",
  md: "px-3 py-1 text-xs font-bold leading-none tracking-[0.04em]",
};

const interactiveSizing =
  "px-3.5 py-2.5 min-h-[44px] text-xs font-semibold leading-none tracking-[0.04em]";

const baseClasses =
  "inline-flex items-center justify-center rounded-pill transition-colors";

const interactiveStateClasses = {
  active: "bg-primary/20 text-primary",
  inactive:
    "bg-white/5 text-text-muted hover:bg-white/10 hover:text-text",
};

const interactiveFocusClasses =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

// Warn-and-render fallback: dev/browser surfaces missing tone (mirrors the
// BadgeIcon pattern for unknown icon_name). The fallback renders a
// transparent neutral chip so layout doesn't collapse.
const fallbackClasses = "bg-transparent text-text-muted";

interface PillInformationalProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  tone?: PillTone;
  size?: PillSize;
  interactive?: false;
  className?: string;
  children: ReactNode;
}

interface PillInteractiveProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "type" | "onClick"
  > {
  interactive: true;
  active?: boolean;
  ariaPressed?: boolean;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
  // tone + size are ignored on interactive; type-omit them so callers
  // don't pass values that won't take effect.
  tone?: undefined;
  size?: undefined;
}

export type PillProps = PillInformationalProps | PillInteractiveProps;

export const Pill = forwardRef<HTMLElement, PillProps>(function Pill(
  props,
  ref,
) {
  if (props.interactive) {
    const {
      interactive: _interactive,
      active = false,
      ariaPressed,
      onClick,
      className,
      children,
      tone: _tone,
      size: _size,
      ...rest
    } = props;
    return (
      <button
        {...rest}
        ref={ref as ForwardedRef<HTMLButtonElement>}
        type="button"
        onClick={onClick}
        aria-pressed={ariaPressed}
        className={cn(
          baseClasses,
          interactiveSizing,
          active
            ? interactiveStateClasses.active
            : interactiveStateClasses.inactive,
          interactiveFocusClasses,
          className,
        )}
      >
        {children}
      </button>
    );
  }

  const {
    tone,
    size = "md",
    interactive: _interactive,
    className,
    children,
    ...rest
  } = props;

  if (
    !tone &&
    typeof window !== "undefined" &&
    process.env.NODE_ENV !== "production"
  ) {
    console.warn(
      "[Pill] Missing required `tone` prop on informational pill — rendering transparent neutral fallback.",
    );
  }

  const toneClass = tone ? toneClasses[tone] : fallbackClasses;

  return (
    <span
      {...rest}
      ref={ref as ForwardedRef<HTMLSpanElement>}
      className={cn(baseClasses, sizeClasses[size], toneClass, className)}
    >
      {children}
    </span>
  );
});
