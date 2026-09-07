import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { parseCsv } from '../lib/parseCsv';
import { postsStore } from '@/shared/lib/postsStore';
import { postsRepository } from '@/shared/lib/postsRepository';
import type { CsvParseResult } from '@/shared/types/csv';

interface UseCsvUploadResult {
  isParsing: boolean;
  result: CsvParseResult | null;
  error: string | null;
  uploadFile: (file: File) => Promise<void>;
}

export function useCsvUpload(): UseCsvUploadResult {
  const [isParsing, setIsParsing] = useState(false);
  const [result, setResult] = useState<CsvParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setIsParsing(true);
    setError(null);
    try {
      const parseResult = await parseCsv(file);
      setResult(parseResult);
      postsStore.setPosts(parseResult.posts);
      postsRepository.saveUploadMeta({
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        totalRows: parseResult.totalRows,
        acceptedRows: parseResult.acceptedRows,
        rejectedCount: parseResult.rejectedRows.length,
      });
      if (parseResult.acceptedRows > 0) {
        toast.success(`${parseResult.acceptedRows}件の投稿を読み込みました`);
      } else {
        toast.error('有効な投稿データが見つかりませんでした');
      }
    } catch {
      setError('CSVの読み込みに失敗しました。ファイル形式をご確認ください。');
      toast.error('CSVの読み込みに失敗しました');
    } finally {
      setIsParsing(false);
    }
  }, []);

  return { isParsing, result, error, uploadFile };
}
