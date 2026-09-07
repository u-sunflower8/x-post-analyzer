import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { generateIdeas } from "@/lib/openai/generateBuzzIdeas";
import { MissingApiKeyError } from "@/lib/openai/client";
import { ideaRowToIdea } from "@/lib/supabase/mappers";
import type { AnalysisRow, GeneratedIdeaRow } from "@/lib/supabase/types";
import type { StructureAbstract } from "@/lib/openai/schemas";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { analysisId?: string; genre?: string; count?: number }
    | null;

  const analysisId = body?.analysisId;
  const genre = body?.genre?.trim();
  const count = Math.min(Math.max(body?.count ?? 3, 1), 5);

  if (!analysisId || !genre) {
    return NextResponse.json({ error: "analysisId and genre are required" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  const { data: analysisRow, error: analysisError } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", analysisId)
    .maybeSingle();

  if (analysisError) {
    return NextResponse.json({ error: analysisError.message }, { status: 500 });
  }
  if (!analysisRow) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  const structureAbstract = (analysisRow as AnalysisRow).structure_abstract as unknown as StructureAbstract;

  let generated;
  try {
    generated = await generateIdeas({ structureAbstract, genre, count });
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      return NextResponse.json({ error: "OPENAI_API_KEY未設定です" }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "OpenAI generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const { data: inserted, error: insertError } = await supabase
    .from("generated_ideas")
    .insert(generated.ideas.map((idea) => ({ analysis_id: analysisId, genre, idea_text: idea.text })))
    .select("*");

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const ideas = ((inserted ?? []) as GeneratedIdeaRow[]).map(ideaRowToIdea);
  return NextResponse.json({ ideas });
}
