import { Eye, Heart, TrendingUp, Clock, CalendarDays, UserPlus } from 'lucide-react';
import type { DashboardKpis } from '@/shared/types/kpi';
import { KpiCard } from './KpiCard';
import { formatDayOfWeek, formatHour, formatNumber, formatPercent } from '@/shared/lib/format';

export function KpiGrid({ kpis }: { kpis: DashboardKpis }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      <KpiCard label="投稿数" value={formatNumber(kpis.totalPosts)} icon={TrendingUp} />
      <KpiCard label="合計インプレッション" value={formatNumber(kpis.totalImpressions)} icon={Eye} />
      <KpiCard label="合計エンゲージメント" value={formatNumber(kpis.totalEngagements)} icon={Heart} />
      <KpiCard
        label="平均エンゲージメント率"
        value={formatPercent(kpis.avgEngagementRate)}
        icon={TrendingUp}
        hint={`中央値 ${formatPercent(kpis.medianEngagementRate)}`}
      />
      <KpiCard
        label="ベストな投稿時間帯"
        value={formatHour(kpis.bestPostingHour)}
        icon={Clock}
      />
      <KpiCard
        label="ベストな曜日"
        value={formatDayOfWeek(kpis.bestPostingDayOfWeek)}
        icon={CalendarDays}
      />
      <KpiCard label="獲得フォロー数" value={formatNumber(kpis.totalFollowsGained)} icon={UserPlus} />
    </div>
  );
}
