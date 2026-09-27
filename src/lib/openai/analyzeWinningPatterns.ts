import { callOpenAiJson } from "./callOpenAiJson";
import { AnalyzeResponseSchema } from "./schemas";
import type { AnalyzeRequest, AnalyzeResponse } from "@/types/own-post";

const JSON_ONLY_INSTRUCTION =
  "必ず有効なJSONのみを出力してください。前置きや説明文、Markdownのコードフェンスは一切含めないでください。";

export async function analyzeWinningPatterns(request: AnalyzeRequest): Promise<AnalyzeResponse> {
  const result = await callOpenAiJson({
    system:
      "あなたはX(旧Twitter)運用の分析アシスタントです。与えられた投稿の統計データから、" +
      "アカウント固有の「勝ちパターン」を具体的な根拠とともに抽出してください。" +
      JSON_ONLY_INSTRUCTION,
    user: JSON.stringify({
      instruction:
        "以下のデータをもとに、伸びる投稿の共通点・伸びるテーマ・最適な投稿時間・" +
        "フォローされやすい投稿の特徴・改善ポイントの観点から、最低10件の勝ちパターン(insights)を" +
        "生成してください。いいね(共感された)とリツイート(拡散された)は別の反応として区別し、" +
        "topPostsはいいね数上位、topRepostedPostsはリツイート数上位の投稿です。" +
        "両者の違い(共感される投稿と広まる投稿の差)にも触れてください。表示回数は判断材料にしないでください。" +
        "各insightは { id, title, description, evidence, category } の形で、" +
        "categoryは timing|content|format|engagement|growth のいずれかにしてください。" +
        '出力形式: { "insights": [...] }',
      data: request,
    }),
    schema: AnalyzeResponseSchema,
  });

  return { insights: result.insights, generatedAt: new Date().toISOString() };
}
