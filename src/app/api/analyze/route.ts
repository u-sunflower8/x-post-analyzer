import { NextResponse } from "next/server";
import { getLatestAnalysisByPostId, getPostById, insertAnalysis } from "@/lib/db/queries";
import { analyzePost } from "@/lib/openai/analyzeBuzzPost";
import { MODEL, MissingApiKeyError } from "@/lib/openai/client";
import { analysisRowToAnalysis } from "@/lib/db/mappers";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { postId?: string; force?: boolean } | null;
  const postId = body?.postId;
  if (!postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  if (!body?.force) {
    const existing = await getLatestAnalysisByPostId(postId);
    if (existing) {
      return NextResponse.json({ analysis: analysisRowToAnalysis(existing), cached: true });
    }
  }

  const post = await getPostById(postId);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  let result;
  try {
    result = await analyzePost({
      text: post.text,
      authorFollowersCount: post.author_followers_count,
      likeCount: post.like_count,
      repostCount: post.repost_count,
      replyCount: post.reply_count,
    });
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      return NextResponse.json({ error: "OPENAI_API_KEY未設定です" }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "OpenAI analysis failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const inserted = await insertAnalysis({
    postId,
    model: MODEL,
    result,
    structureAbstract: result.structureAbstract,
  });

  return NextResponse.json({ analysis: analysisRowToAnalysis(inserted), cached: false });
}
