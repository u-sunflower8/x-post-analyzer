import { NextResponse } from "next/server";
import { getAnalysisById, insertGeneratedIdeas } from "@/lib/db/queries";
import { generateIdeas } from "@/lib/openai/generateBuzzIdeas";
import { MissingApiKeyError } from "@/lib/openai/client";
import { ideaRowToIdea } from "@/lib/db/mappers";
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

  const analysisRow = await getAnalysisById(analysisId);
  if (!analysisRow) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  const structureAbstract = analysisRow.structure_abstract as unknown as StructureAbstract;

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

  const inserted = await insertGeneratedIdeas(
    analysisId,
    genre,
    generated.ideas.map((idea) => idea.text),
  );

  return NextResponse.json({ ideas: inserted.map(ideaRowToIdea) });
}
