import { createClient } from "@/lib/supabase/client";
import { trackPromoCodeRedeemed } from "@/lib/track-actions";
import type { PromoCodeType } from "@/types";

export type RedeemErrorCode =
  | "invalid"
  | "expired"
  | "exhausted"
  | "already_redeemed"
  | "already_pro"
  | "unauthenticated"
  | "internal";

interface RedeemSuccess {
  success: true;
  type: PromoCodeType;
  expiresAt: string | null;
}

interface RedeemError {
  success: false;
  error: string;
  errorCode: RedeemErrorCode;
}

type RedeemResult = RedeemSuccess | RedeemError;

// One canonical mapping from machine error_code → user-facing string.
// Keep in sync with the error_code values returned by the
// redeem_promo_code() PL/pgSQL function (migration 017).
const ERROR_MESSAGES: Record<RedeemErrorCode, string> = {
  invalid: "That code isn't valid. Please check and try again.",
  expired: "This code has expired.",
  exhausted: "This code has already been fully redeemed.",
  already_redeemed: "You've already redeemed this code.",
  already_pro: "You already have Pro — no need to redeem.",
  unauthenticated: "Please sign in to redeem a code.",
  internal: "Something went wrong. Please try again.",
};

interface RpcSuccessPayload {
  success: true;
  tier: PromoCodeType;
  code_id: string;
  expires_at: string | null;
}

interface RpcErrorPayload {
  success: false;
  error_code: RedeemErrorCode;
}

type RpcPayload = RpcSuccessPayload | RpcErrorPayload;

export const redeemPromoCode = async (
  codeString: string
): Promise<RedeemResult> => {
  const trimmed = codeString.trim();

  if (!trimmed) {
    return {
      success: false,
      error: "Please enter a promo code.",
      errorCode: "invalid",
    };
  }

  const supabase = createClient();

  // Single atomic call. The RPC locks the promo_codes row, validates,
  // inserts the redemption, bumps current_uses, and upgrades the user
  // profile — all in one transaction running as the function owner.
  const { data, error } = await supabase.rpc("redeem_promo_code", {
    p_code: trimmed,
  });

  if (error || data == null) {
    return {
      success: false,
      error: ERROR_MESSAGES.internal,
      errorCode: "internal",
    };
  }

  const payload = data as RpcPayload;

  if (!payload.success) {
    const code: RedeemErrorCode = payload.error_code ?? "internal";
    return {
      success: false,
      error: ERROR_MESSAGES[code] ?? ERROR_MESSAGES.internal,
      errorCode: code,
    };
  }

  // Fire-and-forget analytics. Derive userId from the session, not a client
  // parameter — caller shouldn't be trusted with identity on a Pro grant.
  supabase.auth
    .getUser()
    .then(({ data: { user } }) => {
      if (user) {
        trackPromoCodeRedeemed(user.id, {
          code_type: payload.tier,
          code_id: payload.code_id,
        }).catch(() => {});
      }
    })
    .catch(() => {});

  return {
    success: true,
    type: payload.tier,
    expiresAt: payload.expires_at,
  };
};
