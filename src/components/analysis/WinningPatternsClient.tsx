"use client";

import { useState } from "react";
import { Clock, FileText, LayoutTemplate, Heart, TrendingUp, Loader2, Sparkles, Wand2, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { WINNING_PATTERN_CATEGORY_LABELS } from "@/lib/openai/labels";
import type { AnalyzeResponse, PostDraft, WinningPatternCategory } from "@/types/own-post";
import type { OwnPostAnalysis } from "@/lib/db/mappers";

const CATEGORY_ICONS: Record<WinningPatternCategory, typeof Clock> = {
  timing: Clock,
  content: FileText,
  format: LayoutTemplate,
  engagement: Heart,
  growth: TrendingUp,
};

export function WinningPatternsClient({ initialAnalysis }: { initialAnalysis: OwnPostAnalysis | null }) {
  const [analysis, setAnalysis] = useState<OwnPostAnalysis | null>(initialAnalysis);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [drafts, setDrafts] = useState<PostDraft[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);

  async function runAnalysis(force: boolean) {
    setLoadingAnalysis(true);
    try {
      const res = await fetch("/api/own-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "分析に失敗しました");
      setAnalysis(body.analysis as OwnPostAnalysis);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "分析に失敗しました");
    } finally {
      setLoadingAnalysis(false);
    }
  }

  async function runGenerate(force: boolean) {
    if (!analysis) return;
    setLoadingDrafts(true);
    try {
      const res = await fetch("/api/own-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId: analysis.id, force }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "生成に失敗しました");
      setDrafts(body.drafts as PostDraft[]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "生成に失敗しました");
    } finally {
      setLoadingDrafts(false);
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("コピーしました");
    } catch {
      toast.error("コピーに失敗しました");
    }
  }

  const insights: AnalyzeResponse["insights"] = analysis?.result.insights ?? [];

  return (
    <div className="space-y-6">
      {insights.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <Button onClick={() => runAnalysis(false)} disabled={loadingAnalysis}>
            {loadingAnalysis ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            分析を実行
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-secondary-foreground">勝ちパターン</h2>
            <Button variant="ghost" size="sm" onClick={() => runAnalysis(true)} disabled={loadingAnalysis}>
              {loadingAnalysis ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              再分析
            </Button>
          </div>
          {insights.map((insight) => {
            const Icon = CATEGORY_ICONS[insight.category];
            const categoryLabel = WINNING_PATTERN_CATEGORY_LABELS[insight.category]?.label ?? insight.category;
            return (
              <Card key={insight.id} className="border-border">
                <CardContent className="space-y-2 pt-6">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <Icon className="h-3 w-3" />
                      {categoryLabel}
                    </Badge>
                    <p className="text-sm font-medium text-foreground">{insight.title}</p>
                  </div>
                  <p className="text-sm text-secondary-foreground">{insight.description}</p>
                  <p className="text-xs text-muted-foreground">根拠: {insight.evidence}</p>
                </CardContent>
              </Card>
            );
          })}

          <div className="rounded-lg border border-border p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-secondary-foreground">この勝ちパターンから投稿案を作る</h3>
              <Button onClick={() => runGenerate(drafts.length > 0)} disabled={loadingDrafts} size="sm">
                {loadingDrafts ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                {drafts.length > 0 ? "再生成" : "生成"}
              </Button>
            </div>

            {drafts.length > 0 && (
              <div className="space-y-3">
                {drafts.map((draft) => (
                  <Card key={draft.id} className="border-border">
                    <CardContent className="space-y-2 pt-6">
                      <p className="whitespace-pre-wrap text-sm text-foreground">{draft.text}</p>
                      <p className="text-xs text-muted-foreground">根拠: {draft.rationale}</p>
                      <p className="text-xs text-muted-foreground/80">活用パターン: {draft.basedOnPattern}</p>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(draft.text)}>
                        <Copy className="h-3.5 w-3.5" />
                        コピー
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
