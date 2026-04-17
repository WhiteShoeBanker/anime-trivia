import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/browse";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has completed age profile
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("age_group")
          .eq("id", user.id)
          .maybeSingle();

        // Fail-open to match middleware: only force completion when we
        // positively observe a row with null age_group.
        if (!profileError && profile && !profile.age_group) {
          return NextResponse.redirect(
            `${origin}/auth?complete_profile=true`
          );
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=callback_failed`);
}
