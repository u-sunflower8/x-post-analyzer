import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { postRowToPost, analysisRowToAnalysis } from "@/lib/supabase/mappers";
import type { PostRow, AnalysisRow } from "@/lib/supabase/types";
import { PostDetailClient } from "@/components/analysis/PostDetailClient";

export default async function PostDetailPage({ params }: PageProps<"/posts/[id]">) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();

  const { data: postRow } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (!postRow) notFound();

  const { data: analysisRow } = await supabase
    .from("analyses")
    .select("*")
    .eq("post_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <PostDetailClient
      post={postRowToPost(postRow as PostRow)}
      initialAnalysis={analysisRow ? analysisRowToAnalysis(analysisRow as AnalysisRow) : null}
    />
  );
}
