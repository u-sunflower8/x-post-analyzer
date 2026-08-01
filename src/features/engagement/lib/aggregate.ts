import type { PostWithMetrics } from '@/shared/types/post';
import type { BucketStat } from '@/shared/types/kpi';
import { MIN_BUCKET_SAMPLE_SIZE } from '@/shared/constants/engagementWeights';

function bucketize(
  posts: PostWithMetrics[],
  keyFn: (post: PostWithMetrics) => string,
): BucketStat[] {
  const groups = new Map<string, PostWithMetrics[]>();
  for (const post of posts) {
    const key = keyFn(post);
    const group = groups.get(key) ?? [];
    group.push(post);
    groups.set(key, group);
  }

  return Array.from(groups.entries()).map(([label, group]) => {
    const totalImpressions = group.reduce((sum, p) => sum + p.impressions, 0);
    const totalEngagements = group.reduce((sum, p) => sum + p.engagements, 0);
    return {
      label,
      postCount: group.length,
      avgEngagementRate: totalImpressions > 0 ? totalEngagements / totalImpressions : 0,
    };
  });
}

const HOUR_LABELS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0'));
const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

export function aggregateByHour(posts: PostWithMetrics[]): BucketStat[] {
  const stats = bucketize(posts, (p) => String(p.metrics.hourOfDay));
  const byLabel = new Map(stats.map((s) => [s.label, s]));
  return HOUR_LABELS.map(
    (h) => byLabel.get(String(Number(h))) ?? { label: h, avgEngagementRate: 0, postCount: 0 },
  ).map((s, i) => ({ ...s, label: HOUR_LABELS[i] }));
}

export function aggregateByDayOfWeek(posts: PostWithMetrics[]): BucketStat[] {
  const stats = bucketize(posts, (p) => String(p.metrics.dayOfWeek));
  const byLabel = new Map(stats.map((s) => [s.label, s]));
  return DAY_LABELS.map(
    (_, i) => byLabel.get(String(i)) ?? { label: '', avgEngagementRate: 0, postCount: 0 },
  ).map((s, i) => ({ ...s, label: DAY_LABELS[i] }));
}

export function aggregateByCharCount(posts: PostWithMetrics[]): BucketStat[] {
  const order = ['0-50', '51-100', '101-150', '151-200', '201-280', '281+'];
  const stats = bucketize(posts, (p) => p.metrics.charCountBucket);
  const byLabel = new Map(stats.map((s) => [s.label, s]));
  return order.map((label) => byLabel.get(label) ?? { label, avgEngagementRate: 0, postCount: 0 });
}

export function bestBucket(buckets: BucketStat[]): BucketStat | null {
  const eligible = buckets.filter((b) => b.postCount >= MIN_BUCKET_SAMPLE_SIZE);
  if (eligible.length === 0) return null;
  return eligible.reduce((best, b) => (b.avgEngagementRate > best.avgEngagementRate ? b : best));
}
