import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl.includes("your-project-id") ||
    supabaseUrl.includes("deblsqilknaxulxqbmmm")
  ) {
    return { supabaseResponse, user: null, role: "learner" };
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
              supabaseResponse = NextResponse.next({
                request,
              });
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    // Refresh the session and get the current user safely
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      return { supabaseResponse, user: null, role: "learner" };
    }

    const user = data.user;
    let role = "learner";

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role) {
        role = profile.role;
      }
    } catch {}

    return { supabaseResponse, user, role };
  } catch (err) {
    // Graceful fallback for dead/unreachable Supabase domain in mock or offline mode
    return { supabaseResponse, user: null, role: "learner" };
  }
}
