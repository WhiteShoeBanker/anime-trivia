import { describe, it, expect, vi, beforeEach } from "vitest";

// Integration test. We render BrowsePage (server component) for each of
// the four session states and assert that the SSR payload does not
// include slugs/titles the session should not see. The test bypasses
// the client-side filter in BrowseContent — we're checking what the
// SERVER ships, not what the UI paints after hydration.

const mockAnimeQuery = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: (table: string) => {
      if (table === "anime_series") return mockAnimeQuery();
      throw new Error(`unexpected table ${table}`);
    },
  })),
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => {
    throw new Error("browse SSR must not use the service client");
  },
}));

// BrowseContent is a client component that uses hooks. For SSR content
// assertions we don't need it rendered — inspecting the React element
// BrowsePage returns is equivalent to grepping the SSR HTML, because
// the prop is what gets serialized into the RSC payload.
vi.mock("./BrowseContent", () => ({
  default: () => null,
}));

import BrowsePage from "./page";
import type { ReactElement } from "react";

interface BrowseContentProps {
  animeList: typeof ALL_ANIME;
}

const ALL_ANIME = [
  { id: "1", slug: "naruto", title: "Naruto", content_rating: "E", is_active: true },
  { id: "2", slug: "one-piece", title: "One Piece", content_rating: "E", is_active: true },
  { id: "3", slug: "demon-slayer", title: "Demon Slayer", content_rating: "T", is_active: true },
  { id: "4", slug: "death-note", title: "Death Note", content_rating: "M", is_active: true },
  { id: "5", slug: "attack-on-titan", title: "Attack on Titan", content_rating: "M", is_active: true },
];

const rlsAllowedFor = (session: "unauth" | "null" | "junior" | "teen" | "full") => {
  if (session === "unauth") return ALL_ANIME;
  if (session === "null" || session === "junior")
    return ALL_ANIME.filter((a) => a.content_rating === "E");
  if (session === "teen")
    return ALL_ANIME.filter((a) => a.content_rating === "E" || a.content_rating === "T");
  return ALL_ANIME;
};

const primeRls = (session: "unauth" | "null" | "junior" | "teen" | "full") => {
  const rows = rlsAllowedFor(session);
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.order = vi.fn(async () => ({ data: rows, error: null }));
  mockAnimeQuery.mockReturnValue(chain);
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

  it("unauth: ships all anime (login prompt handles gate at click)", async () => {
    primeRls("unauth");
    const { props, payload } = await renderAndInspect();
    expect(payload).toContain("death-note");
    expect(payload).toContain("Attack on Titan");
    expect(props.animeList).toHaveLength(5);
  });

  it("null age_group: E-only in SSR — no M, no T titles or slugs", async () => {
    primeRls("null");
    const { payload } = await renderAndInspect();
    expect(payload).not.toContain("death-note");
    expect(payload).not.toContain("Death Note");
    expect(payload).not.toContain("attack-on-titan");
    expect(payload).not.toContain("Attack on Titan");
    expect(payload).not.toContain("demon-slayer");
    expect(payload).not.toContain("Demon Slayer");
    expect(payload).toContain("naruto");
  });

  it("junior: E-only in SSR — no M, no T titles or slugs", async () => {
    primeRls("junior");
    const { payload } = await renderAndInspect();
    expect(payload).not.toContain("death-note");
    expect(payload).not.toContain("Death Note");
    expect(payload).not.toContain("demon-slayer");
    expect(payload).not.toContain("Demon Slayer");
    expect(payload).toContain("naruto");
  });

  it("teen: E + T in SSR — no M titles or slugs", async () => {
    primeRls("teen");
    const { payload } = await renderAndInspect();
    expect(payload).not.toContain("death-note");
    expect(payload).not.toContain("Death Note");
    expect(payload).not.toContain("attack-on-titan");
    expect(payload).not.toContain("Attack on Titan");
    expect(payload).toContain("demon-slayer");
  });

  it("full: ships everything", async () => {
    primeRls("full");
    const { props, payload } = await renderAndInspect();
    expect(payload).toContain("death-note");
    expect(payload).toContain("attack-on-titan");
    expect(props.animeList).toHaveLength(5);
  });
});
