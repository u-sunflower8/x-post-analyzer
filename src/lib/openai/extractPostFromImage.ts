import { callOpenAiVisionJson } from "./callOpenAiVisionJson";
import { ExtractPostResponseSchema } from "./schemas";
import type { ExtractPostResponse } from "@/types/own-post";

const JSON_ONLY_INSTRUCTION =
  "必ず有効なJSONのみを出力してください。前置きや説明文、Markdownのコードフェンスは一切含めないでください。";

const SYSTEM_PROMPT =
  "あなたはX(旧Twitter)の投稿画面のスクリーンショットから情報を読み取るアシスタントです。" +
  "画像に写っている1件の投稿について、本文・投稿日時・表示回数(インプレッション)・" +
  "リポスト数・いいね数・ブックマーク数を可能な限り正確に読み取ってください。" +
  "読み取れない、または画像に写っていない項目はnullにしてください。" +
  "数値はカンマや「件」「回」「万」などの単位を除いた整数にしてください" +
  "(例: 「1.2万」は12000、「3,456件」は3456)。" +
  "投稿日時は年月日と時刻が両方読み取れる場合のみ「YYYY-MM-DD HH:mm」形式にしてください。" +
  "「3時間前」のような相対表記や日付のみしか読み取れない場合はnullにしてください。" +
  JSON_ONLY_INSTRUCTION;

const USER_PROMPT = JSON.stringify({
  instruction:
    "画像から投稿を1件読み取ってください。出力形式: { \"text\": string|null, " +
    '"createdAt": string|null, "impressions": number|null, "retweets": number|null, ' +
    '"likes": number|null, "bookmarks": number|null }',
});

export async function extractPostFromImage(imageBase64: string, mimeType: string): Promise<ExtractPostResponse> {
  return callOpenAiVisionJson({
    system: SYSTEM_PROMPT,
    user: USER_PROMPT,
    imageBase64,
    mimeType,
    schema: ExtractPostResponseSchema,
  });
}
