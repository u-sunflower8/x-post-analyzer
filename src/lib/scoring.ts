export interface EngagementInput {
  likeCount: number;
  repostCount: number;
  replyCount: number;
  quoteCount: number;
  impressionCount: number | null;
  followersCount: number | null;
}

export interface EngagementScores {
  engagementScore: number;
  likeRate: number;
  repostRate: number;
  replyRate: number;
}

/**
 * Normalizes engagement by impressions when available, falling back to
 * follower count so accounts of very different sizes remain comparable.
 * Reposts and replies are weighted higher than likes since they reflect
 * more active engagement.
 */
export function computeEngagementScores(input: EngagementInput): EngagementScores {
  const base = Math.max(input.impressionCount ?? input.followersCount ?? 0, 1);

  const likeRate = input.likeCount / base;
  const repostRate = input.repostCount / base;
  const replyRate = input.replyCount / base;

  const engagementScore =
    ((input.likeCount * 1 + input.repostCount * 3 + input.replyCount * 2 + input.quoteCount * 2) / base) * 1000;

  return {
    engagementScore: round(engagementScore),
    likeRate: round(likeRate),
    repostRate: round(repostRate),
    replyRate: round(replyRate),
  };
}

function round(value: number): number {
  return Math.round(value * 10000) / 10000;
}
