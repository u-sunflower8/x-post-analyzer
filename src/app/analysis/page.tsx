import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
import { ownPostAnalysisRowToAnalysis } from "@/lib/supabase/mappers";
import type { OwnPostAnalysisRow } from "@/lib/supabase/types";
import { WinningPatternsClient } from "@/components/analysis/WinningPatternsClient";

export default async function AnalysisPage() {
  const { data } = await getSupabaseServerClient()
    .from("own_post_analyses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const initialAnalysis = data ? ownPostAnalysisRowToAnalysis(data as OwnPostAnalysisRow) : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">勝ちパターン分析</h1>
        <p className="mt-1 text-sm text-neutral-500">
          自分の投稿全体から、伸びる投稿の共通点をAIが抽出します。
        </p>
      </div>
      <WinningPatternsClient initialAnalysis={initialAnalysis} />
    </div>
  );
}
