import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ModalShell } from "./ModalShell";

describe("<ModalShell>", () => {
  it("defaults to role=dialog with aria-modal and the required aria-label", () => {
    render(
      <ModalShell isOpen onClose={() => {}} aria-label="Full bleed">
        <div>Shell content</div>
      </ModalShell>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "Full bleed");
  });

  it("engages the focus trap (first focusable child receives focus)", () => {
    render(
      <ModalShell isOpen onClose={() => {}} aria-label="Shell">
        <button>Inside</button>
      </ModalShell>,
    );
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Inside" }),
    );
  });

  it("closes on backdrop click by default and not when dismissOnBackdrop=false", () => {
    const onClose = vi.fn();
    const { unmount } = render(
      <ModalShell isOpen onClose={onClose} aria-label="S">
        <span>x</span>
      </ModalShell>,
    );
    fireEvent.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();

    const onClose2 = vi.fn();
    render(
      <ModalShell
        isOpen
        onClose={onClose2}
        dismissOnBackdrop={false}
        aria-label="S"
      >
        <span>x</span>
      </ModalShell>,
    );
    fireEvent.click(screen.getByRole("dialog"));
    expect(onClose2).not.toHaveBeenCalled();
  });

  it("closes on Escape by default and not when closeOnEscape=false", () => {
    const onClose = vi.fn();
    const { unmount } = render(
      <ModalShell isOpen onClose={onClose} aria-label="S">
        <span>x</span>
      </ModalShell>,
    );
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();

    const onClose2 = vi.fn();
    render(
      <ModalShell
        isOpen
        onClose={onClose2}
        closeOnEscape={false}
        aria-label="S"
      >
        <span>x</span>
      </ModalShell>,
    );
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(onClose2).not.toHaveBeenCalled();
  });

  it("defaults to z-modal (no zIndex) and applies a custom backdropClassName", () => {
    render(
      <ModalShell
        isOpen
        onClose={() => {}}
        aria-label="S"
        backdropClassName="bg-secondary"
      >
        <span>x</span>
      </ModalShell>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toMatch(/z-modal/);
    expect(dialog.className).toMatch(/bg-secondary/);
  });

  it("applies z-nav when zIndex='nav' and does NOT apply z-modal", () => {
    render(
      <ModalShell isOpen onClose={() => {}} zIndex="nav" aria-label="S">
        <span>x</span>
      </ModalShell>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toMatch(/\bz-nav\b/);
    expect(dialog.className).not.toMatch(/\bz-modal\b/);
  });

  it("applies z-celebration when zIndex='celebration' and does NOT apply z-modal", () => {
    render(
      <ModalShell isOpen onClose={() => {}} zIndex="celebration" aria-label="S">
        <span>x</span>
      </ModalShell>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toMatch(/\bz-celebration\b/);
    expect(dialog.className).not.toMatch(/\bz-modal\b/);
  });

  it("passes id through to the dialog element when provided", () => {
    render(
      <ModalShell isOpen onClose={() => {}} id="my-menu" aria-label="Menu">
        <p>x</p>
      </ModalShell>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.id).toBe("my-menu");
  });
});
