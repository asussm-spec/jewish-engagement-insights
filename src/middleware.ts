import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const DEMO_COOKIE = "demo_mode";

export async function middleware(request: NextRequest) {
  // Skip auth middleware if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Demo cookie management ──
  // Real auth always wins: if the user is logged in, drop any stale demo cookie.
  // Honor `?demo=false` as an explicit exit.
  // Otherwise, set the cookie when `?demo=true` is passed and there's no user.
  const demoQuery = request.nextUrl.searchParams.get("demo");
  const hasDemoCookie = request.cookies.get(DEMO_COOKIE)?.value === "true";

  const shouldClearDemo =
    Boolean(user) || demoQuery === "false";
  const shouldSetDemo =
    !user && demoQuery === "true" && !hasDemoCookie;

  if (shouldClearDemo && hasDemoCookie) {
    request.cookies.delete(DEMO_COOKIE);
    supabaseResponse.cookies.set(DEMO_COOKIE, "", { path: "/", maxAge: 0 });
  }

  // Effective demo state for this request after the clear above
  const isDemo =
    !user &&
    (demoQuery === "true" ||
      (hasDemoCookie && !shouldClearDemo));

  // Protect dashboard routes — redirect to login if neither authed nor in demo
  if (
    !user &&
    !isDemo &&
    request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (shouldSetDemo) {
    supabaseResponse.cookies.set(DEMO_COOKIE, "true", {
      path: "/",
      maxAge: 60 * 60 * 4, // 4 hours
    });
  }

  // Redirect logged-in users away from auth pages
  if (
    user &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/signup")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|demo/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
