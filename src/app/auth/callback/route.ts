import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const authError = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (authError || errorDescription) {
    console.error("[OAuth Callback Error]:", authError, errorDescription);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription || authError || "oauth_failed")}`);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes("your-project-id")) {
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  if (code) {
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(url, key, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore inside route handler
            }
          },
        },
      });

      const { data: sessionData, error: sessionErr } = await supabase.auth.exchangeCodeForSession(code);
      if (sessionErr) {
        console.error("[OAuth Exchange Error]:", sessionErr.message);
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(sessionErr.message)}`);
      }

      const user = sessionData?.user;
      if (user) {
        const admin = await createAdminClient();

        // 1. Auto-provision or update public.profiles record
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Learner";

        if (admin) {
          try {
            const { data: existingProfile } = await admin
              .from("profiles")
              .select("id, has_completed_setup")
              .eq("id", user.id)
              .maybeSingle();

            if (!existingProfile) {
              await admin.from("profiles").upsert(
                {
                  id: user.id,
                  email: user.email || "",
                  name: fullName,
                  role: "learner",
                  has_completed_setup: false,
                  current_streak: 0,
                },
                { onConflict: "id" }
              );
            }
          } catch (profErr) {
            console.warn("[OAuth Callback] Profile provisioning warning:", profErr);
          }

          // 2. Check if user already has an active learning path
          try {
            const { data: activePath } = await admin
              .from("learning_paths")
              .select("id")
              .eq("user_id", user.id)
              .maybeSingle();

            if (!activePath) {
              return NextResponse.redirect(`${origin}/onboarding`);
            }
          } catch (pathErr) {
            console.warn("[OAuth Callback] Path check warning:", pathErr);
          }
        }


        // If explicit next query param was provided, respect it
        if (next) {
          return NextResponse.redirect(`${origin}${next}`);
        }

        return NextResponse.redirect(`${origin}/roadmap`);
      }
    } catch (err: any) {
      console.error("[OAuth Callback Exception]:", err);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(err.message || "oauth_exception")}`);
    }
  }

  // Return to login if no code was received
  return NextResponse.redirect(`${origin}/login?error=no_auth_code`);
}


