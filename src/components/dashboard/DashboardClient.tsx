"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BucketStat, DashboardKpis } from "@/types/own-post";

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

function formatCount(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(Math.round(n));
}

function formatPercent(n: number) {
  return `${(n * 100).toFixed(2)}%`;
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="border-neutral-200">
      <CardHeader>
        <CardTitle className="text-xs font-normal text-neutral-500">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-semibold text-neutral-900">{value}</p>
        {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function EngagementBarChart({ title, data }: { title: string; data: BucketStat[] }) {
  return (
    <Card className="border-neutral-200">
      <CardHeader>
        <CardTitle className="text-sm text-neutral-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => formatCount(v)} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value, _name, item) => [
                  `${Number(value ?? 0).toFixed(1)}（${(item.payload as BucketStat).postCount}件）`,
                  "平均いいね＋リポスト",
                ]}
              />
              <Bar dataKey="avgLikesAndReposts">
                {data.map((entry, i) => (
                  <Cell key={i} fillOpacity={entry.postCount < 3 ? 0.35 : 1} fill="#171717" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardClient({
  kpis,
  hourBuckets,
  dayOfWeekBuckets,
  charCountBuckets,
}: {
  kpis: DashboardKpis;
  hourBuckets: BucketStat[];
  dayOfWeekBuckets: BucketStat[];
  charCountBuckets: BucketStat[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="投稿数" value={String(kpis.totalPosts)} />
        <KpiCard label="合計インプレッション" value={formatCount(kpis.totalImpressions)} />
        <KpiCard label="合計エンゲージメント" value={formatCount(kpis.totalEngagements)} />
        <KpiCard
          label="平均エンゲージメント率"
          value={formatPercent(kpis.avgEngagementRate)}
          hint={`中央値 ${formatPercent(kpis.medianEngagementRate)}`}
        />
        <KpiCard label="ベスト投稿時間帯" value={kpis.bestPostingHour !== null ? `${kpis.bestPostingHour}時台` : "—"} />
        <KpiCard
          label="ベスト曜日"
          value={kpis.bestPostingDayOfWeek !== null ? `${DAY_LABELS[kpis.bestPostingDayOfWeek]}曜日` : "—"}
        />
        <KpiCard label="獲得フォロー数" value={formatCount(kpis.totalFollowsGained)} />
        <KpiCard label="投稿あたり平均表示回数" value={formatCount(kpis.avgImpressionsPerPost)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <EngagementBarChart title="時間帯別 平均いいね＋リポスト" data={hourBuckets} />
        <EngagementBarChart title="曜日別 平均いいね＋リポスト" data={dayOfWeekBuckets} />
        <EngagementBarChart title="文字数別 平均いいね＋リポスト" data={charCountBuckets} />
      </div>
    </div>
  );
}
