import type { BucketStat } from './kpi';

export interface AccountSummary {
  postCount: number;
  dateRangeStart: string;
  dateRangeEnd: string;
  avgEngagementRate: number;
  medianEngagementRate: number;
  avgImpressions: number;
}

export interface PostBrief {
  id: string;
  text: string;
  createdAt: string;
  engagementRate: number | null;
  likes: number;
  retweets: number;
  impressions: number;
  charCount: number;
}

export interface KeywordStat {
  keyword: string;
  occurrences: number;
  avgEngagementRate: number;
}

export interface AnalyzeRequest {
  summary: AccountSummary;
  topPosts: PostBrief[];
  bottomPosts: PostBrief[];
  hourBuckets: BucketStat[];
  dayOfWeekBuckets: BucketStat[];
  charCountBuckets: BucketStat[];
  topKeywords: KeywordStat[];
}

export type WinningPatternCategory =
  | 'timing'
  | 'content'
  | 'format'
  | 'engagement'
  | 'growth';

export interface WinningPattern {
  id: string;
  title: string;
  description: string;
  evidence: string;
  category: WinningPatternCategory;
}

export interface AnalyzeResponse {
  insights: WinningPattern[];
  generatedAt: string;
}

export interface SuggestRequest {
  post: PostBrief;
  accountSummary: AccountSummary;
}

export interface PostImprovement {
  issue: string;
  suggestion: string;
  expectedImpact: string;
}

export interface SuggestResponse {
  improvements: PostImprovement[];
}

export interface GenerateRequest {
  insights: WinningPattern[];
  topPosts: PostBrief[];
  accountSummary: AccountSummary;
}

export interface PostDraft {
  id: string;
  text: string;
  rationale: string;
  basedOnPattern: string;
}

export interface GenerateResponse {
  drafts: PostDraft[];
}

export interface ExtractPostRequest {
  imageBase64: string;
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp';
}

export interface ExtractPostResponse {
  text: string | null;
  createdAt: string | null;
  impressions: number | null;
  retweets: number | null;
  likes: number | null;
  bookmarks: number | null;
}

export type ApiErrorCode =
  | 'MISSING_API_KEY'
  | 'INVALID_REQUEST'
  | 'OPENAI_ERROR'
  | 'TIMEOUT';

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
  };
}
