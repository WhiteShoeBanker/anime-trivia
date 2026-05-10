import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("<Card>", () => {
  it("renders as a <div>", () => {
    render(<Card data-testid="card">content</Card>);
    expect(screen.getByTestId("card").tagName).toBe("DIV");
  });

  it("applies default variant classes (bg-surface + rounded-card, no shadow)", () => {
    render(<Card data-testid="card">content</Card>);
    const el = screen.getByTestId("card");
    expect(el.className).toMatch(/bg-surface/);
    expect(el.className).toMatch(/rounded-card/);
    expect(el.className).not.toMatch(/shadow-ink/);
  });

  it("applies elevated variant classes when variant='elevated'", () => {
    render(
      <Card data-testid="card" variant="elevated">
        content
      </Card>,
    );
    const el = screen.getByTestId("card");
    expect(el.className).toMatch(/bg-surface/);
    expect(el.className).toMatch(/rounded-card/);
  });

  it("elevated variant includes shadow-ink", () => {
    render(
      <Card data-testid="card" variant="elevated">
        content
      </Card>,
    );
    expect(screen.getByTestId("card").className).toMatch(/shadow-ink/);
  });

  it("merges custom className with variant classes", () => {
    render(
      <Card data-testid="card" className="my-extra">
        content
      </Card>,
    );
    const el = screen.getByTestId("card");
    expect(el.className).toMatch(/my-extra/);
    expect(el.className).toMatch(/bg-surface/);
  });

  it("renders children", () => {
    render(
      <Card>
        <span>inside</span>
      </Card>,
    );
    expect(screen.getByText("inside")).toBeInTheDocument();
  });
});
