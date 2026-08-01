import type { z } from 'zod';
import { getOpenAIClient, AI_MODEL } from './openaiClient.js';

const REQUEST_TIMEOUT_MS = 25000;

export class OpenAiResponseValidationError extends Error {
  constructor() {
    super('OpenAI response did not match the expected schema');
    this.name = 'OpenAiResponseValidationError';
  }
}

export async function callOpenAiJson<Schema extends z.ZodTypeAny>(
  prompt: { system: string; user: string },
  schema: Schema,
): Promise<z.infer<Schema>> {
  const client = getOpenAIClient();

  const completion = await client.chat.completions.create(
    {
      model: AI_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
    },
    { timeout: REQUEST_TIMEOUT_MS },
  );

  const content = completion.choices[0]?.message?.content ?? '{}';
  const parsed = schema.safeParse(JSON.parse(content));
  if (!parsed.success) throw new OpenAiResponseValidationError();
  return parsed.data;
}
