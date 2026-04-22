import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { profileNeedsCompletion } from "@/lib/profile-completeness";
import {
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
} from "@/lib/env/client-env";
import { ADMIN_EMAILS } from "@/lib/env/server-env";

const PROTECTED_ROUTES = ["/profile", "/leagues", "/badges", "/stats", "/grand-prix", "/duels"];

// Matches the body of Next's default 404 page closely enough that an
// unauthorized /admin URL is indistinguishable from a non-existent route.
const notFoundResponse = () => new NextResponse("Not Found", { status: 404 });

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  let user = null;

  try {
    const supabase = createServerClient(
      NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // Refresh session cookie
    const { data } = await supabase.auth.getUser();
    user = data.user;

    // Protected routes: require auth
    const pathname = request.nextUrl.pathname;
    const isProtected = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route)
    );

    if (isProtected && !user) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    // Profile completeness check. Authoritative rule in profileNeedsCompletion:
    //   null age_group or missing row → redirect to age gate.
    //   query error → fail open (don't trap users during Supabase outages).
    // The /auth page itself guards against showing the age gate to users who
    // already completed it.
    if (user && !pathname.startsWith("/auth")) {
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("age_group")
        .eq("id", user.id)
        .maybeSingle();

      if (profileNeedsCompletion(profile, !!profileError)) {
        return NextResponse.redirect(
          new URL("/auth?complete_profile=true", request.url)
        );
      }
    }
  } catch {
    // Supabase unavailable — continue without auth
  }

  // Admin route guard. ADMIN_EMAILS unset is a valid state meaning
  // "no admin access"; in that case every /admin URL returns 404,
  // identical to the response a non-allowlisted user gets.
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (ADMIN_EMAILS.length === 0) {
      return notFoundResponse();
    }
    if (!user || !ADMIN_EMAILS.includes((user.email ?? "").toLowerCase())) {
      return notFoundResponse();
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
