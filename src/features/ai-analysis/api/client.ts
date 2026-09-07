import { postJson } from '@/shared/lib/apiClient';
import type { AnalyzeRequest, AnalyzeResponse } from '@/shared/types/ai';

export function analyzePosts(request: AnalyzeRequest): Promise<AnalyzeResponse> {
  return postJson<AnalyzeRequest, AnalyzeResponse>('/api/analyze', request);
}
