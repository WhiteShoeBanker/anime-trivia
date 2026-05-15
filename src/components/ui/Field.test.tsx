import { describe, it, expect, vi } from "vitest";
import type { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import { Field } from "./Field";
import { Input } from "./Input";

describe("<Field> composition + render order", () => {
  it("renders Label, the input child, hint, then error in order", () => {
    const { container } = render(
      <Field id="email" label="Email" hint="We never share it" error="Required">
        <Input />
      </Field>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    const kids = Array.from(wrapper.children);
    expect(kids[0]?.tagName).toBe("LABEL");
    expect(kids[1]?.tagName).toBe("INPUT");
    expect(kids[2]?.tagName).toBe("P");
    expect(kids[2]?.textContent).toBe("We never share it");
    expect(kids[3]?.tagName).toBe("P");
    expect(kids[3]?.textContent).toBe("Required");
  });

  it("renders the label text", () => {
    render(
      <Field id="email" label="Email address">
        <Input />
      </Field>,
    );
    expect(screen.getByText("Email address")).toBeInTheDocument();
  });

  it("associates the label with the input via htmlFor↔id", () => {
    render(
      <Field id="email" label="Email">
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText("Email").tagName).toBe("INPUT");
  });

  it("propagates id to the input", () => {
    render(
      <Field id="username" label="Username">
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText("Username")).toHaveAttribute("id", "username");
  });

  it("does NOT render FieldHint when hint is absent", () => {
    const { container } = render(
      <Field id="email" label="Email">
        <Input />
      </Field>,
    );
    expect(container.querySelectorAll("p")).toHaveLength(0);
  });

  it("does NOT render FieldError when error is absent", () => {
    render(
      <Field id="email" label="Email" hint="hint only">
        <Input />
      </Field>,
    );
    expect(screen.getByText("hint only")).toBeInTheDocument();
    expect(screen.queryByText("Required")).not.toBeInTheDocument();
  });

  it("renders hint with id={id}-hint", () => {
    render(
      <Field id="email" label="Email" hint="helper">
        <Input />
      </Field>,
    );
    expect(screen.getByText("helper")).toHaveAttribute("id", "email-hint");
  });

  it("renders error with id={id}-error", () => {
    render(
      <Field id="email" label="Email" error="bad">
        <Input />
      </Field>,
    );
    expect(screen.getByText("bad")).toHaveAttribute("id", "email-error");
  });
});

describe("<Field> ARIA wiring", () => {
  it("sets aria-invalid=true on the input when error is present", () => {
    render(
      <Field id="email" label="Email" error="Required">
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("omits aria-invalid on the input when there is no error", () => {
    render(
      <Field id="email" label="Email">
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-invalid");
  });

  it("sets aria-required=true on the input when required", () => {
    render(
      <Field id="email" label="Email" required>
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText(/Email/)).toHaveAttribute(
      "aria-required",
      "true",
    );
  });

  it("omits aria-required on the input when not required", () => {
    render(
      <Field id="email" label="Email">
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText("Email")).not.toHaveAttribute(
      "aria-required",
    );
  });

  it("renders the required asterisk in the label when required", () => {
    render(
      <Field id="email" label="Email" required>
        <Input />
      </Field>,
    );
    expect(screen.getByText("*", { exact: false })).toBeInTheDocument();
  });

  it("aria-describedby concatenates hint id then error id when both present", () => {
    render(
      <Field id="email" label="Email" hint="h" error="e">
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "aria-describedby",
      "email-hint email-error",
    );
  });

  it("aria-describedby includes only the hint id when error absent", () => {
    render(
      <Field id="email" label="Email" hint="h">
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "aria-describedby",
      "email-hint",
    );
  });

  it("aria-describedby includes only the error id when hint absent", () => {
    render(
      <Field id="email" label="Email" error="e">
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "aria-describedby",
      "email-error",
    );
  });

  it("aria-describedby is absent when both hint and error are absent", () => {
    render(
      <Field id="email" label="Email">
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText("Email")).not.toHaveAttribute(
      "aria-describedby",
    );
  });

  it("forwards the error visual state to the Input child (border-error)", () => {
    render(
      <Field id="email" label="Email" error="Required">
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText("Email").className).toMatch(/border-error/);
  });

  it("does NOT force the error visual state when no error", () => {
    render(
      <Field id="email" label="Email">
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText("Email").className).toMatch(/border-rule/);
  });

  it("preserves the child's own props (cloneElement merge, not replace)", () => {
    render(
      <Field id="email" label="Email">
        <Input placeholder="you@example.com" type="email" />
      </Field>,
    );
    const el = screen.getByLabelText("Email");
    expect(el).toHaveAttribute("placeholder", "you@example.com");
    expect(el).toHaveAttribute("type", "email");
    expect(el).toHaveAttribute("id", "email");
  });
});

describe("<Field> guards + wrapper", () => {
  it("merges custom className onto the flex-col wrapper", () => {
    const { container } = render(
      <Field id="email" label="Email" className="mt-4">
        <Input />
      </Field>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toMatch(/flex/);
    expect(wrapper.className).toMatch(/flex-col/);
    expect(wrapper.className).toMatch(/mt-4/);
  });

  it("dev-warns when given multiple children (not a single element)", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Field id="x" label="L">
        {
          [
            <input key="a" />,
            <input key="b" />,
          ] as unknown as ReactElement
        }
      </Field>,
    );
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      "must be exactly one React element",
    );
    warnSpy.mockRestore();
  });

  it("does NOT warn for a single valid element child", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Field id="email" label="Email">
        <Input />
      </Field>,
    );
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
