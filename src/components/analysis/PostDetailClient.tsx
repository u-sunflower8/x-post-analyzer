"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreBadge } from "@/components/posts/ScoreBadge";
import { AnalysisPanel } from "./AnalysisPanel";
import { GenerateForm } from "@/components/generate/GenerateForm";
import type { Post } from "@/types/post";
import type { AnalysisWithAbstract } from "@/lib/supabase/mappers";

export function PostDetailClient({
  post,
  initialAnalysis,
}: {
  post: Post;
  initialAnalysis: AnalysisWithAbstract | null;
}) {
  const [analysis, setAnalysis] = useState<AnalysisWithAbstract | null>(initialAnalysis);
  const [loading, setLoading] = useState(false);

  async function runAnalysis(force: boolean) {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, force }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "分析に失敗しました");
      setAnalysis(body.analysis as AnalysisWithAbstract);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "分析に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        検索に戻る
      </Link>

      <div className="mb-8 rounded-lg border border-neutral-200 p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-neutral-900">{post.authorName}</p>
            <p className="text-xs text-neutral-400">
              @{post.authorUsername}
              {post.authorFollowersCount !== null && ` ・ ${post.authorFollowersCount.toLocaleString()}フォロワー`}
            </p>
          </div>
          <ScoreBadge score={post.engagementScore} />
        </div>
        <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">{post.text}</p>
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>
            いいね {post.likeCount.toLocaleString()} ・ リポスト {post.repostCount.toLocaleString()} ・ 返信{" "}
            {post.replyCount.toLocaleString()}
          </span>
          <a href={post.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-neutral-700">
            Xで見る <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {!analysis ? (
        <div className="rounded-lg border border-dashed border-neutral-200 py-16 text-center">
          <Button onClick={() => runAnalysis(false)} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            AI分析を実行
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="analysis">
          <div className="mb-4 flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="analysis">AI分析</TabsTrigger>
              <TabsTrigger value="generate">オリジナル投稿案</TabsTrigger>
            </TabsList>
            <Button variant="ghost" size="sm" onClick={() => runAnalysis(true)} disabled={loading}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              再分析
            </Button>
          </div>
          <TabsContent value="analysis">
            <AnalysisPanel analysis={analysis.result} />
          </TabsContent>
          <TabsContent value="generate">
            <GenerateForm analysisId={analysis.id} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
