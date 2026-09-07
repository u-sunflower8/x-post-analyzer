import type { z } from 'zod';
import { getOpenAIClient, AI_MODEL } from './openaiClient.js';
import { OpenAiResponseValidationError } from './callOpenAiJson.js';

const REQUEST_TIMEOUT_MS = 25000;

export async function callOpenAiVisionJson<Schema extends z.ZodTypeAny>(
  prompt: { system: string; user: string },
  imageDataUrl: string,
  schema: Schema,
): Promise<z.infer<Schema>> {
  const client = getOpenAIClient();

  const completion = await client.chat.completions.create(
    {
      model: AI_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: prompt.system },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt.user },
            { type: 'image_url', image_url: { url: imageDataUrl } },
          ],
        },
      ],
    },
    { timeout: REQUEST_TIMEOUT_MS },
  );

  const content = completion.choices[0]?.message?.content ?? '{}';
  const parsed = schema.safeParse(JSON.parse(content));
  if (!parsed.success) throw new OpenAiResponseValidationError();
  return parsed.data;
}
