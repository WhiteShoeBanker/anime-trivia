import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CountBadge } from "./CountBadge";

describe("<CountBadge>", () => {
  it("renders as a <span>", () => {
    render(<CountBadge data-testid="cb">3</CountBadge>);
    expect(screen.getByTestId("cb").tagName).toBe("SPAN");
  });

  it("defaults to size='sm' (w-4 h-4 / text-[10px])", () => {
    render(<CountBadge data-testid="cb">3</CountBadge>);
    const el = screen.getByTestId("cb");
    expect(el.className).toMatch(/\bw-4\b/);
    expect(el.className).toMatch(/\bh-4\b/);
    expect(el.className).toMatch(/text-\[10px\]/);
  });

  it("applies size='md' (w-5 h-5 / text-xs)", () => {
    render(
      <CountBadge size="md" data-testid="cb">
        3
      </CountBadge>,
    );
    const el = screen.getByTestId("cb");
    expect(el.className).toMatch(/\bw-5\b/);
    expect(el.className).toMatch(/\bh-5\b/);
    expect(el.className).toMatch(/text-xs/);
  });

  it("applies the base bg-accent / text-white / rounded-pill classes", () => {
    render(<CountBadge data-testid="cb">3</CountBadge>);
    const el = screen.getByTestId("cb");
    expect(el.className).toMatch(/bg-accent/);
    expect(el.className).toMatch(/text-white/);
    expect(el.className).toMatch(/rounded-pill/);
    expect(el.className).toMatch(/font-bold/);
  });

  it("merges custom className with size + base classes", () => {
    render(
      <CountBadge className="ml-2" data-testid="cb">
        3
      </CountBadge>,
    );
    const el = screen.getByTestId("cb");
    expect(el.className).toMatch(/ml-2/);
    expect(el.className).toMatch(/bg-accent/);
  });

  it("renders children", () => {
    render(<CountBadge>42</CountBadge>);
    expect(screen.getByText("42")).toBeInTheDocument();
  });
});
