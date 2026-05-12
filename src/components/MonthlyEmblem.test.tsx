import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import MonthlyEmblem from "./MonthlyEmblem";
import type { GrandPrixEmblem } from "@/types";

const emblem: GrandPrixEmblem = {
  id: "22222222-2222-2222-2222-222222222222",
  tournament_id: "33333333-3333-3333-3333-333333333333",
  name: "Grand Prix Champion — May 2026",
  description: "Imaginary GP emblem for tests",
  icon_name: "Trophy",
  icon_color: "#eab308",
  month_label: "May 2026",
  rarity: "legendary",
  created_at: "2026-05-10T00:00:00Z",
};

describe("<MonthlyEmblem>", () => {
  it("binds the framing color to tier-3 (not yellow-400)", () => {
    const { container } = render(<MonthlyEmblem emblem={emblem} />);
    const frame = container.querySelector(":scope > div > div");
    expect(frame).not.toBeNull();
    const cls = (frame as HTMLElement).className;
    expect(cls).toMatch(/border-tier-3/);
    expect(cls).toMatch(/bg-tier-3/);
    expect(cls).not.toMatch(/border-yellow-400/);
    expect(cls).not.toMatch(/bg-yellow-400/);
  });

  it("binds the frame rounding to rounded-card (not rounded-xl)", () => {
    const { container } = render(<MonthlyEmblem emblem={emblem} />);
    const frame = container.querySelector(":scope > div > div") as HTMLElement;
    expect(frame.className).toMatch(/rounded-card/);
    expect(frame.className).not.toMatch(/rounded-xl/);
  });

  it("renders all three size variants with rounded-card and the canonical containers", () => {
    const dims: Record<"sm" | "md" | "lg", RegExp> = {
      sm: /w-10 h-10/,
      md: /w-14 h-14/,
      lg: /w-20 h-20/,
    };
    (Object.keys(dims) as Array<"sm" | "md" | "lg">).forEach((size) => {
      const { container } = render(
        <MonthlyEmblem emblem={emblem} size={size} showLabel={false} />,
      );
      const frame = container.querySelector(":scope > div > div") as HTMLElement;
      expect(frame.className).toMatch(/rounded-card/);
      expect(frame.className).toMatch(dims[size]);
    });
  });

  it("renders the month label when showLabel is true (default)", () => {
    const { getByText } = render(<MonthlyEmblem emblem={emblem} />);
    expect(getByText("May 2026")).toBeInTheDocument();
  });
});
