import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

import { proxy } from "./proxy";

const mockProfileQuery = (result: {
  data: { age_group: string | null } | null;
  error: { message: string } | null;
}) => {
  mockFrom.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue(result),
      }),
    }),
  });
};

const makeRequest = (pathname: string) =>
  new NextRequest(`https://example.com${pathname}`);

describe("proxy — age-verification invariant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("unauthenticated user on a protected route → /auth", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await proxy(makeRequest("/profile"));
    expect(res.headers.get("location")).toContain("/auth");
  });

  it("authenticated user with null age_group → /auth?complete_profile", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "u1", email: "a@b.com" } },
    });
    mockProfileQuery({ data: { age_group: null }, error: null });
    const res = await proxy(makeRequest("/browse"));
    expect(res.headers.get("location")).toContain(
      "/auth?complete_profile=true"
    );
  });

  it("authenticated user with no profile row → /auth?complete_profile", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "u1", email: "a@b.com" } },
    });
    mockProfileQuery({ data: null, error: null });
    const res = await proxy(makeRequest("/browse"));
    expect(res.headers.get("location")).toContain(
      "/auth?complete_profile=true"
    );
  });

  it("authenticated user with age_group='full' passes through", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "u1", email: "a@b.com" } },
    });
    mockProfileQuery({ data: { age_group: "full" }, error: null });
    const res = await proxy(makeRequest("/browse"));
    expect(res.headers.get("location")).toBeNull();
  });

  it("authenticated user with age_group='teen' passes through", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "u1", email: "a@b.com" } },
    });
    mockProfileQuery({ data: { age_group: "teen" }, error: null });
    const res = await proxy(makeRequest("/browse"));
    expect(res.headers.get("location")).toBeNull();
  });

  it("does not redirect on /auth itself (no loop)", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "u1", email: "a@b.com" } },
    });
    mockProfileQuery({ data: { age_group: null }, error: null });
    const res = await proxy(makeRequest("/auth?complete_profile=true"));
    expect(res.headers.get("location")).toBeNull();
  });

  it("profile query error → fails open, no redirect", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "u1", email: "a@b.com" } },
    });
    mockProfileQuery({ data: null, error: { message: "db down" } });
    const res = await proxy(makeRequest("/browse"));
    expect(res.headers.get("location")).toBeNull();
  });
});
