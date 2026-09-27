import type { BucketStat, OwnPostWithMetrics } from "@/types/own-post";
import { MIN_BUCKET_SAMPLE_SIZE } from "./constants";
import { likesAndReposts } from "./metrics";

function bucketize(posts: OwnPostWithMetrics[], keyFn: (post: OwnPostWithMetrics) => string): BucketStat[] {
  const groups = new Map<string, OwnPostWithMetrics[]>();
  for (const post of posts) {
    const key = keyFn(post);
    const group = groups.get(key) ?? [];
    group.push(post);
    groups.set(key, group);
  }

  return Array.from(groups.entries()).map(([label, group]) => {
    const totalLikesAndReposts = group.reduce((sum, p) => sum + likesAndReposts(p), 0);
    return {
      label,
      postCount: group.length,
      avgLikesAndReposts: totalLikesAndReposts / group.length,
    };
  });
}

const HOUR_LABELS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0"));
const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
const CHAR_COUNT_BUCKET_ORDER = ["0-50", "51-100", "101-150", "151-200", "201-280", "281+"];

export function aggregateByHour(posts: OwnPostWithMetrics[]): BucketStat[] {
  const stats = bucketize(posts, (p) => String(p.metrics.hourOfDay));
  const byLabel = new Map(stats.map((s) => [s.label, s]));
  return HOUR_LABELS.map(
    (h) => byLabel.get(String(Number(h))) ?? { label: h, avgLikesAndReposts: 0, postCount: 0 },
  ).map((s, i) => ({ ...s, label: HOUR_LABELS[i] }));
}

export function aggregateByDayOfWeek(posts: OwnPostWithMetrics[]): BucketStat[] {
  const stats = bucketize(posts, (p) => String(p.metrics.dayOfWeek));
  const byLabel = new Map(stats.map((s) => [s.label, s]));
  return DAY_LABELS.map(
    (_, i) => byLabel.get(String(i)) ?? { label: "", avgLikesAndReposts: 0, postCount: 0 },
  ).map((s, i) => ({ ...s, label: DAY_LABELS[i] }));
}

export function aggregateByCharCount(posts: OwnPostWithMetrics[]): BucketStat[] {
  const stats = bucketize(posts, (p) => p.metrics.charCountBucket);
  const byLabel = new Map(stats.map((s) => [s.label, s]));
  return CHAR_COUNT_BUCKET_ORDER.map(
    (label) => byLabel.get(label) ?? { label, avgLikesAndReposts: 0, postCount: 0 },
  );
}

export function bestBucket(buckets: BucketStat[]): BucketStat | null {
  const eligible = buckets.filter((b) => b.postCount >= MIN_BUCKET_SAMPLE_SIZE);
  if (eligible.length === 0) return null;
  return eligible.reduce((best, b) => (b.avgLikesAndReposts > best.avgLikesAndReposts ? b : best));
}
