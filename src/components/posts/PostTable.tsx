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
      <div className="rounded-lg border border-dashed border-neutral-200 py-16 text-center text-sm text-neutral-500">
        投稿が見つかりません。検索条件を変更してください。
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-neutral-50 hover:bg-neutral-50">
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
              <TableCell className="max-w-md">
                <Link href={`/posts/${post.id}`} className="block hover:underline">
                  <p className="line-clamp-3 text-sm text-neutral-800">{post.text}</p>
                </Link>
                <p className="mt-1 text-xs text-neutral-400">{formatDate(post.postedAt)}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm font-medium text-neutral-900">
                  {post.authorName ?? "-"}
                </p>
                <p className="text-xs text-neutral-400">
                  @{post.authorUsername ?? "-"} ・{" "}
                  {post.authorFollowersCount !== null
                    ? `${formatCount(post.authorFollowersCount)}フォロワー`
                    : "フォロワー数不明"}
                </p>
              </TableCell>
              <TableCell className="text-right text-sm text-neutral-700">
                <span className="inline-flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5 text-neutral-400" />
                  {formatCount(post.likeCount)}
                </span>
              </TableCell>
              <TableCell className="text-right text-sm text-neutral-700">
                <span className="inline-flex items-center gap-1">
                  <Repeat2 className="h-3.5 w-3.5 text-neutral-400" />
                  {formatCount(post.repostCount)}
                </span>
              </TableCell>
              <TableCell className="text-right text-sm text-neutral-700">
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5 text-neutral-400" />
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
                  className="text-neutral-300 hover:text-neutral-600"
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
