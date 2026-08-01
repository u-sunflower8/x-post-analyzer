import type { VercelResponse } from '@vercel/node';
import { APIConnectionTimeoutError } from 'openai';
import type { ApiErrorCode } from '../../src/shared/types/ai.js';
import { MissingApiKeyError } from './openaiClient.js';
import { OpenAiResponseValidationError } from './callOpenAiJson.js';

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  MISSING_API_KEY: 503,
  INVALID_REQUEST: 400,
  OPENAI_ERROR: 502,
  TIMEOUT: 504,
};

export function sendApiError(res: VercelResponse, code: ApiErrorCode, message: string): void {
  res.status(STATUS_BY_CODE[code]).json({ error: { code, message } });
}

export function handleUnexpectedError(res: VercelResponse, error: unknown): void {
  if (error instanceof MissingApiKeyError) {
    sendApiError(res, 'MISSING_API_KEY', 'OpenAI APIキーが設定されていません。');
    return;
  }
  if (error instanceof APIConnectionTimeoutError) {
    sendApiError(res, 'TIMEOUT', 'AI分析がタイムアウトしました。');
    return;
  }
  if (error instanceof OpenAiResponseValidationError) {
    sendApiError(res, 'OPENAI_ERROR', 'AIの応答形式が不正でした。');
    return;
  }
  sendApiError(res, 'OPENAI_ERROR', 'AI呼び出し中にエラーが発生しました。');
}
