import type { ApiErrorBody, ApiErrorCode } from '@/shared/types/ai';

export class ApiRequestError extends Error {
  code: ApiErrorCode;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.code = code;
  }
}

export async function postJson<TRequest, TResponse>(
  url: string,
  body: TRequest,
): Promise<TResponse> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = (await res.json().catch(() => null)) as ApiErrorBody | null;
    if (errorBody?.error) throw new ApiRequestError(errorBody.error.code, errorBody.error.message);
    throw new ApiRequestError('OPENAI_ERROR', 'リクエストに失敗しました。');
  }

  return res.json() as Promise<TResponse>;
}
