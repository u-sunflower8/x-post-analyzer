import { getSql } from "./client";
import type {
  PostRow,
  AnalysisRow,
  GeneratedIdeaRow,
  OwnPostRow,
  OwnPostSuggestionRow,
  OwnPostAnalysisRow,
  OwnPostDraftRow,
} from "./types";

// posts

export async function listPosts(limit: number): Promise<PostRow[]> {
  const sql = getSql();
  return (await sql`select * from posts order by engagement_score desc limit ${limit}`) as unknown as PostRow[];
}

export async function getPostById(id: string): Promise<PostRow | null> {
  const sql = getSql();
  const rows = (await sql`select * from posts where id = ${id} limit 1`) as unknown as PostRow[];
  return rows[0] ?? null;
}

export async function upsertPosts(rows: PostRow[]): Promise<void> {
  if (rows.length === 0) return;
  const sql = getSql();
  await Promise.all(
    rows.map(
      (r) => sql`
        insert into posts (
          id, author_id, author_username, author_name, author_followers_count, text, posted_at,
          like_count, repost_count, reply_count, quote_count, impression_count,
          engagement_score, like_rate, repost_rate, reply_rate, url, fetched_at
        ) values (
          ${r.id}, ${r.author_id}, ${r.author_username}, ${r.author_name}, ${r.author_followers_count}, ${r.text}, ${r.posted_at},
          ${r.like_count}, ${r.repost_count}, ${r.reply_count}, ${r.quote_count}, ${r.impression_count},
          ${r.engagement_score}, ${r.like_rate}, ${r.repost_rate}, ${r.reply_rate}, ${r.url}, ${r.fetched_at}
        )
        on conflict (id) do update set
          author_id = excluded.author_id,
          author_username = excluded.author_username,
          author_name = excluded.author_name,
          author_followers_count = excluded.author_followers_count,
          text = excluded.text,
          posted_at = excluded.posted_at,
          like_count = excluded.like_count,
          repost_count = excluded.repost_count,
          reply_count = excluded.reply_count,
          quote_count = excluded.quote_count,
          impression_count = excluded.impression_count,
          engagement_score = excluded.engagement_score,
          like_rate = excluded.like_rate,
          repost_rate = excluded.repost_rate,
          reply_rate = excluded.reply_rate,
          url = excluded.url,
          fetched_at = excluded.fetched_at
      `,
    ),
  );
}

// analyses

export async function getLatestAnalysisByPostId(postId: string): Promise<AnalysisRow | null> {
  const sql = getSql();
  const rows = (await sql`
    select * from analyses where post_id = ${postId} order by created_at desc limit 1
  `) as unknown as AnalysisRow[];
  return rows[0] ?? null;
}

export async function getAnalysisById(id: string): Promise<AnalysisRow | null> {
  const sql = getSql();
  const rows = (await sql`select * from analyses where id = ${id} limit 1`) as unknown as AnalysisRow[];
  return rows[0] ?? null;
}

export async function insertAnalysis(input: {
  postId: string;
  model: string;
  result: object;
  structureAbstract: object;
}): Promise<AnalysisRow> {
  const sql = getSql();
  const rows = (await sql`
    insert into analyses (post_id, model, result, structure_abstract)
    values (${input.postId}, ${input.model}, ${JSON.stringify(input.result)}::jsonb, ${JSON.stringify(input.structureAbstract)}::jsonb)
    returning *
  `) as unknown as AnalysisRow[];
  return rows[0];
}

// generated_ideas

export async function insertGeneratedIdeas(
  analysisId: string,
  genre: string,
  ideaTexts: string[],
): Promise<GeneratedIdeaRow[]> {
  const sql = getSql();
  const rows = await Promise.all(
    ideaTexts.map(
      (text) => sql`
        insert into generated_ideas (analysis_id, genre, idea_text)
        values (${analysisId}, ${genre}, ${text})
        returning *
      `,
    ),
  );
  return rows.map((r) => (r as unknown as GeneratedIdeaRow[])[0]);
}

// own_posts

export async function listOwnPosts(limit: number): Promise<OwnPostRow[]> {
  const sql = getSql();
  return (await sql`
    select * from own_posts order by posted_at desc nulls last limit ${limit}
  `) as unknown as OwnPostRow[];
}

export async function listAllOwnPosts(): Promise<OwnPostRow[]> {
  const sql = getSql();
  return (await sql`select * from own_posts`) as unknown as OwnPostRow[];
}

export async function getOwnPostById(id: string): Promise<OwnPostRow | null> {
  const sql = getSql();
  const rows = (await sql`select * from own_posts where id = ${id} limit 1`) as unknown as OwnPostRow[];
  return rows[0] ?? null;
}

