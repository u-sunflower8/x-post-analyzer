import type { PostWithMetrics } from '@/shared/types/post';
import type { KeywordStat } from '@/shared/types/ai';

const STOPWORDS = new Set([
  'の', 'に', 'は', 'を', 'が', 'と', 'で', 'も', 'な', 'い', 'う', 'する', 'した', 'ます', 'です',
  'あり', 'なり', 'こと', 'これ', 'それ', 'この', 'その', 'ため', 'よう', 'から', 'まで', 'より',
  'the', 'a', 'an', 'is', 'are', 'to', 'of', 'and', 'in', 'for', 'on', 'with', 'at', 'by', 'this',
  'that', 'it', 'was', 'were', 'be', 'been',
]);

const MIN_KEYWORD_OCCURRENCES = 3;
const TOP_KEYWORD_COUNT = 15;

function tokenize(text: string): string[] {
  const withoutUrls = text.replace(/https?:\/\/\S+/g, '');
  const matches = withoutUrls.match(/[\p{L}\p{N}]+/gu) ?? [];
  return matches
    .map((token) => token.toLowerCase())
    .filter((token) => token.length >= 2 && !STOPWORDS.has(token) && !/^\d+$/.test(token));
}

export function computeTopKeywords(posts: PostWithMetrics[]): KeywordStat[] {
  const stats = new Map<string, { occurrences: number; totalEngagementRate: number }>();

  for (const post of posts) {
    const tokens = new Set([...tokenize(post.text), ...post.hashtags.map((h) => h.toLowerCase())]);
    for (const token of tokens) {
      const entry = stats.get(token) ?? { occurrences: 0, totalEngagementRate: 0 };
      entry.occurrences += 1;
      entry.totalEngagementRate += post.metrics.engagementRate ?? 0;
      stats.set(token, entry);
    }
  }

  return Array.from(stats.entries())
    .filter(([, stat]) => stat.occurrences >= MIN_KEYWORD_OCCURRENCES)
    .map(([keyword, stat]) => ({
      keyword,
      occurrences: stat.occurrences,
      avgEngagementRate: stat.totalEngagementRate / stat.occurrences,
    }))
    .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate)
    .slice(0, TOP_KEYWORD_COUNT);
}
