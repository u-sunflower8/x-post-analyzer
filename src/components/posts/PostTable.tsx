"use client";

import Link from "next/link";
import { Heart, Repeat2, MessageCircle, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScoreBadge } from "./ScoreBadge";
import type { Post } from "@/types/post";

function formatCount(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PostTable({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-white py-16 text-center text-sm text-muted-foreground">
        投稿が見つかりません。検索条件を変更してください。
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            <TableHead className="w-[42%]">投稿</TableHead>
            <TableHead>投稿者</TableHead>
            <TableHead className="text-right">いいね</TableHead>
            <TableHead className="text-right">リポスト</TableHead>
            <TableHead className="text-right">返信</TableHead>
            <TableHead className="text-right">スコア</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id} className="align-top">
              <TableCell className="max-w-md whitespace-normal">
                <Link href={`/posts/${post.id}`} className="block hover:underline">
                  <p className="line-clamp-3 text-sm text-foreground">{post.text}</p>
                </Link>
                <p className="mt-1 text-xs text-muted-foreground/80">{formatDate(post.postedAt)}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm font-medium text-foreground">
                  {post.authorName ?? "-"}
                </p>
                <p className="text-xs text-muted-foreground/80">
                  @{post.authorUsername ?? "-"} ・{" "}
                  {post.authorFollowersCount !== null
                    ? `${formatCount(post.authorFollowersCount)}フォロワー`
                    : "フォロワー数不明"}
                </p>
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
              <TableCell className="text-right">
                <ScoreBadge score={post.engagementScore} />
              </TableCell>
              <TableCell>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground/60 hover:text-secondary-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
