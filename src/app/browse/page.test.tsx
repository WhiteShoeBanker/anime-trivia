import { describe, it, expect, vi, beforeEach } from "vitest";

// Integration test. We render BrowsePage (server component) for each of
// the five session states and assert that the SSR payload does not
// include slugs/titles the session should not see. The test bypasses
// the client-side filter in BrowseContent — we're checking what the
// SERVER ships, not what the UI paints after hydration.
//
// Phase 2: browse is registry-driven. The supabase mock only stubs auth
// (session lookup); the anime list comes from the real registry import.
// Per-user age filtering is layered on top of getEnabledAnime() at SSR.

const mockGetUser = vi.fn();
const mockProfileSingle = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: (table: string) => {
      if (table === "user_profiles") {
        return {
          select: () => ({
            eq: () => ({
              single: mockProfileSingle,
            }),
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  })),
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => {
    throw new Error("browse SSR must not use the service client");
  },
}));

// BrowseContent is a client component. For SSR content assertions we
// don't need it rendered — inspecting the prop is equivalent to grepping
// the SSR HTML, because the prop is what gets serialized into the RSC
// payload.
vi.mock("./BrowseContent", () => ({
  default: () => null,
}));

import BrowsePage from "./page";
import type { ReactElement } from "react";
import type { AnimeRegistryEntry } from "@/data/anime/registry";

interface BrowseContentProps {
  animeList: readonly AnimeRegistryEntry[];
}

type Session = "unauth" | "null" | "junior" | "teen" | "full";

const primeSession = (session: Session) => {
  if (session === "unauth") {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    return;
  }
  mockGetUser.mockResolvedValue({ data: { user: { id: "test-user" } } });
  const ageGroup = session === "null" ? null : session;
  mockProfileSingle.mockResolvedValue({
    data: { age_group: ageGroup },
    error: null,
  });
};

const renderAndInspect = async () => {
  const element = (await BrowsePage()) as ReactElement<BrowseContentProps>;
  return {
    props: element.props,
    payload: JSON.stringify(element.props),
  };
};

describe("BrowsePage SSR — age-gated content never ships to unauthorized sessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("unauth: ships all variant-enabled anime (login prompt handles gate at click)", async () => {
    primeSession("unauth");
    const { payload } = await renderAndInspect();
    // Default variant is 'full' — all 10 registry entries visible
    expect(payload).toContain("death-note");
    expect(payload).toContain("Attack on Titan");
    expect(payload).toContain("naruto");
    expect(payload).toContain("hunter-x-hunter");
    expect(payload).toContain("my-neighbor-totoro");
  });

  it("null age_group: E-only in SSR — no M, no T titles or slugs", async () => {
    primeSession("null");
    const { payload } = await renderAndInspect();
    expect(payload).not.toContain("death-note");
    expect(payload).not.toContain("Death Note");
    expect(payload).not.toContain("attack-on-titan");
    expect(payload).not.toContain("Attack on Titan");
    expect(payload).not.toContain("demon-slayer");
    expect(payload).not.toContain("Demon Slayer");
    expect(payload).not.toContain("hunter-x-hunter");
    expect(payload).toContain("naruto");
    expect(payload).toContain("my-neighbor-totoro");
  });

  it("junior: E-only in SSR — no M, no T titles or slugs", async () => {
    primeSession("junior");
    const { payload } = await renderAndInspect();
    expect(payload).not.toContain("death-note");
    expect(payload).not.toContain("Death Note");
    expect(payload).not.toContain("demon-slayer");
    expect(payload).not.toContain("Demon Slayer");
    expect(payload).not.toContain("hunter-x-hunter");
    expect(payload).toContain("naruto");
    expect(payload).toContain("my-neighbor-totoro");
  });

  it("teen: E + T in SSR — no M titles or slugs", async () => {
    primeSession("teen");
    const { payload } = await renderAndInspect();
    expect(payload).not.toContain("death-note");
    expect(payload).not.toContain("Death Note");
    expect(payload).not.toContain("attack-on-titan");
    expect(payload).not.toContain("Attack on Titan");
    expect(payload).toContain("demon-slayer");
    expect(payload).toContain("hunter-x-hunter");
  });

  it("full: ships every variant-enabled anime", async () => {
    primeSession("full");
    const { payload } = await renderAndInspect();
    expect(payload).toContain("death-note");
    expect(payload).toContain("attack-on-titan");
    expect(payload).toContain("hunter-x-hunter");
    expect(payload).toContain("my-neighbor-totoro");
  });
});
