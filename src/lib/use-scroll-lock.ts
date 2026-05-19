"use client";

import { useEffect } from "react";

// Module-level lock state. Concurrent locks (stacked modals) share one
// captured body snapshot: only the first lock captures + applies, only
// the last unlock restores. Without ref-counting, the first unlock
// race-restores body styles while a second lock is still active, so the
// page scrolls behind a still-open modal.
let lockCount = 0;
let savedState: {
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
  scrollY: number;
} | null = null;

/**
 * Locks body scroll while active. Uses position:fixed with scroll-position
 * save/restore — works correctly in iOS Safari / WKWebView (Capacitor),
 * where bare overflow:hidden leaks on input focus and rubber-band.
 *
 * Ref-counted: the first concurrent lock captures the pre-lock body state
 * and applies the lock; subsequent locks only bump the counter. Each
 * unlock decrements; the last unlock restores from the shared snapshot.
 *
 * Single source of truth for modal/overlay scroll lock. Replaces the
 * per-call-site document.body.style.overflow = "hidden" pattern.
 */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    lockCount += 1;
    if (lockCount === 1) {
      const scrollY = window.scrollY;
      const body = document.body;
      savedState = {
        position: body.style.position,
        top: body.style.top,
        left: body.style.left,
        right: body.style.right,
        width: body.style.width,
        scrollY,
      };

      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
    }

    return () => {
      lockCount -= 1;
      if (lockCount === 0 && savedState) {
        const body = document.body;
        body.style.position = savedState.position;
        body.style.top = savedState.top;
        body.style.left = savedState.left;
        body.style.right = savedState.right;
        body.style.width = savedState.width;
        window.scrollTo(0, savedState.scrollY);
        savedState = null;
      }
    };
  }, [active]);
}
