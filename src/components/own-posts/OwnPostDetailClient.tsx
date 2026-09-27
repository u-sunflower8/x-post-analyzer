"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Lightbulb, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { OwnPostWithMetrics } from "@/types/own-post";
import type { OwnPostSuggestion } from "@/lib/db/mappers";

function formatNumber(n: number | null) {
  if (n === null) return "—";
  return n.toLocaleString();
}

function formatPercent(n: number | null) {
  if (n === null) return "—";
  return `${(n * 100).toFixed(2)}%`;
}

export function OwnPostDetailClient({
  post,
  initialSuggestion,
}: {
  post: OwnPostWithMetrics;
  initialSuggestion: OwnPostSuggestion | null;
}) {
  const [suggestion, setSuggestion] = useState<OwnPostSuggestion | null>(initialSuggestion);
  const [loading, setLoading] = useState(false);

  async function runSuggestion(force: boolean) {
    setLoading(true);
    try {
      const res = await fetch(`/api/own-posts/${post.id}/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "改善提案の生成に失敗しました");
      setSuggestion(body.suggestion as OwnPostSuggestion);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "改善提案の生成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/own-posts" className="mb-6 inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900">
        <ArrowLeft className="h-3.5 w-3.5" />
        一覧に戻る
      </Link>

      <div className="mb-8 rounded-lg border border-neutral-200 p-5">
        <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">{post.text}</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          <Stat label="表示回数" value={formatNumber(post.impressionCount)} />
          <Stat label="エンゲージメント率" value={formatPercent(post.metrics.engagementRate)} />
          <Stat label="いいね" value={formatNumber(post.likeCount)} />
          <Stat label="リポスト" value={formatNumber(post.repostCount)} />
          <Stat label="返信" value={formatNumber(post.replyCount)} />
          <Stat label="文字数" value={String(Array.from(post.text).length)} />
        </div>
        {post.url && (
          <a href={post.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700">
            Xで見る <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {!suggestion ? (
        <div className="rounded-lg border border-dashed border-neutral-200 py-16 text-center">
          <Button onClick={() => runSuggestion(false)} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            改善提案を実行
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-neutral-700">改善提案</h2>
            <Button variant="ghost" size="sm" onClick={() => runSuggestion(true)} disabled={loading}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              再生成
            </Button>
          </div>
          {suggestion.result.improvements.map((improvement, i) => (
            <Card key={i} className="border-neutral-200">
              <CardContent className="flex gap-3 pt-6">
                <Lightbulb className="h-4 w-4 shrink-0 text-neutral-400" />
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-neutral-900">{improvement.issue}</p>
                  <p className="text-neutral-700">{improvement.suggestion}</p>
                  <p className="text-xs text-neutral-500">期待できる効果: {improvement.expectedImpact}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="text-sm font-medium text-neutral-900">{value}</p>
    </div>
  );
}
