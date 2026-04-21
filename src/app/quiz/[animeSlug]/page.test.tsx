import { describe, it, expect, vi, beforeEach } from "vitest";

// Metadata-leak regression test. generateMetadata must not emit the title
// of an M-rated anime when the viewer's session cannot see it. Because
// RLS (migration 016) returns null for filtered rows, getAnimeBySlug
// returns null, and generateMetadata must fall through to neutral copy.

const mockAnimeQuery = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: null } })),
    },
    from: (table: string) => {
      if (table === "anime_series") return mockAnimeQuery();
      throw new Error(`unexpected table ${table}`);
    },
  })),
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => {
    throw new Error("quiz page metadata must not use the service client");
  },
}));

vi.mock("@/lib/admin-config", () => ({
  getConfig: vi.fn(async () => 10),
}));

import { generateMetadata } from "./page";

const NARUTO = {
  id: "1",
  slug: "naruto",
  title: "Naruto",
  content_rating: "E",
  total_questions: 50,
  is_active: true,
};

const primeAnime = (row: typeof NARUTO | null) => {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.maybeSingle = vi.fn(async () => ({ data: row, error: null }));
  mockAnimeQuery.mockReturnValue(chain);
};

describe("generateMetadata — no title leak for RLS-filtered anime", () => {
  beforeEach(() => vi.clearAllMocks());

  it("junior hitting /quiz/death-note → RLS returns null → neutral title, no 'Death Note' anywhere", async () => {
    primeAnime(null); // RLS filters the M-rated row out
    const metadata = await generateMetadata({
      params: Promise.resolve({ animeSlug: "death-note" }),
    });
    const serialized = JSON.stringify(metadata);
    expect(serialized).not.toContain("Death Note");
    expect(serialized).not.toContain("death-note");
    expect(metadata.title).toBe("OtakuQuiz");
    expect(metadata.description).toBeUndefined();
  });

  it("junior hitting /quiz/naruto → RLS allows → real title for regression", async () => {
    primeAnime(NARUTO);
    const metadata = await generateMetadata({
      params: Promise.resolve({ animeSlug: "naruto" }),
    });
    expect(metadata.title).toBe("Naruto Quiz");
    expect(typeof metadata.description).toBe("string");
    expect(metadata.description).toContain("Naruto");
  });

  it("unknown slug → same neutral metadata (no anti-enumeration surface)", async () => {
    primeAnime(null);
    const metadata = await generateMetadata({
      params: Promise.resolve({ animeSlug: "no-such-thing" }),
    });
    expect(metadata.title).toBe("OtakuQuiz");
  });

  it("DB error → neutral metadata, does not crash or throw", async () => {
    const chain: Record<string, unknown> = {};
    chain.select = vi.fn(() => chain);
    chain.eq = vi.fn(() => chain);
    chain.maybeSingle = vi.fn(async () => ({
      data: null,
      error: { message: "db down" },
    }));
    mockAnimeQuery.mockReturnValue(chain);

    const metadata = await generateMetadata({
      params: Promise.resolve({ animeSlug: "death-note" }),
    });
    expect(metadata.title).toBe("OtakuQuiz");
  });
});
