import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BadgeGrid from "./BadgeGrid";
import type { Badge } from "@/types";

const mkBadge = (id: string, slug: string, name: string): Badge => ({
  id,
  slug,
  name,
  description: `${name} description`,
  category: "streak",
  icon_name: "Flame",
  icon_color: "#d97706",
  requirement_type: "manual",
  requirement_value: {},
  rarity: "common",
  created_at: "2026-05-10T00:00:00Z",
});

describe("<BadgeGrid>", () => {
  it("binds each cell's rounding to rounded-card (not rounded-xl)", () => {
    const badges = [
      mkBadge("a", "a", "Alpha"),
      mkBadge("b", "b", "Beta"),
    ];
    render(<BadgeGrid badges={badges} earnedBadgeIds={new Set(["a"])} />);
    const cells = screen.getAllByRole("button");
    expect(cells).toHaveLength(2);
    for (const cell of cells) {
      expect(cell.className).toMatch(/rounded-card/);
      expect(cell.className).not.toMatch(/rounded-xl/);
    }
  });
});
