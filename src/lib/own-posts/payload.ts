import type { AccountSummary, AnalyzeRequest, OwnPostWithMetrics, PostBrief } from "@/types/own-post";
import { aggregateByHour, aggregateByDayOfWeek, aggregateByCharCount } from "./aggregate";
import { computeTopKeywords } from "./keywords";
import { likesAndReposts } from "./metrics";

const TOP_POST_COUNT = 18;
const BOTTOM_POST_COUNT = 10;
const TEXT_TRUNCATE_LENGTH = 200;

export function toPostBrief(post: OwnPostWithMetrics): PostBrief {
  const text = Array.from(post.text).slice(0, TEXT_TRUNCATE_LENGTH).join("");
  return {
    id: post.id,
    text,
    createdAt: post.postedAt,
    likes: post.likeCount,
    retweets: post.repostCount,
    charCount: Array.from(post.text).length,
  };
}

export function buildAccountSummary(posts: OwnPostWithMetrics[]): AccountSummary {
  const scores = posts.map(likesAndReposts).sort((a, b) => a - b);
  const median =
    scores.length === 0
      ? 0
      : scores.length % 2 === 0
        ? (scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2
        : scores[Math.floor(scores.length / 2)];
  const times = posts
    .map((p) => new Date(p.postedAt ?? p.createdAt).getTime())
    .filter((t) => !Number.isNaN(t));

  return {
    postCount: posts.length,
    dateRangeStart: times.length > 0 ? new Date(Math.min(...times)).toISOString() : null,
    dateRangeEnd: times.length > 0 ? new Date(Math.max(...times)).toISOString() : null,
    avgLikesAndReposts: posts.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / posts.length : 0,
    medianLikesAndReposts: median,
  };
}

export function buildAnalysisPayload(posts: OwnPostWithMetrics[]): AnalyzeRequest {
  const byLikesAndReposts = [...posts].sort((a, b) => likesAndReposts(b) - likesAndReposts(a));

  return {
    summary: buildAccountSummary(posts),
    topPosts: byLikesAndReposts.slice(0, TOP_POST_COUNT).map(toPostBrief),
    bottomPosts: byLikesAndReposts.slice(-BOTTOM_POST_COUNT).reverse().map(toPostBrief),
    hourBuckets: aggregateByHour(posts),
    dayOfWeekBuckets: aggregateByDayOfWeek(posts),
    charCountBuckets: aggregateByCharCount(posts),
    topKeywords: computeTopKeywords(posts),
  };
}
