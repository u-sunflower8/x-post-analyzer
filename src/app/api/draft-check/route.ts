import { NextResponse } from "next/server";
import { listAllOwnPosts } from "@/lib/db/queries";
import { ownPostRowToOwnPost } from "@/lib/db/mappers";
import { withMetrics } from "@/lib/own-posts/metrics";
import { checkDraft } from "@/lib/own-posts/draft-check";
import { parseDraftBody, type DraftCheckRequestBody } from "@/lib/own-posts/draft-request";

// Rule-based check against the account's own past posts. No AI call, no cost.
export async function POST(request: Request) {
  const parsed = parseDraftBody((await request.json().catch(() => ({}))) as DraftCheckRequestBody);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const posts = (await listAllOwnPosts()).map(ownPostRowToOwnPost).map(withMetrics);
  const result = checkDraft(parsed.text, posts, { scheduledHour: parsed.scheduledHour, theme: parsed.theme });
  return NextResponse.json(result);
}
