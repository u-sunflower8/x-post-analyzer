-- Cache of the user's OWN posts, collected via X API auto-fetch, Notion CSV
-- export, screenshot vision extraction, or manual entry. `id` is the tweet id
-- when source='x_api' (so re-fetching never duplicates), otherwise a
-- generated uuid. impression_count is nullable because X only exposes it to
-- the account owner privately (not via any public API), so CSV/screenshot
-- imports may never populate it.
create table if not exists own_posts (
  id text primary key,
  source text not null check (source in ('x_api', 'csv', 'screenshot', 'manual')),
  text text not null,
  posted_at timestamptz,
  url text,
  like_count integer not null default 0,
  repost_count integer not null default 0,
  reply_count integer not null default 0,
  quote_count integer not null default 0,
  impression_count integer,
  url_click_count integer,
  permalink_click_count integer,
  detail_expand_count integer,
  app_open_count integer,
  app_install_count integer,
  follow_count integer,
  media_view_count integer,
  media_engagement_count integer,
  is_promoted boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists own_posts_posted_at_idx on own_posts (posted_at desc);

-- Per-post improvement suggestions. Kept as history (not overwritten) so a
-- `force` re-run doesn't destroy the previous suggestion; routes read the
-- latest row by created_at.
create table if not exists own_post_suggestions (
  id uuid primary key default gen_random_uuid(),
  own_post_id text not null references own_posts (id) on delete cascade,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists own_post_suggestions_own_post_id_idx on own_post_suggestions (own_post_id);

-- Account-wide "winning pattern" analysis. Single-tenant app, so there's no
-- account scoping column — history accumulates and the latest row wins.
create table if not exists own_post_analyses (
  id uuid primary key default gen_random_uuid(),
  result jsonb not null,
  created_at timestamptz not null default now()
);

-- Next-post drafts generated from a specific winning-pattern analysis.
create table if not exists own_post_drafts (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references own_post_analyses (id) on delete cascade,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists own_post_drafts_analysis_id_idx on own_post_drafts (analysis_id);
