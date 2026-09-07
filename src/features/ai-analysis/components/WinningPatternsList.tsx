import { Clock, FileText, LayoutTemplate, Heart, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { WinningPattern, WinningPatternCategory } from '@/shared/types/ai';

const CATEGORY_META: Record<WinningPatternCategory, { label: string; icon: LucideIcon }> = {
  timing: { label: '投稿時間', icon: Clock },
  content: { label: 'コンテンツ', icon: FileText },
  format: { label: 'フォーマット', icon: LayoutTemplate },
  engagement: { label: 'エンゲージメント', icon: Heart },
  growth: { label: '成長', icon: TrendingUp },
};

export function WinningPatternsList({ insights }: { insights: WinningPattern[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {insights.map((insight) => {
        const meta = CATEGORY_META[insight.category];
        const Icon = meta.icon;
        return (
          <Card key={insight.id}>
            <CardContent className="space-y-2 py-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium">{insight.title}</h3>
                <Badge variant="secondary" className="shrink-0 gap-1">
                  <Icon className="size-3" />
                  {meta.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{insight.description}</p>
              <p className="text-xs text-muted-foreground/80">根拠: {insight.evidence}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
