import { useCallback, useState } from 'react';
import type { PostWithMetrics } from '@/shared/types/post';
import type { SuggestResponse } from '@/shared/types/ai';
import { postsRepository } from '@/shared/lib/postsRepository';
import { toPostBrief, buildAccountSummary } from '@/features/ai-analysis/lib/buildAnalysisPayload';
import { suggestImprovements } from '../api/client';
import { ApiRequestError } from '@/shared/lib/apiClient';

interface UsePostSuggestionResult {
  suggestion: SuggestResponse | null;
  isLoading: boolean;
  errorCode: string | null;
  errorMessage: string | null;
  requestSuggestion: () => Promise<void>;
}

export function usePostSuggestion(
  post: PostWithMetrics | undefined,
  allPosts: PostWithMetrics[],
): UsePostSuggestionResult {
  const [suggestion, setSuggestion] = useState<SuggestResponse | null>(
    () => (post ? postsRepository.loadPostSuggestions()[post.id] : undefined) ?? null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestSuggestion = useCallback(async () => {
    if (!post) return;
    setIsLoading(true);
    setErrorCode(null);
    setErrorMessage(null);
    try {
      const response = await suggestImprovements({
        post: toPostBrief(post),
        accountSummary: buildAccountSummary(allPosts),
      });
      setSuggestion(response);
      postsRepository.savePostSuggestion(post.id, response);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setErrorCode(error.code);
        setErrorMessage(error.message);
      } else {
        setErrorCode('OPENAI_ERROR');
        setErrorMessage('改善提案の取得に失敗しました。');
      }
    } finally {
      setIsLoading(false);
    }
  }, [post, allPosts]);

  return { suggestion, isLoading, errorCode, errorMessage, requestSuggestion };
}
