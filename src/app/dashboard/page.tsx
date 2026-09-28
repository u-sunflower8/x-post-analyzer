import { listAllOwnPosts } from "@/lib/db/queries";
import { ownPostRowToOwnPost } from "@/lib/db/mappers";
import { withMetrics } from "@/lib/own-posts/metrics";
import { computeDashboardKpis } from "@/lib/own-posts/dashboard";
import { aggregateByHour, aggregateByDayOfWeek, aggregateByCharCount } from "@/lib/own-posts/aggregate";
import { aggregateByHook, aggregateByTheme } from "@/lib/own-posts/content";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const rows = await listAllOwnPosts();
  const posts = rows.map(ownPostRowToOwnPost).map(withMetrics);

  const kpis = computeDashboardKpis(posts);
  const hourBuckets = aggregateByHour(posts);
  const dayOfWeekBuckets = aggregateByDayOfWeek(posts);
  const charCountBuckets = aggregateByCharCount(posts);
  const themeStats = aggregateByTheme(posts);
  const hookStats = aggregateByHook(posts);
  const unclassifiedCount = posts.filter((p) => !p.theme).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">ダッシュボード</h1>
        <p className="mt-1 text-sm text-neutral-500">自分の投稿全体の傾向を確認します。</p>
      </div>
      <DashboardClient
        kpis={kpis}
        hourBuckets={hourBuckets}
        dayOfWeekBuckets={dayOfWeekBuckets}
        charCountBuckets={charCountBuckets}
        themeStats={themeStats}
        hookStats={hookStats}
        unclassifiedCount={unclassifiedCount}
      />
    </div>
  );
}
