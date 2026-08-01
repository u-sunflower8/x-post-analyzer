import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { PostDraft } from '@/shared/types/ai';

export function DraftCard({ draft }: { draft: PostDraft }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(draft.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card>
      <CardContent className="space-y-3 py-2">
        <p className="whitespace-pre-wrap text-sm">{draft.text}</p>
        <p className="text-xs text-muted-foreground">{Array.from(draft.text).length}文字</p>
        <p className="text-xs text-muted-foreground/80">根拠: {draft.rationale}</p>
        <p className="text-xs text-muted-foreground/80">based on: {draft.basedOnPattern}</p>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? <Check /> : <Copy />}
          {copied ? 'コピーしました' : 'コピー'}
        </Button>
      </CardContent>
    </Card>
  );
}
