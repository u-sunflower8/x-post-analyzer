import type { CharCountBucket, EngagementMetrics, Post } from '@/shared/types/post';

function rate(numerator: number, impressions: number): number | null {
  if (impressions <= 0) return null;
  return numerator / impressions;
}

function charCountBucket(charCount: number): CharCountBucket {
  if (charCount <= 50) return '0-50';
  if (charCount <= 100) return '51-100';
  if (charCount <= 150) return '101-150';
  if (charCount <= 200) return '151-200';
  if (charCount <= 280) return '201-280';
  return '281+';
}

export function computeEngagementMetrics(post: Post): EngagementMetrics {
  const engagementRate = rate(post.engagements, post.impressions);
  const createdAt = new Date(post.createdAt);

  return {
    postId: post.id,
    engagementRate,
    likeRate: rate(post.likes, post.impressions),
    retweetRate: rate(post.retweets, post.impressions),
    replyRate: rate(post.replies, post.impressions),
    clickThroughRate: rate(post.urlClicks + post.permalinkClicks, post.impressions),
    followRate: rate(post.follows, post.impressions),
    engagementScore: (engagementRate ?? 0) * Math.log10(post.impressions + 1),
    dayOfWeek: createdAt.getDay(),
    hourOfDay: createdAt.getHours(),
    charCountBucket: charCountBucket(post.charCount),
  };
}
