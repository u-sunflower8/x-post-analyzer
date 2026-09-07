import Papa from 'papaparse';
import type { ExtractedPostRow } from '../types';

export function buildCsv(rows: ExtractedPostRow[]): string {
  const data = rows.map((row) => ({
    'tweet text': row.text ?? '',
    time: row.createdAt ?? '',
    impressions: row.impressions ?? '',
    retweets: row.retweets ?? '',
    likes: row.likes ?? '',
  }));
  return Papa.unparse(data);
}
