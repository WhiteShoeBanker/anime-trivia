import { createClient } from "@/lib/supabase/client";
import type { PromoCode, PromoCodeType } from "@/types";

interface RedeemSuccess {
  success: true;
  type: PromoCodeType;
  expiresAt: string | null;
}

interface RedeemError {
  success: false;
  error: string;
}

type RedeemResult = RedeemSuccess | RedeemError;

const getProExpiration = (type: PromoCodeType): string | null => {
  const now = new Date();
  switch (type) {
    case "pro_monthly":
      now.setMonth(now.getMonth() + 1);
      return now.toISOString();
    case "pro_yearly":
      now.setFullYear(now.getFullYear() + 1);
      return now.toISOString();
    case "pro_lifetime":
      return null;
  }
};

export const redeemPromoCode = async (
  userId: string,
  codeString: string
): Promise<RedeemResult> => {
  const supabase = createClient();
  const trimmed = codeString.trim().toUpperCase();

  if (!trimmed) {
    return { success: false, error: "Please enter a promo code." };
  }

  // 1. Look up the code
  const { data: codeData, error: codeError } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", trimmed)
    .single();

  if (codeError || !codeData) {
    return { success: false, error: "Code not found. Please check and try again." };
  }

  const promo = codeData as PromoCode;

  // 2. Check expiration
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return { success: false, error: "This code has expired." };
  }

  // 3. Check max uses
  if (promo.current_uses >= promo.max_uses) {
    return { success: false, error: "This code has already been fully redeemed." };
  }

  // 4. Check if user already redeemed this code
  const { data: existing } = await supabase
    .from("promo_redemptions")
    .select("id")
    .eq("user_id", userId)
    .eq("promo_code_id", promo.id)
    .single();

  if (existing) {
    return { success: false, error: "You've already redeemed this code." };
  }

  // 5. Calculate expiration date
  const expiresAt = getProExpiration(promo.type);

  // 6. Insert redemption
  const { error: redemptionError } = await supabase
    .from("promo_redemptions")
    .insert({
      user_id: userId,
      promo_code_id: promo.id,
    });

  if (redemptionError) {
    return { success: false, error: "Something went wrong. Please try again." };
  }

  // 7. Update user profile to pro
  const { error: profileError } = await supabase
    .from("user_profiles")
    .update({
      subscription_tier: "pro",
      subscription_source: "promo_code",
      pro_expires_at: expiresAt,
    })
    .eq("id", userId);

  if (profileError) {
    return { success: false, error: "Something went wrong. Please try again." };
  }

  // 8. Increment code uses
  await supabase
    .from("promo_codes")
    .update({ current_uses: promo.current_uses + 1 })
    .eq("id", promo.id);

  return {
    success: true,
    type: promo.type,
    expiresAt,
  };
};
