export type ExtractionStatus = 'processing' | 'done' | 'error';

export interface ExtractedPostRow {
  id: string;
  fileName: string;
  status: ExtractionStatus;
  errorMessage?: string;
  text: string | null;
  createdAt: string | null;
  impressions: number | null;
  retweets: number | null;
  likes: number | null;
  bookmarks: number | null;
}
