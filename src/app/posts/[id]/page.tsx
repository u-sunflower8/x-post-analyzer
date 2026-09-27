import { notFound } from "next/navigation";
import { getPostById, getLatestAnalysisByPostId } from "@/lib/db/queries";
import { postRowToPost, analysisRowToAnalysis } from "@/lib/db/mappers";
import { PostDetailClient } from "@/components/analysis/PostDetailClient";

export default async function PostDetailPage({ params }: PageProps<"/posts/[id]">) {
  const { id } = await params;

  const postRow = await getPostById(id);
  if (!postRow) notFound();

  const analysisRow = await getLatestAnalysisByPostId(id);

  return (
    <PostDetailClient
      post={postRowToPost(postRow)}
      initialAnalysis={analysisRow ? analysisRowToAnalysis(analysisRow) : null}
    />
  );
}
