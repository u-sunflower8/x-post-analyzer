-- Cache of posts fetched from the X API. Keyed by tweet id so re-running a
-- search (or revisiting a post) never has to pay for the same read twice.
create table if not exists posts (
  id text primary key,
  author_id text,
  author_username text,
  author_name text,
  author_followers_count integer,
  text text not null,
  posted_at timestamptz,
  like_count integer not null default 0,
  repost_count integer not null default 0,
  reply_count integer not null default 0,
  quote_count integer not null default 0,
  impression_count integer,
  engagement_score numeric not null default 0,
  like_rate numeric not null default 0,
  repost_rate numeric not null default 0,
  reply_rate numeric not null default 0,
  url text not null,
  fetched_at timestamptz not null default now()
);

create index if not exists posts_engagement_score_idx on posts (engagement_score desc);
create index if not exists posts_posted_at_idx on posts (posted_at desc);

-- The AI's structured analysis for a post. `structure_abstract` is stored
-- separately because the generation step only ever reads this field, never
-- the original post text, so generated ideas can't copy the source wording.
create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  post_id text not null references posts (id) on delete cascade,
  model text not null,
  result jsonb not null,
  structure_abstract jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists analyses_post_id_idx on analyses (post_id);

-- Original post ideas generated from an analysis's structure_abstract for a
-- user-specified genre.
create table if not exists generated_ideas (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references analyses (id) on delete cascade,
  genre text not null,
  idea_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists generated_ideas_analysis_id_idx on generated_ideas (analysis_id);
