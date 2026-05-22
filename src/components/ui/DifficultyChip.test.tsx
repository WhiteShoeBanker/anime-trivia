import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { DifficultyChip } from "./DifficultyChip";
import type { DifficultyTone } from "@/themes";

const ACTIVE_EXPECTATIONS: { tone: DifficultyTone; bg: RegExp; text: RegExp }[] =
  [
    { tone: "easy", bg: /bg-audience-junior(?!\/)/, text: /text-ink/ },
    { tone: "medium", bg: /bg-audience-teen(?!\/)/, text: /text-ink/ },
    { tone: "hard", bg: /bg-audience-mature(?!\/)/, text: /text-ink/ },
    {
      tone: "impossible",
      bg: /bg-difficulty-impossible(?!\/)/,
      text: /text-ink/,
    },
    { tone: "mixed", bg: /bg-difficulty-mixed(?!\/)/, text: /text-ink/ },
  ];

const INACTIVE_EXPECTATIONS: {
  tone: DifficultyTone;
  bg: RegExp;
  text: RegExp;
}[] = [
  {
    tone: "easy",
    bg: /bg-audience-junior\/20/,
    text: /text-audience-junior/,
  },
  {
    tone: "medium",
    bg: /bg-audience-teen\/20/,
    text: /text-audience-teen/,
  },
  {
    tone: "hard",
    bg: /bg-audience-mature\/20/,
    text: /text-audience-mature/,
  },
  {
    tone: "impossible",
    bg: /bg-difficulty-impossible\/20/,
    text: /text-difficulty-impossible/,
  },
  {
    tone: "mixed",
    bg: /bg-difficulty-mixed\/20/,
    text: /text-difficulty-mixed/,
  },
];

describe("<DifficultyChip> base shape", () => {
  it("renders as a <button type='button'>", () => {
    render(
      <DifficultyChip tone="easy" active>
        Easy
      </DifficultyChip>,
    );
    const btn = screen.getByRole("button", { name: /easy/i });
    expect(btn.tagName).toBe("BUTTON");
    expect(btn).toHaveAttribute("type", "button");
  });

  it("applies shared base classes (rounded-pill, inline-flex, transition)", () => {
    render(
      <DifficultyChip tone="easy" active>
        Easy
      </DifficultyChip>,
    );
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/rounded-pill/);
    expect(btn.className).toMatch(/inline-flex/);
    expect(btn.className).toMatch(/transition-colors/);
  });

  it("applies pill-interactive sizing (min-h-[44px], py-2.5, px-3.5)", () => {
    render(
      <DifficultyChip tone="easy" active>
        Easy
      </DifficultyChip>,
    );
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/min-h-\[44px\]/);
    expect(btn.className).toMatch(/py-2\.5/);
    expect(btn.className).toMatch(/px-3\.5/);
    expect(btn.className).toMatch(/text-xs/);
    expect(btn.className).toMatch(/tracking-\[0\.04em\]/);
  });

  it("applies focus-visible ring classes", () => {
    render(
      <DifficultyChip tone="easy" active>
        Easy
      </DifficultyChip>,
    );
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/focus-visible:ring-2/);
    expect(btn.className).toMatch(/focus-visible:ring-primary/);
    expect(btn.className).toMatch(/focus-visible:ring-offset-surface/);
  });

  it("merges custom className with base + tone classes", () => {
    render(
      <DifficultyChip tone="easy" active className="ml-2">
        Easy
      </DifficultyChip>,
    );
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/ml-2/);
    expect(btn.className).toMatch(/bg-audience-junior/);
  });

  it("renders children", () => {
    render(
      <DifficultyChip tone="easy" active>
        <span>Easy 80</span>
      </DifficultyChip>,
    );
    expect(screen.getByText("Easy 80")).toBeInTheDocument();
  });

  it("forwards ref to the underlying button", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <DifficultyChip ref={ref} tone="easy" active>
        Easy
      </DifficultyChip>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("BUTTON");
  });
});

