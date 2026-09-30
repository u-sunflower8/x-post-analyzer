import { DraftCheckClient } from "@/components/draft-check/DraftCheckClient";

export default function DraftCheckPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">投稿案チェック</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          書いた投稿案が伸びやすい形になっているかを、あなたの過去の投稿の実績と比べてチェックします。
        </p>
      </div>
      <DraftCheckClient />
    </div>
  );
}
