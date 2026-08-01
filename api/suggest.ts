import type { VercelRequest, VercelResponse } from '@vercel/node';
import { suggestRequestSchema, suggestResponseSchema } from './_lib/schemas.js';
import { buildSuggestPrompt } from './_lib/promptBuilder.js';
import { callOpenAiJson } from './_lib/callOpenAiJson.js';
import { sendApiError, handleUnexpectedError } from './_lib/respond.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    sendApiError(res, 'INVALID_REQUEST', 'POSTメソッドのみ対応しています。');
    return;
  }

  const parsedBody = suggestRequestSchema.safeParse(req.body);
  if (!parsedBody.success) {
    sendApiError(res, 'INVALID_REQUEST', 'リクエスト内容が不正です。');
    return;
  }

  try {
    const prompt = buildSuggestPrompt(parsedBody.data);
    const result = await callOpenAiJson(prompt, suggestResponseSchema);
    res.status(200).json(result);
  } catch (error) {
    handleUnexpectedError(res, error);
  }
}
