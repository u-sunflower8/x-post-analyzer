import { Lightbulb } from "lucide-react";

export function IdeaCard({ text, index }: { text: string; index: number }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground/80">
        <Lightbulb className="h-3.5 w-3.5" />
        案 {index + 1}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{text}</p>
    </div>
  );
}
