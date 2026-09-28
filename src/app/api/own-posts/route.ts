import { NextResponse } from "next/server";
import { listOwnPosts, upsertOwnPosts } from "@/lib/db/queries";
import { ownPostRowToOwnPost } from "@/lib/db/mappers";
import { withMetrics } from "@/lib/own-posts/metrics";
import type { OwnPostInsertRow } from "@/lib/db/types";
import type { OwnPost } from "@/types/own-post";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 50) || 50, 200);

  const rows = await listOwnPosts(limit);
  const posts = rows.map(ownPostRowToOwnPost).map(withMetrics);
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { posts?: OwnPost[] } | null;
  const posts = body?.posts;
  if (!posts || !Array.isArray(posts) || posts.length === 0) {
    return NextResponse.json({ error: "posts is required" }, { status: 400 });
  }

  const rows: OwnPostInsertRow[] = posts.map((p) => ({
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

  const inserted = await upsertOwnPosts(rows);
  return NextResponse.json({ posts: inserted.map(ownPostRowToOwnPost), count: inserted.length });
}
