import type { ContentStat, OwnPostWithMetrics } from "@/types/own-post";
import { median } from "./dashboard";
import { HOOK_LABELS, THEME_LABELS } from "./themes";

/** How many earlier posts form the "usual me" baseline for the relative score. */
const RELATIVE_WINDOW = 30;
/** Posts with fewer earlier posts than this get no relative score (baseline too noisy). */
const MIN_HISTORY = 10;
/** A post at or above this multiple of its baseline counts as a buzz. */
const BUZZ_MULTIPLE = 3;

/**
 * Likes divided by the median likes of the previous RELATIVE_WINDOW posts.
 * Comparing against the account's own recent baseline cancels out follower
 * growth, so early and recent posts can be compared fairly.
 */
export function relativeScores(posts: OwnPostWithMetrics[]): Map<string, number> {
  const sorted = [...posts]
    .filter((p) => p.postedAt)
    .sort((a, b) => new Date(a.postedAt!).getTime() - new Date(b.postedAt!).getTime());
  const scores = new Map<string, number>();
  sorted.forEach((post, i) => {
    const previous = sorted.slice(Math.max(0, i - RELATIVE_WINDOW), i).map((p) => p.likeCount);
    if (previous.length < MIN_HISTORY) return;
    scores.set(post.id, post.likeCount / Math.max(median(previous), 1));
  });
  return scores;
}

function aggregate(
  posts: OwnPostWithMetrics[],
  keyFn: (post: OwnPostWithMetrics) => string | null | undefined,
  labels: Record<string, string>,
): ContentStat[] {
  const relative = relativeScores(posts);
  const groups = new Map<string, OwnPostWithMetrics[]>();
  for (const post of posts) {
    const key = keyFn(post);
    if (!key) continue;
    groups.set(key, [...(groups.get(key) ?? []), post]);
  }

  return Array.from(groups.entries())
    .map(([key, group]) => {
      const rel = group.map((p) => relative.get(p.id)).filter((r): r is number => r !== undefined);
      return {
        key,
        label: labels[key] ?? key,
        postCount: group.length,
        avgLikes: group.reduce((sum, p) => sum + p.likeCount, 0) / group.length,
        medianLikes: median(group.map((p) => p.likeCount)),
        avgReposts: group.reduce((sum, p) => sum + p.repostCount, 0) / group.length,
        repostedShare: group.filter((p) => p.repostCount > 0).length / group.length,
        relativeMedian: rel.length > 0 ? median(rel) : null,
        buzzShare: rel.length > 0 ? rel.filter((r) => r >= BUZZ_MULTIPLE).length / rel.length : null,
      };
    })
    .sort((a, b) => (b.relativeMedian ?? 0) - (a.relativeMedian ?? 0));
}

export function aggregateByTheme(posts: OwnPostWithMetrics[]): ContentStat[] {
  return aggregate(posts, (p) => p.theme, THEME_LABELS);
}

export function aggregateByHook(posts: OwnPostWithMetrics[]): ContentStat[] {
  return aggregate(posts, (p) => p.hook, HOOK_LABELS);
}
