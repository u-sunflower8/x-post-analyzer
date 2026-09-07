import type { AccountSummary, AnalyzeRequest, OwnPostWithMetrics, PostBrief } from "@/types/own-post";
import { aggregateByHour, aggregateByDayOfWeek, aggregateByCharCount } from "./aggregate";
import { computeTopKeywords } from "./keywords";
import { MIN_IMPRESSIONS_FOR_AI_RANKING } from "./constants";
import { totalEngagements } from "./metrics";

const TOP_POST_COUNT = 18;
const BOTTOM_POST_COUNT = 10;
const TEXT_TRUNCATE_LENGTH = 200;

export function toPostBrief(post: OwnPostWithMetrics): PostBrief {
  const text = Array.from(post.text).slice(0, TEXT_TRUNCATE_LENGTH).join("");
  return {
    id: post.id,
    text,
    createdAt: post.postedAt,
    engagementRate: post.metrics.engagementRate,
    likes: post.likeCount,
    retweets: post.repostCount,
    impressions: post.impressionCount ?? 0,
    charCount: Array.from(post.text).length,
  };
}

export function buildAccountSummary(posts: OwnPostWithMetrics[]): AccountSummary {
  const totalImpressions = posts.reduce((sum, p) => sum + (p.impressionCount ?? 0), 0);
  const totalEng = posts.reduce((sum, p) => sum + totalEngagements(p), 0);
  const rates = posts.map((p) => p.metrics.engagementRate).filter((r): r is number => r !== null);
  const sortedRates = [...rates].sort((a, b) => a - b);
  const median =
    sortedRates.length === 0
      ? 0
      : sortedRates.length % 2 === 0
        ? (sortedRates[sortedRates.length / 2 - 1] + sortedRates[sortedRates.length / 2]) / 2
        : sortedRates[Math.floor(sortedRates.length / 2)];
  const times = posts
    .map((p) => new Date(p.postedAt ?? p.createdAt).getTime())
    .filter((t) => !Number.isNaN(t));

  return {
    postCount: posts.length,
    dateRangeStart: times.length > 0 ? new Date(Math.min(...times)).toISOString() : null,
    dateRangeEnd: times.length > 0 ? new Date(Math.max(...times)).toISOString() : null,
    avgEngagementRate: totalImpressions > 0 ? totalEng / totalImpressions : 0,
    medianEngagementRate: median,
    avgImpressions: posts.length > 0 ? totalImpressions / posts.length : 0,
  };
}

export function buildAnalysisPayload(posts: OwnPostWithMetrics[]): AnalyzeRequest {
  const eligiblePosts = posts.filter((p) => (p.impressionCount ?? 0) >= MIN_IMPRESSIONS_FOR_AI_RANKING);
  const byEngagementRate = [...eligiblePosts].sort(
    (a, b) => (b.metrics.engagementRate ?? 0) - (a.metrics.engagementRate ?? 0),
  );

  return {
    summary: buildAccountSummary(posts),
    topPosts: byEngagementRate.slice(0, TOP_POST_COUNT).map(toPostBrief),
    bottomPosts: byEngagementRate.slice(-BOTTOM_POST_COUNT).reverse().map(toPostBrief),
    hourBuckets: aggregateByHour(posts),
    dayOfWeekBuckets: aggregateByDayOfWeek(posts),
    charCountBuckets: aggregateByCharCount(posts),
    topKeywords: computeTopKeywords(posts),
  };
}
