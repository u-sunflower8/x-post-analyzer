import type { DashboardKpis, OwnPostWithMetrics } from "@/types/own-post";
import { aggregateByHour, aggregateByDayOfWeek, bestBucket } from "./aggregate";
import { likesAndReposts, totalEngagements } from "./metrics";

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function computeDashboardKpis(posts: OwnPostWithMetrics[]): DashboardKpis {
  if (posts.length === 0) {
    return {
      totalPosts: 0,
      totalImpressions: 0,
      totalEngagements: 0,
      avgLikesAndReposts: 0,
      medianLikesAndReposts: 0,
      avgImpressionsPerPost: 0,
      bestPostingHour: null,
      bestPostingDayOfWeek: null,
      totalFollowsGained: 0,
      periodStart: null,
      periodEnd: null,
    };
  }

  const totalImpressions = posts.reduce((sum, p) => sum + (p.impressionCount ?? 0), 0);
  const totalEng = posts.reduce((sum, p) => sum + totalEngagements(p), 0);
  const totalFollowsGained = posts.reduce((sum, p) => sum + (p.followCount ?? 0), 0);
  const scores = posts.map(likesAndReposts);
  const createdAtTimes = posts
    .map((p) => new Date(p.postedAt ?? p.createdAt).getTime())
    .filter((t) => !Number.isNaN(t));

  const hourBest = bestBucket(aggregateByHour(posts));
  const dayBest = bestBucket(aggregateByDayOfWeek(posts));

  return {
    totalPosts: posts.length,
    totalImpressions,
    totalEngagements: totalEng,
    avgLikesAndReposts: scores.reduce((sum, s) => sum + s, 0) / posts.length,
    medianLikesAndReposts: median(scores),
    avgImpressionsPerPost: totalImpressions / posts.length,
    bestPostingHour: hourBest ? Number(hourBest.label) : null,
    bestPostingDayOfWeek: dayBest ? ["日", "月", "火", "水", "木", "金", "土"].indexOf(dayBest.label) : null,
    totalFollowsGained,
    periodStart: createdAtTimes.length > 0 ? new Date(Math.min(...createdAtTimes)).toISOString() : null,
    periodEnd: createdAtTimes.length > 0 ? new Date(Math.max(...createdAtTimes)).toISOString() : null,
  };
}
