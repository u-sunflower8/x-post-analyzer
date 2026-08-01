import { Link } from 'react-router-dom';
import { PenSquare, Loader2 } from 'lucide-react';
import { usePosts } from '@/shared/hooks/usePosts';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/components/ui/button';
import { postsRepository } from '@/shared/lib/postsRepository';
import { usePostGeneration } from '@/features/post-generator/hooks/usePostGeneration';
import { DraftCard } from '@/features/post-generator/components/DraftCard';
import { ApiKeyMissingNotice } from '@/features/ai-analysis/components/ApiKeyMissingNotice';
import { CardSkeletonGrid } from '@/shared/components/CardSkeletonGrid';
import type { PostWithMetrics } from '@/shared/types/post';
import type { AnalyzeResponse } from '@/shared/types/ai';

export function PostGeneratorPage() {
  const posts = usePosts();
  const analysis = postsRepository.loadAiAnalysis();

  if (posts.length === 0) {
    return (
      <EmptyState
        title="まだ投稿データがありません"
        description="CSVをアップロードすると、次回投稿を生成できます。"
        actionTo="/upload"
        actionLabel="CSVをアップロード"
      />
    );
  }

  if (!analysis) {
    return (
      <EmptyState
        title="先にAI分析を実行してください"
        description="投稿生成にはAI分析で抽出した勝ちパターンが必要です。"
        actionTo="/analysis"
        actionLabel="AI分析へ"
      />
    );
  }

  return <PostGeneratorContent posts={posts} analysis={analysis} />;
}

interface PostGeneratorContentProps {
  posts: PostWithMetrics[];
  analysis: AnalyzeResponse;
}

function PostGeneratorContent({ posts, analysis }: PostGeneratorContentProps) {
  const { drafts, isLoading, errorCode, errorMessage, runGeneration } = usePostGeneration(
    posts,
    analysis,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">投稿生成</h1>
          <p className="text-sm text-muted-foreground">
            勝ちパターンをもとに次回投稿の下書きを3案生成します
          </p>
        </div>
        <Button onClick={runGeneration} disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : <PenSquare />}
          {drafts ? '再生成する' : '投稿を生成'}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        <Link to="/analysis" className="underline">
          AI分析結果
        </Link>
        （{new Date(analysis.generatedAt).toLocaleString('ja-JP')} 実行）を参照しています
      </p>

      {errorCode === 'MISSING_API_KEY' && <ApiKeyMissingNotice />}
      {errorCode && errorCode !== 'MISSING_API_KEY' && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}

      {isLoading && !drafts && <CardSkeletonGrid count={3} />}
      {drafts && (
        <div className="grid gap-4 md:grid-cols-3">
          {drafts.map((draft) => (
            <DraftCard key={draft.id} draft={draft} />
          ))}
        </div>
      )}
    </div>
  );
}
