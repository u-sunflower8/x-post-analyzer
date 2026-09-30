import { isOwnPostTheme } from "./themes";

export const MAX_DRAFT_LENGTH = 2000;

export interface DraftCheckRequestBody {
  text?: unknown;
  scheduledHour?: unknown;
  theme?: unknown;
}

/** Validates the shared request body of the draft-check routes. */
export function parseDraftBody(body: DraftCheckRequestBody) {
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return { error: "投稿案を入力してください" } as const;
  if (text.length > MAX_DRAFT_LENGTH) return { error: `投稿案は${MAX_DRAFT_LENGTH}字以内にしてください` } as const;
  const hour = body.scheduledHour;
  const scheduledHour = typeof hour === "number" && Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : null;
  const theme = isOwnPostTheme(body.theme) ? body.theme : null;
  return { text, scheduledHour, theme } as const;
}
