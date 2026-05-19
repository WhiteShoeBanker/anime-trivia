"use client";

import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import useReducedMotion from "@/lib/use-reduced-motion";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { useScrollLock } from "@/lib/use-scroll-lock";

// ── Backdrop ──────────────────────────────────────────────────────
// Fixed full-viewport scrim at the modal z-layer (z-modal === --z-modal).
// Static class strings so Tailwind v4's build-time extractor sees every
// utility — no template composition (DifficultyChip precedent).
const BACKDROP_BASE = "fixed inset-0 z-modal flex bg-ink/70";
// Sheet docks to the bottom edge below sm, then centers at sm+.
const BACKDROP_SHEET = "items-end sm:items-center justify-center";
// Center is always vertically centered with horizontal gutter.
const BACKDROP_CENTER = "items-center justify-center px-4";

// ── Container card ────────────────────────────────────────────────
// Sheet rounds only the top edge below sm (docked), fully at sm+.
const CONTAINER_SHEET =
  "w-full max-w-md bg-surface rounded-t-card sm:rounded-card border border-rule p-5 max-h-[80vh] overflow-hidden flex flex-col";
// Center is fully rounded at every breakpoint.
const CONTAINER_CENTER =
  "w-full max-w-md bg-surface rounded-card border border-rule p-5 max-h-[80vh] overflow-hidden flex flex-col";

// Surfaceless siblings: sizing + flex layout only — no bg/border/
// rounded/padding. For consumers whose child carries its own surface
// chrome (canonical case: badge-detail wrapping <BadgeCard selected />),
// so the child surface is the only visual chrome. Static class strings
// (Tailwind v4 build-time extractor) — no template composition.
const CONTAINER_SHEET_BARE =
  "w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col";
const CONTAINER_CENTER_BARE =
  "w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col";

// Header + footer are pinned outside the scroll region; only the body
// (an unstyled flex child so a <Card> consumer doesn't double the
// surface chrome) scrolls.
const HEADER_CLASS = "mb-4";
const BODY_CLASS = "flex-1 overflow-y-auto";
const FOOTER_CLASS = "mt-4 flex gap-2 justify-end";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  presentation?: "center" | "sheet";
  role?: "dialog" | "alertdialog";
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  dismissOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  surfaceless?: boolean;
  "aria-label"?: string;
  className?: string;
}

// Single source of truth for app modals: focus trap, scroll lock,
// Escape-to-close, backdrop dismissal, reduced-motion-aware sheet /
// center animations, and ARIA wiring (role, aria-modal, accessible
// name via header → aria-labelledby or aria-label). Mirrors <Field>'s
// slot-prop + ReactNode-for-chrome / children-for-variable-region
// pattern.
export const Modal = ({
  isOpen,
  onClose,
  presentation = "center",
  role = "dialog",
  header,
  footer,
  children,
  dismissOnBackdrop,
  closeOnEscape,
  initialFocusRef,
  surfaceless = false,
  "aria-label": ariaLabel,
  className,
}: ModalProps) => {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const headingId = useId();

  // alertdialog is auto-coupled to non-dismissible (no backdrop / no
  // Escape) unless the caller explicitly opts back in.
  const resolvedDismissOnBackdrop =
    dismissOnBackdrop ?? role !== "alertdialog";
  const resolvedCloseOnEscape = closeOnEscape ?? role !== "alertdialog";

  if (
    process.env.NODE_ENV !== "production" &&
    isOpen &&
    !header &&
    !ariaLabel
  ) {
    console.warn(
      "[Modal] Provide a `header` or an `aria-label` so the dialog has an accessible name. Neither was supplied.",
    );
  }

  useFocusTrap(isOpen, containerRef, { initialFocusRef });
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen || !resolvedCloseOnEscape) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, resolvedCloseOnEscape, onClose]);

  const isSheet = presentation === "sheet";
  const labelledBy = header ? headingId : undefined;
  const ariaLabelProp = header ? undefined : ariaLabel;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="presentation"
          className={cn(
            BACKDROP_BASE,
            isSheet ? BACKDROP_SHEET : BACKDROP_CENTER,
          )}
          onClick={resolvedDismissOnBackdrop ? onClose : undefined}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={containerRef}
            role={role}
            aria-modal="true"
            aria-labelledby={labelledBy}
            aria-label={ariaLabelProp}
            className={cn(
              isSheet
                ? surfaceless
                  ? CONTAINER_SHEET_BARE
                  : CONTAINER_SHEET
                : surfaceless
                  ? CONTAINER_CENTER_BARE
                  : CONTAINER_CENTER,
              className,
            )}
            onClick={(event) => event.stopPropagation()}
            initial={
              reduced
                ? false
                : isSheet
                  ? { y: 100, opacity: 0 }
                  : { scale: 0.95, opacity: 0 }
            }
            animate={isSheet ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1 }}
            exit={
              reduced
                ? { opacity: 0 }
                : isSheet
                  ? { y: 100, opacity: 0 }
                  : { scale: 0.95, opacity: 0 }
            }
            transition={
              reduced
                ? { duration: 0 }
                : isSheet
                  ? { type: "spring", damping: 20 }
                  : { duration: 0.2 }
            }
          >
            {header && (
              <div id={headingId} className={HEADER_CLASS}>
                {header}
              </div>
            )}
            <div className={BODY_CLASS}>{children}</div>
            {footer && <div className={FOOTER_CLASS}>{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export type { ModalProps };
