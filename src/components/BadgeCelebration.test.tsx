import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import BadgeCelebration from "./BadgeCelebration";
import type { Badge } from "@/types";

// Minimal full-shape Badge fixtures. icon_name "Trophy" resolves in the
// Lucide map so <BadgeFoilCard> doesn't fall back / warn; rarity
// "common" is a valid rarityLabels key.
const makeBadge = (id: string, name: string): Badge => ({
  id,
  slug: id,
  name,
  description: `${name} description`,
  category: "special",
  icon_name: "Trophy",
  icon_color: "#ffffff",
  requirement_type: "manual",
  requirement_value: {},
  rarity: "common",
  created_at: "2026-01-01T00:00:00Z",
});

const mockBadges: Badge[] = [
  makeBadge("b1", "First"),
  makeBadge("b2", "Second"),
  makeBadge("b3", "Third"),
];

// The celebration renders the badge name in an <h2>; <BadgeFoilCard>
// renders the same text in an <h3>, so target level 2 specifically.
const shownBadgeName = () =>
  screen.getByRole("heading", { level: 2 }).textContent;

// The tap-to-advance handler lives on the absolute-inset wrapper; a
// click on the badge-name heading bubbles up to it (no stopPropagation
// between them), so we drive taps through a role query rather than a
// CSS/testid selector.
const tap = () =>
  fireEvent.click(screen.getByRole("heading", { level: 2 }));

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe("BadgeCelebration", () => {
  it("resets currentIndex to 0 when isOpen toggles false → true", () => {
    const { rerender } = render(
      <BadgeCelebration
        isOpen
        badges={mockBadges}
        onComplete={() => {}}
      />,
    );
    expect(shownBadgeName()).toBe("First");

    tap(); // → Second
    tap(); // → Third (last)
    expect(shownBadgeName()).toBe("Third");

    rerender(
      <BadgeCelebration
        isOpen={false}
        badges={mockBadges}
        onComplete={() => {}}
      />,
    );
    rerender(
      <BadgeCelebration
        isOpen
        badges={mockBadges}
        onComplete={() => {}}
      />,
    );

    expect(shownBadgeName()).toBe("First");
  });

  it("advances on tap when not on last badge", () => {
    render(
      <BadgeCelebration
        isOpen
        badges={mockBadges.slice(0, 2)}
        onComplete={() => {}}
      />,
    );
    expect(shownBadgeName()).toBe("First");

    tap();

    expect(shownBadgeName()).toBe("Second");
  });

  it("calls onComplete on tap when on last badge", () => {
    const onComplete = vi.fn();
    render(
      <BadgeCelebration
        isOpen
        badges={mockBadges.slice(0, 1)}
        onComplete={onComplete}
      />,
    );
    expect(shownBadgeName()).toBe("First");

    tap();

    expect(onComplete).toHaveBeenCalled();
  });

  it("auto-advances after 3 seconds via the existing setTimeout", () => {
    render(
      <BadgeCelebration
        isOpen
        badges={mockBadges.slice(0, 2)}
        onComplete={() => {}}
      />,
    );
    expect(shownBadgeName()).toBe("First");

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(shownBadgeName()).toBe("Second");
  });

  it("calls onComplete via setTimeout when on last badge (auto-complete after 3s)", () => {
    const onComplete = vi.fn();
    render(
      <BadgeCelebration
        isOpen
        badges={mockBadges.slice(0, 1)}
        onComplete={onComplete}
      />,
    );

    // The auto-advance timer fires for the last badge too: currentIndex
    // is pushed past the array, the next render hits the !currentBadge
    // branch, and onComplete fires (shipped behaviour — no isLast gate).
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onComplete).toHaveBeenCalled();
  });

  it("does not advance / complete when isOpen=false", () => {
    const onComplete = vi.fn();
    render(
      <BadgeCelebration
        isOpen={false}
        badges={mockBadges.slice(0, 2)}
        onComplete={onComplete}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
