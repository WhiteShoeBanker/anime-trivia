import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_ROUTES = ["/profile", "/leagues", "/badges", "/stats", "/grand-prix"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  let user = null;

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    // Authenticated user without birth_year: force profile completion
    if (user && !pathname.startsWith("/auth")) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("birth_year")
        .eq("id", user.id)
        .single();

      if (profile && !profile.birth_year) {
        return NextResponse.redirect(
          new URL("/auth?complete_profile=true", request.url)
        );
      }
    }
  } catch {
    // Supabase unavailable — continue without auth
  }

  // Admin route guard
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    if (adminEmails.length === 0) {
      return NextResponse.rewrite(new URL("/__admin_guard", request.url));
    }

    if (!user || !adminEmails.includes(user.email ?? "")) {
      return NextResponse.rewrite(new URL("/__admin_guard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
