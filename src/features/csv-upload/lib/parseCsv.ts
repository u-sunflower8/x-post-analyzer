import type { Post } from '@/shared/types/post';
import type { ColumnMapping, CsvParseResult, CsvValidationIssue } from '@/shared/types/csv';
import { parseCsvFile } from './parseCsvFile';
import { COLUMN_ALIASES, getRawValue, mapRowToPost } from './normalizeHeaders';
import { validatePost } from './validatePost';

function detectColumns(headers: string[]): ColumnMapping[] {
  return headers.map((csvHeader) => {
    const field = (Object.keys(COLUMN_ALIASES) as (keyof typeof COLUMN_ALIASES)[]).find((f) =>
      COLUMN_ALIASES[f].includes(csvHeader),
    );
    return { csvHeader, field: field === 'promoted' ? null : (field ?? null) };
  });
}

export async function parseCsv(file: File): Promise<CsvParseResult> {
  const rows = await parseCsvFile(file);
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  const detectedColumns = detectColumns(headers);

  const posts: Post[] = [];
  const rejectedRows: CsvValidationIssue[] = [];

  rows.forEach((row, rowIndex) => {
    const { post, hasAnyEngagementField } = mapRowToPost(row);
    const rawTimestampPresent = getRawValue(row, 'createdAt') !== undefined;
    const reason = validatePost(post, hasAnyEngagementField, rawTimestampPresent);

    if (reason) {
      rejectedRows.push({ rowIndex, reason });
      return;
    }
    posts.push(post);
  });

  return {
    posts,
    totalRows: rows.length,
    acceptedRows: posts.length,
    rejectedRows,
    detectedColumns,
  };
}
