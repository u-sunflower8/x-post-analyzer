import { KeyRound } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function ApiKeyMissingNotice() {
  return (
    <Card className="border-amber-500/40 bg-amber-500/5">
      <CardContent className="flex items-start gap-3 py-2">
        <KeyRound className="mt-0.5 size-5 text-amber-500" />
        <div className="space-y-1">
          <p className="font-medium">APIキーが未設定です</p>
          <p className="text-sm text-muted-foreground">
            OpenAI APIキーが設定されていないため、AI分析を実行できません。サーバーの環境変数
            <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">OPENAI_API_KEY</code>
            を設定してから再度お試しください。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
