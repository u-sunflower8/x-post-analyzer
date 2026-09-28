"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Repeat2, MessageCircle, ExternalLink, ArrowDown, ArrowUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OwnPostHook, OwnPostTheme, OwnPostWithMetrics } from "@/types/own-post";
import { HOOK_LABELS, THEME_LABELS } from "@/lib/own-posts/themes";

function formatCount(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type SortKey = "postedAt" | "likeCount" | "repostCount";
type SortDir = "desc" | "asc";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "postedAt:desc", label: "投稿日（新しい順）" },
  { value: "postedAt:asc", label: "投稿日（古い順）" },
  { value: "likeCount:desc", label: "いいね（多い順）" },
  { value: "likeCount:asc", label: "いいね（少ない順）" },
  { value: "repostCount:desc", label: "リポスト（多い順）" },
  { value: "repostCount:asc", label: "リポスト（少ない順）" },
];

const ALL = "all";

function sortValue(post: OwnPostWithMetrics, key: SortKey): number {
  if (key === "postedAt") return post.postedAt ? new Date(post.postedAt).getTime() : 0;
  return post[key];
}

function countBy<K extends string>(
  posts: OwnPostWithMetrics[],
  keyFn: (p: OwnPostWithMetrics) => K | null | undefined,
) {
  const counts = new Map<K, number>();
  for (const p of posts) {
    const k = keyFn(p);
    if (k) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return counts;
}

function SortableHead({
  label,
  column,
  sortKey,
  sortDir,
  onSort,
}: {
  label: string;
  column: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = sortKey === column;
  const Arrow = sortDir === "desc" ? ArrowDown : ArrowUp;
  return (
    <TableHead className="text-right">
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`inline-flex items-center gap-0.5 hover:text-foreground ${active ? "text-foreground" : ""}`}
      >
        {label}
        {active && <Arrow className="h-3 w-3" />}
      </button>
    </TableHead>
  );
}

export function OwnPostTable({ posts }: { posts: OwnPostWithMetrics[] }) {
  const [theme, setTheme] = useState<OwnPostTheme | typeof ALL>(ALL);
  const [hook, setHook] = useState<OwnPostHook | typeof ALL>(ALL);
  const [sortKey, setSortKey] = useState<SortKey>("postedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const themeCounts = useMemo(() => countBy(posts, (p) => p.theme), [posts]);
  const hookCounts = useMemo(() => countBy(posts, (p) => p.hook), [posts]);

  const visible = useMemo(() => {
    const filtered = posts.filter((p) => (theme === ALL || p.theme === theme) && (hook === ALL || p.hook === hook));
    const sign = sortDir === "desc" ? -1 : 1;
    return [...filtered].sort((a, b) => sign * (sortValue(a, sortKey) - sortValue(b, sortKey)));
  }, [posts, theme, hook, sortKey, sortDir]);

  // Clicking a column header sorts by it (many first); clicking again flips the order.
  function handleHeaderSort(key: SortKey) {
    if (key === sortKey) setSortDir(sortDir === "desc" ? "asc" : "desc");
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const filtered = theme !== ALL || hook !== ALL;

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-white py-16 text-center text-sm text-muted-foreground">
        投稿がまだありません。Xから自動取得するか、CSV/スクショから追加してください。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={theme} onValueChange={(v) => setTheme(v as OwnPostTheme | typeof ALL)}>
          <SelectTrigger className="min-w-44 bg-white" aria-label="テーマで絞り込み">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>テーマ：すべて</SelectItem>
            {(Object.keys(THEME_LABELS) as OwnPostTheme[]).map((t) => (
              <SelectItem key={t} value={t}>
                {THEME_LABELS[t]}（{themeCounts.get(t) ?? 0}）
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={hook} onValueChange={(v) => setHook(v as OwnPostHook | typeof ALL)}>
          <SelectTrigger className="min-w-44 bg-white" aria-label="1行目の型で絞り込み">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>1行目の型：すべて</SelectItem>
            {(Object.keys(HOOK_LABELS) as OwnPostHook[]).map((h) => (
              <SelectItem key={h} value={h}>
                {HOOK_LABELS[h]}（{hookCounts.get(h) ?? 0}）
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={`${sortKey}:${sortDir}`}
          onValueChange={(v) => {
            const [key, dir] = v.split(":") as [SortKey, SortDir];
            setSortKey(key);
            setSortDir(dir);
          }}
        >
          <SelectTrigger className="min-w-44 bg-white" aria-label="並び替え">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {filtered ? `${visible.length}件 / 全${posts.length}件` : `全${posts.length}件`}
        </span>
        {filtered && (
          <button
            type="button"
            onClick={() => {
              setTheme(ALL);
              setHook(ALL);
            }}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            絞り込みを解除
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/60 hover:bg-muted/60">
              <TableHead className="w-[42%]">投稿</TableHead>
              <SortableHead
                label="いいね"
                column="likeCount"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleHeaderSort}
              />
              <SortableHead
                label="リポスト"
                column="repostCount"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleHeaderSort}
              />
              <TableHead className="text-right">返信</TableHead>
              <TableHead className="text-right">表示回数</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  条件に合う投稿がありません。
                </TableCell>
              </TableRow>
            )}
            {visible.map((post) => (
              <TableRow key={post.id} className="align-top">
                <TableCell className="max-w-md whitespace-normal">
                  <Link href={`/own-posts/${post.id}`} className="block hover:underline">
                    <p className="line-clamp-3 text-sm text-foreground">{post.text}</p>
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground/80">
                    <span>{formatDate(post.postedAt)}</span>
                    {post.theme && (
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-secondary-foreground">
                        {THEME_LABELS[post.theme]}
                      </span>
                    )}
                    {post.hook && (
                      <span className="rounded border border-border px-1.5 py-0.5 text-muted-foreground">
                        {HOOK_LABELS[post.hook]}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm text-secondary-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5 text-muted-foreground/80" />
                    {formatCount(post.likeCount)}
                  </span>
                </TableCell>
                <TableCell className="text-right text-sm text-secondary-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Repeat2 className="h-3.5 w-3.5 text-muted-foreground/80" />
                    {formatCount(post.repostCount)}
                  </span>
                </TableCell>
                <TableCell className="text-right text-sm text-secondary-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5 text-muted-foreground/80" />
                    {formatCount(post.replyCount)}
                  </span>
                </TableCell>
                <TableCell className="text-right text-sm text-secondary-foreground">
                  {post.impressionCount !== null ? formatCount(post.impressionCount) : "—"}
                </TableCell>
                <TableCell>
                  {post.url && (
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground/60 hover:text-secondary-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
