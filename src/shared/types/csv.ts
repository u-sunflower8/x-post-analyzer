import type { Post } from './post';

export interface ColumnMapping {
  csvHeader: string;
  field: keyof Post | null;
}

export type CsvRejectionReason =
  | 'missing-text'
  | 'missing-timestamp'
  | 'missing-engagement-fields'
  | 'unparseable-timestamp';

export interface CsvValidationIssue {
  rowIndex: number;
  reason: CsvRejectionReason;
}

export interface CsvParseResult {
  posts: Post[];
  totalRows: number;
  acceptedRows: number;
  rejectedRows: CsvValidationIssue[];
  detectedColumns: ColumnMapping[];
}

export interface UploadMeta {
  fileName: string;
  uploadedAt: string;
  totalRows: number;
  acceptedRows: number;
  rejectedCount: number;
}
