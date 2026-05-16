"use client";

import { useEffect, type RefObject } from "react";

interface UseFocusTrapOptions {
  initialFocusRef?: RefObject<HTMLElement | null>;
  restoreFocus?: boolean;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Traps Tab/Shift+Tab focus inside containerRef while active. Captures the
 * trigger element on activation and (by default) restores focus to it on
 * cleanup. Focusables are recomputed on every keydown so dynamically loaded
 * content (e.g. ChallengeModal's async anime list) is handled correctly.
 *
 * Single source of truth for modal focus management.
 */
export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
  options: UseFocusTrapOptions = {},
): void {
  const { initialFocusRef, restoreFocus = true } = options;

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const trigger = document.activeElement as HTMLElement | null;

    let injectedTabIndex = false;
    if (!container.hasAttribute("tabindex")) {
      container.setAttribute("tabindex", "-1");
      injectedTabIndex = true;
    }

    const initial =
      initialFocusRef?.current ??
      (container.querySelector(FOCUSABLE_SELECTOR) as HTMLElement | null) ??
      container;
    initial.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const focusables = Array.from(
        container!.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement as HTMLElement | null;

      if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    }

    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      if (injectedTabIndex) container.removeAttribute("tabindex");
      if (restoreFocus && trigger) trigger.focus();
    };
  }, [active, containerRef, initialFocusRef, restoreFocus]);
}

export type { UseFocusTrapOptions };
