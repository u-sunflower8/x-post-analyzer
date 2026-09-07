import { Loader2, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ExtractedPostRow } from '../types';

interface ExtractedPostsTableProps {
  rows: ExtractedPostRow[];
  onUpdate: (id: string, patch: Partial<ExtractedPostRow>) => void;
  onRemove: (id: string) => void;
}

function toNumberOrNull(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function ExtractedPostsTable({ rows, onUpdate, onRemove }: ExtractedPostsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>状態</TableHead>
          <TableHead>投稿文</TableHead>
          <TableHead>投稿日時</TableHead>
          <TableHead>表示回数</TableHead>
          <TableHead>リポスト</TableHead>
          <TableHead>いいね</TableHead>
          <TableHead>ブックマーク</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              {row.status === 'processing' && (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              )}
              {row.status === 'done' && <Badge variant="secondary">読取済</Badge>}
              {row.status === 'error' && (
                <Badge variant="destructive" title={row.errorMessage}>
                  失敗
                </Badge>
              )}
            </TableCell>
            <TableCell className="min-w-64 whitespace-normal">
              <Input
                value={row.text ?? ''}
                placeholder="投稿文"
                onChange={(e) => onUpdate(row.id, { text: e.target.value })}
              />
            </TableCell>
            <TableCell>
              <Input
                value={row.createdAt ?? ''}
                placeholder="YYYY-MM-DD HH:mm"
                className="w-40"
                onChange={(e) => onUpdate(row.id, { createdAt: e.target.value })}
              />
            </TableCell>
            <TableCell>
              <Input
                value={row.impressions ?? ''}
                type="number"
                className="w-24"
                onChange={(e) => onUpdate(row.id, { impressions: toNumberOrNull(e.target.value) })}
              />
            </TableCell>
            <TableCell>
              <Input
                value={row.retweets ?? ''}
                type="number"
                className="w-20"
                onChange={(e) => onUpdate(row.id, { retweets: toNumberOrNull(e.target.value) })}
              />
            </TableCell>
            <TableCell>
              <Input
                value={row.likes ?? ''}
                type="number"
                className="w-20"
                onChange={(e) => onUpdate(row.id, { likes: toNumberOrNull(e.target.value) })}
              />
            </TableCell>
            <TableCell className="text-muted-foreground">{row.bookmarks ?? '-'}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="削除"
                onClick={() => onRemove(row.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
