import { postJson } from '@/shared/lib/apiClient';
import type { GenerateRequest, GenerateResponse } from '@/shared/types/ai';

export function generatePostDrafts(request: GenerateRequest): Promise<GenerateResponse> {
  return postJson<GenerateRequest, GenerateResponse>('/api/generate', request);
}
