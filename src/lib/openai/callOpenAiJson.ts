import type { ZodType } from "zod";
import { getOpenAiClient, MODEL } from "./client";

const REQUEST_TIMEOUT_MS = 25_000;

export class OpenAiResponseValidationError extends Error {
  constructor(details: string) {
    super(`OpenAI response did not match the expected schema: ${details}`);
    this.name = "OpenAiResponseValidationError";
  }
}

export async function callOpenAiJson<T>(params: {
  system: string;
  user: string;
  schema: ZodType<T>;
}): Promise<T> {
  const client = getOpenAiClient();

  const completion = await client.chat.completions.create(
    {
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
    },
    { timeout: REQUEST_TIMEOUT_MS },
  );

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    throw new OpenAiResponseValidationError("response was not valid JSON");
  }

  const result = params.schema.safeParse(parsedJson);
  if (!result.success) {
    throw new OpenAiResponseValidationError(result.error.message);
  }
  return result.data;
}
