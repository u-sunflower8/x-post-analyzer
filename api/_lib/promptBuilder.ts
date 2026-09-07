import type { AnalyzeRequest, GenerateRequest, SuggestRequest } from '../../src/shared/types/ai.js';

const JSON_ONLY_INSTRUCTION =
  '必ず有効なJSONのみを出力してください。前置きや説明文、Markdownのコードフェンスは一切含めないでください。';

export function buildAnalyzePrompt(request: AnalyzeRequest): { system: string; user: string } {
  return {
    system:
      'あなたはX(旧Twitter)運用の分析アシスタントです。与えられた投稿の統計データから、' +
      'アカウント固有の「勝ちパターン」を具体的な根拠とともに抽出してください。' +
      JSON_ONLY_INSTRUCTION,
    user: JSON.stringify({
      instruction:
        '以下のデータをもとに、伸びる投稿の共通点・伸びるテーマ・最適な投稿時間・' +
        'フォローされやすい投稿の特徴・改善ポイントの観点から、最低10件の勝ちパターン(insights)を' +
        '生成してください。各insightは { id, title, description, evidence, category } の形で、' +
        'categoryは timing|content|format|engagement|growth のいずれかにしてください。' +
        '出力形式: { "insights": [...] }',
      data: request,
    }),
  };
}

export function buildSuggestPrompt(request: SuggestRequest): { system: string; user: string } {
  return {
    system:
      'あなたはX(旧Twitter)運用の改善アドバイザーです。1件の投稿とアカウント全体の統計を比較し、' +
      '具体的で実行可能な改善案を提示してください。' +
      JSON_ONLY_INSTRUCTION,
    user: JSON.stringify({
      instruction:
        '以下の投稿とアカウントサマリーを比較し、3件前後の改善提案(improvements)を生成してください。' +
        '各improvementは { issue, suggestion, expectedImpact } の形にしてください。' +
        '出力形式: { "improvements": [...] }',
      data: request,
    }),
  };
}

export function buildExtractPostPrompt(): { system: string; user: string } {
  return {
    system:
      'あなたはX(旧Twitter)の投稿画面のスクリーンショットから情報を読み取るアシスタントです。' +
      '画像に写っている1件の投稿について、本文・投稿日時・表示回数(インプレッション)・' +
      'リポスト数・いいね数・ブックマーク数を可能な限り正確に読み取ってください。' +
      '読み取れない、または画像に写っていない項目はnullにしてください。' +
      '数値はカンマや「件」「回」「万」などの単位を除いた整数にしてください' +
      '(例: 「1.2万」は12000、「3,456件」は3456)。' +
      '投稿日時は年月日と時刻が両方読み取れる場合のみ「YYYY-MM-DD HH:mm」形式にしてください。' +
      '「3時間前」のような相対表記や日付のみしか読み取れない場合はnullにしてください。' +
      JSON_ONLY_INSTRUCTION,
    user: JSON.stringify({
      instruction:
        '画像から投稿を1件読み取ってください。出力形式: { "text": string|null, ' +
        '"createdAt": string|null, "impressions": number|null, "retweets": number|null, ' +
        '"likes": number|null, "bookmarks": number|null }',
    }),
  };
}

export function buildGeneratePrompt(request: GenerateRequest): { system: string; user: string } {
  return {
    system:
      'あなたはX(旧Twitter)運用のコンテンツ作成アシスタントです。分析済みの勝ちパターンと' +
      '過去の高評価投稿を踏まえて、次に投稿すべき文面の案を作成してください。' +
      JSON_ONLY_INSTRUCTION,
    user: JSON.stringify({
      instruction:
        '以下の勝ちパターンと上位投稿を踏まえ、次回投稿の下書きを3案(drafts)生成してください。' +
        '各draftは { id, text, rationale, basedOnPattern } の形にし、' +
        'textは実際にXに投稿できる自然な文面にしてください。' +
        '出力形式: { "drafts": [...] }',
      data: request,
    }),
  };
}
