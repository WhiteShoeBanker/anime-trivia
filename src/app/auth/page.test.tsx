/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

// ── Mocks ─────────────────────────────────────────────────────

const signUpMock = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signUp: signUpMock,
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signInWithOtp: vi.fn(),
      verifyOtp: vi.fn(),
    },
  }),
}));

const refreshProfileMock = vi.fn().mockResolvedValue(undefined);
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    refreshProfile: refreshProfileMock,
    signOut: vi.fn(),
  }),
}));

const pushMock = vi.fn();
const refreshMock = vi.fn();
const routerReplaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
    replace: routerReplaceMock,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("./actions", () => ({
  updateProfileAfterSignup: vi.fn(),
}));

vi.mock("@/components/AgeGate", () => ({
  default: ({
    onAgeGroupSelected,
  }: {
    onAgeGroupSelected: (group: "junior" | "teen" | "full") => void;
  }) => (
    <button type="button" onClick={() => onAgeGroupSelected("full")}>
      confirm-age
    </button>
  ),
}));

vi.mock("@/components/ParentConsentForm", () => ({ default: () => null }));

import AuthPage from "./page";

// jsdom blocks direct assignment to window.location, but Object.defineProperty
// can swap it for a stub that exposes the surface auth/page.tsx uses:
// window.location.replace (the assertion target) and window.location.origin
// (read at module scope to compose redirectTo for OAuth).
const locationReplaceMock = vi.fn();

beforeEach(() => {
  signUpMock.mockReset();
  pushMock.mockReset();
  refreshMock.mockReset();
  routerReplaceMock.mockReset();
  locationReplaceMock.mockReset();
  refreshProfileMock.mockClear();

  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      replace: locationReplaceMock,
      origin: "http://localhost:3000",
      href: "http://localhost:3000/auth",
    },
  });
});

const advanceToAuthForm = async () => {
  render(<AuthPage />);
  // Default state is sign-in + auth-form; flip to sign-up via the pill
  // toggle, then advance through the AgeGate to reach the sign-up form.
  const signUpPill = await screen.findByRole("button", { name: /^sign up$/i });
  await act(async () => {
    signUpPill.click();
  });
  const ageButton = await screen.findByRole("button", {
    name: /confirm-age/i,
  });
  await act(async () => {
    ageButton.click();
  });
};

const fillSignUpForm = (
  email: string,
  password: string,
  confirmPassword: string
) => {
  fireEvent.change(screen.getByLabelText(/^email/i), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(/^password/i), {
    target: { value: password },
  });
  fireEvent.change(screen.getByLabelText(/confirm password/i), {
    target: { value: confirmPassword },
  });
};

describe("AuthPage email/password sign-up", () => {
  it("session present → window.location.replace('/browse'), no router.push", async () => {
    signUpMock.mockResolvedValueOnce({
      data: { session: { access_token: "tok" }, user: { id: "u1" } },
      error: null,
    });

    await advanceToAuthForm();
    fillSignUpForm("test@example.com", "secret123", "secret123");

    const submit = screen.getByRole("button", { name: /create account/i });
    await act(async () => {
      submit.click();
    });

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(locationReplaceMock).toHaveBeenCalledWith("/browse");
    });
    // The new flow does a hard navigation; the soft-navigation hooks must
    // NOT also fire (otherwise we'd race the proxy with stale cookies, the
    // exact symptom this fix addresses).
    expect(pushMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("no session (email confirmation enabled) → error shown, no navigation", async () => {
    signUpMock.mockResolvedValueOnce({
      data: { session: null, user: { id: "u2" } },
      error: null,
    });

    await advanceToAuthForm();
    fillSignUpForm("test2@example.com", "secret123", "secret123");

    const submit = screen.getByRole("button", { name: /create account/i });
    await act(async () => {
      submit.click();
    });

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeTruthy();
    });

    expect(locationReplaceMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });
});
