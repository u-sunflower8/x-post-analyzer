import { z } from 'zod';

export const accountSummarySchema = z.object({
  postCount: z.number(),
  dateRangeStart: z.string(),
  dateRangeEnd: z.string(),
  avgEngagementRate: z.number(),
  medianEngagementRate: z.number(),
  avgImpressions: z.number(),
});

export const postBriefSchema = z.object({
  id: z.string(),
  text: z.string(),
  createdAt: z.string(),
  engagementRate: z.number().nullable(),
  likes: z.number(),
  retweets: z.number(),
  impressions: z.number(),
  charCount: z.number(),
});

export const bucketStatSchema = z.object({
  label: z.string(),
  avgEngagementRate: z.number(),
  postCount: z.number(),
});

export const keywordStatSchema = z.object({
  keyword: z.string(),
  occurrences: z.number(),
  avgEngagementRate: z.number(),
});

export const analyzeRequestSchema = z.object({
  summary: accountSummarySchema,
  topPosts: z.array(postBriefSchema),
  bottomPosts: z.array(postBriefSchema),
  hourBuckets: z.array(bucketStatSchema),
  dayOfWeekBuckets: z.array(bucketStatSchema),
  charCountBuckets: z.array(bucketStatSchema),
  topKeywords: z.array(keywordStatSchema),
});

export const winningPatternSchema = z.object({
  id: z.coerce.string(),
  title: z.string(),
  description: z.string(),
  evidence: z.string(),
  category: z.enum(['timing', 'content', 'format', 'engagement', 'growth']),
});

export const analyzeResponseSchema = z.object({
  insights: z.array(winningPatternSchema).min(1),
});

export const suggestRequestSchema = z.object({
  post: postBriefSchema,
  accountSummary: accountSummarySchema,
});

export const postImprovementSchema = z.object({
  issue: z.string(),
  suggestion: z.string(),
  expectedImpact: z.string(),
});

export const suggestResponseSchema = z.object({
  improvements: z.array(postImprovementSchema).min(1),
});

export const generateRequestSchema = z.object({
  insights: z.array(winningPatternSchema),
  topPosts: z.array(postBriefSchema),
  accountSummary: accountSummarySchema,
});

export const postDraftSchema = z.object({
  id: z.coerce.string(),
  text: z.string(),
  rationale: z.string(),
  basedOnPattern: z.string(),
});

export const generateResponseSchema = z.object({
  drafts: z.array(postDraftSchema).min(1),
});

const nullableNumber = z.preprocess((value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}, z.number().nullable());

export const extractPostRequestSchema = z.object({
  imageBase64: z.string().min(1),
  mimeType: z.enum(['image/png', 'image/jpeg', 'image/webp']),
});

export const extractPostResponseSchema = z.object({
  text: z.string().nullable(),
  createdAt: z.string().nullable(),
  impressions: nullableNumber,
  retweets: nullableNumber,
  likes: nullableNumber,
  bookmarks: nullableNumber,
});
