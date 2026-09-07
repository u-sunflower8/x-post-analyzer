import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ownPostRowToOwnPost, ownPostSuggestionRowToSuggestion } from "@/lib/supabase/mappers";
import { withMetrics } from "@/lib/own-posts/metrics";
import type { OwnPostRow, OwnPostSuggestionRow } from "@/lib/supabase/types";
import { OwnPostDetailClient } from "@/components/own-posts/OwnPostDetailClient";

export default async function OwnPostDetailPage({ params }: PageProps<"/own-posts/[id]">) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();

  const { data: postRow } = await supabase.from("own_posts").select("*").eq("id", id).maybeSingle();
  if (!postRow) notFound();

  const { data: suggestionRow } = await supabase
    .from("own_post_suggestions")
    .select("*")
    .eq("own_post_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <OwnPostDetailClient
      post={withMetrics(ownPostRowToOwnPost(postRow as OwnPostRow))}
      initialSuggestion={suggestionRow ? ownPostSuggestionRowToSuggestion(suggestionRow as OwnPostSuggestionRow) : null}
    />
  );
}
