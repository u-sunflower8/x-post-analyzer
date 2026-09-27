import { NextResponse } from "next/server";
import { getLatestSuggestionByOwnPostId, getOwnPostById, listAllOwnPosts, insertSuggestion } from "@/lib/db/queries";
import { ownPostRowToOwnPost, ownPostSuggestionRowToSuggestion } from "@/lib/db/mappers";
import { withMetrics } from "@/lib/own-posts/metrics";
import { toPostBrief, buildAccountSummary } from "@/lib/own-posts/payload";
import { suggestImprovement } from "@/lib/openai/suggestImprovement";
import { MissingApiKeyError } from "@/lib/openai/client";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { force?: boolean };

  if (!body.force) {
    const existing = await getLatestSuggestionByOwnPostId(id);
    if (existing) {
      return NextResponse.json({ suggestion: ownPostSuggestionRowToSuggestion(existing), cached: true });
    }
  }

  const postRow = await getOwnPostById(id);
  if (!postRow) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const allRows = await listAllOwnPosts();
  const allPosts = allRows.map(ownPostRowToOwnPost).map(withMetrics);
  const post = withMetrics(ownPostRowToOwnPost(postRow));

  let result;
  try {
    result = await suggestImprovement({
      post: toPostBrief(post),
      accountSummary: buildAccountSummary(allPosts),
    });
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      return NextResponse.json({ error: "OPENAI_API_KEY未設定です" }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "OpenAI suggestion failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const inserted = await insertSuggestion(id, result);

  return NextResponse.json({
    suggestion: ownPostSuggestionRowToSuggestion(inserted),
    cached: false,
  });
}
