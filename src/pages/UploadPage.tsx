import { UploadDropzone } from '@/features/csv-upload/components/UploadDropzone';
import { ValidationSummary } from '@/features/csv-upload/components/ValidationSummary';
import { useCsvUpload } from '@/features/csv-upload/hooks/useCsvUpload';

export function UploadPage() {
  const { isParsing, result, error, uploadFile } = useCsvUpload();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">CSVアップロード</h1>
        <p className="text-sm text-muted-foreground">
          Xアナリティクスからエクスポートした投稿CSVを読み込みます
        </p>
      </div>

      <UploadDropzone isParsing={isParsing} onFileSelected={uploadFile} />

      {error && <p className="text-sm text-destructive">{error}</p>}
      {result && <ValidationSummary result={result} />}
    </div>
  );
}
