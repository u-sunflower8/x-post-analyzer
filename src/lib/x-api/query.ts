import type { SearchParams } from "@/types/post";

/**
 * X API v2 search operators only support min_likes / min_replies / min_reposts.
 * There is no follower-count operator, so that filter is applied client-side
 * after the author's public_metrics are fetched via expansions.
 */
export function buildSearchQuery(params: SearchParams): string {
  const parts = [params.keyword.trim()];

  if (params.minLikes) parts.push(`min_likes:${params.minLikes}`);
  if (params.minReposts) parts.push(`min_reposts:${params.minReposts}`);
  if (params.minReplies) parts.push(`min_replies:${params.minReplies}`);

  // Exclude retweets by default so ranking reflects original authorship.
  parts.push("-is:retweet");

  return parts.join(" ");
}
