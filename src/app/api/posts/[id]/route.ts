import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { postRowToPost, analysisRowToAnalysis } from "@/lib/supabase/mappers";
import type { PostRow, AnalysisRow } from "@/lib/supabase/types";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();

  const { data: postRow, error: postError } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (postError) {
    return NextResponse.json({ error: postError.message }, { status: 500 });
  }
  if (!postRow) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const { data: analysisRow, error: analysisError } = await supabase
    .from("analyses")
    .select("*")
    .eq("post_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (analysisError) {
    return NextResponse.json({ error: analysisError.message }, { status: 500 });
  }

  return NextResponse.json({
    post: postRowToPost(postRow as PostRow),
    analysis: analysisRow ? analysisRowToAnalysis(analysisRow as AnalysisRow) : null,
  });
}
