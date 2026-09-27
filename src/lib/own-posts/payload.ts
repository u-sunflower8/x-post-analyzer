import type { AccountSummary, AnalyzeRequest, OwnPostWithMetrics, PostBrief } from "@/types/own-post";
import { aggregateByHour, aggregateByDayOfWeek, aggregateByCharCount } from "./aggregate";
import { computeTopKeywords } from "./keywords";
import { median } from "./dashboard";

const TOP_POST_COUNT = 18;
const TOP_REPOSTED_POST_COUNT = 10;
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
  const times = posts
    .map((p) => new Date(p.postedAt ?? p.createdAt).getTime())
    .filter((t) => !Number.isNaN(t));

  return {
    postCount: posts.length,
    dateRangeStart: times.length > 0 ? new Date(Math.min(...times)).toISOString() : null,
    dateRangeEnd: times.length > 0 ? new Date(Math.max(...times)).toISOString() : null,
    avgLikes: posts.length > 0 ? posts.reduce((sum, p) => sum + p.likeCount, 0) / posts.length : 0,
    medianLikes: median(posts.map((p) => p.likeCount)),
    avgReposts: posts.length > 0 ? posts.reduce((sum, p) => sum + p.repostCount, 0) / posts.length : 0,
    repostedPostShare: posts.length > 0 ? posts.filter((p) => p.repostCount > 0).length / posts.length : 0,
  };
}

export function buildAnalysisPayload(posts: OwnPostWithMetrics[]): AnalyzeRequest {
  const byLikes = [...posts].sort((a, b) => b.likeCount - a.likeCount);
  const byReposts = posts.filter((p) => p.repostCount > 0).sort((a, b) => b.repostCount - a.repostCount);

  return {
    summary: buildAccountSummary(posts),
    topPosts: byLikes.slice(0, TOP_POST_COUNT).map(toPostBrief),
    topRepostedPosts: byReposts.slice(0, TOP_REPOSTED_POST_COUNT).map(toPostBrief),
    bottomPosts: byLikes.slice(-BOTTOM_POST_COUNT).reverse().map(toPostBrief),
    hourBuckets: aggregateByHour(posts),
    dayOfWeekBuckets: aggregateByDayOfWeek(posts),
    charCountBuckets: aggregateByCharCount(posts),
    topKeywords: computeTopKeywords(posts),
  };
}
