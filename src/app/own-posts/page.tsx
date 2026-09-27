import { listOwnPosts } from "@/lib/db/queries";
import { ownPostRowToOwnPost } from "@/lib/db/mappers";
import { withMetrics } from "@/lib/own-posts/metrics";
import { OwnPostTable } from "@/components/own-posts/OwnPostTable";
import { CsvUploadDialog } from "@/components/own-posts/CsvUploadDialog";
import { ScreenshotImportDialog } from "@/components/own-posts/ScreenshotImportDialog";
import { FetchFromXDialog } from "@/components/own-posts/FetchFromXDialog";

export const dynamic = "force-dynamic";

export default async function OwnPostsPage() {
  const rows = await listOwnPosts(200);
  const posts = rows.map(ownPostRowToOwnPost).map(withMetrics);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">自分の投稿</h1>
          <p className="mt-1 text-sm text-neutral-500">
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
