import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("<Button>", () => {
  it("renders as a <button> by default with type='button'", () => {
    render(<Button>Click me</Button>);
    const el = screen.getByRole("button", { name: /click me/i });
    expect(el.tagName).toBe("BUTTON");
    expect(el).toHaveAttribute("type", "button");
  });

  it("renders as an <a> when href is provided, carrying the href", () => {
    render(<Button href="/somewhere">Go</Button>);
    const el = screen.getByRole("link", { name: /go/i });
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("href", "/somewhere");
  });

  it("applies primary variant classes by default", () => {
    render(<Button>Default</Button>);
    const el = screen.getByRole("button");
    expect(el.className).toMatch(/bg-primary/);
    expect(el.className).toMatch(/text-white/);
    expect(el.className).toMatch(/shadow-ink/);
  });

  it("applies secondary variant classes when variant='secondary'", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const el = screen.getByRole("button");
    expect(el.className).toMatch(/bg-surface/);
    expect(el.className).not.toMatch(/shadow-ink/);
  });

  it("applies tertiary variant classes when variant='tertiary'", () => {
    render(<Button variant="tertiary">Tertiary</Button>);
    const el = screen.getByRole("button");
    expect(el.className).toMatch(/bg-transparent/);
    expect(el.className).toMatch(/text-primary/);
  });

  it("applies outline variant classes when variant='outline'", () => {
    render(<Button variant="outline">Outline</Button>);
    const el = screen.getByRole("button");
    expect(el.className).toMatch(/bg-transparent/);
    expect(el.className).toMatch(/border-rule/);
  });

  it("merges custom className with variant classes", () => {
    render(<Button className="extra-class">Hi</Button>);
    const el = screen.getByRole("button");
    expect(el.className).toMatch(/extra-class/);
    expect(el.className).toMatch(/bg-primary/);
  });

  it("forwards onClick to the underlying button", () => {
    const handler = vi.fn();
    render(<Button onClick={handler}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("respects the disabled prop", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("icon variant renders a 44x44 square (w-11 h-11)", () => {
    render(
      <Button variant="icon" aria-label="close">
        X
      </Button>,
    );
    const el = screen.getByRole("button", { name: /close/i });
    expect(el.className).toMatch(/\bw-11\b/);
    expect(el.className).toMatch(/\bh-11\b/);
  });
});
