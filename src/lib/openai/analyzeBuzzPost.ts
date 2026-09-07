import { callOpenAiJson } from "./callOpenAiJson";
import { AnalysisSchema, type Analysis } from "./schemas";

const SYSTEM_PROMPT = `あなたはSNS（X/Twitter）のバズ投稿を分析する専門家です。
与えられた投稿がなぜ拡散・エンゲージメントを獲得したのかを、文章表現ではなく構造・心理・テーマの観点から分析してください。

重要な制約:
- structureAbstract フィールドには、元投稿の固有の言い回しや具体的な事例・数値・人物名を一切含めないでください。
- 「◯◯は△△なのに××という驚き」のように、テーマと構造パターンを一般化・抽象化した形で記述してください。
- 元の文章をそのまま引用したり、言い換えただけの文章にしないでください。抽象化のレベルは、他ジャンルにも応用できる程度まで引き上げてください。
- 必ずJSON形式のみで回答してください。`;

export async function analyzePost(params: {
  text: string;
  authorFollowersCount: number | null;
  likeCount: number;
  repostCount: number;
  replyCount: number;
}): Promise<Analysis> {
  return callOpenAiJson({
    system: SYSTEM_PROMPT,
    user: `以下のX投稿を分析してください。

【投稿本文】
${params.text}

【エンゲージメント】
いいね: ${params.likeCount} / リポスト: ${params.repostCount} / 返信: ${params.replyCount}
投稿者フォロワー数: ${params.authorFollowersCount ?? "不明"}

以下のJSON形式で回答してください:
{
  "buzzFactorSummary": "バズ要因の一言まとめ",
  "openingHook": "冒頭のフックの説明",
  "structure": "投稿の構造の説明",
  "emotion": ["喚起している感情の配列"],
  "empathy": {"score": 1-5の数値, "reason": "理由"},
  "surprise": {"score": 1-5の数値, "reason": "理由"},
  "controversy": {"score": 1-5の数値, "reason": "理由"},
  "saveValue": {"score": 1-5の数値, "reason": "理由"},
  "selfRelevance": {"score": 1-5の数値, "reason": "理由"},
  "targetReader": "想定読者層",
  "cta": {"present": true/false, "text": "CTAの文言（あれば）"},
  "postType": "question|insight|howto|empathy|surprise|story|controversy|data|other のいずれか",
  "whyItWentViral": "なぜ伸びた可能性があるかの説明",
  "structureAbstract": {
    "pattern": "抽象化された構造パターン",
    "theme": "抽象化されたテーマ",
    "psychologicalTrigger": "心理的トリガー",
    "hookType": "フックの型"
  }
}`,
    schema: AnalysisSchema,
  });
}
