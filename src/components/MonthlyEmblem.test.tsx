import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import type { GrandPrixEmblem } from "@/types";

// Mock useReducedMotion (BadgeFoilCard dependency) so the adapter doesn't
// pull the reduced-motion query into the test environment.
vi.mock("@/lib/use-reduced-motion", () => ({
  default: () => false,
}));

import MonthlyEmblem from "./MonthlyEmblem";

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
  it("renders through BadgeFoilCard with foil-legendary by default", () => {
    const { container } = render(
      <MonthlyEmblem emblem={emblem} showLabel={false} />,
    );
    // The adapter wraps in a flex column; the first child is the foil card.
    const card = container.querySelector(":scope > div > div") as HTMLElement;
    expect(card).not.toBeNull();
    expect(card.className).toMatch(/foil-legendary/);
    expect(card.className).toMatch(/aspect-\[3\/4\]/);
    expect(card.className).toMatch(/rounded-card/);
  });

  it("falls back to legendary when emblem.rarity is not a known BadgeRarity", () => {
    const oddRarity: GrandPrixEmblem = { ...emblem, rarity: "mythic" };
    const { container } = render(
      <MonthlyEmblem emblem={oddRarity} showLabel={false} />,
    );
    const card = container.querySelector(":scope > div > div") as HTMLElement;
    expect(card.className).toMatch(/foil-legendary/);
  });

  it("uses month_label as the card title", () => {
    const { getByText } = render(
      <MonthlyEmblem emblem={emblem} showLabel={false} />,
    );
    const title = getByText("May 2026");
    expect(title.tagName).toBe("H3");
  });

  it("defaults showLabel to true at sm (external label shown)", () => {
    const { container } = render(<MonthlyEmblem emblem={emblem} size="sm" />);
    // Card title + external label both render "May 2026" → two matching nodes.
    const matches = container.querySelectorAll("h3, p");
    const labels = Array.from(matches).filter(
      (n) => n.textContent === "May 2026",
    );
    expect(labels.length).toBe(2);
    const external = labels.find((n) => n.tagName === "P") as HTMLElement;
    expect(external).toBeDefined();
    expect(external.className).toMatch(/text-xs/);
  });

  it("defaults showLabel to false at md / lg / xl (no external label)", () => {
    (["md", "lg", "xl"] as const).forEach((size) => {
      const { container } = render(
        <MonthlyEmblem emblem={emblem} size={size} />,
      );
      // Only the card title (h3) renders the month_label — no <p> beneath.
      const ps = Array.from(container.querySelectorAll("p")).filter(
        (n) => n.textContent === "May 2026",
      );
      expect(ps.length).toBe(0);
    });
  });

  it("honors explicit showLabel override (true at lg, false at sm)", () => {
    const { container: lg } = render(
      <MonthlyEmblem emblem={emblem} size="lg" showLabel />,
    );
    const lgExternal = Array.from(lg.querySelectorAll("p")).filter(
      (n) => n.textContent === "May 2026",
    );
    expect(lgExternal.length).toBe(1);

    const { container: sm } = render(
      <MonthlyEmblem emblem={emblem} size="sm" showLabel={false} />,
    );
    const smExternal = Array.from(sm.querySelectorAll("p")).filter(
      (n) => n.textContent === "May 2026",
    );
    expect(smExternal.length).toBe(0);
  });
});
