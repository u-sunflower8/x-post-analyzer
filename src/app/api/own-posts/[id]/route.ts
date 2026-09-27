import { NextResponse } from "next/server";
import { getOwnPostById, getLatestSuggestionByOwnPostId, updateOwnPostImpressionCount } from "@/lib/db/queries";
import { ownPostRowToOwnPost, ownPostSuggestionRowToSuggestion } from "@/lib/db/mappers";
import { withMetrics } from "@/lib/own-posts/metrics";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const postRow = await getOwnPostById(id);
  if (!postRow) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const suggestionRow = await getLatestSuggestionByOwnPostId(id);

  return NextResponse.json({
    post: withMetrics(ownPostRowToOwnPost(postRow)),
    suggestion: suggestionRow ? ownPostSuggestionRowToSuggestion(suggestionRow) : null,
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { impressionCount?: number } | null;
  if (!body || body.impressionCount === undefined) {
    return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
  }

  const updated = await updateOwnPostImpressionCount(id, body.impressionCount);
  if (!updated) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ post: withMetrics(ownPostRowToOwnPost(updated)) });
}
