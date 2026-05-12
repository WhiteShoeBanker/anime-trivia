import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BadgeCard from "./BadgeCard";
import type { Badge } from "@/types";

const badge: Badge = {
  id: "11111111-1111-1111-1111-111111111111",
  slug: "flame-test",
  name: "Flame Test",
  description: "An imaginary badge for tests",
  category: "streak",
  icon_name: "Flame",
  icon_color: "#d97706",
  requirement_type: "manual",
  requirement_value: {},
  rarity: "rare",
  created_at: "2026-05-10T00:00:00Z",
};

describe("<BadgeCard>", () => {
  it("renders the elevated-card contract: rounded-card + shadow-ink, not rounded-2xl", () => {
    render(<BadgeCard badge={badge} earned />);
    const el = screen.getByRole("button");
    expect(el.className).toMatch(/rounded-card/);
    expect(el.className).toMatch(/shadow-ink/);
    expect(el.className).toMatch(/bg-surface/);
    expect(el.className).not.toMatch(/rounded-2xl/);
  });

  it("renders the rarity label from @/themes rarityLabels", () => {
    render(<BadgeCard badge={badge} earned />);
    // rare → "Rare"
    expect(screen.getByText("Rare")).toBeInTheDocument();
  });

  it("renders the badge name and description", () => {
    render(<BadgeCard badge={badge} earned />);
    expect(screen.getByText("Flame Test")).toBeInTheDocument();
    expect(screen.getByText("An imaginary badge for tests")).toBeInTheDocument();
  });
});
