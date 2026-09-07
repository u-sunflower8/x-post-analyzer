import type { Post } from '@/shared/types/post';
import type { CsvRejectionReason } from '@/shared/types/csv';

export function validatePost(
  post: Post,
  hasAnyEngagementField: boolean,
  rawTimestampPresent: boolean,
): CsvRejectionReason | null {
  if (post.text.trim() === '') return 'missing-text';
  if (!rawTimestampPresent) return 'missing-timestamp';
  if (post.createdAt === '') return 'unparseable-timestamp';
  if (!hasAnyEngagementField) return 'missing-engagement-fields';
  return null;
}
