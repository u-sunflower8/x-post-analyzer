import type {
  PostRow,
  AnalysisRow,
  GeneratedIdeaRow,
  OwnPostRow,
  OwnPostSuggestionRow,
  OwnPostAnalysisRow,
  OwnPostDraftRow,
} from "./types";
import type { Post } from "@/types/post";
import type { Analysis } from "@/lib/openai/schemas";
import type { OwnPost, AnalyzeResponse, SuggestResponse, GenerateOwnResponse } from "@/types/own-post";
import { isOwnPostHook, isOwnPostTheme } from "@/lib/own-posts/themes";

export function postRowToPost(row: PostRow): Post {
  return {
    id: row.id,
    authorId: row.author_id,
    authorUsername: row.author_username,
    authorName: row.author_name,
    authorFollowersCount: row.author_followers_count,
    text: row.text,
    postedAt: row.posted_at,
    likeCount: row.like_count,
    repostCount: row.repost_count,
    replyCount: row.reply_count,
    quoteCount: row.quote_count,
    impressionCount: row.impression_count,
    engagementScore: Number(row.engagement_score),
    likeRate: Number(row.like_rate),
    repostRate: Number(row.repost_rate),
    replyRate: Number(row.reply_rate),
    url: row.url,
    fetchedAt: row.fetched_at,
  };
}

export interface AnalysisWithAbstract {
  id: string;
  postId: string;
  model: string;
  result: Analysis;
  createdAt: string;
}

export function analysisRowToAnalysis(row: AnalysisRow): AnalysisWithAbstract {
  return {
    id: row.id,
    postId: row.post_id,
    model: row.model,
    result: row.result as unknown as Analysis,
    createdAt: row.created_at,
  };
}

export interface GeneratedIdea {
  id: string;
  analysisId: string;
  genre: string;
  text: string;
  createdAt: string;
}

export function ideaRowToIdea(row: GeneratedIdeaRow): GeneratedIdea {
  return {
    id: row.id,
    analysisId: row.analysis_id,
    genre: row.genre,
    text: row.idea_text,
    createdAt: row.created_at,
  };
}

export function ownPostRowToOwnPost(row: OwnPostRow): OwnPost {
  return {
    id: row.id,
    source: row.source,
    text: row.text,
    postedAt: row.posted_at,
    url: row.url,
    likeCount: row.like_count,
    repostCount: row.repost_count,
    replyCount: row.reply_count,
    quoteCount: row.quote_count,
    impressionCount: row.impression_count,
    urlClickCount: row.url_click_count,
    permalinkClickCount: row.permalink_click_count,
    detailExpandCount: row.detail_expand_count,
    appOpenCount: row.app_open_count,
    appInstallCount: row.app_install_count,
    followCount: row.follow_count,
    mediaViewCount: row.media_view_count,
    mediaEngagementCount: row.media_engagement_count,
    isPromoted: row.is_promoted,
    theme: isOwnPostTheme(row.theme) ? row.theme : null,
    hook: isOwnPostHook(row.hook) ? row.hook : null,
    createdAt: row.created_at,
  };
}

export interface OwnPostSuggestion {
  id: string;
  ownPostId: string;
  result: SuggestResponse;
  createdAt: string;
}

export function ownPostSuggestionRowToSuggestion(row: OwnPostSuggestionRow): OwnPostSuggestion {
  return {
    id: row.id,
    ownPostId: row.own_post_id,
    result: row.result as unknown as SuggestResponse,
    createdAt: row.created_at,
  };
}

export interface OwnPostAnalysis {
  id: string;
  result: AnalyzeResponse;
  createdAt: string;
}

export function ownPostAnalysisRowToAnalysis(row: OwnPostAnalysisRow): OwnPostAnalysis {
  return {
    id: row.id,
    result: row.result as unknown as AnalyzeResponse,
    createdAt: row.created_at,
  };
}

export interface OwnPostDrafts {
  id: string;
  analysisId: string;
  result: GenerateOwnResponse;
  createdAt: string;
}

export function ownPostDraftRowToDrafts(row: OwnPostDraftRow): OwnPostDrafts {
  return {
    id: row.id,
    analysisId: row.analysis_id,
    result: row.result as unknown as GenerateOwnResponse,
    createdAt: row.created_at,
  };
}
