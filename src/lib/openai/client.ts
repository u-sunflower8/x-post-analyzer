import OpenAI from "openai";

export class MissingApiKeyError extends Error {
  constructor() {
    super("OPENAI_API_KEY is not set");
    this.name = "MissingApiKeyError";
  }
}

let _client: OpenAI | null = null;

export function getOpenAiClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new MissingApiKeyError();
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

export const MODEL = "gpt-4o-mini";
