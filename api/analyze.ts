import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeRequestSchema, analyzeResponseSchema } from './_lib/schemas.js';
import { buildAnalyzePrompt } from './_lib/promptBuilder.js';
import { callOpenAiJson } from './_lib/callOpenAiJson.js';
import { sendApiError, handleUnexpectedError } from './_lib/respond.js';
import type { AnalyzeResponse } from '../src/shared/types/ai.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    sendApiError(res, 'INVALID_REQUEST', 'POSTメソッドのみ対応しています。');
    return;
  }

  const parsedBody = analyzeRequestSchema.safeParse(req.body);
  if (!parsedBody.success) {
    sendApiError(res, 'INVALID_REQUEST', 'リクエスト内容が不正です。');
    return;
  }

  try {
    const prompt = buildAnalyzePrompt(parsedBody.data);
    const result = await callOpenAiJson(prompt, analyzeResponseSchema);
    const response: AnalyzeResponse = { insights: result.insights, generatedAt: new Date().toISOString() };
    res.status(200).json(response);
  } catch (error) {
    handleUnexpectedError(res, error);
  }
}
