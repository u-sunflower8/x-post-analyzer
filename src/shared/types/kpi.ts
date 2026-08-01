export interface DashboardKpis {
  totalPosts: number;
  totalImpressions: number;
  totalEngagements: number;
  avgEngagementRate: number;
  medianEngagementRate: number;
  avgImpressionsPerPost: number;
  bestPostingHour: number | null;
  bestPostingDayOfWeek: number | null;
  totalFollowsGained: number;
  periodStart: string | null;
  periodEnd: string | null;
}

export interface BucketStat {
  label: string;
  avgEngagementRate: number;
  postCount: number;
}
