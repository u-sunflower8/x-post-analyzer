import Papa from 'papaparse';
import { normalizeHeaderName, getRawValue } from '@/features/csv-upload/lib/normalizeHeaders';
import type { ExtractedPostRow } from '../types';

function toNumber(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  const cleaned = raw.replace(/[,%]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

let importedRowIdCounter = 0;

export function parseExistingCsv(file: File): Promise<ExtractedPostRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeaderName,
      complete: (results) => {
        const rows: ExtractedPostRow[] = results.data.map((row) => ({
          id: `existing-${(importedRowIdCounter += 1)}`,
          fileName: file.name,
          status: 'done',
          text: getRawValue(row, 'text') ?? null,
          createdAt: getRawValue(row, 'createdAt') ?? null,
          impressions: toNumber(getRawValue(row, 'impressions')),
          retweets: toNumber(getRawValue(row, 'retweets')),
          likes: toNumber(getRawValue(row, 'likes')),
          bookmarks: null,
        }));
        resolve(rows);
      },
      error: (error) => reject(error),
    });
  });
}
