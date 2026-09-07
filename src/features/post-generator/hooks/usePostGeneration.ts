import { useCallback, useState } from 'react';
import type { PostWithMetrics } from '@/shared/types/post';
import type { AnalyzeResponse, PostDraft } from '@/shared/types/ai';
import { postsRepository } from '@/shared/lib/postsRepository';
import { buildAnalysisPayload } from '@/features/ai-analysis/lib/buildAnalysisPayload';
import { generatePostDrafts } from '../api/client';
import { ApiRequestError } from '@/shared/lib/apiClient';

interface UsePostGenerationResult {
  drafts: PostDraft[] | null;
  isLoading: boolean;
  errorCode: string | null;
  errorMessage: string | null;
  runGeneration: () => Promise<void>;
}

export function usePostGeneration(
  posts: PostWithMetrics[],
  analysis: AnalyzeResponse,
): UsePostGenerationResult {
  const [drafts, setDrafts] = useState<PostDraft[] | null>(() => postsRepository.loadPostDrafts());
  const [isLoading, setIsLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runGeneration = useCallback(async () => {
    setIsLoading(true);
    setErrorCode(null);
    setErrorMessage(null);
    try {
      const payload = buildAnalysisPayload(posts);
      const response = await generatePostDrafts({
        insights: analysis.insights,
        topPosts: payload.topPosts,
        accountSummary: payload.summary,
      });
      setDrafts(response.drafts);
      postsRepository.savePostDrafts(response.drafts);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setErrorCode(error.code);
        setErrorMessage(error.message);
      } else {
        setErrorCode('OPENAI_ERROR');
        setErrorMessage('投稿生成に失敗しました。');
      }
    } finally {
      setIsLoading(false);
    }
  }, [posts, analysis]);

  return { drafts, isLoading, errorCode, errorMessage, runGeneration };
}
