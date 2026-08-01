import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { ApiRequestError } from '@/shared/lib/apiClient';
import { extractPostFromImage } from '../api/client';
import { fileToBase64 } from '../lib/fileToBase64';
import { parseExistingCsv } from '../lib/parseExistingCsv';
import type { ExtractedPostRow } from '../types';

let rowIdCounter = 0;

function toMimeType(file: File): 'image/png' | 'image/jpeg' | 'image/webp' {
  if (file.type === 'image/jpeg' || file.type === 'image/webp') return file.type;
  return 'image/png';
}

export function useScreenshotImport() {
  const [rows, setRows] = useState<ExtractedPostRow[]>([]);

  const addFiles = useCallback(async (files: File[]) => {
    const newRows: ExtractedPostRow[] = files.map((file) => ({
      id: `row-${(rowIdCounter += 1)}`,
      fileName: file.name,
      status: 'processing',
      text: null,
      createdAt: null,
      impressions: null,
      retweets: null,
      likes: null,
      bookmarks: null,
    }));
    setRows((prev) => [...prev, ...newRows]);

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const rowId = newRows[i].id;
      try {
        const base64 = await fileToBase64(file);
        const result = await extractPostFromImage(base64, toMimeType(file));
        setRows((prev) =>
          prev.map((row) => (row.id === rowId ? { ...row, ...result, status: 'done' } : row)),
        );
      } catch (error) {
        const message =
          error instanceof ApiRequestError ? error.message : '読み取りに失敗しました。';
        setRows((prev) =>
          prev.map((row) =>
            row.id === rowId ? { ...row, status: 'error', errorMessage: message } : row,
          ),
        );
        toast.error(`${file.name}: ${message}`);
      }
    }
  }, []);

  const importCsv = useCallback(async (file: File) => {
    try {
      const imported = await parseExistingCsv(file);
      if (imported.length === 0) {
        toast.error('CSVから有効な行が見つかりませんでした');
        return;
      }
      setRows((prev) => [...imported, ...prev]);
      toast.success(`${imported.length}件を読み込みました`);
    } catch {
      toast.error('CSVの読み込みに失敗しました。ファイル形式をご確認ください。');
    }
  }, []);

  const updateRow = useCallback((id: string, patch: Partial<ExtractedPostRow>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }, []);

  const removeRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }, []);

  const clearAll = useCallback(() => setRows([]), []);

  return { rows, addFiles, importCsv, updateRow, removeRow, clearAll };
}