describe("<DifficultyChip> active tone class composition", () => {
  it.each(ACTIVE_EXPECTATIONS)(
    "tone='$tone' (active) applies filled bg + text-ink",
    ({ tone, bg, text }) => {
      render(
        <DifficultyChip tone={tone} active>
          {tone}
        </DifficultyChip>,
      );
      const btn = screen.getByRole("button");
      expect(btn.className).toMatch(bg);
      expect(btn.className).toMatch(text);
    },
  );

  it.each(ACTIVE_EXPECTATIONS)(
    "tone='$tone' (active) applies hover 10% deepening",
    ({ tone }) => {
      render(
        <DifficultyChip tone={tone} active>
          {tone}
        </DifficultyChip>,
      );
      const btn = screen.getByRole("button");
      expect(btn.className).toMatch(/hover:bg-/);
      expect(btn.className).toMatch(/\/90/);
    },
  );
});

describe("<DifficultyChip> inactive tone class composition", () => {
  it.each(INACTIVE_EXPECTATIONS)(
    "tone='$tone' (inactive) applies ghost /20 bg + colored text",
    ({ tone, bg, text }) => {
      render(
        <DifficultyChip tone={tone} active={false}>
          {tone}
        </DifficultyChip>,
      );
      const btn = screen.getByRole("button");
      expect(btn.className).toMatch(bg);
      expect(btn.className).toMatch(text);
    },
  );

  it.each(INACTIVE_EXPECTATIONS)(
    "tone='$tone' (inactive) applies hover /30 deepening",
    ({ tone }) => {
      render(
        <DifficultyChip tone={tone} active={false}>
          {tone}
        </DifficultyChip>,
      );
      const btn = screen.getByRole("button");
      expect(btn.className).toMatch(/hover:bg-.+\/30/);
    },
  );
});

describe("<DifficultyChip> locked state", () => {
  it("applies bg-surface + border-rule + text-text-muted + opacity-50 + cursor-not-allowed", () => {
    render(
      <DifficultyChip tone="hard" active={false} locked>
        Hard
      </DifficultyChip>,
    );
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/bg-surface/);
    expect(btn.className).toMatch(/border-rule/);
    expect(btn.className).toMatch(/text-text-muted/);
    expect(btn.className).toMatch(/opacity-50/);
    expect(btn.className).toMatch(/cursor-not-allowed/);
  });

  it("sets native disabled and aria-disabled when locked", () => {
    render(
      <DifficultyChip tone="hard" active={false} locked>
        Hard
      </DifficultyChip>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-disabled", "true");
  });

  it("does NOT apply tone classes when locked (locked overrides tone)", () => {
    render(
      <DifficultyChip tone="hard" active={false} locked>
        Hard
      </DifficultyChip>,
    );
    const btn = screen.getByRole("button");
    expect(btn.className).not.toMatch(/bg-audience-mature/);
  });

  it("does NOT set aria-pressed when locked", () => {
    render(
      <DifficultyChip tone="hard" active={false} locked>
        Hard
      </DifficultyChip>,
    );
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-pressed");
  });
});

describe("<DifficultyChip> aria-pressed", () => {
  it("aria-pressed=true when active and not locked", () => {
    render(
      <DifficultyChip tone="easy" active>
        Easy
      </DifficultyChip>,
    );
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("aria-pressed=false when inactive and not locked", () => {
    render(
      <DifficultyChip tone="easy" active={false}>
        Easy
      </DifficultyChip>,
    );
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});

describe("<DifficultyChip> click behavior", () => {
  it("fires onClick when clicked + active", () => {
    const handler = vi.fn();
    render(
      <DifficultyChip tone="easy" active onClick={handler}>
        Easy
      </DifficultyChip>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("fires onClick when clicked + inactive", () => {
    const handler = vi.fn();
    render(
      <DifficultyChip tone="easy" active={false} onClick={handler}>
        Easy
      </DifficultyChip>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does NOT fire onClick when locked", () => {
    const handler = vi.fn();
    render(
      <DifficultyChip tone="hard" active={false} locked onClick={handler}>
        Hard
      </DifficultyChip>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("<DifficultyChip> unknown tone fallback", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("warns and renders fallback when tone is unknown", () => {
    render(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <DifficultyChip tone={"bogus" as any} active>
        ??
      </DifficultyChip>,
    );
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/bg-transparent/);
    expect(btn.className).toMatch(/text-text-muted/);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain("Unknown tone");
  });

  it("does NOT warn on a known tone", () => {
    render(
      <DifficultyChip tone="easy" active>
        Easy
      </DifficultyChip>,
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
