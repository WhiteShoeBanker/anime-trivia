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
