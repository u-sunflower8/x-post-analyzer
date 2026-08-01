import { postJson } from '@/shared/lib/apiClient';
import type { ExtractPostRequest, ExtractPostResponse } from '@/shared/types/ai';

export function extractPostFromImage(
  imageBase64: string,
  mimeType: ExtractPostRequest['mimeType'],
): Promise<ExtractPostResponse> {
  return postJson<ExtractPostRequest, ExtractPostResponse>('/api/extract-post', {
    imageBase64,
    mimeType,
  });
}
