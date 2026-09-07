import type { ZodType } from "zod";
import { getOpenAiClient, MODEL } from "./client";
import { OpenAiResponseValidationError } from "./callOpenAiJson";

const REQUEST_TIMEOUT_MS = 25_000;

export async function callOpenAiVisionJson<T>(params: {
  system: string;
  user: string;
  imageBase64: string;
  mimeType: string;
  schema: ZodType<T>;
}): Promise<T> {
  const client = getOpenAiClient();

  const completion = await client.chat.completions.create(
    {
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: params.system },
        {
          role: "user",
          content: [
            { type: "text", text: params.user },
            {
              type: "image_url",
              image_url: { url: `data:${params.mimeType};base64,${params.imageBase64}` },
            },
          ],
        },
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
