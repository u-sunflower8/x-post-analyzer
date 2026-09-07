import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { analyzePost } from "@/lib/openai/analyzeBuzzPost";
import { MODEL, MissingApiKeyError } from "@/lib/openai/client";
import { analysisRowToAnalysis } from "@/lib/supabase/mappers";
import type { AnalysisRow, PostRow } from "@/lib/supabase/types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { postId?: string; force?: boolean } | null;
  const postId = body?.postId;
  if (!postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  if (!body?.force) {
    const { data: existing, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (existing) {
      return NextResponse.json({ analysis: analysisRowToAnalysis(existing as AnalysisRow), cached: true });
    }
  }

  const { data: postRow, error: postError } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .maybeSingle();

  if (postError) {
    return NextResponse.json({ error: postError.message }, { status: 500 });
  }
  if (!postRow) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const post = postRow as PostRow;

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

  const { data: inserted, error: insertError } = await supabase
    .from("analyses")
    .insert({
      post_id: postId,
      model: MODEL,
      result,
      structure_abstract: result.structureAbstract,
    })
    .select("*")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ analysis: analysisRowToAnalysis(inserted as AnalysisRow), cached: false });
}
