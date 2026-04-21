import { describe, it, expect, vi, beforeEach } from "vitest";

// The queries under test use `@/lib/supabase/server`. RLS enforcement
// happens in the DB; we can't exercise the SQL policy in a unit test, so
// instead we simulate what RLS returns for each of the four session states
// (migration 016) and assert the functions pass it through faithfully.
//
// This also pins down the key invariants:
// - Functions use the server client (cookie-aware), NOT the service client.
// - Functions do NOT add any userland age/rating filter of their own —
//   filtering must happen at the DB layer via RLS.

const mockAnimeQuery = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: (table: string) => {
      if (table === "anime_series") return mockAnimeQuery();
      throw new Error(`unexpected table ${table}`);
    },
  })),
}));

// If anyone accidentally reintroduces the service client here, the mock
// below blows up with a descriptive error.
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => {
    throw new Error(
      "queries.ts must not use the service client for anime_series reads"
    );
  },
}));

import { getAnimeList, getAnimeBySlug } from "./queries";

// RLS-simulated anime sets. Source of truth: migration 016.
const ALL_ANIME = [
  { id: "1", slug: "naruto", title: "Naruto", content_rating: "E", is_active: true },
  { id: "2", slug: "one-piece", title: "One Piece", content_rating: "E", is_active: true },
  { id: "3", slug: "demon-slayer", title: "Demon Slayer", content_rating: "T", is_active: true },
  { id: "4", slug: "jujutsu-kaisen", title: "Jujutsu Kaisen", content_rating: "T", is_active: true },
  { id: "5", slug: "death-note", title: "Death Note", content_rating: "M", is_active: true },
  { id: "6", slug: "attack-on-titan", title: "Attack on Titan", content_rating: "M", is_active: true },
];

const rlsAllowedFor = (session: "unauth" | "null" | "junior" | "teen" | "full") => {
  if (session === "unauth") return ALL_ANIME;
  if (session === "null" || session === "junior")
    return ALL_ANIME.filter((a) => a.content_rating === "E");
  if (session === "teen")
    return ALL_ANIME.filter((a) => a.content_rating === "E" || a.content_rating === "T");
  return ALL_ANIME;
};

// Build a chainable query mock that captures every call so tests can assert
// that no userland age/rating filter was applied.
const makeListQuery = (rows: typeof ALL_ANIME) => {
  const calls: { method: string; args: unknown[] }[] = [];
  const chain: Record<string, unknown> = {};
  const recordReturn = (method: string) =>
    (...args: unknown[]) => {
      calls.push({ method, args });
      return chain;
    };
  chain.select = recordReturn("select");
  chain.eq = recordReturn("eq");
  chain.in = recordReturn("in");
  chain.order = vi.fn(async () => ({ data: rows, error: null }));
  return { chain, calls };
};

const makeSingleQuery = (row: (typeof ALL_ANIME)[number] | null) => {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.maybeSingle = vi.fn(async () => ({ data: row, error: null }));
  return chain;
};

describe("getAnimeList — passes through RLS-scoped results", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    ["unauth", 6],
    ["null", 2],
    ["junior", 2],
    ["teen", 4],
    ["full", 6],
  ] as const)("session=%s → returns %i anime", async (session, expected) => {
    const rows = rlsAllowedFor(session);
    const { chain } = makeListQuery(rows);
    mockAnimeQuery.mockReturnValue(chain);

    const result = await getAnimeList();
    expect(result).toHaveLength(expected);
  });

  it("does NOT apply a userland content_rating filter", async () => {
    const { chain, calls } = makeListQuery(ALL_ANIME);
    mockAnimeQuery.mockReturnValue(chain);

    await getAnimeList();

    const filtered = calls.filter(
      (c) =>
        (c.method === "eq" && c.args[0] === "content_rating") ||
        (c.method === "in" && c.args[0] === "content_rating")
    );
    expect(filtered).toHaveLength(0);
  });

  it("only filters by is_active — leaves age scope to RLS", async () => {
    const { chain, calls } = makeListQuery(ALL_ANIME);
    mockAnimeQuery.mockReturnValue(chain);

    await getAnimeList();

    const eqCalls = calls.filter((c) => c.method === "eq");
    expect(eqCalls).toEqual([{ method: "eq", args: ["is_active", true] }]);
  });
});

describe("getAnimeBySlug — returns null for RLS-filtered rows", () => {
  beforeEach(() => vi.clearAllMocks());

  it("junior viewing an E-rated anime → returns the row", async () => {
    mockAnimeQuery.mockReturnValue(
      makeSingleQuery(ALL_ANIME.find((a) => a.slug === "naruto")!)
    );
    const result = await getAnimeBySlug("naruto");
    expect(result?.title).toBe("Naruto");
  });

  it("junior viewing an M-rated anime → RLS returns null → we return null", async () => {
    // RLS hides the row from a junior session; the query yields null data,
    // no error. maybeSingle handles that cleanly.
    mockAnimeQuery.mockReturnValue(makeSingleQuery(null));
    const result = await getAnimeBySlug("death-note");
    expect(result).toBeNull();
  });

  it("unknown slug → returns null", async () => {
    mockAnimeQuery.mockReturnValue(makeSingleQuery(null));
    const result = await getAnimeBySlug("no-such-anime");
    expect(result).toBeNull();
  });

  it("teen viewing a T-rated anime → returns the row", async () => {
    mockAnimeQuery.mockReturnValue(
      makeSingleQuery(ALL_ANIME.find((a) => a.slug === "demon-slayer")!)
    );
    const result = await getAnimeBySlug("demon-slayer");
    expect(result?.content_rating).toBe("T");
  });

  it("teen viewing an M-rated anime → RLS filters, null returned", async () => {
    mockAnimeQuery.mockReturnValue(makeSingleQuery(null));
    const result = await getAnimeBySlug("death-note");
    expect(result).toBeNull();
  });
});
