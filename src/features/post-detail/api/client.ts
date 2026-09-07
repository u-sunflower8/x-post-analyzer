import { postJson } from '@/shared/lib/apiClient';
import type { SuggestRequest, SuggestResponse } from '@/shared/types/ai';

export function suggestImprovements(request: SuggestRequest): Promise<SuggestResponse> {
  return postJson<SuggestRequest, SuggestResponse>('/api/suggest', request);
}
