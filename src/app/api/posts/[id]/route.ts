import { NextResponse } from "next/server";
import { getPostById, getLatestAnalysisByPostId } from "@/lib/db/queries";
import { postRowToPost, analysisRowToAnalysis } from "@/lib/db/mappers";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const postRow = await getPostById(id);
  if (!postRow) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const analysisRow = await getLatestAnalysisByPostId(id);

  return NextResponse.json({
    post: postRowToPost(postRow),
    analysis: analysisRow ? analysisRowToAnalysis(analysisRow) : null,
  });
}
