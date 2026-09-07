export interface Post {
  id: string;
  authorId: string | null;
  authorUsername: string | null;
  authorName: string | null;
  authorFollowersCount: number | null;
  text: string;
  postedAt: string | null;
  likeCount: number;
  repostCount: number;
  replyCount: number;
  quoteCount: number;
  impressionCount: number | null;
  engagementScore: number;
  likeRate: number;
  repostRate: number;
  replyRate: number;
  url: string;
  fetchedAt: string;
}

export interface SearchParams {
  keyword: string;
  startTime?: string;
  endTime?: string;
  minLikes?: number;
  minReposts?: number;
  minReplies?: number;
  minFollowers?: number;
  maxResults?: number;
}
