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
  it("renders one <BadgeFoilCard> per badge, exposed as clickable buttons when onBadgeClick is provided", () => {
    const badges = [
      mkBadge("a", "a", "Alpha"),
      mkBadge("b", "b", "Beta"),
    ];
    render(
      <BadgeGrid
        badges={badges}
        earnedBadgeIds={new Set(["a"])}
        onBadgeClick={() => {}}
      />,
    );
    const cells = screen.getAllByRole("button");
    expect(cells).toHaveLength(2);
    for (const cell of cells) {
      // Foil-card primitive contract: 3:4 aspect, rounded-card, foil-<rarity>
      expect(cell.className).toMatch(/aspect-\[3\/4\]/);
      expect(cell.className).toMatch(/rounded-card/);
      expect(cell.className).toMatch(/foil-common/);
    }
  });

  it("renders BadgeFoilCard as non-button wrapper when no onBadgeClick is given", () => {
    const badges = [mkBadge("a", "a", "Alpha")];
    render(<BadgeGrid badges={badges} earnedBadgeIds={new Set(["a"])} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("uses a 3/4/5 column grid (reconciled with the 3:4 foil-card aspect)", () => {
    const badges = [mkBadge("a", "a", "Alpha")];
    const { container } = render(
      <BadgeGrid badges={badges} earnedBadgeIds={new Set()} />,
    );
    const grid = container.querySelector(".grid");
    expect(grid).not.toBeNull();
    const cls = (grid as HTMLElement).className;
    expect(cls).toMatch(/grid-cols-3/);
    expect(cls).toMatch(/sm:grid-cols-4/);
    expect(cls).toMatch(/md:grid-cols-5/);
    expect(cls).not.toMatch(/grid-cols-6/);
  });
});
