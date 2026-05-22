import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

// Mock useReducedMotion (BadgeFoilCard dependency) so the adapter doesn't
// pull the reduced-motion query into the test environment.
vi.mock("@/lib/use-reduced-motion", () => ({
  default: () => false,
}));

import StarLeagueEmblem from "./StarLeagueEmblem";

describe("<StarLeagueEmblem>", () => {
  it("renders through BadgeFoilCard with the prestige (Champion Foil) treatment", () => {
    const { container } = render(<StarLeagueEmblem />);
    const card = container.querySelector('[class*="foil-prestige"]') as HTMLElement;
    expect(card).not.toBeNull();
    expect(card.className).toContain("border-tier-6");
    expect(card.className).toMatch(/aspect-\[3\/4\]/);
  });

  it("uses 'Star League' as the synthetic badge card title", () => {
    const { getByText } = render(<StarLeagueEmblem />);
    const title = getByText("Star League");
    expect(title.tagName).toBe("H3");
  });

  it("renders at the xl hero size", () => {
    const { container } = render(<StarLeagueEmblem />);
    const card = container.querySelector('[class*="foil-prestige"]') as HTMLElement;
    expect(card.className).toContain("w-48");
  });

  it("renders earned (unmuted) — static decorative artifact", () => {
    const { container } = render(<StarLeagueEmblem />);
    const card = container.querySelector('[class*="foil-prestige"]') as HTMLElement;
    expect(card.className).not.toMatch(/opacity-60/);
    expect(card.className).not.toMatch(/grayscale/);
  });
});
