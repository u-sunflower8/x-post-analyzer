import { NextResponse } from "next/server";
import { getLatestOwnPostAnalysis, listAllOwnPosts, insertOwnPostAnalysis } from "@/lib/db/queries";
import { ownPostRowToOwnPost, ownPostAnalysisRowToAnalysis } from "@/lib/db/mappers";
import { withMetrics } from "@/lib/own-posts/metrics";
import { buildAnalysisPayload } from "@/lib/own-posts/payload";
import { analyzeWinningPatterns } from "@/lib/openai/analyzeWinningPatterns";
import { MissingApiKeyError } from "@/lib/openai/client";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { force?: boolean };

  if (!body.force) {
    const existing = await getLatestOwnPostAnalysis();
    if (existing) {
      return NextResponse.json({ analysis: ownPostAnalysisRowToAnalysis(existing), cached: true });
    }
  }

  const rows = await listAllOwnPosts();
  const posts = rows.map(ownPostRowToOwnPost).map(withMetrics);
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

  const inserted = await insertOwnPostAnalysis(result);

  return NextResponse.json({
    analysis: ownPostAnalysisRowToAnalysis(inserted),
    cached: false,
  });
}
