"use client";

import { useState } from "react";
import { CheckCircle2, CircleAlert, CircleDot, Copy, Heart, Loader2, Repeat2, Search, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { THEME_LABELS } from "@/lib/own-posts/themes";
import type { CheckStatus, DraftCheckResult } from "@/lib/own-posts/draft-check";
import type { ImproveDraftResponse } from "@/lib/openai/schemas";
import type { OwnPostTheme } from "@/types/own-post";

const AUTO = "auto";
const UNSET = "unset";
const HOURS = Array.from({ length: 24 }, (_, h) => h);

const STATUS_STYLE: Record<CheckStatus, { icon: typeof CheckCircle2; className: string; label: string }> = {
  good: { icon: CheckCircle2, className: "text-chart-3", label: "良い" },
  ok: { icon: CircleDot, className: "text-star", label: "まずまず" },
  improve: { icon: CircleAlert, className: "text-chart-2", label: "改善" },
};

function scoreLabel(score: number): string {
  if (score >= 75) return "伸びやすい形です";
  if (score >= 50) return "あと一歩です";
  return "改善の余地があります";
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "numeric", day: "numeric" });
}

export function DraftCheckClient() {
  const [text, setText] = useState("");
  const [theme, setTheme] = useState<OwnPostTheme | typeof AUTO>(AUTO);
  const [hour, setHour] = useState<string>(UNSET);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<DraftCheckResult | null>(null);
  const [improving, setImproving] = useState(false);
  const [improvement, setImprovement] = useState<ImproveDraftResponse | null>(null);

  function requestBody(draft: string) {
    return JSON.stringify({
      text: draft,
      theme: theme === AUTO ? null : theme,
      scheduledHour: hour === UNSET ? null : Number(hour),
    });
  }

  async function runCheck(draft = text) {
    setChecking(true);
    try {
      const res = await fetch("/api/draft-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody(draft),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "チェックに失敗しました");
      setResult(body as DraftCheckResult);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "チェックに失敗しました");
    } finally {
      setChecking(false);
    }
  }

  async function runImprove() {
    setImproving(true);
    try {
      const res = await fetch("/api/draft-check/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody(text),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "改善案の作成に失敗しました");
      setImprovement(body as ImproveDraftResponse);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "改善案の作成に失敗しました");
    } finally {
      setImproving(false);
    }
  }

  async function copyToClipboard(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("コピーしました");
    } catch {
      toast.error("コピーに失敗しました");
    }
  }

  function applyRewrite(value: string) {
    setText(value);
    setImprovement(null);
    void runCheck(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const length = Array.from(text.trim()).length;

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardContent className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"ここに投稿案を入力してください\n\n例）株クラのみなさんに聞きたい！\n今100万円あったら、一括で入れる？積立にする？"}
            rows={8}
            className="bg-white text-sm leading-relaxed"
            aria-label="投稿案"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select value={theme} onValueChange={(v) => setTheme(v as OwnPostTheme | typeof AUTO)}>
              <SelectTrigger className="min-w-44 bg-white" aria-label="テーマ">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AUTO}>テーマ：自動で判定</SelectItem>
                {(Object.keys(THEME_LABELS) as OwnPostTheme[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    テーマ：{THEME_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={hour} onValueChange={setHour}>
              <SelectTrigger className="min-w-40 bg-white" aria-label="投稿予定時刻">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNSET}>投稿時間：未定</SelectItem>
                {HOURS.map((h) => (
                  <SelectItem key={h} value={String(h)}>
                    投稿時間：{h}時台
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">{length}字</span>
            <Button className="ml-auto" onClick={() => runCheck()} disabled={checking || length === 0}>
              {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              チェックする
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            チェックは、あなたの過去の投稿の実績と比べて行います。AIは使わないので無料です。
          </p>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card className="border-border">
            <CardContent className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">バズりやすさ（目安）</p>
                <p className="text-4xl font-bold text-primary">
                  {result.score}
                  <span className="ml-1 text-base font-medium text-muted-foreground">/ 100</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{scoreLabel(result.score)}</p>
                <p className="text-xs text-muted-foreground">
                  テーマ：{result.theme ? THEME_LABELS[result.theme] : "判定できず"}
                  {result.themeGuessed && result.theme && "（自動判定。違う場合は上で選び直してください）"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">チェック項目</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {result.checks.map((check) => {
                  const style = STATUS_STYLE[check.status];
                  const Icon = style.icon;
                  return (
                    <li key={check.id} className="flex gap-3">
                      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.className}`} aria-label={style.label} />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {check.label}
                          <span className={`ml-2 text-xs ${style.className}`}>{style.label}</span>
                        </p>
                        <p className="text-sm text-secondary-foreground">{check.message}</p>
                        {check.evidence && <p className="text-xs text-muted-foreground">根拠：{check.evidence}</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                ほかに効くこと：9月までの分析では、投稿の前日にリプ回りを50件以上した日は、バズる確率が約2.5倍でした。
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">似ている過去の投稿</CardTitle>
            </CardHeader>
            <CardContent>
              {result.similar.length === 0 ? (
                <p className="text-sm text-muted-foreground">似ている投稿は見つかりませんでした。新しい切り口の投稿です。</p>
              ) : (
                <ul className="divide-y divide-border">
                  {result.similar.map((post) => (
                    <li key={post.id} className="space-y-1 py-3 first:pt-0 last:pb-0">
                      <p className="line-clamp-3 text-sm text-foreground">{post.text}</p>
                      <p className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>{formatDate(post.postedAt)}</span>
                        <span className="inline-flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.likeCount}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Repeat2 className="h-3 w-3" />
                          {post.repostCount}
                        </span>
                        {post.relativeScore !== null && <span>自分比 {post.relativeScore.toFixed(2)}倍</span>}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">AIで改善案を作る</p>
                  <p className="text-xs text-muted-foreground">
                    チェック結果とあなたの伸びた投稿をもとに、書き直し案を3つ作ります。OpenAIを使うので、1回ごとに料金が少しかかります（1円未満の見込み）。
                  </p>
                </div>
                <Button variant="outline" onClick={runImprove} disabled={improving}>
                  {improving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  改善案を作る
                </Button>
              </div>

              {improvement && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-white p-4 text-sm">
                    <p className="font-medium text-foreground">{improvement.summary}</p>
                    {improvement.strengths.length > 0 && (
                      <p className="mt-2 text-secondary-foreground">良い点：{improvement.strengths.join("／")}</p>
                    )}
                    {improvement.weaknesses.length > 0 && (
                      <p className="mt-1 text-secondary-foreground">弱い点：{improvement.weaknesses.join("／")}</p>
                    )}
                  </div>
                  {improvement.rewrites.map((rewrite, i) => (
                    <div key={i} className="space-y-2 rounded-lg border border-border bg-white p-4">
                      <p className="text-xs font-medium text-primary">案{i + 1}</p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{rewrite.text}</p>
                      <p className="text-xs text-muted-foreground">変えたところ：{rewrite.point}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(rewrite.text)}>
                          <Copy className="h-3.5 w-3.5" />
                          コピー
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => applyRewrite(rewrite.text)}>
                          <Search className="h-3.5 w-3.5" />
                          この案をチェック
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
