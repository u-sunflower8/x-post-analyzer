import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ownPostRowToOwnPost, ownPostSuggestionRowToSuggestion } from "@/lib/supabase/mappers";
import { withMetrics } from "@/lib/own-posts/metrics";
import { toPostBrief, buildAccountSummary } from "@/lib/own-posts/payload";
import { suggestImprovement } from "@/lib/openai/suggestImprovement";
import { MissingApiKeyError } from "@/lib/openai/client";
import type { OwnPostRow, OwnPostSuggestionRow } from "@/lib/supabase/types";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { force?: boolean };
  const supabase = getSupabaseServerClient();

  if (!body.force) {
    const { data: existing, error } = await supabase
      .from("own_post_suggestions")
      .select("*")
      .eq("own_post_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (existing) {
      return NextResponse.json({
        suggestion: ownPostSuggestionRowToSuggestion(existing as OwnPostSuggestionRow),
        cached: true,
      });
    }
  }

  const { data: postRow, error: postError } = await supabase
    .from("own_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (postError) {
    return NextResponse.json({ error: postError.message }, { status: 500 });
  }
  if (!postRow) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const { data: allRows, error: allError } = await supabase.from("own_posts").select("*");
  if (allError) {
    return NextResponse.json({ error: allError.message }, { status: 500 });
  }

  const allPosts = ((allRows ?? []) as OwnPostRow[]).map(ownPostRowToOwnPost).map(withMetrics);
  const post = withMetrics(ownPostRowToOwnPost(postRow as OwnPostRow));

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

  const { data: inserted, error: insertError } = await supabase
    .from("own_post_suggestions")
    .insert({ own_post_id: id, result })
    .select("*")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    suggestion: ownPostSuggestionRowToSuggestion(inserted as OwnPostSuggestionRow),
    cached: false,
  });
}
