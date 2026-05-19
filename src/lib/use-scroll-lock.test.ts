import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScrollLock } from "./use-scroll-lock";

const SCROLL_Y = 250;

describe("useScrollLock", () => {
  let scrollToSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    Object.defineProperty(window, "scrollY", {
      value: SCROLL_Y,
      configurable: true,
      writable: true,
    });
    scrollToSpy = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.removeAttribute("style");
    Object.defineProperty(window, "scrollY", {
      value: 0,
      configurable: true,
      writable: true,
    });
  });

  it("does nothing while inactive", () => {
    renderHook(() => useScrollLock(false));
    expect(document.body.style.position).toBe("");
    expect(document.body.style.top).toBe("");
  });

  it("locks the body with position:fixed and the saved scroll offset", () => {
    renderHook(() => useScrollLock(true));
    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.top).toBe(`-${SCROLL_Y}px`);
    expect(document.body.style.width).toBe("100%");
  });

  it("restores prior body styles and scroll position on unmount", () => {
    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.body.style.position).toBe("fixed");

    unmount();

    expect(document.body.style.position).toBe("");
    expect(document.body.style.top).toBe("");
    expect(scrollToSpy).toHaveBeenCalledWith(0, SCROLL_Y);
  });

  it("engages on false→true and releases on true→false via rerender", () => {
    const { rerender } = renderHook(
      ({ active }: { active: boolean }) => useScrollLock(active),
      { initialProps: { active: false } },
    );
    expect(document.body.style.position).toBe("");

    rerender({ active: true });
    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.top).toBe(`-${SCROLL_Y}px`);

    rerender({ active: false });
    expect(document.body.style.position).toBe("");
    expect(scrollToSpy).toHaveBeenCalledWith(0, SCROLL_Y);
  });

  describe("concurrent locks (ref-counted)", () => {
    it("two concurrent locks both keep the body locked", () => {
      const a = renderHook(() => useScrollLock(true));
      const b = renderHook(() => useScrollLock(true));
      expect(document.body.style.position).toBe("fixed");
      a.unmount();
      b.unmount();
    });

    it("first unlock keeps the body locked while the second is still active", () => {
      const a = renderHook(() => useScrollLock(true));
      const b = renderHook(() => useScrollLock(true));
      a.unmount();
      expect(document.body.style.position).toBe("fixed");
      expect(document.body.style.top).toBe(`-${SCROLL_Y}px`);
      b.unmount();
    });

    it("the last unlock restores the body to its pre-lock state", () => {
      const a = renderHook(() => useScrollLock(true));
      const b = renderHook(() => useScrollLock(true));
      a.unmount();
      b.unmount();
      expect(document.body.style.position).toBe("");
      expect(document.body.style.top).toBe("");
      expect(scrollToSpy).toHaveBeenCalledWith(0, SCROLL_Y);
    });

    it("lockCount resets between tests (cleanup hygiene — first lock here re-applies)", () => {
      expect(document.body.style.position).toBe("");
      const a = renderHook(() => useScrollLock(true));
      expect(document.body.style.position).toBe("fixed");
      a.unmount();
      expect(document.body.style.position).toBe("");
    });
  });
});
