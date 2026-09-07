import type { CharCountBucket, OwnPost, OwnPostMetrics, OwnPostWithMetrics } from "@/types/own-post";

/**
 * own_posts has no single "engagements" column (unlike X's official Analytics
 * export) — it's derived from the counts we do store, matching how the
 * original app's CSV importer filled in missing "engagements" totals.
 */
export function totalEngagements(post: OwnPost): number {
  return post.likeCount + post.repostCount + post.replyCount + post.quoteCount;
}

function rate(numerator: number, impressions: number | null): number | null {
  if (!impressions || impressions <= 0) return null;
  return numerator / impressions;
}

function charCountBucket(charCount: number): CharCountBucket {
  if (charCount <= 50) return "0-50";
  if (charCount <= 100) return "51-100";
  if (charCount <= 150) return "101-150";
  if (charCount <= 200) return "151-200";
  if (charCount <= 280) return "201-280";
  return "281+";
}

export function computeEngagementMetrics(post: OwnPost): OwnPostMetrics {
  const impressions = post.impressionCount;
  const engagementRate = rate(totalEngagements(post), impressions);
  const createdAt = new Date(post.postedAt ?? post.createdAt);
  const clicks = (post.urlClickCount ?? 0) + (post.permalinkClickCount ?? 0);

  return {
    postId: post.id,
    engagementRate,
    likeRate: rate(post.likeCount, impressions),
    retweetRate: rate(post.repostCount, impressions),
    replyRate: rate(post.replyCount, impressions),
    clickThroughRate: rate(clicks, impressions),
    followRate: rate(post.followCount ?? 0, impressions),
    engagementScore: (engagementRate ?? 0) * Math.log10((impressions ?? 0) + 1),
    dayOfWeek: createdAt.getDay(),
    hourOfDay: createdAt.getHours(),
    charCountBucket: charCountBucket(Array.from(post.text).length),
  };
}

export function withMetrics(post: OwnPost): OwnPostWithMetrics {
  return { ...post, metrics: computeEngagementMetrics(post) };
}
