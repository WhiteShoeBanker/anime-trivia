import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { profileNeedsCompletion } from "@/lib/profile-completeness";
import {
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
} from "@/lib/env/client-env";
import { ADMIN_EMAILS } from "@/lib/env/server-env";

// Routes reachable without an authenticated session. Everything else redirects
// to /auth. The matcher already excludes _next/static, _next/image, favicon,
// and image asset extensions, so this list only governs application routes.
const PUBLIC_PATHS = ["/", "/privacy"];
const PUBLIC_PREFIXES = ["/auth", "/api/", "/_next/"];

const isPublicPath = (pathname: string): boolean => {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix.replace(/\/$/, "") || pathname.startsWith(prefix)
  );
};

// Matches the body of Next's default 404 page closely enough that an
// unauthorized /admin URL is indistinguishable from a non-existent route.
const notFoundResponse = () => new NextResponse("Not Found", { status: 404 });

export async function middleware(request: NextRequest) {
  // Canonical @supabase/ssr Next.js middleware pattern: build a single
  // response that wraps `request`, and propagate refreshed Supabase cookies
  // to BOTH request.cookies (so downstream Server Components see them via
  // next/headers) and the outgoing response (so the browser persists them).
  let supabaseResponse = NextResponse.next({ request });

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
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => {
              supabaseResponse.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // Refresh session cookie
    const { data } = await supabase.auth.getUser();
    user = data.user;

    const pathname = request.nextUrl.pathname;

    // Auth-required by default: any non-public route requires a session.
    if (!user && !isPublicPath(pathname)) {
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

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
