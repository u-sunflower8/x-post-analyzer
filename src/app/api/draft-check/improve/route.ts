import { NextResponse } from "next/server";
import { listAllOwnPosts } from "@/lib/db/queries";
import { ownPostRowToOwnPost } from "@/lib/db/mappers";
import { withMetrics } from "@/lib/own-posts/metrics";
import { checkDraft } from "@/lib/own-posts/draft-check";
import { relativeScores } from "@/lib/own-posts/content";
import { THEME_LABELS } from "@/lib/own-posts/themes";
import { improveDraft } from "@/lib/openai/improveDraft";
import { MissingApiKeyError } from "@/lib/openai/client";
import { parseDraftBody, type DraftCheckRequestBody } from "@/lib/own-posts/draft-request";

const BEST_POST_COUNT = 8;
const EXAMPLE_TEXT_LENGTH = 200;

// AI rewrite of a draft (OpenAI, paid per call). Only runs when the user presses the button;
// results are not cached because every draft is different.
export async function POST(request: Request) {
  const parsed = parseDraftBody((await request.json().catch(() => ({}))) as DraftCheckRequestBody);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const posts = (await listAllOwnPosts()).map(ownPostRowToOwnPost).map(withMetrics);
  const check = checkDraft(parsed.text, posts, { scheduledHour: null, theme: parsed.theme });
  const relative = relativeScores(posts);
  const bestPosts = [...posts]
    .filter((p) => relative.has(p.id))
    .sort((a, b) => relative.get(b.id)! - relative.get(a.id)!)
    .slice(0, BEST_POST_COUNT)
    .map((p) => ({
      text: Array.from(p.text).slice(0, EXAMPLE_TEXT_LENGTH).join(""),
      likes: p.likeCount,
      retweets: p.repostCount,
    }));

  try {
    const result = await improveDraft({
      draft: parsed.text,
      theme: check.theme ? THEME_LABELS[check.theme] : null,
      checks: check.checks.map(({ label, status, message }) => ({ label, status, message })),
      bestPosts,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      return NextResponse.json({ error: "OPENAI_API_KEY未設定です" }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "AIでの改善案作成に失敗しました";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
