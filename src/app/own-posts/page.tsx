import { listOwnPosts } from "@/lib/db/queries";
import { ownPostRowToOwnPost } from "@/lib/db/mappers";
import { OwnPostTable } from "@/components/own-posts/OwnPostTable";
import { CsvUploadDialog } from "@/components/own-posts/CsvUploadDialog";
import { ScreenshotImportDialog } from "@/components/own-posts/ScreenshotImportDialog";
import { FetchFromXDialog } from "@/components/own-posts/FetchFromXDialog";
import type { OwnPostListItem } from "@/types/own-post";

/** The table shows 3 lines of text at most, so there is no need to ship the full post. */
const LIST_TEXT_LENGTH = 150;

export const dynamic = "force-dynamic";

export default async function OwnPostsPage() {
  const rows = await listOwnPosts(1000);
  const posts: OwnPostListItem[] = rows.map(ownPostRowToOwnPost).map((p) => ({
    id: p.id,
    text: Array.from(p.text).slice(0, LIST_TEXT_LENGTH).join(""),
    postedAt: p.postedAt,
    url: p.url,
    likeCount: p.likeCount,
    repostCount: p.repostCount,
    replyCount: p.replyCount,
    impressionCount: p.impressionCount,
    theme: p.theme,
    hook: p.hook,
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">自分の投稿</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            自分の過去投稿を集めて、ダッシュボードや勝ちパターン分析の元データにします。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <FetchFromXDialog />
          <CsvUploadDialog />
          <ScreenshotImportDialog />
        </div>
      </div>

      <OwnPostTable posts={posts} />
    </div>
  );
}
