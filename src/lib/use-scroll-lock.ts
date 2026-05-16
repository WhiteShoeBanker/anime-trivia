"use client";

import { useEffect } from "react";

/**
 * Locks body scroll while active. Uses position:fixed with scroll-position
 * save/restore — works correctly in iOS Safari / WKWebView (Capacitor),
 * where bare overflow:hidden leaks on input focus and rubber-band.
 *
 * Single source of truth for modal/overlay scroll lock. Replaces the
 * per-call-site document.body.style.overflow = "hidden" pattern.
 */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}
