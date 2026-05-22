import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { Star } from "lucide-react";

// Mock useReducedMotion so individual tests can flip it deterministically.
// Default: motion enabled (returns false).
const reducedMotionMock = vi.fn(() => false);
vi.mock("@/lib/use-reduced-motion", () => ({
  default: () => reducedMotionMock(),
}));

import PrestigeCertificate from "./PrestigeCertificate";

describe("<PrestigeCertificate>", () => {
  beforeEach(() => {
    reducedMotionMock.mockReturnValue(false);
  });

  it("renders the title in the display face (Anton via font-display)", () => {
    const { getByText } = render(
      <PrestigeCertificate title="Star League" sealIcon={Star}>
        body
      </PrestigeCertificate>,
    );
    const title = getByText("Star League");
    expect(title.className).toMatch(/font-display/);
  });

  it("renders the title as a semantic h2 heading", () => {
    const { getByRole } = render(
      <PrestigeCertificate title="Star League" sealIcon={Star}>
        body
      </PrestigeCertificate>,
    );
    const heading = getByRole("heading", { level: 2 });
    expect(heading.textContent).toBe("Star League");
  });

  it("renders the seal glyph inside a vermillion (bg-primary) seal", () => {
    const { container } = render(
      <PrestigeCertificate title="Star League" sealIcon={Star}>
        body
      </PrestigeCertificate>,
    );
    const seal = container.querySelector('[data-seal-motion]') as HTMLElement;
    expect(seal).not.toBeNull();
    expect(seal.className).toMatch(/bg-primary/);
    expect(seal.className).toMatch(/rounded-pill/);
    // The seal carries a single Lucide glyph (icon-only, never text).
    expect(seal.querySelector("svg")).not.toBeNull();
  });

  it("applies the paper-mode prestige surface classes on the wrapper", () => {
    const { container } = render(
      <PrestigeCertificate title="Star League" sealIcon={Star}>
        body
      </PrestigeCertificate>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/bg-paper/);
    expect(wrapper.className).toMatch(/text-ink/);
    expect(wrapper.className).toMatch(/border-rule-paper/);
    expect(wrapper.className).toMatch(/rounded-card/);
    expect(wrapper.className).toMatch(/shadow-ink/);
  });

  it("renders body children inside the certificate", () => {
    const { getByText } = render(
      <PrestigeCertificate title="Star League" sealIcon={Star}>
        <p>The ultimate competitive arena.</p>
      </PrestigeCertificate>,
    );
    expect(getByText("The ultimate competitive arena.")).not.toBeNull();
  });

  it("renders the optional eyebrow above the title when provided, omits it otherwise", () => {
    const { getByText, queryByText, rerender } = render(
      <PrestigeCertificate title="Star League" sealIcon={Star} eyebrow="Coming Soon">
        body
      </PrestigeCertificate>,
    );
    expect(getByText("Coming Soon")).not.toBeNull();

    rerender(
      <PrestigeCertificate title="Star League" sealIcon={Star}>
        body
      </PrestigeCertificate>,
    );
    expect(queryByText("Coming Soon")).toBeNull();
  });

  it("renders the seal settled (no stamp press) when prefers-reduced-motion is on", () => {
    reducedMotionMock.mockReturnValue(true);
    const { container } = render(
      <PrestigeCertificate title="Star League" sealIcon={Star}>
        body
      </PrestigeCertificate>,
    );
    const seal = container.querySelector('[data-seal-motion]') as HTMLElement;
    expect(seal.getAttribute("data-seal-motion")).toBe("settled");
  });

  it("plays the stamp-press on the seal when motion is enabled", () => {
    reducedMotionMock.mockReturnValue(false);
    const { container } = render(
      <PrestigeCertificate title="Star League" sealIcon={Star}>
        body
      </PrestigeCertificate>,
    );
    const seal = container.querySelector('[data-seal-motion]') as HTMLElement;
    expect(seal.getAttribute("data-seal-motion")).toBe("stamp");
  });

  it("renders the title as an h1 when headingLevel='h1'", () => {
    const { getByRole } = render(
      <PrestigeCertificate title="Star League" sealIcon={Star} headingLevel="h1">
        body
      </PrestigeCertificate>,
    );
    const heading = getByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("Star League");
  });

  it("renders the title as an h2 when headingLevel='h2' is explicit", () => {
    const { getByRole } = render(
      <PrestigeCertificate title="Star League" sealIcon={Star} headingLevel="h2">
        body
      </PrestigeCertificate>,
    );
    const heading = getByRole("heading", { level: 2 });
    expect(heading.textContent).toBe("Star League");
  });
});
