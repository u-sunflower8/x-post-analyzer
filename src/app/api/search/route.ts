import { NextResponse } from "next/server";
import { searchRecentTweets, XApiNotConfiguredError } from "@/lib/x-api/client";
import { computeEngagementScores } from "@/lib/scoring";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { PostRow } from "@/lib/supabase/types";
import type { Post, SearchParams } from "@/types/post";

export async function POST(request: Request) {
  let params: SearchParams;
  try {
    params = (await request.json()) as SearchParams;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!params.keyword || !params.keyword.trim()) {
    return NextResponse.json({ error: "keyword is required" }, { status: 400 });
  }

  let searchResult;
  try {
    searchResult = await searchRecentTweets(params);
  } catch (error) {
    if (error instanceof XApiNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "X API request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const usersById = new Map((searchResult.includes?.users ?? []).map((u) => [u.id, u]));
  const minFollowers = params.minFollowers ?? 0;

  const posts: Post[] = [];
  for (const tweet of searchResult.data ?? []) {
    const author = tweet.author_id ? usersById.get(tweet.author_id) : undefined;
    const followersCount = author?.public_metrics?.followers_count ?? null;

    if (followersCount !== null && followersCount < minFollowers) continue;

    const metrics = tweet.public_metrics;
    const scores = computeEngagementScores({
      likeCount: metrics?.like_count ?? 0,
      repostCount: metrics?.retweet_count ?? 0,
      replyCount: metrics?.reply_count ?? 0,
      quoteCount: metrics?.quote_count ?? 0,
      impressionCount: metrics?.impression_count ?? null,
      followersCount,
    });

    posts.push({
      id: tweet.id,
      authorId: tweet.author_id ?? null,
      authorUsername: author?.username ?? null,
      authorName: author?.name ?? null,
      authorFollowersCount: followersCount,
      text: tweet.text,
      postedAt: tweet.created_at ?? null,
      likeCount: metrics?.like_count ?? 0,
      repostCount: metrics?.retweet_count ?? 0,
      replyCount: metrics?.reply_count ?? 0,
      quoteCount: metrics?.quote_count ?? 0,
      impressionCount: metrics?.impression_count ?? null,
      ...scores,
      url: author?.username
        ? `https://x.com/${author.username}/status/${tweet.id}`
        : `https://x.com/i/status/${tweet.id}`,
      fetchedAt: new Date().toISOString(),
    });
  }

  posts.sort((a, b) => b.engagementScore - a.engagementScore);

  if (posts.length > 0) {
    const rows: PostRow[] = posts.map((p) => ({
      id: p.id,
      author_id: p.authorId,
      author_username: p.authorUsername,
      author_name: p.authorName,
      author_followers_count: p.authorFollowersCount,
      text: p.text,
      posted_at: p.postedAt,
      like_count: p.likeCount,
      repost_count: p.repostCount,
      reply_count: p.replyCount,
      quote_count: p.quoteCount,
      impression_count: p.impressionCount,
      engagement_score: p.engagementScore,
      like_rate: p.likeRate,
      repost_rate: p.repostRate,
      reply_rate: p.replyRate,
      url: p.url,
      fetched_at: p.fetchedAt,
    }));

    const { error } = await getSupabaseServerClient().from("posts").upsert(rows, { onConflict: "id" });
    if (error) {
      // Cache write failures shouldn't block returning fresh results to the user.
      console.error("Failed to cache posts in Supabase:", error.message);
    }
  }

  return NextResponse.json({ posts });
}
