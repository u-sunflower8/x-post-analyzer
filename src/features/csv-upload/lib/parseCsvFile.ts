import Papa from 'papaparse';
import { normalizeHeaderName } from './normalizeHeaders';

export function parseCsvFile(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeaderName,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error),
    });
  });
}
