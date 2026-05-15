import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Input } from "./Input";

describe("<Input> base chrome", () => {
  it("renders as an <input> element", () => {
    render(<Input aria-label="email" />);
    expect(screen.getByRole("textbox").tagName).toBe("INPUT");
  });

  it("applies input-default base classes", () => {
    render(<Input aria-label="email" />);
    const el = screen.getByRole("textbox");
    expect(el.className).toMatch(/w-full/);
    expect(el.className).toMatch(/px-4/);
    expect(el.className).toMatch(/py-3/);
    expect(el.className).toMatch(/min-h-\[44px\]/);
    expect(el.className).toMatch(/rounded-sharp/);
    expect(el.className).toMatch(/bg-surface/);
    expect(el.className).toMatch(/text-text/);
    expect(el.className).toMatch(/transition-colors/);
  });

  it("binds placeholder to text-text-muted/60", () => {
    render(<Input aria-label="email" />);
    expect(screen.getByRole("textbox").className).toMatch(
      /placeholder:text-text-muted\/60/,
    );
  });

  it("does NOT use the drift placeholder:text-white/30", () => {
    render(<Input aria-label="email" />);
    expect(screen.getByRole("textbox").className).not.toMatch(
      /placeholder:text-white\/30/,
    );
  });

  it("applies disabled:opacity-50 + disabled:cursor-not-allowed classes", () => {
    render(<Input aria-label="email" />);
    const el = screen.getByRole("textbox");
    expect(el.className).toMatch(/disabled:opacity-50/);
    expect(el.className).toMatch(/disabled:cursor-not-allowed/);
  });

  it("honors the native disabled attribute", () => {
    render(<Input aria-label="email" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("applies thin-ring focus-visible classes (border-primary + ring-1, no offset)", () => {
    render(<Input aria-label="email" />);
    const el = screen.getByRole("textbox");
    expect(el.className).toMatch(/focus-visible:outline-none/);
    expect(el.className).toMatch(/focus-visible:border-primary/);
    expect(el.className).toMatch(/focus-visible:ring-1/);
    expect(el.className).toMatch(/focus-visible:ring-primary\/30/);
  });

  it("uses the thin ring (NOT the chunky ring-2 ring-offset signature)", () => {
    render(<Input aria-label="email" />);
    const el = screen.getByRole("textbox");
    expect(el.className).not.toMatch(/focus-visible:ring-2/);
    expect(el.className).not.toMatch(/ring-offset/);
  });
});

describe("<Input> state composition", () => {
  it("default state applies border-rule (input-default hairline)", () => {
    render(<Input aria-label="email" />);
    const el = screen.getByRole("textbox");
    expect(el.className).toMatch(/border-rule/);
    expect(el.className).not.toMatch(/border-error/);
  });

  it("error state applies border-error (input-error surface token)", () => {
    render(<Input aria-label="email" error />);
    const el = screen.getByRole("textbox");
    expect(el.className).toMatch(/border-error/);
    expect(el.className).not.toMatch(/border-rule/);
  });

  it("error=false is equivalent to default state", () => {
    render(<Input aria-label="email" error={false} />);
    expect(screen.getByRole("textbox").className).toMatch(/border-rule/);
  });

  it("does NOT bind error border to accent (L307 reservation)", () => {
    render(<Input aria-label="email" error />);
    expect(screen.getByRole("textbox").className).not.toMatch(/border-accent/);
  });
});

describe("<Input> leading icon", () => {
  it("renders the leadingIcon node", () => {
    render(
      <Input
        aria-label="search"
        leadingIcon={<svg data-testid="icon" />}
      />,
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("wraps in a relative container when leadingIcon is present", () => {
    render(
      <Input
        aria-label="search"
        leadingIcon={<svg data-testid="icon" />}
      />,
    );
    const wrapper = screen.getByRole("textbox").parentElement;
    expect(wrapper?.className).toMatch(/relative/);
  });

  it("applies pl-10 to the input when leadingIcon is present", () => {
    render(
      <Input
        aria-label="search"
        leadingIcon={<svg data-testid="icon" />}
      />,
    );
    expect(screen.getByRole("textbox").className).toMatch(/pl-10/);
  });

  it("does NOT apply pl-10 when there is no leadingIcon", () => {
    render(<Input aria-label="email" />);
    expect(screen.getByRole("textbox").className).not.toMatch(/pl-10/);
  });

  it("positions the icon absolutely + non-interactive", () => {
    render(
      <Input
        aria-label="search"
        leadingIcon={<svg data-testid="icon" />}
      />,
    );
    const iconHost = screen.getByTestId("icon").parentElement;
    expect(iconHost?.className).toMatch(/absolute/);
    expect(iconHost?.className).toMatch(/left-3/);
    expect(iconHost?.className).toMatch(/top-1\/2/);
    expect(iconHost?.className).toMatch(/-translate-y-1\/2/);
    expect(iconHost?.className).toMatch(/text-text-muted/);
    expect(iconHost?.className).toMatch(/pointer-events-none/);
  });

  it("does NOT wrap (no relative container) when leadingIcon is absent", () => {
    render(<Input aria-label="email" data-testid="bare" />);
    const el = screen.getByTestId("bare");
    expect(el.parentElement?.className ?? "").not.toMatch(/relative/);
  });
});

describe("<Input> className passthrough", () => {
  it("merges custom className last (OTP-style override)", () => {
    render(
      <Input
        aria-label="otp"
        className="text-center text-2xl tracking-[0.5em] font-mono"
      />,
    );
    const el = screen.getByRole("textbox");
    expect(el.className).toMatch(/text-center/);
    expect(el.className).toMatch(/text-2xl/);
    expect(el.className).toMatch(/tracking-\[0\.5em\]/);
    expect(el.className).toMatch(/font-mono/);
    // base chrome still present
    expect(el.className).toMatch(/bg-surface/);
    expect(el.className).toMatch(/rounded-sharp/);
  });

  it("merges custom className alongside the error state", () => {
    render(<Input aria-label="otp" error className="font-mono" />);
    const el = screen.getByRole("textbox");
    expect(el.className).toMatch(/font-mono/);
    expect(el.className).toMatch(/border-error/);
  });
});

describe("<Input> native behavior", () => {
  it("forwards ref to the underlying <input>", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input aria-label="email" ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("INPUT");
  });

  it("forwards ref to the input even when wrapped (leadingIcon)", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Input
        aria-label="search"
        ref={ref}
        leadingIcon={<svg data-testid="icon" />}
      />,
    );
    expect(ref.current?.tagName).toBe("INPUT");
  });

  it("supports controlled value + onChange", () => {
    const onChange = vi.fn();
    render(
      <Input aria-label="email" value="hello" onChange={onChange} />,
    );
    const el = screen.getByRole("textbox") as HTMLInputElement;
    expect(el.value).toBe("hello");
    fireEvent.change(el, { target: { value: "world" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("spreads native attributes (name, type, autoComplete)", () => {
    render(
      <Input
        aria-label="email"
        name="email"
        type="email"
        autoComplete="email"
      />,
    );
    const el = screen.getByRole("textbox");
    expect(el).toHaveAttribute("name", "email");
    expect(el).toHaveAttribute("type", "email");
    expect(el).toHaveAttribute("autocomplete", "email");
  });

  it("passes placeholder through", () => {
    render(<Input aria-label="email" placeholder="you@example.com" />);
    expect(
      screen.getByPlaceholderText("you@example.com"),
    ).toBeInTheDocument();
  });

  it("passes through id (for <Field> aria wiring)", () => {
    render(<Input aria-label="email" id="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("id", "email");
  });

  it("fires onChange for uncontrolled typing", () => {
    const onChange = vi.fn();
    render(<Input aria-label="email" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "x" },
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
