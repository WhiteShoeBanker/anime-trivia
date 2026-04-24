import { vi } from "vitest";

/**
 * Creates a chainable mock that mimics the Supabase query builder pattern.
 * Each method returns the same builder so calls like
 *   supabase.from("x").select("*").eq("id", "1").single()
 * all resolve to the configured return value.
 */
export const createMockSupabaseClient = () => {
  const resolvedValue: { data: unknown; error: unknown; count: number | null } = {
    data: null,
    error: null,
    count: null,
  };

  const builder: Record<string, ReturnType<typeof vi.fn>> = {};

  const chainable = () =>
    new Proxy(builder, {
      get(_target, prop: string) {
        if (prop === "then") {
          // Make the builder thenable — resolves to { data, error, count }
          return (resolve: (v: unknown) => void) =>
            resolve({ data: resolvedValue.data, error: resolvedValue.error, count: resolvedValue.count });
        }
        if (!builder[prop]) {
          builder[prop] = vi.fn().mockReturnValue(chainable());
        }
        return builder[prop];
      },
    });

  const client = {
    from: vi.fn().mockReturnValue(chainable()),
    _builder: builder,
    _resolved: resolvedValue,
    /** Set the data that the current chain will resolve to */
    mockResolvedData(data: unknown, count?: number | null) {
      resolvedValue.data = data;
      resolvedValue.error = null;
      resolvedValue.count = count ?? null;
    },
    /** Set an error for the current chain */
    mockResolvedError(error: unknown) {
      resolvedValue.data = null;
      resolvedValue.error = error;
      resolvedValue.count = null;
    },
  };

  return client;
};

// ─────────────────────────────────────────────────────────────
// Per-table responder pattern
//
// More powerful than createMockSupabaseClient when tests need to
// return different data from different tables or methods.
//
// Capture each chained call as a Query {table, ops[]} and let the
// test provide a Responder that decides what to return based on
// the captured call shape. Also exposes the captured queries array
// so tests can assert on the exact chain that was built (e.g.
// "questions was filtered with .in('anime_id', [...])").
//
// Originally established in src/app/api/process-leagues/route.test.ts
// during Session 3; extracted for reuse in Session 4A.
// ─────────────────────────────────────────────────────────────

export type QueryOp = { method: string; args: unknown[] };
export type Query = { table: string; ops: QueryOp[] };
export type QueryResult = { data?: unknown; error?: unknown; count?: number | null };
export type Responder = (q: Query) => QueryResult;

/**
 * Install a per-table responder on a provided `from` mock fn.
 *
 * Usage:
 *   const mockFrom = vi.fn();
 *   vi.mock("@/lib/supabase/client", () => ({
 *     createClient: () => ({ from: mockFrom }),
 *   }));
 *   const queries = installSupabaseResponder(mockFrom, (q) => {
 *     if (q.table === "user_profiles") return { data: { total_xp: 100 } };
 *     return { data: null };
 *   });
 *
 * Assert on captured chains via findCall / findAllCalls.
 */
export const installSupabaseResponder = (
  fromMock: ReturnType<typeof vi.fn>,
  responder: Responder
): Query[] => {
  const queries: Query[] = [];
  fromMock.mockImplementation((table: string) => {
    const ops: QueryOp[] = [];
    const query: Query = { table, ops };
    queries.push(query);
    const handler: ProxyHandler<object> = {
      get(_t, prop) {
        if (prop === "then") {
          const result = responder(query);
          return (resolve: (v: { data: unknown; error: unknown; count: number | null }) => void) =>
            resolve({
              data: result.data ?? null,
              error: result.error ?? null,
              count: result.count ?? null,
            });
        }
        return (...args: unknown[]) => {
          ops.push({ method: String(prop), args });
          return new Proxy({}, handler);
        };
      },
    };
    return new Proxy({}, handler);
  });
  return queries;
};

/** Find the first captured query that hit `table` and called `method` in its chain. */
export const findCall = (queries: Query[], table: string, method: string): Query | undefined =>
  queries.find(
    (q) => q.table === table && q.ops.some((op) => op.method === method)
  );

/** Find all captured queries that hit `table` and called `method` in their chain. */
export const findAllCalls = (queries: Query[], table: string, method: string): Query[] =>
  queries.filter(
    (q) => q.table === table && q.ops.some((op) => op.method === method)
  );
