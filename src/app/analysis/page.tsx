import { getLatestOwnPostAnalysis } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
import { ownPostAnalysisRowToAnalysis } from "@/lib/db/mappers";
import { WinningPatternsClient } from "@/components/analysis/WinningPatternsClient";

export default async function AnalysisPage() {
  const data = await getLatestOwnPostAnalysis();

  const initialAnalysis = data ? ownPostAnalysisRowToAnalysis(data) : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">勝ちパターン分析</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          自分の投稿全体から、伸びる投稿の共通点をAIが抽出します。
        </p>
      </div>
      <WinningPatternsClient initialAnalysis={initialAnalysis} />
    </div>
  );
}
