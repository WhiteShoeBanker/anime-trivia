import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import BadgeIcon from "./BadgeIcon";

describe("<BadgeIcon>", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("resolves a known Lucide icon by name and renders without warning", () => {
    const { container } = render(
      <BadgeIcon iconName="Flame" iconColor="#d97706" rarity="common" />,
    );
    expect(container.querySelector("svg")).not.toBeNull();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("falls back to HelpCircle and warns when icon_name is unknown (dev/browser)", () => {
    const { container } = render(
      <BadgeIcon
        iconName="NotAnIconAtAll"
        iconColor="#d97706"
        rarity="common"
      />,
    );
    expect(container.querySelector("svg")).not.toBeNull();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain("NotAnIconAtAll");
    expect(warnSpy.mock.calls[0]?.[0]).toContain("HelpCircle");
  });

  it("binds container rounding to the rounded-card token (not rounded-xl)", () => {
    const { container } = render(
      <BadgeIcon iconName="Flame" iconColor="#d97706" rarity="common" size="lg" />,
    );
    const outer = container.firstChild as HTMLElement;
    expect(outer.className).toMatch(/rounded-card/);
    expect(outer.className).not.toMatch(/rounded-xl/);
  });

  it("applies size container dimensions matching badge-icon-sm/md/lg tokens", () => {
    const { container: sm } = render(
      <BadgeIcon iconName="Flame" iconColor="#000" rarity="common" size="sm" />,
    );
    const { container: md } = render(
      <BadgeIcon iconName="Flame" iconColor="#000" rarity="common" size="md" />,
    );
    const { container: lg } = render(
      <BadgeIcon iconName="Flame" iconColor="#000" rarity="common" size="lg" />,
    );
    expect((sm.firstChild as HTMLElement).className).toMatch(/w-8 h-8/);
    expect((md.firstChild as HTMLElement).className).toMatch(/w-12 h-12/);
    expect((lg.firstChild as HTMLElement).className).toMatch(/w-16 h-16/);
  });
});
