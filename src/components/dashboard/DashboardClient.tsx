"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { BucketMetric, BucketStat, ContentStat, DashboardKpis } from "@/types/own-post";
import { MIN_BUCKET_SAMPLE_SIZE } from "@/lib/own-posts/constants";

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

function formatCount(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(Math.round(n));
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-xs font-normal text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-semibold text-foreground">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground/80">{hint}</p>}
      </CardContent>
    </Card>
  );
}

const METRIC_LABELS: Record<BucketMetric, string> = { avgLikes: "平均いいね", avgReposts: "平均リツイート" };

function EngagementBarChart({ title, data, metric }: { title: string; data: BucketStat[]; metric: BucketMetric }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">
          {title} {METRIC_LABELS[metric]}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => (metric === "avgReposts" ? Number(v).toFixed(1) : formatCount(v))} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value, _name, item) => [
                  `${Number(value ?? 0).toFixed(metric === "avgReposts" ? 2 : 1)}（${(item.payload as BucketStat).postCount}件）`,
                  METRIC_LABELS[metric],
                ]}
              />
              <Bar dataKey={metric}>
                {data.map((entry, i) => (
                  <Cell key={i} fillOpacity={entry.postCount < MIN_BUCKET_SAMPLE_SIZE ? 0.35 : 1} fill="var(--primary)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function ContentStatTable({ title, stats }: { title: string; stats: ContentStat[] }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>分類</TableHead>
              <TableHead className="text-right">件数</TableHead>
              <TableHead className="text-right">自分比</TableHead>
              <TableHead className="text-right">バズ率</TableHead>
              <TableHead className="text-right">平均いいね</TableHead>
              <TableHead className="text-right">いいね中央値</TableHead>
              <TableHead className="text-right">平均RT</TableHead>
              <TableHead className="text-right">RTされた率</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((s) => (
              <TableRow key={s.key} className={s.postCount < MIN_BUCKET_SAMPLE_SIZE ? "text-muted-foreground/80" : ""}>
                <TableCell className="whitespace-nowrap">{s.label}</TableCell>
                <TableCell className="text-right tabular-nums">{s.postCount}</TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {s.relativeMedian !== null ? `${s.relativeMedian.toFixed(2)}倍` : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {s.buzzShare !== null ? `${(s.buzzShare * 100).toFixed(0)}%` : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">{s.avgLikes.toFixed(1)}</TableCell>
                <TableCell className="text-right tabular-nums">{s.medianLikes.toFixed(0)}</TableCell>
                <TableCell className="text-right tabular-nums">{s.avgReposts.toFixed(2)}</TableCell>
                <TableCell className="text-right tabular-nums">{(s.repostedShare * 100).toFixed(0)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function formatHour(hour: number | null) {
  return hour !== null ? `${hour}時台` : "—";
}

function formatDay(day: number | null) {
  return day !== null ? `${DAY_LABELS[day]}曜日` : "—";
}

export function DashboardClient({
  kpis,
  hourBuckets,
  dayOfWeekBuckets,
  charCountBuckets,
  themeStats,
  hookStats,
  unclassifiedCount,
}: {
  kpis: DashboardKpis;
  hourBuckets: BucketStat[];
  dayOfWeekBuckets: BucketStat[];
  charCountBuckets: BucketStat[];
  themeStats: ContentStat[];
  hookStats: ContentStat[];
  unclassifiedCount: number;
}) {
  const [metric, setMetric] = useState<BucketMetric>("avgLikes");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="投稿数" value={String(kpis.totalPosts)} />
        <KpiCard label="平均いいね" value={kpis.avgLikes.toFixed(1)} hint={`中央値 ${kpis.medianLikes.toFixed(1)}`} />
        <KpiCard
          label="平均リツイート"
          value={kpis.avgReposts.toFixed(2)}
          hint={`リツイートされた投稿 ${(kpis.repostedPostShare * 100).toFixed(0)}%`}
        />
        <KpiCard label="合計エンゲージメント" value={formatCount(kpis.totalEngagements)} />
        <KpiCard label="ベスト時間帯（いいね）" value={formatHour(kpis.bestHourByLikes)} />
        <KpiCard label="ベスト時間帯（リツイート）" value={formatHour(kpis.bestHourByReposts)} />
        <KpiCard label="ベスト曜日（いいね）" value={formatDay(kpis.bestDayByLikes)} />
        <KpiCard label="ベスト曜日（リツイート）" value={formatDay(kpis.bestDayByReposts)} />
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground/80">
          ベストは投稿{MIN_BUCKET_SAMPLE_SIZE}件以上の区分から選んでいます（薄い棒は件数不足）。
        </p>
        <div className="inline-flex rounded-md border border-border p-0.5 text-xs">
          {(Object.keys(METRIC_LABELS) as BucketMetric[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMetric(m)}
              className={`rounded px-3 py-1 ${metric === m ? "bg-primary text-primary-foreground" : "text-secondary-foreground hover:bg-accent"}`}
            >
              {m === "avgLikes" ? "いいね" : "リツイート"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <EngagementBarChart title="時間帯別" data={hourBuckets} metric={metric} />
        <EngagementBarChart title="曜日別" data={dayOfWeekBuckets} metric={metric} />
        <EngagementBarChart title="文字数別" data={charCountBuckets} metric={metric} />
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground/80">
          自分比＝いいね数 ÷ 直前30投稿のいいね中央値（フォロワー増加の影響を除くため）。1.00倍がいつも通り、3倍以上をバズとして数えています。
          {unclassifiedCount > 0 && ` 未分類の投稿が${unclassifiedCount}件あり、この表には含まれていません。`}
        </p>
        <div className="grid grid-cols-1 gap-4">
          <ContentStatTable title="テーマ別" stats={themeStats} />
          <ContentStatTable title="1行目の型別" stats={hookStats} />
        </div>
      </div>
    </div>
  );
}
