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
const mockQuizSessionsQuery = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: (table: string) => {
      if (table === "anime_series") return mockAnimeQuery();
      if (table === "quiz_sessions") return mockQuizSessionsQuery();
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

import {
  getAnimeList,
  getAnimeBySlug,
  getUserPerAnimeStats,
  getUserRecentQuizzes,
} from "./queries";

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

// ── getUserPerAnimeStats ─────────────────────────────────────
//
// Mocks quiz_sessions rows with embedded anime_series. RLS scoping
// (auth.uid() = user_id) is enforced at the DB layer; here we just verify
// that whatever the DB returns gets aggregated correctly.

type SessionRow = {
  anime_id: string | null;
  correct_answers: number | null;
  total_questions: number | null;
  anime_series: { slug: string; title: string } | null;
};

const makeSessionsQuery = (rows: SessionRow[]) => {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.not = vi.fn(async () => ({ data: rows, error: null }));
  return chain;
};

describe("getUserPerAnimeStats — aggregates per-anime accuracy", () => {
  beforeEach(() => vi.clearAllMocks());

  it("zero sessions → returns empty array", async () => {
    mockQuizSessionsQuery.mockReturnValue(makeSessionsQuery([]));
    const result = await getUserPerAnimeStats("user-1");
    expect(result).toEqual([]);
  });

  it("sessions across two anime → returns two rows with summed aggregates", async () => {
    mockQuizSessionsQuery.mockReturnValue(
      makeSessionsQuery([
        {
          anime_id: "anime-naruto",
          correct_answers: 8,
          total_questions: 10,
          anime_series: { slug: "naruto", title: "Naruto" },
        },
        {
          anime_id: "anime-naruto",
          correct_answers: 6,
          total_questions: 10,
          anime_series: { slug: "naruto", title: "Naruto" },
        },
        {
          anime_id: "anime-op",
          correct_answers: 5,
          total_questions: 10,
          anime_series: { slug: "one-piece", title: "One Piece" },
        },
      ])
    );

    const result = await getUserPerAnimeStats("user-1");
    expect(result).toHaveLength(2);

    const naruto = result.find((s) => s.anime_id === "anime-naruto")!;
    expect(naruto.quiz_count).toBe(2);
    expect(naruto.correct_answers).toBe(14);
    expect(naruto.total_questions).toBe(20);
    expect(naruto.accuracy_pct).toBe(70);
    expect(naruto.anime_title).toBe("Naruto");
    expect(naruto.anime_slug).toBe("naruto");

    const onePiece = result.find((s) => s.anime_id === "anime-op")!;
    expect(onePiece.quiz_count).toBe(1);
    expect(onePiece.accuracy_pct).toBe(50);
  });

  it("rounds accuracy_pct to nearest integer", async () => {
    // 7/10 → 70%; 1/3 → 33% (rounded from 33.33); 2/3 → 67% (rounded from 66.67)
    mockQuizSessionsQuery.mockReturnValue(
      makeSessionsQuery([
        {
          anime_id: "a",
          correct_answers: 1,
          total_questions: 3,
          anime_series: { slug: "a", title: "A" },
        },
        {
          anime_id: "b",
          correct_answers: 2,
          total_questions: 3,
          anime_series: { slug: "b", title: "B" },
        },
      ])
    );

    const result = await getUserPerAnimeStats("user-1");
    const a = result.find((s) => s.anime_id === "a")!;
    const b = result.find((s) => s.anime_id === "b")!;
    expect(a.accuracy_pct).toBe(33);
    expect(b.accuracy_pct).toBe(67);
  });

  it("sessions across many anime → returns top 8 sorted by quiz_count desc", async () => {
    // 10 anime, decreasing quiz_count from 10 down to 1
    const rows: SessionRow[] = [];
    for (let i = 0; i < 10; i++) {
      const animeId = `anime-${i}`;
      const count = 10 - i;
      for (let q = 0; q < count; q++) {
        rows.push({
          anime_id: animeId,
          correct_answers: 5,
          total_questions: 10,
          anime_series: { slug: `slug-${i}`, title: `Anime ${i}` },
        });
      }
    }
    mockQuizSessionsQuery.mockReturnValue(makeSessionsQuery(rows));

    const result = await getUserPerAnimeStats("user-1");
    expect(result).toHaveLength(8);
    // Ordered by quiz_count desc — first 8 anime (counts 10..3)
    expect(result.map((s) => s.anime_id)).toEqual([
      "anime-0",
      "anime-1",
      "anime-2",
      "anime-3",
      "anime-4",
      "anime-5",
      "anime-6",
      "anime-7",
    ]);
    expect(result[0].quiz_count).toBe(10);
    expect(result[7].quiz_count).toBe(3);
  });

  it("tie-break on quiz_count → secondary sort by accuracy_pct desc", async () => {
    // Three anime, all with quiz_count=2 but different accuracies
    mockQuizSessionsQuery.mockReturnValue(
      makeSessionsQuery([
        // Low accuracy anime (40%)
        {
          anime_id: "low",
          correct_answers: 4,
          total_questions: 10,
          anime_series: { slug: "low", title: "Low" },
        },
        {
          anime_id: "low",
          correct_answers: 4,
          total_questions: 10,
          anime_series: { slug: "low", title: "Low" },
        },
        // High accuracy anime (90%)
        {
          anime_id: "high",
          correct_answers: 9,
          total_questions: 10,
          anime_series: { slug: "high", title: "High" },
        },
        {
          anime_id: "high",
          correct_answers: 9,
          total_questions: 10,
          anime_series: { slug: "high", title: "High" },
        },
        // Mid accuracy (65%)
        {
          anime_id: "mid",
          correct_answers: 6,
          total_questions: 10,
          anime_series: { slug: "mid", title: "Mid" },
        },
        {
          anime_id: "mid",
          correct_answers: 7,
          total_questions: 10,
          anime_series: { slug: "mid", title: "Mid" },
        },
      ])
    );

    const result = await getUserPerAnimeStats("user-1");
    expect(result.map((s) => s.anime_id)).toEqual(["high", "mid", "low"]);
    expect(result[0].accuracy_pct).toBe(90);
    expect(result[1].accuracy_pct).toBe(65);
    expect(result[2].accuracy_pct).toBe(40);
  });

  it("treats null correct_answers/total_questions as zero", async () => {
    mockQuizSessionsQuery.mockReturnValue(
      makeSessionsQuery([
        {
          anime_id: "a",
          correct_answers: null,
          total_questions: null,
          anime_series: { slug: "a", title: "A" },
        },
        {
          anime_id: "a",
          correct_answers: 5,
          total_questions: 10,
          anime_series: { slug: "a", title: "A" },
        },
      ])
    );

    const result = await getUserPerAnimeStats("user-1");
    expect(result).toHaveLength(1);
    expect(result[0].correct_answers).toBe(5);
    expect(result[0].total_questions).toBe(10);
    expect(result[0].quiz_count).toBe(2);
    expect(result[0].accuracy_pct).toBe(50);
  });

  it("skips rows with null anime_id or missing anime_series", async () => {
    // The DB-side .not('anime_id', 'is', null) should filter these, but the
    // JS guards against drift if RLS or the query shape changes later.
    mockQuizSessionsQuery.mockReturnValue(
      makeSessionsQuery([
        {
          anime_id: null,
          correct_answers: 5,
          total_questions: 10,
          anime_series: null,
        },
        {
          anime_id: "valid",
          correct_answers: 8,
          total_questions: 10,
          anime_series: { slug: "valid", title: "Valid" },
        },
      ])
    );

    const result = await getUserPerAnimeStats("user-1");
    expect(result).toHaveLength(1);
    expect(result[0].anime_id).toBe("valid");
  });
});

// ── getUserRecentQuizzes — last 7 quiz sessions ──────────────
//
// Same RLS scoping note as getUserPerAnimeStats. Chain shape differs:
// .select(...).eq(...).not(...).order(...).limit(...) — the .order/.limit
// happen DB-side, so the mock just hands back rows in whatever order the
// test sets up; the function does not re-sort in JS.

type RecentSessionRow = {
  id: string;
  completed_at: string;
  correct_answers: number | null;
  total_questions: number | null;
  anime_id: string | null;
  anime_series: { slug: string; title: string } | null;
};

const makeRecentSessionsQuery = (rows: RecentSessionRow[]) => {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.not = vi.fn(() => chain);
  chain.order = vi.fn(() => chain);
  // The DB-side .limit(7) caps rows server-side; we mimic that here so the
  // mock matches DB behavior exactly. The function itself does not slice.
  chain.limit = vi.fn(async (n: number) => ({
    data: rows.slice(0, n),
    error: null,
  }));
  return chain;
};

describe("getUserRecentQuizzes — last 7 quiz sessions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("zero sessions → returns empty array", async () => {
    mockQuizSessionsQuery.mockReturnValue(makeRecentSessionsQuery([]));
    const result = await getUserRecentQuizzes("user-1");
    expect(result).toEqual([]);
  });

  it("3 sessions → returns 3 in DB-given (completed_at desc) order", async () => {
    mockQuizSessionsQuery.mockReturnValue(
      makeRecentSessionsQuery([
        {
          id: "s3",
          completed_at: "2026-05-10T12:00:00Z",
          correct_answers: 9,
          total_questions: 10,
          anime_id: "anime-naruto",
          anime_series: { slug: "naruto", title: "Naruto" },
        },
        {
          id: "s2",
          completed_at: "2026-05-09T12:00:00Z",
          correct_answers: 7,
          total_questions: 10,
          anime_id: "anime-op",
          anime_series: { slug: "one-piece", title: "One Piece" },
        },
        {
          id: "s1",
          completed_at: "2026-05-08T12:00:00Z",
          correct_answers: 5,
          total_questions: 10,
          anime_id: "anime-naruto",
          anime_series: { slug: "naruto", title: "Naruto" },
        },
      ])
    );

    const result = await getUserRecentQuizzes("user-1");
    expect(result).toHaveLength(3);
    expect(result.map((r) => r.session_id)).toEqual(["s3", "s2", "s1"]);
    expect(result[0].accuracy_pct).toBe(90);
    expect(result[1].accuracy_pct).toBe(70);
    expect(result[2].accuracy_pct).toBe(50);
    expect(result[0].anime_title).toBe("Naruto");
  });

  it("10 sessions → returns 7 most recent (DB-side LIMIT 7)", async () => {
    const rows: RecentSessionRow[] = [];
    for (let i = 9; i >= 0; i--) {
      rows.push({
        id: `s${i}`,
        completed_at: `2026-05-${String(i + 1).padStart(2, "0")}T12:00:00Z`,
        correct_answers: 5,
        total_questions: 10,
        anime_id: "a",
        anime_series: { slug: "a", title: "A" },
      });
    }
    // DB returns newest first (descending completed_at). For this test the
    // input is intentionally sorted that way; the function relies on DB
    // ordering rather than re-sorting.
    rows.sort((a, b) => b.completed_at.localeCompare(a.completed_at));
    mockQuizSessionsQuery.mockReturnValue(makeRecentSessionsQuery(rows));

    const result = await getUserRecentQuizzes("user-1");
    expect(result).toHaveLength(7);
    expect(result[0].session_id).toBe("s9");
    expect(result[6].session_id).toBe("s3");
  });

  it("rounds accuracy_pct and guards null total_questions", async () => {
    mockQuizSessionsQuery.mockReturnValue(
      makeRecentSessionsQuery([
        // 2/3 → 67% rounded
        {
          id: "round",
          completed_at: "2026-05-10T12:00:00Z",
          correct_answers: 2,
          total_questions: 3,
          anime_id: "a",
          anime_series: { slug: "a", title: "A" },
        },
        // null total → 0% (no NaN/Infinity leak)
        {
          id: "null-total",
          completed_at: "2026-05-09T12:00:00Z",
          correct_answers: null,
          total_questions: null,
          anime_id: "a",
          anime_series: { slug: "a", title: "A" },
        },
        // zero total → 0% (division-by-zero guard)
        {
          id: "zero-total",
          completed_at: "2026-05-08T12:00:00Z",
          correct_answers: 0,
          total_questions: 0,
          anime_id: "a",
          anime_series: { slug: "a", title: "A" },
        },
      ])
    );

    const result = await getUserRecentQuizzes("user-1");
    expect(result).toHaveLength(3);
    expect(result.find((r) => r.session_id === "round")!.accuracy_pct).toBe(67);
    expect(
      result.find((r) => r.session_id === "null-total")!.accuracy_pct
    ).toBe(0);
    expect(
      result.find((r) => r.session_id === "zero-total")!.accuracy_pct
    ).toBe(0);
  });
});
