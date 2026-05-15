import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { FieldError } from "./FieldError";

describe("<FieldError>", () => {
  it("renders as a <p> element", () => {
    render(<FieldError data-testid="e">Email is required</FieldError>);
    expect(screen.getByTestId("e").tagName).toBe("P");
  });

  it("renders children text", () => {
    render(<FieldError>Email is required</FieldError>);
    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("applies text-xs text-error-strong mt-1 classes", () => {
    render(<FieldError data-testid="e">err</FieldError>);
    const el = screen.getByTestId("e");
    expect(el.className).toMatch(/text-xs/);
    expect(el.className).toMatch(/text-error-strong/);
    expect(el.className).toMatch(/mt-1/);
  });

  it("binds body text to error-strong, NOT the sub-AA error token", () => {
    render(<FieldError data-testid="e">err</FieldError>);
    const el = screen.getByTestId("e");
    expect(el.className).toMatch(/text-error-strong/);
    // text-error (#991b1b) is sub-AA for body — must not be the message color.
    expect(el.className).not.toMatch(/text-error(?!-strong)/);
  });

  it("does NOT bind to text-accent (L307 incorrect-answer reservation)", () => {
    render(<FieldError data-testid="e">err</FieldError>);
    expect(screen.getByTestId("e").className).not.toMatch(/text-accent/);
  });

  it("sets aria-live='polite' (announce without preempting focus)", () => {
    render(<FieldError data-testid="e">err</FieldError>);
    expect(screen.getByTestId("e")).toHaveAttribute("aria-live", "polite");
  });

  it("does NOT use role='alert' (polite, not assertive)", () => {
    render(<FieldError data-testid="e">err</FieldError>);
    expect(screen.getByTestId("e")).not.toHaveAttribute("role", "alert");
  });

  it("merges custom className with base classes", () => {
    render(
      <FieldError className="font-semibold" data-testid="e">
        err
      </FieldError>,
    );
    const el = screen.getByTestId("e");
    expect(el.className).toMatch(/font-semibold/);
    expect(el.className).toMatch(/text-error-strong/);
  });

  it("passes id through (for aria-describedby wiring)", () => {
    render(<FieldError id="email-error">err</FieldError>);
    expect(screen.getByText("err")).toHaveAttribute("id", "email-error");
  });

  it("forwards ref to the underlying <p>", () => {
    const ref = createRef<HTMLParagraphElement>();
    render(<FieldError ref={ref}>err</FieldError>);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("P");
  });
});
