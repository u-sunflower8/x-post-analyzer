import { useCallback, useState } from 'react';
import type { PostWithMetrics } from '@/shared/types/post';
import type { AnalyzeResponse } from '@/shared/types/ai';
import { postsRepository } from '@/shared/lib/postsRepository';
import { buildAnalysisPayload } from '../lib/buildAnalysisPayload';
import { analyzePosts } from '../api/client';
import { ApiRequestError } from '@/shared/lib/apiClient';

interface UseAiAnalysisResult {
  result: AnalyzeResponse | null;
  isLoading: boolean;
  errorCode: string | null;
  errorMessage: string | null;
  runAnalysis: () => Promise<void>;
}

export function useAiAnalysis(posts: PostWithMetrics[]): UseAiAnalysisResult {
  const [result, setResult] = useState<AnalyzeResponse | null>(() => postsRepository.loadAiAnalysis());
  const [isLoading, setIsLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runAnalysis = useCallback(async () => {
    setIsLoading(true);
    setErrorCode(null);
    setErrorMessage(null);
    try {
      const payload = buildAnalysisPayload(posts);
      const response = await analyzePosts(payload);
      setResult(response);
      postsRepository.saveAiAnalysis(response);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setErrorCode(error.code);
        setErrorMessage(error.message);
      } else {
        setErrorCode('OPENAI_ERROR');
        setErrorMessage('AI分析に失敗しました。');
      }
    } finally {
      setIsLoading(false);
    }
  }, [posts]);

  return { result, isLoading, errorCode, errorMessage, runAnalysis };
}
