import { Card, CardContent } from '@/components/ui/card';
import type { PostWithMetrics } from '@/shared/types/post';
import { formatNumber, formatPercent } from '@/shared/lib/format';

const STATS: { label: string; value: (p: PostWithMetrics) => string }[] = [
  { label: 'インプレッション', value: (p) => formatNumber(p.impressions) },
  {
    label: 'エンゲージメント率',
    value: (p) => (p.metrics.engagementRate === null ? '—' : formatPercent(p.metrics.engagementRate)),
  },
  { label: 'いいね', value: (p) => formatNumber(p.likes) },
  { label: 'リツイート', value: (p) => formatNumber(p.retweets) },
  { label: '返信', value: (p) => formatNumber(p.replies) },
  { label: '文字数', value: (p) => `${p.charCount}文字` },
];

export function PostDetailCard({ post }: { post: PostWithMetrics }) {
  return (
    <Card>
      <CardContent className="space-y-4 py-2">
        <p className="whitespace-pre-wrap text-sm">{post.text}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(post.createdAt).toLocaleString('ja-JP')}
        </p>
        <div className="grid grid-cols-3 gap-4 border-t border-border pt-4 sm:grid-cols-6">
          {STATS.map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-medium">{value(post)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
