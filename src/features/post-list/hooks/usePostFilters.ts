import { useMemo, useState } from 'react';
import type { PostWithMetrics } from '@/shared/types/post';

export type SortField =
  | 'createdAt'
  | 'impressions'
  | 'engagements'
  | 'engagementRate'
  | 'likes'
  | 'retweets';

export const SORT_FIELD_LABELS: Record<SortField, string> = {
  createdAt: '投稿日時',
  impressions: 'インプレッション',
  engagements: 'エンゲージメント',
  engagementRate: 'エンゲージメント率',
  likes: 'いいね数',
  retweets: 'リツイート数',
};

function sortValue(post: PostWithMetrics, field: SortField): number {
  if (field === 'createdAt') return new Date(post.createdAt).getTime();
  if (field === 'engagementRate') return post.metrics.engagementRate ?? -1;
  return post[field];
}

interface UsePostFiltersResult {
  query: string;
  setQuery: (query: string) => void;
  sortField: SortField;
  setSortField: (field: SortField) => void;
  sortDirection: 'asc' | 'desc';
  toggleSortDirection: () => void;
  filteredPosts: PostWithMetrics[];
}

export function usePostFilters(posts: PostWithMetrics[]): UsePostFiltersResult {
  const [query, setQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('engagementRate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? posts.filter((p) => p.text.toLowerCase().includes(normalizedQuery))
      : posts;

    const sorted = [...filtered].sort((a, b) => {
      const diff = sortValue(a, sortField) - sortValue(b, sortField);
      return sortDirection === 'asc' ? diff : -diff;
    });
    return sorted;
  }, [posts, query, sortField, sortDirection]);

  return {
    query,
    setQuery,
    sortField,
    setSortField,
    sortDirection,
    toggleSortDirection: () => setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc')),
    filteredPosts,
  };
}
