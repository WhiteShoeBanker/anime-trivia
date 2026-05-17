import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SignOutErrorModal } from "./SignOutErrorModal";

afterEach(() => {
  cleanup();
});

describe("SignOutErrorModal", () => {
  it("renders nothing when error is null", () => {
    render(
      <SignOutErrorModal
        error={null}
        attempts={0}
        onRetry={() => {}}
        onForceSignOut={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("initial focus lands on Try Again, not Cancel", () => {
    render(
      <SignOutErrorModal
        error="Network error"
        attempts={0}
        onRetry={() => {}}
        onForceSignOut={() => {}}
        onCancel={() => {}}
      />,
    );
    const tryAgain = screen.getByRole("button", { name: /try again/i });
    expect(document.activeElement).toBe(tryAgain);
  });

  it("initial focus stays on Try Again even when attempts ≥ 2 reveals Force Sign Out", () => {
    render(
      <SignOutErrorModal
        error="Network error"
        attempts={2}
        onRetry={() => {}}
        onForceSignOut={() => {}}
        onCancel={() => {}}
      />,
    );
    const tryAgain = screen.getByRole("button", { name: /try again/i });
    const forceSignOut = screen.getByRole("button", {
      name: /force sign out/i,
    });
    expect(document.activeElement).toBe(tryAgain);
    expect(document.activeElement).not.toBe(forceSignOut);
  });

  it("Escape does NOT call onCancel (alertdialog auto-coupled closeOnEscape=false)", () => {
    const onCancel = vi.fn();
    render(
      <SignOutErrorModal
        error="Network error"
        attempts={0}
        onRetry={() => {}}
        onForceSignOut={() => {}}
        onCancel={onCancel}
      />,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("backdrop click does NOT call onCancel (alertdialog auto-coupled dismissOnBackdrop=false)", () => {
    const onCancel = vi.fn();
    render(
      <SignOutErrorModal
        error="Network error"
        attempts={0}
        onRetry={() => {}}
        onForceSignOut={() => {}}
        onCancel={onCancel}
      />,
    );
    // The role="presentation" backdrop is the alertdialog's parent
    // (Modal.test.tsx:105-107 precedent — role-based, no CSS selector).
    const backdrop = screen.getByRole("alertdialog")
      .parentElement as HTMLElement;
    fireEvent.click(backdrop);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("Try Again click calls onRetry", () => {
    const onRetry = vi.fn();
    render(
      <SignOutErrorModal
        error="Network error"
        attempts={0}
        onRetry={onRetry}
        onForceSignOut={() => {}}
        onCancel={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
