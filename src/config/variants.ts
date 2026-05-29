import type { ContentRating } from "@/types";

export type AppVariant = "full" | "kids";

const rawVariant = process.env.NEXT_PUBLIC_APP_VARIANT;
export const APP_VARIANT: AppVariant = rawVariant === "kids" ? "kids" : "full";

export interface VariantConfig {
  readonly displayName: string;
  readonly bundleId: string;
  readonly domain: string;
  readonly enabledContentRatings: readonly ContentRating[];
  readonly enabledAgeGroups: readonly ("junior" | "teen" | "full")[];
  readonly showAgeGate: boolean;
  readonly forcedAgeGroup: "junior" | "teen" | "full" | null;
  readonly monetization: {
    readonly ads: boolean;
    readonly pro: boolean;
    readonly trialDays: number;
  };
  readonly legalRoutes: {
    readonly terms: string;
    readonly privacy: string;
  };
  readonly metadata: {
    readonly title: string;
    readonly description: string;
  };
}

export const VARIANT_CONFIG = {
  full: {
    displayName: "OtakuQuiz",
    bundleId: "com.otakuquiz.app",
    domain: "otakuquiz.com",
    enabledContentRatings: ["E", "T", "M"],
    enabledAgeGroups: ["junior", "teen", "full"],
    showAgeGate: true,
    forcedAgeGroup: null,
    monetization: { ads: true, pro: true, trialDays: 7 },
    legalRoutes: { terms: "/terms", privacy: "/privacy" },
    metadata: {
      title: "OtakuQuiz — Anime Trivia",
      description: "Test your anime knowledge across 10+ titles.",
    },
  },
  kids: {
    displayName: "OtakuQuiz Kids",
    bundleId: "com.otakuquiz.kids",
    domain: "kids.otakuquiz.com",
    enabledContentRatings: ["E"],
    enabledAgeGroups: ["junior"],
    showAgeGate: false,
    forcedAgeGroup: "junior",
    monetization: { ads: false, pro: false, trialDays: 0 },
    legalRoutes: { terms: "/terms/kids", privacy: "/privacy/kids" },
    metadata: {
      title: "OtakuQuiz Kids — Safe Anime Trivia for Kids",
      description: "Kid-friendly anime trivia. No ads. No tracking.",
    },
  },
} as const satisfies Record<AppVariant, VariantConfig>;

export const variantConfig: VariantConfig = VARIANT_CONFIG[APP_VARIANT];

export const isKidsVariant = (): boolean => APP_VARIANT === "kids";
