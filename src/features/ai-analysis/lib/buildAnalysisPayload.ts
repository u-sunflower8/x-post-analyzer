import type { PostWithMetrics } from '@/shared/types/post';
import type { AccountSummary, AnalyzeRequest, PostBrief } from '@/shared/types/ai';
import {
  aggregateByHour,
  aggregateByDayOfWeek,
  aggregateByCharCount,
} from '@/features/engagement/lib/aggregate';
import { computeTopKeywords } from './keywords';
import { MIN_IMPRESSIONS_FOR_AI_RANKING } from '@/shared/constants/engagementWeights';

const TOP_POST_COUNT = 18;
const BOTTOM_POST_COUNT = 10;
const TEXT_TRUNCATE_LENGTH = 200;

export function toPostBrief(post: PostWithMetrics): PostBrief {
  const text = Array.from(post.text).slice(0, TEXT_TRUNCATE_LENGTH).join('');
  return {
    id: post.id,
    text,
    createdAt: post.createdAt,
    engagementRate: post.metrics.engagementRate,
    likes: post.likes,
    retweets: post.retweets,
    impressions: post.impressions,
    charCount: post.charCount,
  };
}

export function buildAccountSummary(posts: PostWithMetrics[]): AccountSummary {
  const totalImpressions = posts.reduce((sum, p) => sum + p.impressions, 0);
  const totalEngagements = posts.reduce((sum, p) => sum + p.engagements, 0);
  const rates = posts.map((p) => p.metrics.engagementRate).filter((r): r is number => r !== null);
  const sortedRates = [...rates].sort((a, b) => a - b);
  const median =
    sortedRates.length === 0
      ? 0
      : sortedRates.length % 2 === 0
        ? (sortedRates[sortedRates.length / 2 - 1] + sortedRates[sortedRates.length / 2]) / 2
        : sortedRates[Math.floor(sortedRates.length / 2)];
  const times = posts.map((p) => new Date(p.createdAt).getTime()).filter((t) => !Number.isNaN(t));

  return {
    postCount: posts.length,
    dateRangeStart: times.length > 0 ? new Date(Math.min(...times)).toISOString() : '',
    dateRangeEnd: times.length > 0 ? new Date(Math.max(...times)).toISOString() : '',
    avgEngagementRate: totalImpressions > 0 ? totalEngagements / totalImpressions : 0,
    medianEngagementRate: median,
    avgImpressions: posts.length > 0 ? totalImpressions / posts.length : 0,
  };
}

export function buildAnalysisPayload(posts: PostWithMetrics[]): AnalyzeRequest {
  const eligiblePosts = posts.filter((p) => p.impressions >= MIN_IMPRESSIONS_FOR_AI_RANKING);
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
