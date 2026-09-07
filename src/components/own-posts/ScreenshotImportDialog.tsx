"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { OwnPost } from "@/types/own-post";

interface ReviewRow {
  id: string;
  status: "processing" | "done" | "error";
  errorMessage?: string;
  text: string;
  createdAt: string;
  impressions: string;
  retweets: string;
  likes: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ScreenshotImportDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [saving, setSaving] = useState(false);

  async function handleFiles(files: FileList) {
    for (const file of Array.from(files)) {
      const id = crypto.randomUUID();
      setRows((prev) => [...prev, { id, status: "processing", text: "", createdAt: "", impressions: "", retweets: "", likes: "" }]);

      try {
        const base64 = await fileToBase64(file);
        const res = await fetch("/api/own-posts/extract-screenshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type || "image/png" }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "読み取りに失敗しました");

        const extracted = body.extracted as {
          text: string | null;
          createdAt: string | null;
          impressions: number | null;
          retweets: number | null;
          likes: number | null;
        };

        setRows((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: "done",
                  text: extracted.text ?? "",
                  createdAt: extracted.createdAt ?? "",
                  impressions: extracted.impressions?.toString() ?? "",
                  retweets: extracted.retweets?.toString() ?? "",
                  likes: extracted.likes?.toString() ?? "",
                }
              : r,
          ),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "読み取りに失敗しました";
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "error", errorMessage: message } : r)));
        toast.error(message);
      }
    }
  }

  function updateRow(id: string, patch: Partial<ReviewRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleSave() {
    const validRows = rows.filter((r) => r.status === "done" && r.text.trim() !== "");
    if (validRows.length === 0) {
      toast.error("保存できる投稿がありません");
      return;
    }

    setSaving(true);
    try {
      const posts: OwnPost[] = validRows.map((r) => ({
        id: crypto.randomUUID(),
        source: "screenshot",
        text: r.text,
        postedAt: r.createdAt ? new Date(r.createdAt.replace(" ", "T")).toISOString() : null,
        url: null,
        likeCount: Number(r.likes) || 0,
        repostCount: Number(r.retweets) || 0,
        replyCount: 0,
        quoteCount: 0,
        impressionCount: r.impressions ? Number(r.impressions) : null,
        urlClickCount: null,
        permalinkClickCount: null,
        detailExpandCount: null,
        appOpenCount: null,
        appInstallCount: null,
        followCount: null,
        mediaViewCount: null,
        mediaEngagementCount: null,
        isPromoted: false,
        createdAt: new Date().toISOString(),
      }));

      const res = await fetch("/api/own-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "保存に失敗しました");

      toast.success(`${posts.length}件の投稿を保存しました`);
      setRows([]);
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Camera className="h-4 w-4" />
          スクショから追加
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>スクリーンショットから追加</DialogTitle>
          <DialogDescription>
            投稿のスクリーンショットをアップロードすると、AIが本文・投稿日時・表示回数・リポスト数・いいね数を読み取ります。内容を確認・修正してから保存してください。
          </DialogDescription>
        </DialogHeader>

        <input
          type="file"
          accept="image/*"
          multiple
          className="text-sm"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />

        <div className="space-y-4">
          {rows.map((row) => (
            <div key={row.id} className="rounded-md border border-neutral-200 p-3">
              {row.status === "processing" && (
                <p className="flex items-center gap-2 text-sm text-neutral-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  読み取り中...
                </p>
              )}
              {row.status === "error" && <p className="text-sm text-red-600">{row.errorMessage}</p>}
              {row.status === "done" && (
                <div className="space-y-2">
                  <Textarea value={row.text} onChange={(e) => updateRow(row.id, { text: e.target.value })} rows={2} />
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label className="mb-1 text-xs text-neutral-500">投稿日時</Label>
                      <Input
                        value={row.createdAt}
                        placeholder="YYYY-MM-DD HH:mm"
                        onChange={(e) => updateRow(row.id, { createdAt: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="mb-1 text-xs text-neutral-500">表示回数</Label>
                      <Input value={row.impressions} onChange={(e) => updateRow(row.id, { impressions: e.target.value })} />
                    </div>
                    <div>
                      <Label className="mb-1 text-xs text-neutral-500">リポスト</Label>
                      <Input value={row.retweets} onChange={(e) => updateRow(row.id, { retweets: e.target.value })} />
                    </div>
                    <div>
                      <Label className="mb-1 text-xs text-neutral-500">いいね</Label>
                      <Input value={row.likes} onChange={(e) => updateRow(row.id, { likes: e.target.value })} />
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeRow(row.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                    削除
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={saving || rows.every((r) => r.status !== "done")}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
