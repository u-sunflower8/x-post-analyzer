"use client";

import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IdeaCard } from "./IdeaCard";

export function GenerateForm({ analysisId }: { analysisId: string }) {
  const [genre, setGenre] = useState("");
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<string[]>([]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!genre.trim()) {
      toast.error("ジャンルを入力してください");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId, genre, count: 3 }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "生成に失敗しました");
      setIdeas((body.ideas as { text: string }[]).map((i) => i.text));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "生成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1">
          <Label htmlFor="genre" className="mb-1.5 text-xs text-neutral-500">
            投稿ジャンル
          </Label>
          <Input
            id="genre"
            placeholder="例: フリーランスエンジニア向け"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          投稿案を生成
        </Button>
      </form>

      {ideas.length > 0 && (
        <div className="space-y-3">
          {ideas.map((text, i) => (
            <IdeaCard key={i} text={text} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
