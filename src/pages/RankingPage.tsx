import { usePosts } from '@/shared/hooks/usePosts';
import { EmptyState } from '@/shared/components/EmptyState';
import { RankingList } from '@/features/post-ranking/components/RankingList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RANKING_SIZE = 20;

export function RankingPage() {
  const posts = usePosts();

  if (posts.length === 0) {
    return (
      <EmptyState
        title="まだ投稿データがありません"
        description="CSVをアップロードすると、投稿ランキングが表示されます。"
        actionTo="/upload"
        actionLabel="CSVをアップロード"
      />
    );
  }

  const sortedByScore = [...posts].sort((a, b) => b.metrics.engagementScore - a.metrics.engagementScore);
  const topPosts = sortedByScore.slice(0, RANKING_SIZE);
  const bottomPosts = sortedByScore.slice(-RANKING_SIZE).reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">投稿ランキング</h1>
        <p className="text-sm text-muted-foreground">
          エンゲージメントスコア（率×リーチ）でランク付け
        </p>
      </div>

      <Tabs defaultValue="top">
        <TabsList>
          <TabsTrigger value="top">上位投稿</TabsTrigger>
          <TabsTrigger value="bottom">伸び悩み投稿</TabsTrigger>
        </TabsList>
        <TabsContent value="top" className="mt-4">
          <RankingList posts={topPosts} />
        </TabsContent>
        <TabsContent value="bottom" className="mt-4">
          <RankingList posts={bottomPosts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
