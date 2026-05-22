import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import type { Badge, BadgeRarity } from "@/types";

// Mock useReducedMotion so individual tests can flip it deterministically.
// Default: motion enabled (returns false).
const reducedMotionMock = vi.fn(() => false);
vi.mock("@/lib/use-reduced-motion", () => ({
  default: () => reducedMotionMock(),
}));

import BadgeFoilCard from "./BadgeFoilCard";

const baseBadge: Badge = {
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

describe("<BadgeFoilCard>", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    reducedMotionMock.mockReturnValue(false);
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("renders the badge name as an uppercase, line-clamp-2 card title in the default sans (Phase 6c tune: dropped font-display)", () => {
    const { getByText } = render(<BadgeFoilCard badge={baseBadge} earned />);
    const title = getByText("Flame Test");
    // Title inherits font-body (DM Sans) from layout.tsx — no font-display.
    expect(title.className).not.toMatch(/font-display/);
    expect(title.className).toMatch(/uppercase/);
    expect(title.className).toMatch(/line-clamp-2/);
    expect(title.className).toMatch(/tracking-tight/);
  });

  it("resolves a known Lucide icon by name without warning", () => {
    const { container } = render(<BadgeFoilCard badge={baseBadge} earned />);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("falls back to HelpCircle and warns when icon_name is unknown (dev/browser)", () => {
    const badge = { ...baseBadge, icon_name: "NotAnIconAtAll" };
    const { container } = render(<BadgeFoilCard badge={badge} earned />);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain("NotAnIconAtAll");
    expect(warnSpy.mock.calls[0]?.[0]).toContain("HelpCircle");
  });

  it("applies the correct foil-<rarity> class for every rarity", () => {
    const rarities: BadgeRarity[] = [
      "common",
      "uncommon",
      "rare",
      "epic",
      "legendary",
    ];
    for (const rarity of rarities) {
      const { container } = render(
        <BadgeFoilCard badge={{ ...baseBadge, rarity }} earned />,
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain(`foil-${rarity}`);
    }
  });

  it("applies opacity-60 + grayscale when not earned, omits them when earned", () => {
    const { container: locked } = render(
      <BadgeFoilCard badge={baseBadge} earned={false} />,
    );
    const lockedEl = locked.firstChild as HTMLElement;
    expect(lockedEl.className).toMatch(/opacity-60/);
    expect(lockedEl.className).toMatch(/grayscale/);

    const { container: open } = render(
      <BadgeFoilCard badge={baseBadge} earned />,
    );
    const openEl = open.firstChild as HTMLElement;
    expect(openEl.className).not.toMatch(/opacity-60/);
    expect(openEl.className).not.toMatch(/grayscale/);
  });

  it("renders four size variants with the correct width utility class", () => {
    const { container: sm } = render(
      <BadgeFoilCard badge={baseBadge} earned size="sm" />,
    );
    const { container: md } = render(
      <BadgeFoilCard badge={baseBadge} earned size="md" />,
    );
    const { container: lg } = render(
      <BadgeFoilCard badge={baseBadge} earned size="lg" />,
    );
    const { container: xl } = render(
      <BadgeFoilCard badge={baseBadge} earned size="xl" />,
    );
    expect((sm.firstChild as HTMLElement).className).toContain("w-[72px]");
    expect((md.firstChild as HTMLElement).className).toContain("w-24");
    expect((lg.firstChild as HTMLElement).className).toContain("w-32");
    expect((xl.firstChild as HTMLElement).className).toContain("w-48");
  });

  it("renders as <button type=\"button\"> when onClick is provided", () => {
    const onClick = vi.fn();
    const { container } = render(
      <BadgeFoilCard badge={baseBadge} earned onClick={onClick} />,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe("BUTTON");
    expect(el.getAttribute("type")).toBe("button");
    expect(el.className).toMatch(/cursor-pointer/);
    expect(el.className).toMatch(/focus-visible:ring-2/);
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders as a plain wrapper (not button) when onClick is omitted", () => {
    const { container } = render(<BadgeFoilCard badge={baseBadge} earned />);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe("DIV");
    expect(el.className).not.toMatch(/cursor-pointer/);
  });

  it("updates --foil-x / --foil-y CSS custom properties on pointer move", () => {
    const { container } = render(<BadgeFoilCard badge={baseBadge} earned />);
    const el = container.firstChild as HTMLElement;
    // jsdom does not implement layout, so getBoundingClientRect returns
    // zeros — we only need to verify the React style object exposes the
    // CSS custom property names (framer-motion writes them on every render).
    expect(el.style.getPropertyValue("--foil-x")).not.toBe("");
    expect(el.style.getPropertyValue("--foil-y")).not.toBe("");
    fireEvent.pointerMove(el, { clientX: 50, clientY: 50 });
    expect(el.style.getPropertyValue("--foil-x")).not.toBe("");
  });

  it("locks foil parallax to 50%/50% when prefers-reduced-motion is on", () => {
    reducedMotionMock.mockReturnValue(true);
    const { container } = render(<BadgeFoilCard badge={baseBadge} earned />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.getPropertyValue("--foil-x")).toBe("50%");
    expect(el.style.getPropertyValue("--foil-y")).toBe("50%");
  });

  it("does not invoke pointer handlers when not earned (no foil parallax for locked cards)", () => {
    const { container } = render(
      <BadgeFoilCard badge={baseBadge} earned={false} />,
    );
    const el = container.firstChild as HTMLElement;
    const before = el.style.getPropertyValue("--foil-x");
    fireEvent.pointerMove(el, { clientX: 50, clientY: 50 });
    // Static defaults preserved — the handler early-returns when !earned.
    expect(el.style.getPropertyValue("--foil-x")).toBe(before);
  });

  it("applies foil-prestige + border-tier-6 and bypasses the rarity foil class when prestige is set", () => {
    const { container } = render(
      <BadgeFoilCard badge={baseBadge} earned prestige />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("foil-prestige");
    expect(wrapper.className).toContain("border-tier-6");
    // baseBadge.rarity is "rare" — the rarity foil + border must NOT apply.
    expect(wrapper.className).not.toContain("foil-rare");
    expect(wrapper.className).not.toContain("border-blue-500");
  });

  it("leaves the rarity path unchanged when prestige is absent", () => {
    const { container } = render(
      <BadgeFoilCard badge={{ ...baseBadge, rarity: "legendary" }} earned />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("foil-legendary");
    expect(wrapper.className).not.toContain("foil-prestige");
    expect(wrapper.className).not.toContain("border-tier-6");
  });
});
