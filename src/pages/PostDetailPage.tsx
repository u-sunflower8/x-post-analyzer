import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { usePosts } from '@/shared/hooks/usePosts';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/components/ui/button';
import { PostDetailCard } from '@/features/post-detail/components/PostDetailCard';
import { ImprovementSuggestions } from '@/features/post-detail/components/ImprovementSuggestions';
import { usePostSuggestion } from '@/features/post-detail/hooks/usePostSuggestion';
import { ApiKeyMissingNotice } from '@/features/ai-analysis/components/ApiKeyMissingNotice';
import { CardSkeletonGrid } from '@/shared/components/CardSkeletonGrid';

export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const posts = usePosts();
  const post = posts.find((p) => p.id === postId);

  const { suggestion, isLoading, errorCode, errorMessage, requestSuggestion } = usePostSuggestion(
    post,
    posts,
  );

  if (!post) {
    return (
      <EmptyState
        title="投稿が見つかりません"
        description="投稿一覧から選び直してください。"
        actionTo="/posts"
        actionLabel="投稿一覧に戻る"
      />
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" render={<Link to="/posts" />} nativeButton={false}>
        <ArrowLeft />
        投稿一覧に戻る
      </Button>

      <h1 className="text-2xl font-semibold tracking-tight">投稿詳細</h1>

      <PostDetailCard post={post} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">改善提案</h2>
          <Button onClick={requestSuggestion} disabled={isLoading} size="sm">
            {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {suggestion ? '再取得する' : '改善提案を取得'}
          </Button>
        </div>

        {errorCode === 'MISSING_API_KEY' && <ApiKeyMissingNotice />}
        {errorCode && errorCode !== 'MISSING_API_KEY' && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}

        {isLoading && !suggestion && <CardSkeletonGrid count={3} />}
        {suggestion && <ImprovementSuggestions suggestion={suggestion} />}
      </div>
    </div>
  );
}
