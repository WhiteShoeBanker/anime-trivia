"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import useReducedMotion from "@/lib/use-reduced-motion";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { useScrollLock } from "@/lib/use-scroll-lock";

// ── ModalShell ────────────────────────────────────────────────────
// Full-bleed surface: no card, caller animates its own children. Only
// the backdrop fades by default.
const SHELL_BACKDROP_BASE = "fixed inset-0";

// Maps the public zIndex prop to a static Tailwind z-* utility. Static
// keys + values so Tailwind v4's build-time extractor sees every class
// (DifficultyChip precedent). "nav" / "modal" / "celebration" are the
// three named bands ModalShell consumers use today (Navbar
// mobile-overlay, default, BadgeCelebration); "toast" / "admin" are
// reserved for future surfaces and not exposed.
const SHELL_Z_CLASS = {
  nav: "z-nav",
  modal: "z-modal",
  celebration: "z-celebration",
} as const;

type ModalZIndex = keyof typeof SHELL_Z_CLASS;

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  role?: "dialog" | "alertdialog";
  zIndex?: ModalZIndex;
  id?: string; // optional DOM id passthrough; enables aria-controls binding from a trigger button
  children: ReactNode;
  dismissOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  backdropClassName?: string;
  "aria-label": string;
}

// Full-bleed sibling of <Modal>: same focus / scroll / Escape / ARIA
// wiring, but renders {children} directly inside the backdrop with no
// container card. The caller owns its own surface + entrance animation
// (BadgeCelebration's bespoke spring, Navbar's mobile-overlay fade);
// only the backdrop fades here.
export const ModalShell = ({
  isOpen,
  onClose,
  role = "dialog",
  zIndex = "modal",
  id,
  children,
  dismissOnBackdrop = true,
  closeOnEscape = true,
  initialFocusRef,
  backdropClassName,
  "aria-label": ariaLabel,
}: ModalShellProps) => {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(isOpen, containerRef, { initialFocusRef });
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          id={id}
          role={role}
          aria-modal="true"
          aria-label={ariaLabel}
          className={cn(
            SHELL_BACKDROP_BASE,
            SHELL_Z_CLASS[zIndex],
            backdropClassName,
          )}
          onClick={dismissOnBackdrop ? onClose : undefined}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export type { ModalShellProps, ModalZIndex };
