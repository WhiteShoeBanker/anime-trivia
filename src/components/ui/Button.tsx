"use client";

import { forwardRef } from "react";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ForwardedRef,
  ReactNode,
} from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "outline"
  | "icon"
  | "destructive";

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-sharp text-sm font-semibold transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary disabled:opacity-50 disabled:pointer-events-none";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-ink hover:bg-primary/90 active:bg-primary/80",
  secondary:
    "bg-surface text-text hover:bg-surface/90 active:bg-surface/80",
  tertiary:
    "bg-transparent text-primary hover:text-primary/80 active:text-primary/70",
  outline:
    "bg-transparent text-text border border-rule hover:bg-surface/90",
  icon:
    "bg-transparent text-text-muted hover:text-text-muted/80 w-11 h-11",
  destructive:
    "bg-accent text-white hover:bg-accent/90 active:bg-accent/80",
};

const sizeClasses: Record<ButtonVariant, string> = {
  primary: "px-5 py-3",
  secondary: "px-5 py-3",
  tertiary: "px-5 py-3",
  outline: "px-5 py-3",
  icon: "",
  destructive: "px-5 py-3",
};

type CommonProps = {
  variant?: ButtonVariant;
  className?: string;
  children?: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const isLinkProps = (props: ButtonProps): props is ButtonAsLink =>
  typeof props.href === "string";

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(function Button(props, ref) {
  const variant = props.variant ?? "primary";
  const merged = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[variant],
    props.className,
  );

  if (isLinkProps(props)) {
    const {
      variant: _variant,
      className: _className,
      children,
      ...rest
    } = props;
    return (
      <Link
        {...rest}
        ref={ref as ForwardedRef<HTMLAnchorElement>}
        className={merged}
      >
        {children}
      </Link>
    );
  }

  const {
    variant: _variant,
    className: _className,
    href: _href,
    type,
    children,
    ...rest
  } = props;
  return (
    <button
      {...rest}
      type={type ?? "button"}
      ref={ref as ForwardedRef<HTMLButtonElement>}
      className={merged}
    >
      {children}
    </button>
  );
});
