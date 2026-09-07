import { NextResponse } from "next/server";
import { extractPostFromImage } from "@/lib/openai/extractPostFromImage";
import { MissingApiKeyError } from "@/lib/openai/client";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { imageBase64?: string; mimeType?: string } | null;
  if (!body?.imageBase64 || !body?.mimeType) {
    return NextResponse.json({ error: "imageBase64 and mimeType are required" }, { status: 400 });
  }

  try {
    const extracted = await extractPostFromImage(body.imageBase64, body.mimeType);
    return NextResponse.json({ extracted });
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      return NextResponse.json({ error: "OPENAI_API_KEY未設定です" }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "OpenAI vision extraction failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
