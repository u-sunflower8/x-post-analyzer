import { Sparkles, Loader2 } from 'lucide-react';
import { usePosts } from '@/shared/hooks/usePosts';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/components/ui/button';
import { useAiAnalysis } from '@/features/ai-analysis/hooks/useAiAnalysis';
import { ApiKeyMissingNotice } from '@/features/ai-analysis/components/ApiKeyMissingNotice';
import { WinningPatternsList } from '@/features/ai-analysis/components/WinningPatternsList';
import { CardSkeletonGrid } from '@/shared/components/CardSkeletonGrid';

export function AiAnalysisPage() {
  const posts = usePosts();
  const { result, isLoading, errorCode, errorMessage, runAnalysis } = useAiAnalysis(posts);

  if (posts.length === 0) {
    return (
      <EmptyState
        title="まだ投稿データがありません"
        description="CSVをアップロードすると、AI分析が実行できます。"
        actionTo="/upload"
        actionLabel="CSVをアップロード"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI分析</h1>
          <p className="text-sm text-muted-foreground">
            投稿データから「勝ちパターン」をAIが抽出します
          </p>
        </div>
        <Button onClick={runAnalysis} disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {result ? '再分析する' : 'AI分析を実行'}
        </Button>
      </div>

      {errorCode === 'MISSING_API_KEY' && <ApiKeyMissingNotice />}
      {errorCode && errorCode !== 'MISSING_API_KEY' && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}

      {isLoading && !result && <CardSkeletonGrid count={6} />}
      {result && <WinningPatternsList insights={result.insights} />}
    </div>
  );
}
