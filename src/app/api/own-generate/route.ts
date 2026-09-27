import { NextResponse } from "next/server";
import {
  getOwnPostAnalysisById,
  getLatestOwnPostAnalysis,
  getLatestDraftByAnalysisId,
  listAllOwnPosts,
  insertOwnPostDraft,
} from "@/lib/db/queries";
import { ownPostRowToOwnPost, ownPostAnalysisRowToAnalysis, ownPostDraftRowToDrafts } from "@/lib/db/mappers";
import { withMetrics } from "@/lib/own-posts/metrics";
import { buildAnalysisPayload } from "@/lib/own-posts/payload";
import { generateDraftsFromPatterns } from "@/lib/openai/generateFromPatterns";
import { MissingApiKeyError } from "@/lib/openai/client";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { analysisId?: string; force?: boolean };

  const analysisRow = body.analysisId
    ? await getOwnPostAnalysisById(body.analysisId)
    : await getLatestOwnPostAnalysis();

  if (!analysisRow) {
    return NextResponse.json({ error: "勝ちパターン分析が見つかりません。先に分析を実行してください" }, { status: 404 });
  }

  const analysis = ownPostAnalysisRowToAnalysis(analysisRow);

  if (!body.force) {
    const existingDraft = await getLatestDraftByAnalysisId(analysis.id);
    if (existingDraft) {
      return NextResponse.json({
        drafts: ownPostDraftRowToDrafts(existingDraft).result.drafts,
        analysisId: analysis.id,
        cached: true,
      });
    }
  }

  const rows = await listAllOwnPosts();
  const posts = rows.map(ownPostRowToOwnPost).map(withMetrics);
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

  const inserted = await insertOwnPostDraft(analysis.id, generated);

  return NextResponse.json({
    drafts: ownPostDraftRowToDrafts(inserted).result.drafts,
    analysisId: analysis.id,
    cached: false,
  });
}
