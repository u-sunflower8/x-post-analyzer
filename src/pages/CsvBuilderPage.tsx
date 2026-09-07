import { useRef } from 'react';
import { Download, FileUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScreenshotImport } from '@/features/csv-builder/hooks/useScreenshotImport';
import { ScreenshotDropzone } from '@/features/csv-builder/components/ScreenshotDropzone';
import { ExtractedPostsTable } from '@/features/csv-builder/components/ExtractedPostsTable';
import { buildCsv } from '@/features/csv-builder/lib/toCsv';
import { downloadCsv } from '@/features/csv-builder/lib/downloadCsv';

export function CsvBuilderPage() {
  const { rows, addFiles, importCsv, updateRow, removeRow, clearAll } = useScreenshotImport();
  const exportableRows = rows.filter((row) => row.status !== 'processing');
  const csvInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = () => {
    downloadCsv(buildCsv(exportableRows), `posts-${Date.now()}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">CSV作成</h1>
          <p className="text-sm text-muted-foreground">
            投稿のスクリーンショットをアップロードすると、AIが本文・投稿日時・数値を読み取ります。
            内容を確認・修正してからCSVをダウンロードし、CSVアップロード画面から取り込んでください。
          </p>
        </div>
        <div>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importCsv(file);
              e.target.value = '';
            }}
          />
          <Button variant="outline" onClick={() => csvInputRef.current?.click()}>
            <FileUp />
            既存のCSVに追加する
          </Button>
        </div>
      </div>

      <ScreenshotDropzone onFilesSelected={addFiles} />

      {rows.length > 0 && (
        <>
          <ExtractedPostsTable rows={rows} onUpdate={updateRow} onRemove={removeRow} />
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownload} disabled={exportableRows.length === 0}>
              <Download />
              CSVをダウンロード
            </Button>
            <Button variant="outline" onClick={clearAll}>
              <Trash2 />
              すべてクリア
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
