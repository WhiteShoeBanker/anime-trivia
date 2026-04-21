import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockExchange = vi.fn();
const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession: mockExchange,
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}));

import { GET } from "./route";

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

const makeRequest = (url: string) => new NextRequest(url);

describe("auth/callback — age-verification invariant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("missing ?code → /auth?error=callback_failed", async () => {
    const res = await GET(makeRequest("https://example.com/auth/callback"));
    expect(res.headers.get("location")).toContain(
      "/auth?error=callback_failed"
    );
  });

  it("exchange failure → /auth?error=callback_failed", async () => {
    mockExchange.mockResolvedValue({ error: { message: "bad code" } });
    const res = await GET(
      makeRequest("https://example.com/auth/callback?code=abc")
    );
    expect(res.headers.get("location")).toContain(
      "/auth?error=callback_failed"
    );
  });

  it("OAuth user with null age_group → /auth?complete_profile", async () => {
    mockExchange.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockProfileQuery({ data: { age_group: null }, error: null });
    const res = await GET(
      makeRequest("https://example.com/auth/callback?code=abc")
    );
    expect(res.headers.get("location")).toContain(
      "/auth?complete_profile=true"
    );
  });

  it("OAuth user with no profile row → /auth?complete_profile", async () => {
    mockExchange.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockProfileQuery({ data: null, error: null });
    const res = await GET(
      makeRequest("https://example.com/auth/callback?code=abc")
    );
    expect(res.headers.get("location")).toContain(
      "/auth?complete_profile=true"
    );
  });

  it("OAuth user with age_group='full' → /browse", async () => {
    mockExchange.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockProfileQuery({ data: { age_group: "full" }, error: null });
    const res = await GET(
      makeRequest("https://example.com/auth/callback?code=abc")
    );
    const loc = res.headers.get("location") ?? "";
    expect(loc).toContain("/browse");
    expect(loc).not.toContain("complete_profile");
  });

  it("honors ?next= when profile is complete", async () => {
    mockExchange.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockProfileQuery({ data: { age_group: "full" }, error: null });
    const res = await GET(
      makeRequest(
        "https://example.com/auth/callback?code=abc&next=/duels"
      )
    );
    expect(res.headers.get("location")).toContain("/duels");
  });

  it("profile query error → fails open, redirects to /browse", async () => {
    mockExchange.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockProfileQuery({ data: null, error: { message: "db down" } });
    const res = await GET(
      makeRequest("https://example.com/auth/callback?code=abc")
    );
    const loc = res.headers.get("location") ?? "";
    expect(loc).toContain("/browse");
    expect(loc).not.toContain("complete_profile");
  });
});
