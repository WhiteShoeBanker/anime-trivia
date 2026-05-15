import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Pill, type PillTone } from "./Pill";

const TONE_EXPECTATIONS: { tone: PillTone; bg: RegExp; text: RegExp }[] = [
  { tone: "pro", bg: /bg-primary(?!\/)/, text: /text-white/ },
  { tone: "audience-junior", bg: /bg-audience-junior(?!\/)/, text: /text-ink/ },
  { tone: "audience-teen", bg: /bg-audience-teen(?!\/)/, text: /text-ink/ },
  { tone: "audience-mature", bg: /bg-audience-mature(?!\/)/, text: /text-ink/ },
  {
    tone: "content-rating-e",
    bg: /bg-audience-junior(?!\/)/,
    text: /text-ink/,
  },
  { tone: "content-rating-t", bg: /bg-audience-teen(?!\/)/, text: /text-ink/ },
  {
    tone: "content-rating-m",
    bg: /bg-audience-mature(?!\/)/,
    text: /text-ink/,
  },
  {
    tone: "difficulty-easy",
    bg: /bg-audience-junior\/20/,
    text: /text-audience-junior/,
  },
  {
    tone: "difficulty-medium",
    bg: /bg-audience-teen\/20/,
    text: /text-audience-teen/,
  },
  {
    tone: "difficulty-hard",
    bg: /bg-audience-mature\/20/,
    text: /text-audience-mature/,
  },
  {
    tone: "difficulty-impossible",
    bg: /bg-difficulty-impossible\/20/,
    text: /text-difficulty-impossible/,
  },
  {
    tone: "difficulty-mixed",
    bg: /bg-difficulty-mixed\/20/,
    text: /text-difficulty-mixed/,
  },
  { tone: "status-positive", bg: /bg-success\/20/, text: /text-success/ },
  { tone: "status-negative", bg: /bg-accent\/20/, text: /text-accent/ },
  { tone: "status-warning", bg: /bg-warning\/20/, text: /text-warning/ },
  {
    tone: "status-neutral",
    bg: /bg-text-muted\/20/,
    text: /text-text-muted/,
  },
];

describe("<Pill> informational variant", () => {
  it("renders as a <span> by default", () => {
    render(
      <Pill tone="pro" data-testid="p">
        PRO
      </Pill>,
    );
    expect(screen.getByTestId("p").tagName).toBe("SPAN");
  });

  it("applies the shared base classes (rounded-pill, inline-flex)", () => {
    render(
      <Pill tone="pro" data-testid="p">
        PRO
      </Pill>,
    );
    const el = screen.getByTestId("p");
    expect(el.className).toMatch(/rounded-pill/);
    expect(el.className).toMatch(/inline-flex/);
  });

  it("defaults to size='md' when size is not provided", () => {
    render(
      <Pill tone="pro" data-testid="p">
        PRO
      </Pill>,
    );
    const el = screen.getByTestId("p");
    expect(el.className).toMatch(/px-3/);
    expect(el.className).toMatch(/py-1/);
    expect(el.className).toMatch(/text-xs/);
    expect(el.className).toMatch(/tracking-\[0\.04em\]/);
  });

  it("applies size='sm' classes (caption typography, micropill padding)", () => {
    render(
      <Pill tone="pro" size="sm" data-testid="p">
        PRO
      </Pill>,
    );
    const el = screen.getByTestId("p");
    expect(el.className).toMatch(/px-2/);
    expect(el.className).toMatch(/py-0\.5/);
    expect(el.className).toMatch(/text-\[10px\]/);
    expect(el.className).toMatch(/tracking-\[0\.06em\]/);
  });

  it("merges custom className with tone + size classes", () => {
    render(
      <Pill tone="pro" className="extra-class" data-testid="p">
        PRO
      </Pill>,
    );
    const el = screen.getByTestId("p");
    expect(el.className).toMatch(/extra-class/);
    expect(el.className).toMatch(/bg-primary/);
  });

  it("renders children", () => {
    render(
      <Pill tone="pro">
        <strong>inside</strong>
      </Pill>,
    );
    expect(screen.getByText("inside")).toBeInTheDocument();
  });

  it.each(TONE_EXPECTATIONS)(
    "tone='$tone' applies the codified bg + text classes",
    ({ tone, bg, text }) => {
      render(
        <Pill tone={tone} data-testid="p">
          {tone}
        </Pill>,
      );
      const el = screen.getByTestId("p");
      expect(el.className).toMatch(bg);
      expect(el.className).toMatch(text);
    },
  );

  it("warns and renders transparent neutral fallback when tone is missing (dev/browser)", () => {
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    render(<Pill data-testid="p">no-tone</Pill>);
    const el = screen.getByTestId("p");
    expect(el.className).toMatch(/bg-transparent/);
    expect(el.className).toMatch(/text-text-muted/);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain("Missing required `tone`");
    warnSpy.mockRestore();
  });
});

describe("<Pill> interactive variant", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("renders as a <button type='button'>", () => {
    render(
      <Pill interactive onClick={() => {}}>
        Filter
      </Pill>,
    );
    const el = screen.getByRole("button", { name: /filter/i });
    expect(el.tagName).toBe("BUTTON");
    expect(el).toHaveAttribute("type", "button");
  });

  it("applies interactive sizing (min-h-[44px], py-2.5)", () => {
    render(
      <Pill interactive onClick={() => {}}>
        Filter
      </Pill>,
    );
    const el = screen.getByRole("button");
    expect(el.className).toMatch(/min-h-\[44px\]/);
    expect(el.className).toMatch(/py-2\.5/);
    expect(el.className).toMatch(/px-3\.5/);
  });

  it("active=true applies bg-primary/20 text-primary", () => {
    render(
      <Pill interactive active onClick={() => {}}>
        Filter
      </Pill>,
    );
    const el = screen.getByRole("button");
    expect(el.className).toMatch(/bg-primary\/20/);
    expect(el.className).toMatch(/text-primary/);
  });

  it("inactive (default) applies bg-white/5 and hover deepening", () => {
    render(
      <Pill interactive onClick={() => {}}>
        Filter
      </Pill>,
    );
    const el = screen.getByRole("button");
    expect(el.className).toMatch(/bg-white\/5/);
    expect(el.className).toMatch(/text-text-muted/);
    expect(el.className).toMatch(/hover:bg-white\/10/);
    expect(el.className).toMatch(/hover:text-text/);
  });

  it("applies focus-visible ring classes", () => {
    render(
      <Pill interactive onClick={() => {}}>
        Filter
      </Pill>,
    );
    const el = screen.getByRole("button");
    expect(el.className).toMatch(/focus-visible:ring-2/);
    expect(el.className).toMatch(/focus-visible:ring-primary/);
    expect(el.className).toMatch(/focus-visible:ring-offset-surface/);
  });

  it("passes aria-pressed through when provided", () => {
    render(
      <Pill interactive ariaPressed onClick={() => {}}>
        Filter
      </Pill>,
    );
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("fires onClick when clicked", () => {
    const handler = vi.fn();
    render(
      <Pill interactive onClick={handler}>
        Filter
      </Pill>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does NOT warn when interactive (tone is intentionally absent)", () => {
    render(
      <Pill interactive onClick={() => {}}>
        Filter
      </Pill>,
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
