import { Sparkles } from "lucide-react";
import type { StructureAbstract } from "@/lib/openai/schemas";

export function StructureAbstractCard({ structureAbstract }: { structureAbstract: StructureAbstract }) {
  return (
    <div className="rounded-lg border border-foreground bg-foreground p-5 text-card">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4" />
        <h3 className="text-sm font-medium">抽象化された構造パターン</h3>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-card/70">
        元投稿の文言は使わず、他ジャンルにも応用できる形に一般化したパターンです。オリジナル投稿案の生成はこの情報のみを入力に行われます。
      </p>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-xs text-card/60">パターン</dt>
          <dd className="text-card">{structureAbstract.pattern}</dd>
        </div>
        <div>
          <dt className="text-xs text-card/60">テーマ</dt>
          <dd className="text-card">{structureAbstract.theme}</dd>
        </div>
        <div>
          <dt className="text-xs text-card/60">心理的トリガー</dt>
          <dd className="text-card">{structureAbstract.psychologicalTrigger}</dd>
        </div>
        <div>
          <dt className="text-xs text-card/60">フックの型</dt>
          <dd className="text-card">{structureAbstract.hookType}</dd>
        </div>
      </dl>
    </div>
  );
}
