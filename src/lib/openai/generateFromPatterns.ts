import { callOpenAiJson } from "./callOpenAiJson";
import { GenerateOwnResponseSchema } from "./schemas";
import type { GenerateRequest, GenerateOwnResponse } from "@/types/own-post";

const JSON_ONLY_INSTRUCTION =
  "必ず有効なJSONのみを出力してください。前置きや説明文、Markdownのコードフェンスは一切含めないでください。";

export async function generateDraftsFromPatterns(request: GenerateRequest): Promise<GenerateOwnResponse> {
  return callOpenAiJson({
    system:
      "あなたはX(旧Twitter)運用のコンテンツ作成アシスタントです。分析済みの勝ちパターンと" +
      "過去の高評価投稿を踏まえて、次に投稿すべき文面の案を作成してください。" +
      JSON_ONLY_INSTRUCTION,
    user: JSON.stringify({
      instruction:
        "以下の勝ちパターンと上位投稿を踏まえ、次回投稿の下書きを3案(drafts)生成してください。" +
        "各draftは { id, text, rationale, basedOnPattern } の形にし、" +
        "textは実際にXに投稿できる自然な文面にしてください。" +
        '出力形式: { "drafts": [...] }',
      data: request,
    }),
    schema: GenerateOwnResponseSchema,
  });
}
