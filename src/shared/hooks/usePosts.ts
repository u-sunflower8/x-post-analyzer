import { useSyncExternalStore } from 'react';
import { postsStore } from '@/shared/lib/postsStore';
import type { PostWithMetrics } from '@/shared/types/post';

export function usePosts(): PostWithMetrics[] {
  return useSyncExternalStore(postsStore.subscribe, postsStore.getSnapshot);
}
