import { usePosts } from '@/shared/hooks/usePosts';
import { EmptyState } from '@/shared/components/EmptyState';
import { KpiGrid } from '@/features/dashboard/components/KpiGrid';
import { computeDashboardKpis } from '@/features/dashboard/lib/computeDashboardKpis';
import { formatDateRange } from '@/shared/lib/format';
import { EngagementBarChart } from '@/features/charts/components/EngagementBarChart';
import {
  aggregateByHour,
  aggregateByDayOfWeek,
  aggregateByCharCount,
} from '@/features/engagement/lib/aggregate';

export function DashboardPage() {
  const posts = usePosts();

  if (posts.length === 0) {
    return (
      <EmptyState
        title="まだ投稿データがありません"
        description="CSVをアップロードすると、ダッシュボードに分析結果が表示されます。"
        actionTo="/upload"
        actionLabel="CSVをアップロード"
      />
    );
  }

  const kpis = computeDashboardKpis(posts);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">ダッシュボード</h1>
        <p className="text-sm text-muted-foreground">
          {formatDateRange(kpis.periodStart, kpis.periodEnd)} のアカウントサマリー
        </p>
      </div>
      <KpiGrid kpis={kpis} />

      <div className="grid gap-4 lg:grid-cols-2">
        <EngagementBarChart title="時間帯別エンゲージメント率" data={aggregateByHour(posts)} />
        <EngagementBarChart title="曜日別エンゲージメント率" data={aggregateByDayOfWeek(posts)} />
        <EngagementBarChart
          title="文字数別エンゲージメント率"
          data={aggregateByCharCount(posts)}
        />
      </div>
    </div>
  );
}
