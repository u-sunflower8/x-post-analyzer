export type RawCsvRow = Record<string, string>;

export interface Post {
  id: string;
  permalink: string | null;
  text: string;
  createdAt: string; // ISO 8601
  impressions: number;
  engagements: number;
  retweets: number;
  replies: number;
  likes: number;
  userProfileClicks: number;
  urlClicks: number;
  hashtagClicks: number;
  detailExpands: number;
  permalinkClicks: number;
  appOpens: number;
  appInstalls: number;
  follows: number;
  mediaViews: number;
  mediaEngagements: number;
  isPromoted: boolean;
  charCount: number;
  hashtags: string[];
  mentions: string[];
  hasMedia: boolean;
}

export type CharCountBucket =
  | '0-50'
  | '51-100'
  | '101-150'
  | '151-200'
  | '201-280'
  | '281+';

export interface EngagementMetrics {
  postId: string;
  engagementRate: number | null;
  likeRate: number | null;
  retweetRate: number | null;
  replyRate: number | null;
  clickThroughRate: number | null;
  followRate: number | null;
  engagementScore: number;
  dayOfWeek: number; // 0-6 (Sun-Sat)
  hourOfDay: number; // 0-23
  charCountBucket: CharCountBucket;
}

export interface PostWithMetrics extends Post {
  metrics: EngagementMetrics;
}
