import { Badge } from "@/components/ui/badge";

export function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 50
      ? "bg-orange-100 text-orange-700 border-orange-200"
      : score >= 15
        ? "bg-blue-100 text-blue-700 border-blue-200"
        : "bg-neutral-100 text-neutral-600 border-neutral-200";

  return (
    <Badge variant="outline" className={`${tone} font-mono tabular-nums`}>
      {score.toFixed(1)}
    </Badge>
  );
}
