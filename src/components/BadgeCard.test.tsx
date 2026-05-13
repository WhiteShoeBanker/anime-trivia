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
  it("renders the elevated-card outer contract: flex row, rounded-card + shadow-ink, not rounded-2xl", () => {
    render(<BadgeCard badge={badge} earned />);
    const el = screen.getByRole("button");
    expect(el.className).toMatch(/rounded-card/);
    expect(el.className).toMatch(/shadow-ink/);
    expect(el.className).toMatch(/bg-surface/);
    expect(el.className).toMatch(/flex/);
    expect(el.className).toMatch(/items-center/);
    expect(el.className).not.toMatch(/rounded-2xl/);
  });

  it("composes a <BadgeFoilCard size=\"sm\"> on the left of the row", () => {
    const { container } = render(<BadgeCard badge={badge} earned />);
    // The foil card carries foil-<rarity> + 3:4 aspect; locate the inner
    // wrapper to assert it exists alongside the text panel.
    const foil = container.querySelector(".foil-rare");
    expect(foil).not.toBeNull();
    expect((foil as HTMLElement).className).toMatch(/aspect-\[3\/4\]/);
    expect((foil as HTMLElement).className).toMatch(/w-\[72px\]/);
  });

  it("renders the rarity label from @/themes rarityLabels", () => {
    render(<BadgeCard badge={badge} earned />);
    // rare → "Rare"
    expect(screen.getByText("Rare")).toBeInTheDocument();
  });

  it("renders the badge name (in both the foil-card title and the text panel) and the description", () => {
    render(<BadgeCard badge={badge} earned />);
    // Name appears twice — Anton card title inside BadgeFoilCard plus the
    // text-panel <h3>. Description only appears in the text panel.
    expect(screen.getAllByText("Flame Test").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("An imaginary badge for tests")).toBeInTheDocument();
  });
});
