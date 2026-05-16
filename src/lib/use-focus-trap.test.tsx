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
// as a Modal would.
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
      <button data-testid="trigger">trigger</button>
      <div ref={containerRef} data-testid="container">
        {empty ? null : (
          <>
            <button data-testid="b1">one</button>
            <button ref={secondRef} data-testid="b2">
              two
            </button>
            <button data-testid="b3">three</button>
          </>
        )}
      </div>
    </div>
  );
};

describe("useFocusTrap — initial focus", () => {
  it("focuses the first focusable in the container on activation", () => {
    render(<Harness active />);
    expect(document.activeElement).toBe(screen.getByTestId("b1"));
  });

  it("focuses options.initialFocusRef when provided", () => {
    render(<Harness active useInitialFocusRef />);
    expect(document.activeElement).toBe(screen.getByTestId("b2"));
  });

  it("does nothing while inactive", () => {
    render(<Harness active={false} />);
    expect(document.activeElement).toBe(document.body);
  });
});

describe("useFocusTrap — Tab cycling", () => {
  it("wraps from the last focusable forward to the first on Tab", () => {
    render(<Harness active />);
    const container = screen.getByTestId("container");
    screen.getByTestId("b3").focus();

    fireEvent.keyDown(container, { key: "Tab" });

    expect(document.activeElement).toBe(screen.getByTestId("b1"));
  });

  it("wraps from the first focusable back to the last on Shift+Tab", () => {
    render(<Harness active />);
    const container = screen.getByTestId("container");
    screen.getByTestId("b1").focus();

    fireEvent.keyDown(container, { key: "Tab", shiftKey: true });

    expect(document.activeElement).toBe(screen.getByTestId("b3"));
  });

  it("does not hijack non-Tab keys", () => {
    render(<Harness active />);
    const container = screen.getByTestId("container");
    screen.getByTestId("b2").focus();

    fireEvent.keyDown(container, { key: "ArrowDown" });

    expect(document.activeElement).toBe(screen.getByTestId("b2"));
  });
});

describe("useFocusTrap — focus restoration", () => {
  it("restores focus to the trigger when deactivated", () => {
    const { rerender } = render(<Harness active={false} />);
    const trigger = screen.getByTestId("trigger");
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    rerender(<Harness active />);
    expect(document.activeElement).toBe(screen.getByTestId("b1"));

    rerender(<Harness active={false} />);
    expect(document.activeElement).toBe(trigger);
  });

  it("does NOT restore focus when restoreFocus is false", () => {
    const { rerender } = render(
      <Harness active={false} restoreFocus={false} />,
    );
    const trigger = screen.getByTestId("trigger");
    trigger.focus();

    rerender(<Harness active restoreFocus={false} />);
    expect(document.activeElement).toBe(screen.getByTestId("b1"));

    rerender(<Harness active={false} restoreFocus={false} />);
    expect(document.activeElement).not.toBe(trigger);
    expect(document.activeElement).toBe(screen.getByTestId("b1"));
  });
});

describe("useFocusTrap — empty container", () => {
  it("does not crash and focuses the container itself", () => {
    render(<Harness active empty />);
    const container = screen.getByTestId("container");
    expect(container).toHaveAttribute("tabindex", "-1");
    expect(document.activeElement).toBe(container);
  });

  it("preventDefaults Tab without crashing when there are no focusables", () => {
    render(<Harness active empty />);
    const container = screen.getByTestId("container");
    expect(() => fireEvent.keyDown(container, { key: "Tab" })).not.toThrow();
  });
});
