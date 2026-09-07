import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ownPostRowToOwnPost, ownPostSuggestionRowToSuggestion } from "@/lib/supabase/mappers";
import { withMetrics } from "@/lib/own-posts/metrics";
import type { OwnPostRow, OwnPostSuggestionRow } from "@/lib/supabase/types";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();

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

  const { data: suggestionRow, error: suggestionError } = await supabase
    .from("own_post_suggestions")
    .select("*")
    .eq("own_post_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (suggestionError) {
    return NextResponse.json({ error: suggestionError.message }, { status: 500 });
  }

  return NextResponse.json({
    post: withMetrics(ownPostRowToOwnPost(postRow as OwnPostRow)),
    suggestion: suggestionRow ? ownPostSuggestionRowToSuggestion(suggestionRow as OwnPostSuggestionRow) : null,
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { impressionCount?: number } | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (body.impressionCount !== undefined) patch.impression_count = body.impressionCount;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
  }

  const { data, error } = await getSupabaseServerClient()
    .from("own_posts")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ post: withMetrics(ownPostRowToOwnPost(data as OwnPostRow)) });
}
