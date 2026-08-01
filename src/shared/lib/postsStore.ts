import type { Post, PostWithMetrics } from '@/shared/types/post';
import { postsRepository } from './postsRepository';
import { computeEngagementMetrics } from '@/features/engagement/lib/computeMetrics';

type Listener = () => void;

let posts: Post[] = postsRepository.loadPosts();
let postsWithMetricsCache: PostWithMetrics[] = posts.map((p) => ({
  ...p,
  metrics: computeEngagementMetrics(p),
}));

const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) listener();
}

export const postsStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot(): PostWithMetrics[] {
    return postsWithMetricsCache;
  },

  setPosts(next: Post[]): void {
    posts = next;
    postsWithMetricsCache = posts.map((p) => ({ ...p, metrics: computeEngagementMetrics(p) }));
    postsRepository.savePosts(posts);
    emit();
  },

  clear(): void {
    posts = [];
    postsWithMetricsCache = [];
    postsRepository.clearPosts();
    emit();
  },
};
