export const POST_TYPE_LABELS: Record<string, string> = {
  question: "質問提起型",
  insight: "気づき型",
  howto: "ノウハウ型",
  empathy: "共感型",
  surprise: "意外性型",
  story: "ストーリー型",
  controversy: "議論喚起型",
  data: "データ型",
  other: "その他",
};

export const TRAIT_LABELS = {
  empathy: "共感性",
  surprise: "意外性",
  controversy: "議論性",
  saveValue: "保存価値",
  selfRelevance: "自分ごと化",
} as const;

export const WINNING_PATTERN_CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  timing: { label: "タイミング", icon: "Clock" },
  content: { label: "コンテンツ", icon: "FileText" },
  format: { label: "フォーマット", icon: "LayoutTemplate" },
  engagement: { label: "エンゲージメント", icon: "Heart" },
  growth: { label: "成長", icon: "TrendingUp" },
};
