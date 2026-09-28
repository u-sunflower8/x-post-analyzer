export interface PostRow {
  id: string;
  author_id: string | null;
  author_username: string | null;
  author_name: string | null;
  author_followers_count: number | null;
  text: string;
  posted_at: string | null;
  like_count: number;
  repost_count: number;
  reply_count: number;
  quote_count: number;
  impression_count: number | null;
  engagement_score: number;
  like_rate: number;
  repost_rate: number;
  reply_rate: number;
  url: string;
  fetched_at: string;
}

export interface AnalysisRow {
  id: string;
  post_id: string;
  model: string;
  result: Record<string, unknown>;
  structure_abstract: Record<string, unknown>;
  created_at: string;
}

export interface GeneratedIdeaRow {
  id: string;
  analysis_id: string;
  genre: string;
  idea_text: string;
  created_at: string;
}

export interface OwnPostRow {
  id: string;
  source: "x_api" | "csv" | "screenshot" | "manual";
  text: string;
  posted_at: string | null;
  url: string | null;
  like_count: number;
  repost_count: number;
  reply_count: number;
  quote_count: number;
  impression_count: number | null;
  url_click_count: number | null;
  permalink_click_count: number | null;
  detail_expand_count: number | null;
  app_open_count: number | null;
  app_install_count: number | null;
  follow_count: number | null;
  media_view_count: number | null;
  media_engagement_count: number | null;
  is_promoted: boolean;
  theme: string | null;
  hook: string | null;
  created_at: string;
}

/** Columns written by imports. theme/hook are labelled separately and never overwritten by re-imports. */
export type OwnPostInsertRow = Omit<OwnPostRow, "created_at" | "theme" | "hook">;

export interface OwnPostSuggestionRow {
  id: string;
  own_post_id: string;
  result: Record<string, unknown>;
  created_at: string;
}

export interface OwnPostAnalysisRow {
  id: string;
  result: Record<string, unknown>;
  created_at: string;
}

export interface OwnPostDraftRow {
  id: string;
  analysis_id: string;
  result: Record<string, unknown>;
  created_at: string;
}
