import { describe, it, expect } from "vitest";
import { useRef } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useFocusTrap } from "./use-focus-trap";

interface HarnessProps {
  active: boolean;
  useInitialFocusRef?: boolean;
  restoreFocus?: boolean;
  empty?: boolean;
}

// Renders a trigger button outside the trap + a container with three
// focusable buttons (or none, when `empty`). Drives the hook exactly
// as a Modal would. Everything is queried by accessible role/name
// (CLAUDE.md: getByRole/getByLabel/getByText, never CSS selectors) —
// the buttons carry visible text and the container is a labelled
// group so it has an addressable accessible name.
const Harness = ({
  active,
  useInitialFocusRef = false,
  restoreFocus = true,
  empty = false,
}: HarnessProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const secondRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(active, containerRef, {
    initialFocusRef: useInitialFocusRef ? secondRef : undefined,
    restoreFocus,
  });

  return (
    <div>
      <button>trigger</button>
      <div ref={containerRef} role="group" aria-label="trap container">
        {empty ? null : (
          <>
            <button>one</button>
            <button ref={secondRef}>two</button>
            <button>three</button>
          </>
        )}
      </div>
    </div>
  );
};

const trigger = () => screen.getByRole("button", { name: "trigger" });
const b1 = () => screen.getByRole("button", { name: "one" });
const b2 = () => screen.getByRole("button", { name: "two" });
const b3 = () => screen.getByRole("button", { name: "three" });
const container = () =>
  screen.getByRole("group", { name: "trap container" });

describe("useFocusTrap — initial focus", () => {
  it("focuses the first focusable in the container on activation", () => {
    render(<Harness active />);
    expect(document.activeElement).toBe(b1());
  });

  it("focuses options.initialFocusRef when provided", () => {
    render(<Harness active useInitialFocusRef />);
    expect(document.activeElement).toBe(b2());
  });

  it("does nothing while inactive", () => {
    render(<Harness active={false} />);
    expect(document.activeElement).toBe(document.body);
  });
});

describe("useFocusTrap — Tab cycling", () => {
  it("wraps from the last focusable forward to the first on Tab", () => {
    render(<Harness active />);
    b3().focus();

    fireEvent.keyDown(container(), { key: "Tab" });

    expect(document.activeElement).toBe(b1());
  });

  it("wraps from the first focusable back to the last on Shift+Tab", () => {
    render(<Harness active />);
    b1().focus();

    fireEvent.keyDown(container(), { key: "Tab", shiftKey: true });

    expect(document.activeElement).toBe(b3());
  });

  it("does not hijack non-Tab keys", () => {
    render(<Harness active />);
    b2().focus();

    fireEvent.keyDown(container(), { key: "ArrowDown" });

    expect(document.activeElement).toBe(b2());
  });
});

describe("useFocusTrap — focus restoration", () => {
  it("restores focus to the trigger when deactivated", () => {
    const { rerender } = render(<Harness active={false} />);
    trigger().focus();
    expect(document.activeElement).toBe(trigger());

    rerender(<Harness active />);
    expect(document.activeElement).toBe(b1());

    rerender(<Harness active={false} />);
    expect(document.activeElement).toBe(trigger());
  });

  it("does NOT restore focus when restoreFocus is false", () => {
    const { rerender } = render(
      <Harness active={false} restoreFocus={false} />,
    );
    trigger().focus();

    rerender(<Harness active restoreFocus={false} />);
    expect(document.activeElement).toBe(b1());

    rerender(<Harness active={false} restoreFocus={false} />);
    expect(document.activeElement).not.toBe(trigger());
    expect(document.activeElement).toBe(b1());
  });
});

describe("useFocusTrap — empty container", () => {
  it("does not crash and focuses the container itself", () => {
    render(<Harness active empty />);
    expect(container()).toHaveAttribute("tabindex", "-1");
    expect(document.activeElement).toBe(container());
  });

  it("preventDefaults Tab without crashing when there are no focusables", () => {
    render(<Harness active empty />);
    expect(() =>
      fireEvent.keyDown(container(), { key: "Tab" }),
    ).not.toThrow();
  });
});
