export type OwnPostSource = "x_api" | "csv" | "screenshot" | "manual";

export interface OwnPost {
  id: string;
  source: OwnPostSource;
  text: string;
  postedAt: string | null;
  url: string | null;
  likeCount: number;
  repostCount: number;
  replyCount: number;
  quoteCount: number;
  impressionCount: number | null;
  urlClickCount: number | null;
  permalinkClickCount: number | null;
  detailExpandCount: number | null;
  appOpenCount: number | null;
  appInstallCount: number | null;
  followCount: number | null;
  mediaViewCount: number | null;
  mediaEngagementCount: number | null;
  isPromoted: boolean;
  createdAt: string;
}

export type CharCountBucket = "0-50" | "51-100" | "101-150" | "151-200" | "201-280" | "281+";

export interface OwnPostMetrics {
  postId: string;
  engagementRate: number | null;
  likeRate: number | null;
  retweetRate: number | null;
  replyRate: number | null;
  clickThroughRate: number | null;
  followRate: number | null;
  engagementScore: number;
  dayOfWeek: number;
  hourOfDay: number;
  charCountBucket: CharCountBucket;
}

export interface OwnPostWithMetrics extends OwnPost {
  metrics: OwnPostMetrics;
}

export interface BucketStat {
  label: string;
  /** Avg likes + reposts per post. Impressions are not used for ranking (X archive imports have none). */
  avgLikesAndReposts: number;
  postCount: number;
}

export interface DashboardKpis {
  totalPosts: number;
  totalImpressions: number;
  totalEngagements: number;
  avgLikesAndReposts: number;
  medianLikesAndReposts: number;
  avgImpressionsPerPost: number;
  bestPostingHour: number | null;
  bestPostingDayOfWeek: number | null;
  totalFollowsGained: number;
  periodStart: string | null;
  periodEnd: string | null;
}

export interface PostBrief {
  id: string;
  text: string;
  createdAt: string | null;
  likes: number;
  retweets: number;
  charCount: number;
}

export interface AccountSummary {
  postCount: number;
  dateRangeStart: string | null;
  dateRangeEnd: string | null;
  avgLikesAndReposts: number;
  medianLikesAndReposts: number;
}

export interface KeywordStat {
  keyword: string;
  occurrences: number;
  avgLikesAndReposts: number;
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

export type WinningPatternCategory = "timing" | "content" | "format" | "engagement" | "growth";

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

export interface GenerateOwnResponse {
  drafts: PostDraft[];
}

export interface ExtractPostResponse {
  text: string | null;
  createdAt: string | null;
  impressions: number | null;
  retweets: number | null;
  likes: number | null;
  bookmarks: number | null;
}

export type CsvRejectionReason =
  | "missing-text"
  | "missing-timestamp"
  | "missing-engagement-fields"
  | "unparseable-timestamp";

export interface CsvValidationIssue {
  rowIndex: number;
  reason: CsvRejectionReason;
}

export interface CsvParseResult {
  posts: OwnPost[];
  totalRows: number;
  acceptedRows: number;
  rejectedRows: CsvValidationIssue[];
}
