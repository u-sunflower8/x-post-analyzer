import type { BucketMetric, BucketStat, OwnPostWithMetrics } from "@/types/own-post";
import { MIN_BUCKET_SAMPLE_SIZE } from "./constants";

function bucketize(posts: OwnPostWithMetrics[], keyFn: (post: OwnPostWithMetrics) => string): BucketStat[] {
  const groups = new Map<string, OwnPostWithMetrics[]>();
  for (const post of posts) {
    const key = keyFn(post);
    const group = groups.get(key) ?? [];
    group.push(post);
    groups.set(key, group);
  }

  return Array.from(groups.entries()).map(([label, group]) => ({
    label,
    postCount: group.length,
    avgLikes: group.reduce((sum, p) => sum + p.likeCount, 0) / group.length,
    avgReposts: group.reduce((sum, p) => sum + p.repostCount, 0) / group.length,
  }));
}

function emptyBucket(label: string): BucketStat {
  return { label, postCount: 0, avgLikes: 0, avgReposts: 0 };
}

const HOUR_LABELS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0"));
const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
const CHAR_COUNT_BUCKET_ORDER = ["0-50", "51-100", "101-150", "151-200", "201-280", "281+"];

export function aggregateByHour(posts: OwnPostWithMetrics[]): BucketStat[] {
  const stats = bucketize(posts, (p) => String(p.metrics.hourOfDay));
  const byLabel = new Map(stats.map((s) => [s.label, s]));
  return HOUR_LABELS.map((h) => ({ ...(byLabel.get(String(Number(h))) ?? emptyBucket(h)), label: h }));
}

export function aggregateByDayOfWeek(posts: OwnPostWithMetrics[]): BucketStat[] {
  const stats = bucketize(posts, (p) => String(p.metrics.dayOfWeek));
  const byLabel = new Map(stats.map((s) => [s.label, s]));
  return DAY_LABELS.map((day, i) => ({ ...(byLabel.get(String(i)) ?? emptyBucket(day)), label: day }));
}

export function aggregateByCharCount(posts: OwnPostWithMetrics[]): BucketStat[] {
  const stats = bucketize(posts, (p) => p.metrics.charCountBucket);
  const byLabel = new Map(stats.map((s) => [s.label, s]));
  return CHAR_COUNT_BUCKET_ORDER.map((label) => byLabel.get(label) ?? emptyBucket(label));
}

// Likes and reposts are ranked separately: likes are ~25x more frequent, so a
// combined score would just be a likes ranking. Impressions are not used —
// archive-imported posts have none.
export function bestBucket(buckets: BucketStat[], metric: BucketMetric): BucketStat | null {
  const eligible = buckets.filter((b) => b.postCount >= MIN_BUCKET_SAMPLE_SIZE);
  if (eligible.length === 0) return null;
  return eligible.reduce((best, b) => (b[metric] > best[metric] ? b : best));
}
