import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ownPostRowToOwnPost, ownPostAnalysisRowToAnalysis, ownPostDraftRowToDrafts } from "@/lib/supabase/mappers";
import { withMetrics } from "@/lib/own-posts/metrics";
import { buildAnalysisPayload } from "@/lib/own-posts/payload";
import { generateDraftsFromPatterns } from "@/lib/openai/generateFromPatterns";
import { MissingApiKeyError } from "@/lib/openai/client";
import type { OwnPostRow, OwnPostAnalysisRow, OwnPostDraftRow } from "@/lib/supabase/types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { analysisId?: string; force?: boolean };
  const supabase = getSupabaseServerClient();

  let analysisQuery = supabase.from("own_post_analyses").select("*");
  analysisQuery = body.analysisId
    ? analysisQuery.eq("id", body.analysisId)
    : analysisQuery.order("created_at", { ascending: false }).limit(1);

  const { data: analysisRow, error: analysisError } = await analysisQuery.maybeSingle();
  if (analysisError) {
    return NextResponse.json({ error: analysisError.message }, { status: 500 });
  }
  if (!analysisRow) {
    return NextResponse.json({ error: "勝ちパターン分析が見つかりません。先に分析を実行してください" }, { status: 404 });
  }

  const analysis = ownPostAnalysisRowToAnalysis(analysisRow as OwnPostAnalysisRow);

  if (!body.force) {
    const { data: existingDrafts, error: draftsError } = await supabase
      .from("own_post_drafts")
      .select("*")
      .eq("analysis_id", analysis.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (draftsError) {
      return NextResponse.json({ error: draftsError.message }, { status: 500 });
    }
    if (existingDrafts) {
      return NextResponse.json({
        drafts: ownPostDraftRowToDrafts(existingDrafts as OwnPostDraftRow).result.drafts,
        analysisId: analysis.id,
        cached: true,
      });
    }
  }

  const { data: rows, error: rowsError } = await supabase.from("own_posts").select("*");
  if (rowsError) {
    return NextResponse.json({ error: rowsError.message }, { status: 500 });
  }

  const posts = ((rows ?? []) as OwnPostRow[]).map(ownPostRowToOwnPost).map(withMetrics);
  const payload = buildAnalysisPayload(posts);

  let generated;
  try {
    generated = await generateDraftsFromPatterns({
      insights: analysis.result.insights,
      topPosts: payload.topPosts,
      accountSummary: payload.summary,
    });
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      return NextResponse.json({ error: "OPENAI_API_KEY未設定です" }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "OpenAI generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const { data: inserted, error: insertError } = await supabase
    .from("own_post_drafts")
    .insert({ analysis_id: analysis.id, result: generated })
    .select("*")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    drafts: ownPostDraftRowToDrafts(inserted as OwnPostDraftRow).result.drafts,
    analysisId: analysis.id,
    cached: false,
  });
}
