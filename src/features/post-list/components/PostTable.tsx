import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PostWithMetrics } from '@/shared/types/post';
import { formatNumber, formatPercent } from '@/shared/lib/format';

export function PostTable({ posts }: { posts: PostWithMetrics[] }) {
  const navigate = useNavigate();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>投稿</TableHead>
          <TableHead>日時</TableHead>
          <TableHead className="text-right">インプレッション</TableHead>
          <TableHead className="text-right">エンゲージメント率</TableHead>
          <TableHead className="text-right">いいね</TableHead>
          <TableHead className="text-right">リツイート</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => (
          <TableRow
            key={post.id}
            className="cursor-pointer"
            onClick={() => navigate(`/posts/${post.id}`)}
          >
            <TableCell className="max-w-xs truncate" title={post.text}>
              {post.text}
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {new Date(post.createdAt).toLocaleString('ja-JP')}
            </TableCell>
            <TableCell className="text-right">{formatNumber(post.impressions)}</TableCell>
            <TableCell className="text-right">
              {post.metrics.engagementRate === null
                ? '—'
                : formatPercent(post.metrics.engagementRate)}
            </TableCell>
            <TableCell className="text-right">{formatNumber(post.likes)}</TableCell>
            <TableCell className="text-right">{formatNumber(post.retweets)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
