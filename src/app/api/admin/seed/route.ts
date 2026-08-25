import { NextResponse } from "next/server";
import { PRESEEDED_CAREER_ROLES } from "@/lib/data/roleTaxonomy";
import { PRESEEDED_CURATED_CORPUS } from "@/lib/data/curatedCorpus";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  const expectedSecret = process.env.ADMIN_SEED_SECRET || "admin-seed-secret";

  if (secret !== expectedSecret) {
    return NextResponse.json(
      { error: "Unauthorized. Invalid secret key." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "LearnPath AI 2.0 taxonomies and corpus verified.",
    rolesCount: PRESEEDED_CAREER_ROLES.length,
    corpusTopicsCount: Object.keys(PRESEEDED_CURATED_CORPUS).length,
  });
}
