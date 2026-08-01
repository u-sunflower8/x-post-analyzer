import OpenAI from 'openai';

export class MissingApiKeyError extends Error {
  constructor() {
    super('OPENAI_API_KEY is not set');
    this.name = 'MissingApiKeyError';
  }
}

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new MissingApiKeyError();
  return new OpenAI({ apiKey });
}

export const AI_MODEL = 'gpt-4o-mini';
