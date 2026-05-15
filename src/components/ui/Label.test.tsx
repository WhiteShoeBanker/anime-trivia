import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Label } from "./Label";

describe("<Label>", () => {
  it("renders as a <label> element", () => {
    render(<Label data-testid="l">Email</Label>);
    expect(screen.getByTestId("l").tagName).toBe("LABEL");
  });

  it("renders children", () => {
    render(<Label>Email address</Label>);
    expect(screen.getByText("Email address")).toBeInTheDocument();
  });

  it("applies field-label typography classes (text-sm, font-medium, leading-[1.4])", () => {
    render(<Label data-testid="l">Email</Label>);
    const el = screen.getByTestId("l");
    expect(el.className).toMatch(/text-sm/);
    expect(el.className).toMatch(/font-medium/);
    expect(el.className).toMatch(/leading-\[1\.4\]/);
    expect(el.className).toMatch(/text-text/);
    expect(el.className).toMatch(/mb-1/);
  });

  it("does NOT render the required asterisk by default", () => {
    render(<Label>Email</Label>);
    expect(screen.queryByText("*", { exact: false })).not.toBeInTheDocument();
  });

  it("renders a visible '*' suffix when required", () => {
    render(<Label required>Email</Label>);
    expect(screen.getByText("*", { exact: false })).toBeInTheDocument();
  });

  it("renders the required asterisk in text-text-muted (not accent/primary)", () => {
    render(<Label required>Email</Label>);
    const star = screen.getByText("*", { exact: false });
    expect(star.className).toMatch(/text-text-muted/);
    expect(star.className).not.toMatch(/text-accent/);
    expect(star.className).not.toMatch(/text-primary/);
  });

  it("passes htmlFor through (associates with an input)", () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </>,
    );
    const input = screen.getByLabelText("Email");
    expect(input).toBeInTheDocument();
  });

  it("merges custom className with base classes", () => {
    render(
      <Label className="sr-only" data-testid="l">
        Hidden
      </Label>,
    );
    const el = screen.getByTestId("l");
    expect(el.className).toMatch(/sr-only/);
    expect(el.className).toMatch(/text-sm/);
  });

  it("spreads native label attributes", () => {
    render(
      <Label id="lbl" data-testid="l">
        Email
      </Label>,
    );
    expect(screen.getByTestId("l")).toHaveAttribute("id", "lbl");
  });

  it("forwards ref to the underlying <label>", () => {
    const ref = createRef<HTMLLabelElement>();
    render(<Label ref={ref}>Email</Label>);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("LABEL");
  });
});
