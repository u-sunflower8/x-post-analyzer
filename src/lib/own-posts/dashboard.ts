import type { BucketStat, DashboardKpis, OwnPostWithMetrics } from "@/types/own-post";
import { aggregateByHour, aggregateByDayOfWeek, bestBucket } from "./aggregate";
import { totalEngagements } from "./metrics";

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function hourOf(bucket: BucketStat | null): number | null {
  return bucket ? Number(bucket.label) : null;
}

function dayOf(bucket: BucketStat | null): number | null {
  return bucket ? DAY_LABELS.indexOf(bucket.label) : null;
}

export function computeDashboardKpis(posts: OwnPostWithMetrics[]): DashboardKpis {
  if (posts.length === 0) {
    return {
      totalPosts: 0,
      totalImpressions: 0,
      totalEngagements: 0,
      avgLikes: 0,
      medianLikes: 0,
      avgReposts: 0,
      repostedPostShare: 0,
      avgImpressionsPerPost: 0,
      bestHourByLikes: null,
      bestHourByReposts: null,
      bestDayByLikes: null,
      bestDayByReposts: null,
      totalFollowsGained: 0,
      periodStart: null,
      periodEnd: null,
    };
  }

  const totalImpressions = posts.reduce((sum, p) => sum + (p.impressionCount ?? 0), 0);
  const totalEng = posts.reduce((sum, p) => sum + totalEngagements(p), 0);
  const totalFollowsGained = posts.reduce((sum, p) => sum + (p.followCount ?? 0), 0);
  const createdAtTimes = posts
    .map((p) => new Date(p.postedAt ?? p.createdAt).getTime())
    .filter((t) => !Number.isNaN(t));

  const hourBuckets = aggregateByHour(posts);
  const dayBuckets = aggregateByDayOfWeek(posts);

  return {
    totalPosts: posts.length,
    totalImpressions,
    totalEngagements: totalEng,
    avgLikes: posts.reduce((sum, p) => sum + p.likeCount, 0) / posts.length,
    medianLikes: median(posts.map((p) => p.likeCount)),
    avgReposts: posts.reduce((sum, p) => sum + p.repostCount, 0) / posts.length,
    repostedPostShare: posts.filter((p) => p.repostCount > 0).length / posts.length,
    avgImpressionsPerPost: totalImpressions / posts.length,
    bestHourByLikes: hourOf(bestBucket(hourBuckets, "avgLikes")),
    bestHourByReposts: hourOf(bestBucket(hourBuckets, "avgReposts")),
    bestDayByLikes: dayOf(bestBucket(dayBuckets, "avgLikes")),
    bestDayByReposts: dayOf(bestBucket(dayBuckets, "avgReposts")),
    totalFollowsGained,
    periodStart: createdAtTimes.length > 0 ? new Date(Math.min(...createdAtTimes)).toISOString() : null,
    periodEnd: createdAtTimes.length > 0 ? new Date(Math.max(...createdAtTimes)).toISOString() : null,
  };
}
