import { usePosts } from '@/shared/hooks/usePosts';
import { EmptyState } from '@/shared/components/EmptyState';
import { usePostFilters } from '@/features/post-list/hooks/usePostFilters';
import { PostSearchBar } from '@/features/post-list/components/PostSearchBar';
import { SortControl } from '@/features/post-list/components/SortControl';
import { PostTable } from '@/features/post-list/components/PostTable';

export function PostListPage() {
  const posts = usePosts();
  const {
    query,
    setQuery,
    sortField,
    setSortField,
    sortDirection,
    toggleSortDirection,
    filteredPosts,
  } = usePostFilters(posts);

  if (posts.length === 0) {
    return (
      <EmptyState
        title="まだ投稿データがありません"
        description="CSVをアップロードすると、投稿一覧が表示されます。"
        actionTo="/upload"
        actionLabel="CSVをアップロード"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">投稿一覧</h1>
        <p className="text-sm text-muted-foreground">
          {filteredPosts.length} / {posts.length}件の投稿
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:w-80">
          <PostSearchBar query={query} onChange={setQuery} />
        </div>
        <SortControl
          sortField={sortField}
          onSortFieldChange={setSortField}
          sortDirection={sortDirection}
          onToggleDirection={toggleSortDirection}
        />
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <PostTable posts={filteredPosts} />
      </div>
    </div>
  );
}
