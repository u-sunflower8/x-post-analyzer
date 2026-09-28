"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function FetchFromXDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleFetch() {
    if (!username.trim()) {
      toast.error("ユーザー名を入力してください");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/own-posts/fetch-x", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "取得に失敗しました");
      toast.success(`${body.count}件の投稿を取得しました（表示回数は別途補完してください）`);
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Download className="h-4 w-4" />
          Xから自動取得
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xから自動取得</DialogTitle>
          <DialogDescription>
            自分のユーザー名を指定すると、本文・いいね・リポスト・返信・投稿日時をX
            APIから自動取得します。表示回数（インプレッション）は非公開指標のため取得できません。
          </DialogDescription>
        </DialogHeader>

        <div>
          <Label htmlFor="username" className="mb-1.5 text-xs text-muted-foreground">
            ユーザー名（@なし）
          </Label>
          <Input id="username" placeholder="例: yuko_sunflower" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <DialogFooter>
          <Button onClick={handleFetch} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            取得
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
