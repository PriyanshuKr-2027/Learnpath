/**
 * /api/learner/notes — GET ?levelId=xxx / POST { levelId, content }
 * Persists markdown notes per level to Supabase level_notes table.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const levelId = req.nextUrl.searchParams.get("levelId");
    if (!levelId) return NextResponse.json({ error: "levelId required" }, { status: 400 });

    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ content: null });

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return NextResponse.json({ content: null });

    const { data, error } = await supabase
      .from("level_notes")
      .select("content, updated_at")
      .eq("user_id", user.id)
      .eq("level_id", levelId)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return NextResponse.json({ content: data?.content ?? null });
  } catch (err: any) {
    console.error("[notes GET]", err);
    return NextResponse.json({ content: null, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { levelId, content } = body;

    if (!levelId) return NextResponse.json({ error: "levelId required" }, { status: 400 });

    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ ok: true, persisted: false });

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return NextResponse.json({ ok: true, persisted: false });

    const { error } = await supabase
      .from("level_notes")
      .upsert(
        {
          user_id: user.id,
          level_id: levelId,
          content: content ?? "",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,level_id" }
      );

    if (error) throw error;

    return NextResponse.json({ ok: true, persisted: true });
  } catch (err: any) {
    console.error("[notes POST]", err);
    return NextResponse.json({ error: err.message, ok: false }, { status: 500 });
  }
}
