import { notFound } from "next/navigation";
import { getOwnPostById, getLatestSuggestionByOwnPostId } from "@/lib/db/queries";
import { ownPostRowToOwnPost, ownPostSuggestionRowToSuggestion } from "@/lib/db/mappers";
import { withMetrics } from "@/lib/own-posts/metrics";
import { OwnPostDetailClient } from "@/components/own-posts/OwnPostDetailClient";

export default async function OwnPostDetailPage({ params }: PageProps<"/own-posts/[id]">) {
  const { id } = await params;

  const postRow = await getOwnPostById(id);
  if (!postRow) notFound();

  const suggestionRow = await getLatestSuggestionByOwnPostId(id);

  return (
    <OwnPostDetailClient
      post={withMetrics(ownPostRowToOwnPost(postRow))}
      initialSuggestion={suggestionRow ? ownPostSuggestionRowToSuggestion(suggestionRow) : null}
    />
  );
}
