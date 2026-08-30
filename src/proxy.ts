import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user, role } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isMockMode =
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl.includes("your-project-id") ||
    supabaseKey.includes("your-anon-public-key");

  // In mock/demo mode, allow all authenticated routes (dashboard, notes, etc.)
  if (isMockMode) {
    return supabaseResponse;
  }

  // Paths that require authentication
  const isProtectedPath = 
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/day") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/plan") ||
    pathname.startsWith("/patterns") ||
    pathname.startsWith("/problems") ||
    pathname.startsWith("/social") ||
    pathname.startsWith("/notes") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/roadmap") ||
    pathname.startsWith("/coach") ||
    pathname.startsWith("/assessments") ||
    pathname.startsWith("/learn");

  // Auth routing logic
  if (!user && isProtectedPath) {
    // Redirect unauthenticated user to login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    // Redirect authenticated user away from login to dashboard
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && pathname.startsWith("/admin") && role !== "admin") {
    // Restrict /admin to admin role only
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - API routes (we handle auth in API handlers where needed)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
