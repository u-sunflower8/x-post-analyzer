import { Sparkles } from "lucide-react";
import type { StructureAbstract } from "@/lib/openai/schemas";

export function StructureAbstractCard({ structureAbstract }: { structureAbstract: StructureAbstract }) {
  return (
    <div className="rounded-lg border border-neutral-900 bg-neutral-900 p-5 text-white">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4" />
        <h3 className="text-sm font-medium">抽象化された構造パターン</h3>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-neutral-400">
        元投稿の文言は使わず、他ジャンルにも応用できる形に一般化したパターンです。オリジナル投稿案の生成はこの情報のみを入力に行われます。
      </p>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-xs text-neutral-500">パターン</dt>
          <dd className="text-neutral-100">{structureAbstract.pattern}</dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">テーマ</dt>
          <dd className="text-neutral-100">{structureAbstract.theme}</dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">心理的トリガー</dt>
          <dd className="text-neutral-100">{structureAbstract.psychologicalTrigger}</dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">フックの型</dt>
          <dd className="text-neutral-100">{structureAbstract.hookType}</dd>
        </div>
      </dl>
    </div>
  );
}
