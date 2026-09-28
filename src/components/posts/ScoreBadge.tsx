import { Badge } from "@/components/ui/badge";

export function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 50
      ? "bg-primary/15 text-primary border-primary/30"
      : score >= 15
        ? "bg-star/25 text-secondary-foreground border-star/50"
        : "bg-secondary text-secondary-foreground border-border";

  return (
    <Badge variant="outline" className={`${tone} font-mono tabular-nums`}>
      {score.toFixed(1)}
    </Badge>
  );
}
