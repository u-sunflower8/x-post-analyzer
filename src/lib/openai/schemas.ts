import { z } from "zod";

const ratedTrait = z.object({
  score: z.number().min(1).max(5),
  reason: z.string(),
});

export const PostTypeEnum = z.enum([
  "question", // 質問提起型
  "insight", // 気づき型
  "howto", // ノウハウ型
  "empathy", // 共感型
  "surprise", // 意外性型
  "story", // ストーリー型
  "controversy", // 議論喚起型
  "data", // データ型
  "other",
]);

export const StructureAbstractSchema = z.object({
  pattern: z.string(),
  theme: z.string(),
  psychologicalTrigger: z.string(),
  hookType: z.string(),
});

export const AnalysisSchema = z.object({
  buzzFactorSummary: z.string(),
  openingHook: z.string(),
  structure: z.string(),
  emotion: z.array(z.string()),
  empathy: ratedTrait,
  surprise: ratedTrait,
  controversy: ratedTrait,
  saveValue: ratedTrait,
  selfRelevance: ratedTrait,
  targetReader: z.string(),
  cta: z.object({
    present: z.boolean(),
    text: z.string().optional(),
  }),
  postType: PostTypeEnum,
  whyItWentViral: z.string(),
  structureAbstract: StructureAbstractSchema,
});

export type Analysis = z.infer<typeof AnalysisSchema>;
export type StructureAbstract = z.infer<typeof StructureAbstractSchema>;

export const GeneratedIdeasSchema = z.object({
  ideas: z.array(
    z.object({
      text: z.string(),
      appliedPattern: z.string(),
    }),
  ),
});

export type GeneratedIdeas = z.infer<typeof GeneratedIdeasSchema>;

// --- 自分の投稿分析（own-posts）用スキーマ ---

export const WinningPatternCategoryEnum = z.enum(["timing", "content", "format", "engagement", "growth"]);

export const WinningPatternSchema = z.object({
  id: z.coerce.string(),
  title: z.string(),
  description: z.string(),
  evidence: z.string(),
  category: WinningPatternCategoryEnum,
});

export const AnalyzeResponseSchema = z.object({
  insights: z.array(WinningPatternSchema).min(1),
  generatedAt: z.string().optional(),
});

export type WinningPattern = z.infer<typeof WinningPatternSchema>;
export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;

export const PostImprovementSchema = z.object({
  issue: z.string(),
  suggestion: z.string(),
  expectedImpact: z.string(),
});

export const SuggestResponseSchema = z.object({
  improvements: z.array(PostImprovementSchema).min(1),
});

export type PostImprovement = z.infer<typeof PostImprovementSchema>;
export type SuggestResponse = z.infer<typeof SuggestResponseSchema>;

// モデルが basedOnPattern を配列で返すことがあるため、カンマ区切り文字列に寄せる。
const basedOnPatternField = z.preprocess((value) => {
  if (Array.isArray(value)) return value.join(", ");
  return value;
}, z.string());

export const PostDraftSchema = z.object({
  id: z.coerce.string(),
  text: z.string(),
  rationale: z.string(),
  basedOnPattern: basedOnPatternField,
});

export const GenerateOwnResponseSchema = z.object({
  drafts: z.array(PostDraftSchema).min(1),
});

export type PostDraft = z.infer<typeof PostDraftSchema>;
export type GenerateOwnResponse = z.infer<typeof GenerateOwnResponseSchema>;

// スクリーンショット読み取り: 空文字/undefinedはnull扱い、数値文字列は数値化。
const nullableNumber = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) return null;
  if (typeof value === "string") {
    const n = Number(value.replace(/,/g, ""));
    return Number.isNaN(n) ? null : n;
  }
  return value;
}, z.number().nullable());

const nullableString = z.preprocess((value) => {
  if (value === "" || value === undefined) return null;
  return value;
}, z.string().nullable());

export const ExtractPostResponseSchema = z.object({
  text: nullableString,
  createdAt: nullableString,
  impressions: nullableNumber,
  retweets: nullableNumber,
  likes: nullableNumber,
  bookmarks: nullableNumber,
});

export type ExtractPostResponse = z.infer<typeof ExtractPostResponseSchema>;

// ---------------------------------------------------------------------------
// Draft post improvement (投稿案チェック)
// ---------------------------------------------------------------------------

export const DraftRewriteSchema = z.object({
  text: z.string(),
  point: z.string(),
});

export const ImproveDraftResponseSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  rewrites: z.array(DraftRewriteSchema).min(1),
});

export type DraftRewrite = z.infer<typeof DraftRewriteSchema>;
export type ImproveDraftResponse = z.infer<typeof ImproveDraftResponseSchema>;
