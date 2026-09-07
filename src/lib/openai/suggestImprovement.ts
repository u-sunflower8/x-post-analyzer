import { callOpenAiJson } from "./callOpenAiJson";
import { SuggestResponseSchema } from "./schemas";
import type { SuggestRequest, SuggestResponse } from "@/types/own-post";

const JSON_ONLY_INSTRUCTION =
  "必ず有効なJSONのみを出力してください。前置きや説明文、Markdownのコードフェンスは一切含めないでください。";

export async function suggestImprovement(request: SuggestRequest): Promise<SuggestResponse> {
  return callOpenAiJson({
    system:
      "あなたはX(旧Twitter)運用の改善アドバイザーです。1件の投稿とアカウント全体の統計を比較し、" +
      "具体的で実行可能な改善案を提示してください。" +
      JSON_ONLY_INSTRUCTION,
    user: JSON.stringify({
      instruction:
        "以下の投稿とアカウントサマリーを比較し、3件前後の改善提案(improvements)を生成してください。" +
        "各improvementは { issue, suggestion, expectedImpact } の形にしてください。" +
        '出力形式: { "improvements": [...] }',
      data: request,
    }),
    schema: SuggestResponseSchema,
  });
}
