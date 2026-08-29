/**
 * /api/learner/profile — GET (load) / POST (upsert)
 * Persists LearnerProfile to Supabase with localStorage as local cache fallback.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured", profile: null }, { status: 200 });
    }

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Not authenticated", profile: null }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("learner_profiles")
      .select("profile_data, updated_at")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return NextResponse.json({ profile: data?.profile_data ?? null });
  } catch (err: any) {
    console.error("[profile GET]", err);
    return NextResponse.json({ error: err.message, profile: null }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile } = body;

    if (!profile) {
      return NextResponse.json({ error: "profile is required" }, { status: 400 });
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ ok: true, persisted: false });
    }

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ ok: true, persisted: false, reason: "not-authenticated" });
    }

    const { error } = await supabase
      .from("learner_profiles")
      .upsert(
        { user_id: user.id, profile_data: profile, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );

    if (error) throw error;

    return NextResponse.json({ ok: true, persisted: true });
  } catch (err: any) {
    console.error("[profile POST]", err);
    return NextResponse.json({ error: err.message, ok: false }, { status: 500 });
  }
}
