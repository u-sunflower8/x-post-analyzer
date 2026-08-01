import type { PostWithMetrics } from '@/shared/types/post';
import type { DashboardKpis } from '@/shared/types/kpi';
import { aggregateByHour, aggregateByDayOfWeek, bestBucket } from '@/features/engagement/lib/aggregate';

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function computeDashboardKpis(posts: PostWithMetrics[]): DashboardKpis {
  if (posts.length === 0) {
    return {
      totalPosts: 0,
      totalImpressions: 0,
      totalEngagements: 0,
      avgEngagementRate: 0,
      medianEngagementRate: 0,
      avgImpressionsPerPost: 0,
      bestPostingHour: null,
      bestPostingDayOfWeek: null,
      totalFollowsGained: 0,
      periodStart: null,
      periodEnd: null,
    };
  }

  const totalImpressions = posts.reduce((sum, p) => sum + p.impressions, 0);
  const totalEngagements = posts.reduce((sum, p) => sum + p.engagements, 0);
  const totalFollowsGained = posts.reduce((sum, p) => sum + p.follows, 0);
  const rates = posts.map((p) => p.metrics.engagementRate).filter((r): r is number => r !== null);
  const createdAtTimes = posts.map((p) => new Date(p.createdAt).getTime()).filter((t) => !Number.isNaN(t));

  const hourBest = bestBucket(aggregateByHour(posts));
  const dayBest = bestBucket(aggregateByDayOfWeek(posts));

  return {
    totalPosts: posts.length,
    totalImpressions,
    totalEngagements,
    avgEngagementRate: totalImpressions > 0 ? totalEngagements / totalImpressions : 0,
    medianEngagementRate: median(rates),
    avgImpressionsPerPost: totalImpressions / posts.length,
    bestPostingHour: hourBest ? Number(hourBest.label) : null,
    bestPostingDayOfWeek: dayBest ? ['日', '月', '火', '水', '木', '金', '土'].indexOf(dayBest.label) : null,
    totalFollowsGained,
    periodStart: createdAtTimes.length > 0 ? new Date(Math.min(...createdAtTimes)).toISOString() : null,
    periodEnd: createdAtTimes.length > 0 ? new Date(Math.max(...createdAtTimes)).toISOString() : null,
  };
}
