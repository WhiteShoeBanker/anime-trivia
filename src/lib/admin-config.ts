import { createServiceClient } from "@/lib/supabase/service";

const cache = new Map<string, { value: unknown; timestamp: number }>();
const CACHE_TTL = 60_000;

const DEFAULTS: Record<string, unknown> = {
  free_quiz_limit: 10,
  diminishing_returns: [1.0, 0.75, 0.5, 0.25, 0.1],
  maintenance_mode: false,
  feature_flags: {
    leagues: true,
    badges: true,
    daily_challenge: true,
    grand_prix: true,
    swag_shop: true,
  },
  announcement_banner: "",
  ad_visibility: true,
  daily_challenge_mix: { easy: 3, medium: 3, hard: 3, impossible: 1 },
};

export const getConfig = async <T>(key: string): Promise<T> => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value as T;
  }

  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("admin_config")
      .select("value")
      .eq("key", key)
      .single();

    const value = data?.value ?? DEFAULTS[key] ?? null;
    cache.set(key, { value, timestamp: Date.now() });
    return value as T;
  } catch {
    const fallback = DEFAULTS[key] ?? null;
    return fallback as T;
  }
};

export const invalidateConfig = (key?: string) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};
