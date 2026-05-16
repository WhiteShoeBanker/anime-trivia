import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { FieldHint } from "./FieldHint";

describe("<FieldHint>", () => {
  it("renders as a <p> element", () => {
    render(<FieldHint data-testid="h">Use 8+ characters</FieldHint>);
    expect(screen.getByTestId("h").tagName).toBe("P");
  });

  it("renders children text", () => {
    render(<FieldHint>Use 8+ characters</FieldHint>);
    expect(screen.getByText("Use 8+ characters")).toBeInTheDocument();
  });

  it("applies text-xs text-text-muted mt-1 classes", () => {
    render(<FieldHint data-testid="h">hint</FieldHint>);
    const el = screen.getByTestId("h");
    expect(el.className).toMatch(/text-xs/);
    expect(el.className).toMatch(/text-text-muted/);
    expect(el.className).toMatch(/mt-1/);
  });

  it("renders helper text at full text-text-muted alpha (no /60 placeholder alpha)", () => {
    render(<FieldHint data-testid="h">hint</FieldHint>);
    expect(screen.getByTestId("h").className).not.toMatch(/text-text-muted\/60/);
  });

  it("merges custom className with base classes", () => {
    render(
      <FieldHint className="italic" data-testid="h">
        hint
      </FieldHint>,
    );
    const el = screen.getByTestId("h");
    expect(el.className).toMatch(/italic/);
    expect(el.className).toMatch(/text-xs/);
  });

  it("passes id through (for aria-describedby wiring)", () => {
    render(<FieldHint id="email-hint">hint</FieldHint>);
    expect(screen.getByText("hint")).toHaveAttribute("id", "email-hint");
  });

  it("spreads native paragraph attributes", () => {
    render(
      <FieldHint data-testid="h" role="note">
        hint
      </FieldHint>,
    );
    expect(screen.getByTestId("h")).toHaveAttribute("role", "note");
  });

  it("forwards ref to the underlying <p>", () => {
    const ref = createRef<HTMLParagraphElement>();
    render(<FieldHint ref={ref}>hint</FieldHint>);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("P");
  });
});
