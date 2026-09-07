import { NextResponse } from "next/server";
import { fetchOwnTimeline } from "@/lib/x-api/own-timeline";
import { XApiNotConfiguredError } from "@/lib/x-api/client";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ownPostRowToOwnPost } from "@/lib/supabase/mappers";
import type { OwnPostRow } from "@/lib/supabase/types";
import type { OwnPost } from "@/types/own-post";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { username?: string } | null;
  const username = body?.username?.trim().replace(/^@/, "");
  if (!username) {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }

  let posts: OwnPost[];
  try {
    posts = await fetchOwnTimeline(username);
  } catch (error) {
    if (error instanceof XApiNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "X API request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (posts.length === 0) {
    return NextResponse.json({ posts: [], count: 0 });
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
