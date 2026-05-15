import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import AnswerButton from "./AnswerButton";

vi.mock("@/lib/use-reduced-motion", () => ({
  default: vi.fn(() => false),
}));

// Capture props passed to motion.button so we can assert against `animate`
// directly. framer-motion does not synchronously resolve animate keyframes
// into inline transform styles in JSDOM, so DOM-level assertions are flaky.
const motionButtonProps: Record<string, unknown>[] = [];
vi.mock("framer-motion", () => ({
  motion: {
    button: (props: Record<string, unknown>) => {
      motionButtonProps.push(props);
      const {
        animate: _animate,
        transition: _transition,
        ...rest
      } = props as { animate?: unknown; transition?: unknown };
      return <button {...(rest as Record<string, unknown>)} />;
    },
  },
}));

import useReducedMotion from "@/lib/use-reduced-motion";

const baseProps = {
  text: "Shadow Clone Jutsu",
  index: 0,
  isSelected: false,
  isCorrect: false,
  isRevealed: false,
  onClick: () => {},
  disabled: false,
};

describe("<AnswerButton> tile class composition", () => {
  beforeEach(() => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  it("default state applies bg-surface + neutral hover/focus-visible classes", () => {
    render(<AnswerButton {...baseProps} />);
    const btn = screen.getByRole("radio");
    expect(btn.className).toMatch(/bg-surface/);
    expect(btn.className).toMatch(/border-white\/10/);
    expect(btn.className).toMatch(/hover:border-white\/20/);
    expect(btn.className).toMatch(/hover:bg-white\/5/);
    expect(btn.className).toMatch(/focus-visible:border-white\/20/);
    expect(btn.className).toMatch(/focus-visible:bg-white\/5/);
    expect(btn.className).toMatch(/focus-visible:outline-none/);
  });

  it("default state does NOT use brand-tinted hover (no hover:border-primary)", () => {
    render(<AnswerButton {...baseProps} />);
    const btn = screen.getByRole("radio");
    expect(btn.className).not.toMatch(/hover:border-primary/);
  });

  it("selected (unrevealed) applies border-primary + bg-primary/10", () => {
    render(<AnswerButton {...baseProps} isSelected />);
    const btn = screen.getByRole("radio");
    expect(btn.className).toMatch(/border-primary/);
    expect(btn.className).toMatch(/bg-primary\/10/);
  });

  it("correct (revealed) applies border-success + bg-success/10", () => {
    render(
      <AnswerButton
        {...baseProps}
        isSelected
        isCorrect
        isRevealed
        disabled
      />,
    );
    const btn = screen.getByRole("radio");
    expect(btn.className).toMatch(/border-success/);
    expect(btn.className).toMatch(/bg-success\/10/);
  });

  it("incorrect-selected (revealed) applies border-accent + bg-accent/10 (NOT red-500)", () => {
    render(
      <AnswerButton {...baseProps} isSelected isRevealed disabled />,
    );
    const btn = screen.getByRole("radio");
    expect(btn.className).toMatch(/border-accent/);
    expect(btn.className).toMatch(/bg-accent\/10/);
    expect(btn.className).not.toMatch(/border-red-500/);
    expect(btn.className).not.toMatch(/bg-red-500/);
  });

  it("disabled-revealed-unselected applies opacity-50 + bg-surface", () => {
    render(<AnswerButton {...baseProps} isRevealed disabled />);
    const btn = screen.getByRole("radio");
    expect(btn.className).toMatch(/opacity-50/);
    expect(btn.className).toMatch(/bg-surface/);
  });

  it("wrapper uses rounded-sharp (NOT rounded-xl)", () => {
    render(<AnswerButton {...baseProps} />);
    const btn = screen.getByRole("radio");
    expect(btn.className).toMatch(/rounded-sharp/);
    expect(btn.className).not.toMatch(/rounded-xl/);
  });

  it("wrapper enforces min-h-[56px] floor", () => {
    render(<AnswerButton {...baseProps} />);
    expect(screen.getByRole("radio").className).toMatch(/min-h-\[56px\]/);
  });
});

describe("<AnswerButton> letter chip class composition", () => {
  it("correct chip uses bg-success + text-ink (AA contrast)", () => {
    render(
      <AnswerButton
        {...baseProps}
        isSelected
        isCorrect
        isRevealed
        disabled
      />,
    );
    const chip = screen.getByRole("radio").querySelector("span");
    expect(chip?.className).toMatch(/bg-success/);
    expect(chip?.className).toMatch(/text-ink/);
    expect(chip?.className).not.toMatch(/text-white/);
  });

  it("incorrect chip uses bg-accent + text-white (AA contrast)", () => {
    render(
      <AnswerButton {...baseProps} isSelected isRevealed disabled />,
    );
    const chip = screen.getByRole("radio").querySelector("span");
    expect(chip?.className).toMatch(/bg-accent/);
    expect(chip?.className).toMatch(/text-white/);
  });

  it("selected chip uses bg-primary + text-white", () => {
    render(<AnswerButton {...baseProps} isSelected />);
    const chip = screen.getByRole("radio").querySelector("span");
    expect(chip?.className).toMatch(/bg-primary/);
    expect(chip?.className).toMatch(/text-white/);
  });

  it("default chip uses bg-white/10 + text-white/70", () => {
    render(<AnswerButton {...baseProps} />);
    const chip = screen.getByRole("radio").querySelector("span");
    expect(chip?.className).toMatch(/bg-white\/10/);
    expect(chip?.className).toMatch(/text-white\/70/);
  });

  it("chip is rounded-pill (32×32 letter circle)", () => {
    render(<AnswerButton {...baseProps} />);
    const chip = screen.getByRole("radio").querySelector("span");
    expect(chip?.className).toMatch(/rounded-pill/);
    expect(chip?.className).toMatch(/w-8/);
    expect(chip?.className).toMatch(/h-8/);
  });
});

describe("<AnswerButton> chip glyph", () => {
  it("renders A/B/C/D letter in default state", () => {
    render(<AnswerButton {...baseProps} index={2} />);
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("renders Check glyph (no letter) in correct state", () => {
    render(
      <AnswerButton
        {...baseProps}
        index={1}
        isSelected
        isCorrect
        isRevealed
        disabled
      />,
    );
    expect(screen.queryByText("B")).not.toBeInTheDocument();
    const chip = screen.getByRole("radio").querySelector("span");
    expect(chip?.querySelector("svg")).toBeInTheDocument();
  });

  it("renders X glyph (no letter) in incorrect-selected state", () => {
    render(
      <AnswerButton
        {...baseProps}
        index={3}
        isSelected
        isRevealed
        disabled
      />,
    );
    expect(screen.queryByText("D")).not.toBeInTheDocument();
    const chip = screen.getByRole("radio").querySelector("span");
    expect(chip?.querySelector("svg")).toBeInTheDocument();
  });
});

describe("<AnswerButton> ARIA contract", () => {
  it.each([
    [0, "A", "Shadow Clone Jutsu"],
    [1, "B", "Fireball Jutsu"],
    [2, "C", "Chidori"],
    [3, "D", "Rasengan"],
  ])(
    'index=%i renders aria-label="Option %s: %s"',
    (index, letter, text) => {
      render(<AnswerButton {...baseProps} text={text} index={index} />);
      expect(
        screen.getByRole("radio", { name: `Option ${letter}: ${text}` }),
      ).toBeInTheDocument();
    },
  );

  it("aria-label format is preserved when revealed-correct", () => {
    render(
      <AnswerButton
        {...baseProps}
        index={0}
        isSelected
        isCorrect
        isRevealed
        disabled
      />,
    );
    expect(
      screen.getByRole("radio", { name: /^Option A:/ }),
    ).toBeInTheDocument();
  });

  it("aria-label format is preserved when revealed-incorrect-selected", () => {
    render(
      <AnswerButton {...baseProps} index={2} isSelected isRevealed disabled />,
    );
    expect(
      screen.getByRole("radio", { name: /^Option C:/ }),
    ).toBeInTheDocument();
  });

  it("aria-checked reflects isSelected=false", () => {
    render(<AnswerButton {...baseProps} />);
    expect(screen.getByRole("radio")).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("aria-checked reflects isSelected=true", () => {
    render(<AnswerButton {...baseProps} isSelected />);
    expect(screen.getByRole("radio")).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("aria-disabled=true is set when disabled", () => {
    render(<AnswerButton {...baseProps} disabled />);
    expect(screen.getByRole("radio")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("aria-disabled=false is set when not disabled", () => {
    render(<AnswerButton {...baseProps} />);
    expect(screen.getByRole("radio")).toHaveAttribute(
      "aria-disabled",
      "false",
    );
  });
});

describe("<AnswerButton> click behavior", () => {
  it("fires onClick when default + clicked", () => {
    const handler = vi.fn();
    render(<AnswerButton {...baseProps} onClick={handler} />);
    fireEvent.click(screen.getByRole("radio"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("fires onClick when selected (unrevealed) + clicked", () => {
    const handler = vi.fn();
    render(
      <AnswerButton {...baseProps} isSelected onClick={handler} />,
    );
    fireEvent.click(screen.getByRole("radio"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does NOT fire onClick when disabled (native disabled attr suppresses)", () => {
    const handler = vi.fn();
    render(
      <AnswerButton
        {...baseProps}
        isRevealed
        disabled
        onClick={handler}
      />,
    );
    fireEvent.click(screen.getByRole("radio"));
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("<AnswerButton> shake animation gating", () => {
  beforeEach(() => {
    motionButtonProps.length = 0;
  });

  it("passes shake keyframes to motion.button on incorrect-selected when reducedMotion=false", () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    render(
      <AnswerButton {...baseProps} isSelected isRevealed disabled />,
    );
    const animate = motionButtonProps[0]?.animate as { x?: number[] };
    expect(animate?.x).toEqual([0, -8, 8, -4, 4, 0]);
  });

  it("does NOT shake on correct-revealed (only incorrect shakes)", () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    render(
      <AnswerButton
        {...baseProps}
        isSelected
        isCorrect
        isRevealed
        disabled
      />,
    );
    const animate = motionButtonProps[0]?.animate as { x?: number[] };
    expect(animate?.x).toBeUndefined();
  });

  it("does NOT shake when reducedMotion=true even on incorrect-selected", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    render(
      <AnswerButton {...baseProps} isSelected isRevealed disabled />,
    );
    const animate = motionButtonProps[0]?.animate as { x?: number[] };
    expect(animate?.x).toBeUndefined();
  });

  it("sets transition duration to 0 when reducedMotion=true", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    render(
      <AnswerButton {...baseProps} isSelected isRevealed disabled />,
    );
    const transition = motionButtonProps[0]?.transition as {
      duration?: number;
    };
    expect(transition?.duration).toBe(0);
  });
});
