-- Content classification for own posts: `theme` is the topic (投資, FIRE, ...)
-- and `hook` is the style of the opening line (問いかけ, あるある, ...). Codes
-- are defined in src/lib/own-posts/themes.ts. Nullable: posts added after the
-- initial hand-labelled import stay unclassified until labelled.
alter table own_posts add column if not exists theme text;
alter table own_posts add column if not exists hook text
