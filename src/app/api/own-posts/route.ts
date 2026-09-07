import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ownPostRowToOwnPost } from "@/lib/supabase/mappers";
import { withMetrics } from "@/lib/own-posts/metrics";
import type { OwnPostRow } from "@/lib/supabase/types";
import type { OwnPost } from "@/types/own-post";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 50) || 50, 200);

  const { data, error } = await getSupabaseServerClient()
    .from("own_posts")
    .select("*")
    .order("posted_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const posts = ((data ?? []) as OwnPostRow[]).map(ownPostRowToOwnPost).map(withMetrics);
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { posts?: OwnPost[] } | null;
  const posts = body?.posts;
  if (!posts || !Array.isArray(posts) || posts.length === 0) {
    return NextResponse.json({ error: "posts is required" }, { status: 400 });
  }

  // created_at はDB側の「取り込み時刻」を表すため、クライアント側の値では上書きしない
  // （挿入時はDEFAULT now()、既存行の更新時は元の値を保持する）。
  const rows: Omit<OwnPostRow, "created_at">[] = posts.map((p) => ({
    id: p.id,
    source: p.source,
    text: p.text,
    posted_at: p.postedAt,
    url: p.url,
    like_count: p.likeCount,
    repost_count: p.repostCount,
    reply_count: p.replyCount,
    quote_count: p.quoteCount,
    impression_count: p.impressionCount,
    url_click_count: p.urlClickCount,
    permalink_click_count: p.permalinkClickCount,
    detail_expand_count: p.detailExpandCount,
    app_open_count: p.appOpenCount,
    app_install_count: p.appInstallCount,
    follow_count: p.followCount,
    media_view_count: p.mediaViewCount,
    media_engagement_count: p.mediaEngagementCount,
    is_promoted: p.isPromoted,
  }));

  const { data, error } = await getSupabaseServerClient()
    .from("own_posts")
    .upsert(rows, { onConflict: "id" })
    .select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const inserted = ((data ?? []) as OwnPostRow[]).map(ownPostRowToOwnPost);
  return NextResponse.json({ posts: inserted, count: inserted.length });
}
