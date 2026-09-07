import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateRequestSchema, generateResponseSchema } from './_lib/schemas.js';
import { buildGeneratePrompt } from './_lib/promptBuilder.js';
import { callOpenAiJson } from './_lib/callOpenAiJson.js';
import { sendApiError, handleUnexpectedError } from './_lib/respond.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    sendApiError(res, 'INVALID_REQUEST', 'POSTメソッドのみ対応しています。');
    return;
  }

  const parsedBody = generateRequestSchema.safeParse(req.body);
  if (!parsedBody.success) {
    sendApiError(res, 'INVALID_REQUEST', 'リクエスト内容が不正です。');
    return;
  }

  try {
    const prompt = buildGeneratePrompt(parsedBody.data);
    const result = await callOpenAiJson(prompt, generateResponseSchema);
    res.status(200).json(result);
  } catch (error) {
    handleUnexpectedError(res, error);
  }
}
