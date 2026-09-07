import { getBearerToken } from "./client";
import type { OwnPost } from "@/types/own-post";

const X_API_BASE = "https://api.x.com/2";
const MAX_PAGES = 10;

interface XUserLookupResponse {
  data?: { id: string; username: string };
  errors?: unknown[];
  title?: string;
  detail?: string;
}

interface XTimelineTweet {
  id: string;
  text: string;
  created_at?: string;
  public_metrics?: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
    quote_count: number;
  };
}

interface XTimelineResponse {
  data?: XTimelineTweet[];
  meta?: { next_token?: string; result_count: number };
  errors?: unknown[];
  title?: string;
  detail?: string;
}

async function xApiFetch<T>(path: string, searchParams: URLSearchParams): Promise<T> {
  const res = await fetch(`${X_API_BASE}${path}?${searchParams.toString()}`, {
    headers: { Authorization: `Bearer ${getBearerToken()}` },
    cache: "no-store",
  });
  const body = (await res.json()) as T & { detail?: string; title?: string };
  if (!res.ok) {
    throw new Error(body.detail ?? body.title ?? `X API request failed with status ${res.status}`);
  }
  return body;
}

/**
 * Fetches the authenticated-by-token-owner-visible timeline of a public X
 * account (text + public engagement counts only — impressions are a private
 * metric X never exposes via this endpoint, so impressionCount is always
 * null here and must be filled in separately, e.g. via CSV/screenshot).
 */
export async function fetchOwnTimeline(username: string): Promise<OwnPost[]> {
  const user = await xApiFetch<XUserLookupResponse>(
    `/users/by/username/${encodeURIComponent(username)}`,
    new URLSearchParams(),
  );
  if (!user.data) {
    throw new Error(`Xユーザー @${username} が見つかりませんでした`);
  }
  const userId = user.data.id;

  const posts: OwnPost[] = [];
  let paginationToken: string | undefined;
  let page = 0;

  do {
    const searchParams = new URLSearchParams({
      max_results: "100",
      exclude: "retweets,replies",
      "tweet.fields": "created_at,public_metrics",
    });
    if (paginationToken) searchParams.set("pagination_token", paginationToken);

    const timeline = await xApiFetch<XTimelineResponse>(`/users/${userId}/tweets`, searchParams);

    for (const tweet of timeline.data ?? []) {
      const metrics = tweet.public_metrics;
      posts.push({
        id: tweet.id,
        source: "x_api",
        text: tweet.text,
        postedAt: tweet.created_at ?? null,
        url: `https://x.com/${username}/status/${tweet.id}`,
        likeCount: metrics?.like_count ?? 0,
        repostCount: metrics?.retweet_count ?? 0,
        replyCount: metrics?.reply_count ?? 0,
        quoteCount: metrics?.quote_count ?? 0,
        impressionCount: null,
        urlClickCount: null,
        permalinkClickCount: null,
        detailExpandCount: null,
        appOpenCount: null,
        appInstallCount: null,
        followCount: null,
        mediaViewCount: null,
        mediaEngagementCount: null,
        isPromoted: false,
        createdAt: new Date().toISOString(),
      });
    }

    paginationToken = timeline.meta?.next_token;
    page += 1;
  } while (paginationToken && page < MAX_PAGES);

  return posts;
}
