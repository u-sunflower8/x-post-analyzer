import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractPostRequestSchema, extractPostResponseSchema } from './_lib/schemas.js';
import { buildExtractPostPrompt } from './_lib/promptBuilder.js';
import { callOpenAiVisionJson } from './_lib/callOpenAiVisionJson.js';
import { sendApiError, handleUnexpectedError } from './_lib/respond.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    sendApiError(res, 'INVALID_REQUEST', 'POSTメソッドのみ対応しています。');
    return;
  }

  const parsedBody = extractPostRequestSchema.safeParse(req.body);
  if (!parsedBody.success) {
    sendApiError(res, 'INVALID_REQUEST', 'リクエスト内容が不正です。');
    return;
  }

  try {
    const prompt = buildExtractPostPrompt();
    const imageDataUrl = `data:${parsedBody.data.mimeType};base64,${parsedBody.data.imageBase64}`;
    const result = await callOpenAiVisionJson(prompt, imageDataUrl, extractPostResponseSchema);
    res.status(200).json(result);
  } catch (error) {
    handleUnexpectedError(res, error);
  }
}
