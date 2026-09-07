import { Lightbulb } from "lucide-react";

export function IdeaCard({ text, index }: { text: string; index: number }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-neutral-400">
        <Lightbulb className="h-3.5 w-3.5" />
        案 {index + 1}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">{text}</p>
    </div>
  );
}
