import { Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { CsvParseResult, CsvRejectionReason } from '@/shared/types/csv';

const REASON_LABELS: Record<CsvRejectionReason, string> = {
  'missing-text': '本文が空',
  'missing-timestamp': '日時列が見つからない',
  'unparseable-timestamp': '日時の形式を解釈できない',
  'missing-engagement-fields': 'エンゲージメント関連の列が見つからない',
};

export function ValidationSummary({ result }: { result: CsvParseResult }) {
  const reasonCounts = new Map<CsvRejectionReason, number>();
  for (const issue of result.rejectedRows) {
    reasonCounts.set(issue.reason, (reasonCounts.get(issue.reason) ?? 0) + 1);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {result.acceptedRows > 0 ? (
            <CheckCircle2 className="size-5 text-emerald-500" />
          ) : (
            <AlertTriangle className="size-5 text-amber-500" />
          )}
          読み込み結果
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-semibold">{result.totalRows}</p>
            <p className="text-xs text-muted-foreground">合計行数</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              {result.acceptedRows}
            </p>
            <p className="text-xs text-muted-foreground">読み込み成功</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-muted-foreground">
              {result.rejectedRows.length}
            </p>
            <p className="text-xs text-muted-foreground">除外</p>
          </div>
        </div>

        {reasonCounts.size > 0 && (
          <div className="space-y-1 rounded-md bg-muted/50 p-3 text-sm">
            {Array.from(reasonCounts.entries()).map(([reason, count]) => (
              <div key={reason} className="flex justify-between text-muted-foreground">
                <span>{REASON_LABELS[reason]}</span>
                <span>{count}件</span>
              </div>
            ))}
          </div>
        )}

        {result.acceptedRows > 0 && (
          <div className="flex gap-2">
            <Button render={<Link to="/" />} nativeButton={false}>
              ダッシュボードを見る
            </Button>
            <Button variant="outline" render={<Link to="/posts" />} nativeButton={false}>
              投稿一覧を見る
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
