import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ path: null });
    }

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ path: null });
    }

    const db = (await createAdminClient()) || supabase;

    const { data, error } = await db
      .from("learning_paths")
      .select("path_data, version, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;

    return NextResponse.json({ path: data?.path_data ?? null, version: data?.version ?? null });
  } catch (err: any) {
    console.error("[path GET]", err);
    return NextResponse.json({ path: null, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path } = body;

    if (!path) return NextResponse.json({ error: "path is required" }, { status: 400 });

    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ ok: true, persisted: false });

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return NextResponse.json({ ok: true, persisted: false });

    const db = (await createAdminClient()) || supabase;

    const { error } = await db
      .from("learning_paths")
      .upsert(
        {
          user_id: user.id,
          path_data: path,
          version: path.version ?? 1,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) throw error;

    return NextResponse.json({ ok: true, persisted: true });
  } catch (err: any) {
    console.error("[path POST]", err);
    return NextResponse.json({ error: err.message, ok: false }, { status: 500 });
  }
}