export async function upsertOwnPosts(rows: Omit<OwnPostRow, "created_at">[]): Promise<OwnPostRow[]> {
  if (rows.length === 0) return [];
  const sql = getSql();
  const results = await Promise.all(
    rows.map(
      (r) => sql`
        insert into own_posts (
          id, source, text, posted_at, url,
          like_count, repost_count, reply_count, quote_count, impression_count,
          url_click_count, permalink_click_count, detail_expand_count, app_open_count, app_install_count,
          follow_count, media_view_count, media_engagement_count, is_promoted
        ) values (
          ${r.id}, ${r.source}, ${r.text}, ${r.posted_at}, ${r.url},
          ${r.like_count}, ${r.repost_count}, ${r.reply_count}, ${r.quote_count}, ${r.impression_count},
          ${r.url_click_count}, ${r.permalink_click_count}, ${r.detail_expand_count}, ${r.app_open_count}, ${r.app_install_count},
          ${r.follow_count}, ${r.media_view_count}, ${r.media_engagement_count}, ${r.is_promoted}
        )
        on conflict (id) do update set
          source = excluded.source,
          text = excluded.text,
          posted_at = excluded.posted_at,
          url = excluded.url,
          like_count = excluded.like_count,
          repost_count = excluded.repost_count,
          reply_count = excluded.reply_count,
          quote_count = excluded.quote_count,
          impression_count = excluded.impression_count,
          url_click_count = excluded.url_click_count,
          permalink_click_count = excluded.permalink_click_count,
          detail_expand_count = excluded.detail_expand_count,
          app_open_count = excluded.app_open_count,
          app_install_count = excluded.app_install_count,
          follow_count = excluded.follow_count,
          media_view_count = excluded.media_view_count,
          media_engagement_count = excluded.media_engagement_count,
          is_promoted = excluded.is_promoted
        returning *
      `,
    ),
  );
  return results.map((r) => (r as unknown as OwnPostRow[])[0]);
}

export async function updateOwnPostImpressionCount(id: string, impressionCount: number): Promise<OwnPostRow | null> {
  const sql = getSql();
  const rows = (await sql`
    update own_posts set impression_count = ${impressionCount} where id = ${id} returning *
  `) as unknown as OwnPostRow[];
  return rows[0] ?? null;
}

// own_post_suggestions

export async function getLatestSuggestionByOwnPostId(ownPostId: string): Promise<OwnPostSuggestionRow | null> {
  const sql = getSql();
  const rows = (await sql`
    select * from own_post_suggestions where own_post_id = ${ownPostId} order by created_at desc limit 1
  `) as unknown as OwnPostSuggestionRow[];
  return rows[0] ?? null;
}

export async function insertSuggestion(ownPostId: string, result: object): Promise<OwnPostSuggestionRow> {
  const sql = getSql();
  const rows = (await sql`
    insert into own_post_suggestions (own_post_id, result)
    values (${ownPostId}, ${JSON.stringify(result)}::jsonb)
    returning *
  `) as unknown as OwnPostSuggestionRow[];
  return rows[0];
}

// own_post_analyses

export async function getLatestOwnPostAnalysis(): Promise<OwnPostAnalysisRow | null> {
  const sql = getSql();
  const rows = (await sql`
    select * from own_post_analyses order by created_at desc limit 1
  `) as unknown as OwnPostAnalysisRow[];
  return rows[0] ?? null;
}

export async function getOwnPostAnalysisById(id: string): Promise<OwnPostAnalysisRow | null> {
  const sql = getSql();
  const rows = (await sql`select * from own_post_analyses where id = ${id} limit 1`) as unknown as OwnPostAnalysisRow[];
  return rows[0] ?? null;
}

export async function insertOwnPostAnalysis(result: object): Promise<OwnPostAnalysisRow> {
  const sql = getSql();
  const rows = (await sql`
    insert into own_post_analyses (result) values (${JSON.stringify(result)}::jsonb) returning *
  `) as unknown as OwnPostAnalysisRow[];
  return rows[0];
}

// own_post_drafts

export async function getLatestDraftByAnalysisId(analysisId: string): Promise<OwnPostDraftRow | null> {
  const sql = getSql();
  const rows = (await sql`
    select * from own_post_drafts where analysis_id = ${analysisId} order by created_at desc limit 1
  `) as unknown as OwnPostDraftRow[];
  return rows[0] ?? null;
}

export async function insertOwnPostDraft(analysisId: string, result: object): Promise<OwnPostDraftRow> {
  const sql = getSql();
  const rows = (await sql`
    insert into own_post_drafts (analysis_id, result) values (${analysisId}, ${JSON.stringify(result)}::jsonb) returning *
  `) as unknown as OwnPostDraftRow[];
  return rows[0];
}
