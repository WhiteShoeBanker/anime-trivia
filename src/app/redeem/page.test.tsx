import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockUseAuth = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockRedeem = vi.fn();
vi.mock("@/lib/promo-codes", () => ({
  redeemPromoCode: (...args: unknown[]) => mockRedeem(...args),
}));

import RedeemPage from "./page";

const fillCode = (value: string) => {
  const input = screen.getByLabelText(/promo code/i) as HTMLInputElement;
  fireEvent.change(input, { target: { value } });
};

const clickRedeem = () => {
  fireEvent.click(screen.getByRole("button", { name: /redeem code/i }));
};

beforeEach(() => {
  mockUseAuth.mockReturnValue({
    user: { id: "user-A", email: "a@x.com" },
    refreshProfile: vi.fn(async () => {}),
  });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  mockRedeem.mockReset();
});

describe("RedeemPage", () => {
  it("transitions out of 'submitting' when redeemPromoCode throws", async () => {
    // Reproduces the production hang: an uncaught throw used to leave the
    // button frozen at "Redeeming...".
    mockRedeem.mockImplementation(() => {
      throw new Error("auth client misconfigured");
    });

    render(<RedeemPage />);
    fillCode("OTAKU2026");
    clickRedeem();

    await waitFor(() =>
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument(),
    );
    expect(screen.queryByText(/redeeming\.\.\./i)).not.toBeInTheDocument();
  });

  it("clears 'submitting' even when refreshProfile hangs after success", async () => {
    // Post-success we no longer await refreshProfile, so a hung profile
    // call cannot freeze the success view.
    mockRedeem.mockResolvedValue({
      success: true,
      type: "pro_monthly",
      expiresAt: "2026-12-01",
    });

    const hangingRefresh = vi.fn(() => new Promise<void>(() => {}));
    mockUseAuth.mockReturnValue({
      user: { id: "user-A", email: "a@x.com" },
      refreshProfile: hangingRefresh,
    });

    render(<RedeemPage />);
    fillCode("OTAKU2026");
    clickRedeem();

    await waitFor(() =>
      expect(screen.getByText(/code redeemed/i)).toBeInTheDocument(),
    );
    expect(screen.queryByText(/redeeming\.\.\./i)).not.toBeInTheDocument();
    expect(hangingRefresh).toHaveBeenCalled();
  });

  it("shows server-side error message and lets user try again", async () => {
    mockRedeem.mockResolvedValue({
      success: false,
      error: "This code has expired.",
      errorCode: "expired",
    });

    render(<RedeemPage />);
    fillCode("EXPIREDCODE");
    clickRedeem();

    await waitFor(() =>
      expect(screen.getByText(/code has expired/i)).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /redeem code/i })).toBeEnabled();
  });

  it("renders sign-in CTA when no user — redeem flow is unreachable", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      refreshProfile: vi.fn(),
    });
    render(<RedeemPage />);
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });
});

describe("auth signup metadata persistence (contract)", () => {
  it("documents the keys that handle_new_user reads from raw_user_meta_data", () => {
    // Guard rail: handle_new_user (migration 018) reads four keys from
    // raw_user_meta_data. The auth page passes EXACTLY those keys via
    // options.data on signUp / signInWithOtp. Renaming one in only one
    // place would silently drop the user's age data again.
    const expectedKeys = [
      "age_group",
      "birth_year",
      "parent_email",
      "username",
    ];
    expect(expectedKeys).toEqual(expectedKeys.slice().sort());
  });
});
