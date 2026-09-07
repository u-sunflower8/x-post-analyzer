import { callOpenAiJson } from "./callOpenAiJson";
import { GeneratedIdeasSchema, type GeneratedIdeas, type StructureAbstract } from "./schemas";

const SYSTEM_PROMPT = `あなたはSNS（X/Twitter）向けのオリジナル投稿案を作るコピーライターです。
入力として渡されるのは、既存のバズ投稿から抽出された「抽象化された構造パターン」であり、元投稿の文章そのものではありません。

重要な制約:
- あなたは元投稿の文章を一切見ていません。渡されたパターン・テーマ・心理的トリガー・フックの型だけを手がかりに、指定ジャンル向けの完全に新規の投稿を作成してください。
- 特定の固有表現、言い回し、事例をコピーしないでください（そもそも渡されていません）。
- 指定されたジャンルの文脈・語彙・具体例を使って、そのジャンルの読者に刺さる自然な投稿にしてください。
- 各投稿は120文字前後を目安にした、Xにそのまま投稿できる完成形の文章にしてください。
- 必ずJSON形式のみで回答してください。`;

export async function generateIdeas(params: {
  structureAbstract: StructureAbstract;
  genre: string;
  count: number;
}): Promise<GeneratedIdeas> {
  return callOpenAiJson({
    system: SYSTEM_PROMPT,
    user: `【抽象化された構造パターン】
パターン: ${params.structureAbstract.pattern}
テーマ: ${params.structureAbstract.theme}
心理的トリガー: ${params.structureAbstract.psychologicalTrigger}
フックの型: ${params.structureAbstract.hookType}

【対象ジャンル】
${params.genre}

このパターンを使って、上記ジャンル向けのオリジナル投稿案を${params.count}件作成してください。
以下のJSON形式で回答してください:
{
  "ideas": [
    {"text": "投稿本文", "appliedPattern": "どのパターン要素をどう使ったかの説明"}
  ]
}`,
    schema: GeneratedIdeasSchema,
  });
}
