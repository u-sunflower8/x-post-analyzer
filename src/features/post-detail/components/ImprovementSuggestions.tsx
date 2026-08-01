import { Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { SuggestResponse } from '@/shared/types/ai';

export function ImprovementSuggestions({ suggestion }: { suggestion: SuggestResponse }) {
  return (
    <div className="space-y-3">
      {suggestion.improvements.map((improvement, index) => (
        <Card key={index}>
          <CardContent className="flex items-start gap-3 py-2">
            <Lightbulb className="mt-0.5 size-5 shrink-0 text-amber-500" />
            <div className="space-y-1">
              <p className="text-sm font-medium">{improvement.issue}</p>
              <p className="text-sm text-muted-foreground">{improvement.suggestion}</p>
              <p className="text-xs text-muted-foreground/80">期待できる効果: {improvement.expectedImpact}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
