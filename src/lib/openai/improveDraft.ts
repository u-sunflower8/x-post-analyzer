import { callOpenAiJson } from "./callOpenAiJson";
import { ImproveDraftResponseSchema, type ImproveDraftResponse } from "./schemas";

const JSON_ONLY_INSTRUCTION =
  "必ず有効なJSONのみを出力してください。前置きや説明文、Markdownのコードフェンスは一切含めないでください。";

export interface ImproveDraftRequest {
  draft: string;
  theme: string | null;
  /** Rule-based check results, so the AI fixes what the account's data says matters. */
  checks: { label: string; status: string; message: string }[];
  /** The account's best posts (by likes relative to its own baseline), as tone and structure examples. */
  bestPosts: { text: string; likes: number; retweets: number }[];
}

export async function improveDraft(request: ImproveDraftRequest): Promise<ImproveDraftResponse> {
  return callOpenAiJson({
    system:
      "あなたはX(旧Twitter)運用のアドバイザーです。投稿者本人の過去の伸びた投稿とデータ分析の結果をもとに、" +
      "下書きをより伸びる形に改善します。投稿者の口調・キャラクター（20代・投資とFIREを発信する会社員、やわらかい話し言葉）を保ってください。" +
      JSON_ONLY_INSTRUCTION,
    user: JSON.stringify({
      instruction:
        "下書き(draft)を評価し、改善案を3つ作ってください。" +
        "checksは投稿者本人の過去データに基づくチェック結果です。status=improveの項目を優先して直してください。" +
        "bestPostsは本人の伸びた投稿なので、口調や構成の参考にしてください（文面のコピーは禁止）。" +
        "改善案は全体を121〜200字にしてください（本人の投稿ではこの長さが最も伸びています）。自然に入れられる場合は" +
        "「株クラのみなさん」への呼びかけや、選択肢つきの問いかけ（どっち派？など）を入れてください。" +
        "下書きにない資産額や年収などの具体的な数字を新しく作らないでください。" +
        "出力形式: { \"summary\": 一言での評価, \"strengths\": 良い点の配列, \"weaknesses\": 弱い点の配列, " +
        "\"rewrites\": [{ \"text\": 改善した投稿文, \"point\": 何をどう変えたか }] }",
      data: request,
    }),
    schema: ImproveDraftResponseSchema,
  });
}
