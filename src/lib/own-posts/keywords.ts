import type { KeywordStat, OwnPostWithMetrics } from "@/types/own-post";

const STOPWORDS = new Set([
  "の", "に", "は", "を", "が", "と", "で", "も", "な", "い", "う", "する", "した", "ます", "です",
  "あり", "なり", "こと", "これ", "それ", "この", "その", "ため", "よう", "から", "まで", "より",
  "the", "a", "an", "is", "are", "to", "of", "and", "in", "for", "on", "with", "at", "by", "this",
  "that", "it", "was", "were", "be", "been",
]);

const MIN_KEYWORD_OCCURRENCES = 3;
const TOP_KEYWORD_COUNT = 15;

function extractHashtags(text: string): string[] {
  return (text.match(/[#＃][\p{L}\p{N}_]+/gu) ?? []).map((h) => h.slice(1));
}

function tokenize(text: string): string[] {
  const withoutUrls = text.replace(/https?:\/\/\S+/g, "");
  const matches = withoutUrls.match(/[\p{L}\p{N}]+/gu) ?? [];
  return matches
    .map((token) => token.toLowerCase())
    .filter((token) => token.length >= 2 && !STOPWORDS.has(token) && !/^\d+$/.test(token));
}

export function computeTopKeywords(posts: OwnPostWithMetrics[]): KeywordStat[] {
  const stats = new Map<string, { occurrences: number; totalLikes: number; totalReposts: number }>();

  for (const post of posts) {
    const tokens = new Set([...tokenize(post.text), ...extractHashtags(post.text).map((h) => h.toLowerCase())]);
    for (const token of tokens) {
      const entry = stats.get(token) ?? { occurrences: 0, totalLikes: 0, totalReposts: 0 };
      entry.occurrences += 1;
      entry.totalLikes += post.likeCount;
      entry.totalReposts += post.repostCount;
      stats.set(token, entry);
    }
  }

  return Array.from(stats.entries())
    .filter(([, stat]) => stat.occurrences >= MIN_KEYWORD_OCCURRENCES)
    .map(([keyword, stat]) => ({
      keyword,
      occurrences: stat.occurrences,
      avgLikes: stat.totalLikes / stat.occurrences,
      avgReposts: stat.totalReposts / stat.occurrences,
    }))
    .sort((a, b) => b.avgLikes - a.avgLikes)
    .slice(0, TOP_KEYWORD_COUNT);
}
