import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import type { PostWithMetrics } from '@/shared/types/post';
import { formatNumber, formatPercent } from '@/shared/lib/format';

export function RankingList({ posts }: { posts: PostWithMetrics[] }) {
  return (
    <div className="space-y-3">
      {posts.map((post, index) => (
        <Link key={post.id} to={`/posts/${post.id}`}>
          <Card className="transition-colors hover:bg-accent/30">
            <CardContent className="flex items-start gap-4 py-2">
              <span className="mt-0.5 text-lg font-semibold text-muted-foreground">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="line-clamp-2 text-sm">{post.text}</p>
                <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                  <span>
                    エンゲージメント率{' '}
                    {post.metrics.engagementRate === null
                      ? '—'
                      : formatPercent(post.metrics.engagementRate)}
                  </span>
                  <span>インプレッション {formatNumber(post.impressions)}</span>
                  <span>いいね {formatNumber(post.likes)}</span>
                  <span>リツイート {formatNumber(post.retweets)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
