"use client";

import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PostTable } from "@/components/posts/PostTable";
import type { Post, SearchParams } from "@/types/post";

const initialParams: SearchParams = {
  keyword: "",
  minLikes: 100,
  minReposts: undefined,
  minReplies: undefined,
  minFollowers: undefined,
  maxResults: 30,
};

export function SearchDashboard() {
  const [params, setParams] = useState<SearchParams>(initialParams);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  function updateField<K extends keyof SearchParams>(key: K, value: SearchParams[K]) {
    setParams((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!params.keyword.trim()) {
      toast.error("キーワードを入力してください");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "検索に失敗しました");
      setPosts(body.posts as Post[]);
      setHasSearched(true);
      if (body.posts.length === 0) {
        toast.info("条件に一致する投稿が見つかりませんでした");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "検索に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">投稿検索</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          条件を指定してXの投稿を検索し、エンゲージメントスコアでランキングします。
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-lg border border-border bg-card p-5"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-4">
            <Label htmlFor="keyword" className="mb-1.5 text-xs text-muted-foreground">
              キーワード
            </Label>
            <Input
              id="keyword"
              placeholder="例: 副業 個人開発"
              value={params.keyword}
              onChange={(e) => updateField("keyword", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="minLikes" className="mb-1.5 text-xs text-muted-foreground">
              最低いいね数
            </Label>
            <Input
              id="minLikes"
              type="number"
              min={0}
              value={params.minLikes ?? ""}
              onChange={(e) => updateField("minLikes", numOrUndefined(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="minReposts" className="mb-1.5 text-xs text-muted-foreground">
              最低リポスト数
            </Label>
            <Input
              id="minReposts"
              type="number"
              min={0}
              value={params.minReposts ?? ""}
              onChange={(e) => updateField("minReposts", numOrUndefined(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="minReplies" className="mb-1.5 text-xs text-muted-foreground">
              最低返信数
            </Label>
            <Input
              id="minReplies"
              type="number"
              min={0}
              value={params.minReplies ?? ""}
              onChange={(e) => updateField("minReplies", numOrUndefined(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="minFollowers" className="mb-1.5 text-xs text-muted-foreground">
              投稿者フォロワー数下限
            </Label>
            <Input
              id="minFollowers"
              type="number"
              min={0}
              value={params.minFollowers ?? ""}
              onChange={(e) => updateField("minFollowers", numOrUndefined(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="startTime" className="mb-1.5 text-xs text-muted-foreground">
              検索期間（開始）
            </Label>
            <Input
              id="startTime"
              type="date"
              value={params.startTime?.slice(0, 10) ?? ""}
              onChange={(e) =>
                updateField("startTime", e.target.value ? `${e.target.value}T00:00:00Z` : undefined)
              }
            />
          </div>
          <div>
            <Label htmlFor="endTime" className="mb-1.5 text-xs text-muted-foreground">
              検索期間（終了）
            </Label>
            <Input
              id="endTime"
              type="date"
              value={params.endTime?.slice(0, 10) ?? ""}
              onChange={(e) =>
                updateField("endTime", e.target.value ? `${e.target.value}T23:59:59Z` : undefined)
              }
            />
          </div>
          <div>
            <Label htmlFor="maxResults" className="mb-1.5 text-xs text-muted-foreground">
              最大取得件数
            </Label>
            <Input
              id="maxResults"
              type="number"
              min={10}
              max={100}
              value={params.maxResults ?? 30}
              onChange={(e) => updateField("maxResults", numOrUndefined(e.target.value) ?? 30)}
            />
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground/80">
          ※ X API の仕様上、検索期間は直近7日以内に限られます。
        </p>

        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            検索
          </Button>
        </div>
      </form>

      {hasSearched && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-secondary-foreground">
              検索結果（{posts.length}件・エンゲージメントスコア順）
            </h2>
          </div>
          <PostTable posts={posts} />
        </div>
      )}
    </div>
  );
}

function numOrUndefined(value: string): number | undefined {
  if (value === "") return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}
