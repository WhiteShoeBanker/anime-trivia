import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "./Modal";

describe("<Modal> ARIA + role", () => {
  it("defaults to role=dialog with aria-modal=true", () => {
    render(
      <Modal isOpen onClose={() => {}} aria-label="Plain">
        <p>Body</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("renders role=alertdialog when role='alertdialog'", () => {
    render(
      <Modal isOpen onClose={() => {}} role="alertdialog" aria-label="Alert">
        <p>Body</p>
      </Modal>,
    );
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("auto-wires aria-labelledby to the header region when header is present", () => {
    render(
      <Modal isOpen onClose={() => {}} header={<h3>Heading text</h3>}>
        <p>Body</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    const labelledBy = dialog.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    const headerEl = document.getElementById(labelledBy as string);
    expect(headerEl).toHaveTextContent("Heading text");
    expect(headerEl).toBe(dialog.firstElementChild);
    expect(dialog).not.toHaveAttribute("aria-label");
  });

  it("falls back to aria-label when no header is given", () => {
    render(
      <Modal isOpen onClose={() => {}} aria-label="Accessible name">
        <p>Body</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-label", "Accessible name");
    expect(dialog).not.toHaveAttribute("aria-labelledby");
  });

  it("dev-warns when neither header nor aria-label is supplied", () => {
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    render(
      <Modal isOpen onClose={() => {}}>
        <p>Body</p>
      </Modal>,
    );
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain("[Modal]");
    warnSpy.mockRestore();
  });
});

describe("<Modal> backdrop dismissal", () => {
  it("calls onClose on backdrop click by default (dialog)", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} aria-label="M">
        <p>Body</p>
      </Modal>,
    );
    const backdrop = screen.getByRole("dialog").parentElement as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onClose on backdrop click when dismissOnBackdrop=false", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} dismissOnBackdrop={false} aria-label="M">
        <p>Body</p>
      </Modal>,
    );
    const backdrop = screen.getByRole("dialog").parentElement as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("does NOT call onClose on backdrop click for alertdialog (auto-coupling)", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} role="alertdialog" aria-label="M">
        <p>Body</p>
      </Modal>,
    );
    const backdrop = screen.getByRole("alertdialog")
      .parentElement as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("does NOT call onClose when the inner panel is clicked (stopPropagation)", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} aria-label="M">
        <p>Body</p>
      </Modal>,
    );
    fireEvent.click(screen.getByRole("dialog"));
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("<Modal> Escape dismissal", () => {
  it("calls onClose on Escape by default (dialog)", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} aria-label="M">
        <p>Body</p>
      </Modal>,
    );
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onClose on Escape when closeOnEscape=false", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} closeOnEscape={false} aria-label="M">
        <p>Body</p>
      </Modal>,
    );
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("does NOT call onClose on Escape for alertdialog (auto-coupling)", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} role="alertdialog" aria-label="M">
        <p>Body</p>
      </Modal>,
    );
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("<Modal> structure + tokens", () => {
  it("pins header and footer outside the scroll region", () => {
    render(
      <Modal
        isOpen
        onClose={() => {}}
        header={<h3>H</h3>}
        footer={<button>F</button>}
      >
        <p>Body copy</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    const kids = Array.from(dialog.children);
    expect(kids).toHaveLength(3);

    const body = kids[1] as HTMLElement;
    expect(body.className).toMatch(/overflow-y-auto/);
    expect(body).toHaveTextContent("Body copy");

    // Body copy is in the scroll region, not in the pinned header/footer.
    expect(kids[0]).toHaveTextContent("H");
    expect(kids[0]).not.toHaveTextContent("Body copy");
    expect(kids[2]).toHaveTextContent("F");
    expect(kids[2]).not.toHaveTextContent("Body copy");
  });

  it("applies z-modal and bg-ink/70 to the backdrop", () => {
    render(
      <Modal isOpen onClose={() => {}} aria-label="M">
        <p>Body</p>
      </Modal>,
    );
    const backdrop = screen.getByRole("dialog").parentElement as HTMLElement;
    expect(backdrop.className).toMatch(/z-modal/);
    expect(backdrop.className).toMatch(/bg-ink\/70/);
  });

  it("applies surface card tokens to the container", () => {
    render(
      <Modal isOpen onClose={() => {}} aria-label="M">
        <p>Body</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toMatch(/bg-surface/);
    expect(dialog.className).toMatch(/border-rule/);
    expect(dialog.className).toMatch(/rounded-card/);
  });

  it("sheet vs center differ in corner rounding", () => {
    const { unmount } = render(
      <Modal isOpen onClose={() => {}} presentation="sheet" aria-label="S">
        <p>Body</p>
      </Modal>,
    );
    expect(screen.getByRole("dialog").className).toMatch(/rounded-t-card/);
    unmount();

    render(
      <Modal isOpen onClose={() => {}} presentation="center" aria-label="C">
        <p>Body</p>
      </Modal>,
    );
    const center = screen.getByRole("dialog");
    expect(center.className).not.toMatch(/rounded-t-card/);
    expect(center.className).toMatch(/rounded-card/);
  });

  it("merges a custom className onto the container", () => {
    render(
      <Modal isOpen onClose={() => {}} aria-label="M" className="ring-2">
        <p>Body</p>
      </Modal>,
    );
    expect(screen.getByRole("dialog").className).toMatch(/ring-2/);
  });

  it("surfaceless=true omits surface chrome from the container", () => {
    render(
      <Modal isOpen onClose={() => {}} surfaceless aria-label="Bare">
        <p>Body</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).not.toMatch(/bg-surface/);
    expect(dialog.className).not.toMatch(/border-rule/);
    expect(dialog.className).not.toMatch(/rounded-card/);
    expect(dialog.className).not.toMatch(/\bp-5\b/);
    // sizing + flex layout preserved
    expect(dialog.className).toMatch(/max-w-md/);
    expect(dialog.className).toMatch(/flex-col/);
  });

  it("surfaceless=true on a sheet omits chrome incl. the top rounding", () => {
    render(
      <Modal
        isOpen
        onClose={() => {}}
        presentation="sheet"
        surfaceless
        aria-label="Bare sheet"
      >
        <p>Body</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).not.toMatch(/bg-surface/);
    expect(dialog.className).not.toMatch(/border-rule/);
    expect(dialog.className).not.toMatch(/rounded-t-card/);
    expect(dialog.className).not.toMatch(/rounded-card/);
    expect(dialog.className).not.toMatch(/\bp-5\b/);
    // sizing + flex layout preserved
    expect(dialog.className).toMatch(/max-w-md/);
    expect(dialog.className).toMatch(/flex-col/);
  });
});

describe("<Modal> reduced motion", () => {
  const realMatchMedia = window.matchMedia;

  beforeEach(() => {
    window.matchMedia = ((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = realMatchMedia;
  });

  it("still renders the dialog under prefers-reduced-motion", () => {
    render(
      <Modal isOpen onClose={() => {}} presentation="sheet" aria-label="M">
        <p>Reduced body</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent("Reduced body");
  });
});
