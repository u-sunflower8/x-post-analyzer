"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { normalizeHeaderName, parseOwnPostRows } from "@/lib/own-posts/csv";
import type { CsvParseResult } from "@/types/own-post";

export function CsvUploadDialog() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CsvParseResult | null>(null);

  function handleFile(file: File) {
    setLoading(true);
    setResult(null);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeaderName,
      complete: async (parsed) => {
        const parseResult = parseOwnPostRows(parsed.data);
        setResult(parseResult);

        if (parseResult.posts.length === 0) {
          setLoading(false);
          return;
        }

        try {
          const res = await fetch("/api/own-posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ posts: parseResult.posts }),
          });
          const body = await res.json();
          if (!res.ok) throw new Error(body.error ?? "保存に失敗しました");
          toast.success(`${parseResult.posts.length}件の投稿を取り込みました`);
          router.refresh();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "保存に失敗しました");
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        toast.error(error.message);
        setLoading(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4" />
          CSVアップロード
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>CSVアップロード</DialogTitle>
          <DialogDescription>
            NotionからエクスポートしたCSV（本文・投稿日時・表示回数・いいね数・リポスト数・返信数・URL）を取り込みます。
          </DialogDescription>
        </DialogHeader>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="text-sm"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {loading && (
          <p className="flex items-center gap-2 text-sm text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            処理中...
          </p>
        )}

        {result && (
          <div className="rounded-md border border-neutral-200 p-3 text-sm text-neutral-700">
            <p>
              全{result.totalRows}行中 {result.acceptedRows}件を取り込みました
              {result.rejectedRows.length > 0 && `（${result.rejectedRows.length}件は不備によりスキップ）`}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
