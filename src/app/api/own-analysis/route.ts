import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ownPostRowToOwnPost, ownPostAnalysisRowToAnalysis } from "@/lib/supabase/mappers";
import { withMetrics } from "@/lib/own-posts/metrics";
import { buildAnalysisPayload } from "@/lib/own-posts/payload";
import { analyzeWinningPatterns } from "@/lib/openai/analyzeWinningPatterns";
import { MissingApiKeyError } from "@/lib/openai/client";
import type { OwnPostRow, OwnPostAnalysisRow } from "@/lib/supabase/types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { force?: boolean };
  const supabase = getSupabaseServerClient();

  if (!body.force) {
    const { data: existing, error } = await supabase
      .from("own_post_analyses")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (existing) {
      return NextResponse.json({
        analysis: ownPostAnalysisRowToAnalysis(existing as OwnPostAnalysisRow),
        cached: true,
      });
    }
  }

  const { data: rows, error: rowsError } = await supabase.from("own_posts").select("*");
  if (rowsError) {
    return NextResponse.json({ error: rowsError.message }, { status: 500 });
  }

  const posts = ((rows ?? []) as OwnPostRow[]).map(ownPostRowToOwnPost).map(withMetrics);
  if (posts.length === 0) {
    return NextResponse.json({ error: "分析対象の投稿がありません" }, { status: 400 });
  }

  let result;
  try {
    result = await analyzeWinningPatterns(buildAnalysisPayload(posts));
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      return NextResponse.json({ error: "OPENAI_API_KEY未設定です" }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "OpenAI analysis failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const { data: inserted, error: insertError } = await supabase
    .from("own_post_analyses")
    .insert({ result })
    .select("*")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    analysis: ownPostAnalysisRowToAnalysis(inserted as OwnPostAnalysisRow),
    cached: false,
  });
}
