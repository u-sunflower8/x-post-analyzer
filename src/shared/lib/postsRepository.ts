import type { Post } from '@/shared/types/post';
import type { UploadMeta } from '@/shared/types/csv';
import type {
  AnalyzeResponse,
  SuggestResponse,
  PostDraft,
} from '@/shared/types/ai';
import { STORAGE_KEYS } from '@/shared/constants/storageKeys';
import { readJson, writeJson, removeKey } from './storage';

/**
 * The only module allowed to touch localStorage directly. Swapping to a
 * remote store (e.g. Supabase) later means rewriting this file only.
 */
export const postsRepository = {
  loadPosts(): Post[] {
    return readJson<Post[]>(STORAGE_KEYS.posts) ?? [];
  },
  savePosts(posts: Post[]): void {
    writeJson(STORAGE_KEYS.posts, posts);
  },
  clearPosts(): void {
    removeKey(STORAGE_KEYS.posts);
    removeKey(STORAGE_KEYS.uploadMeta);
    removeKey(STORAGE_KEYS.aiAnalysis);
    removeKey(STORAGE_KEYS.postSuggestions);
    removeKey(STORAGE_KEYS.postDrafts);
  },

  loadUploadMeta(): UploadMeta | null {
    return readJson<UploadMeta>(STORAGE_KEYS.uploadMeta);
  },
  saveUploadMeta(meta: UploadMeta): void {
    writeJson(STORAGE_KEYS.uploadMeta, meta);
  },

  loadAiAnalysis(): AnalyzeResponse | null {
    return readJson<AnalyzeResponse>(STORAGE_KEYS.aiAnalysis);
  },
  saveAiAnalysis(result: AnalyzeResponse): void {
    writeJson(STORAGE_KEYS.aiAnalysis, result);
  },

  loadPostSuggestions(): Record<string, SuggestResponse> {
    return readJson<Record<string, SuggestResponse>>(STORAGE_KEYS.postSuggestions) ?? {};
  },
  savePostSuggestion(postId: string, suggestion: SuggestResponse): void {
    const all = this.loadPostSuggestions();
    all[postId] = suggestion;
    writeJson(STORAGE_KEYS.postSuggestions, all);
  },

  loadPostDrafts(): PostDraft[] | null {
    return readJson<PostDraft[]>(STORAGE_KEYS.postDrafts);
  },
  savePostDrafts(drafts: PostDraft[]): void {
    writeJson(STORAGE_KEYS.postDrafts, drafts);
  },
};
