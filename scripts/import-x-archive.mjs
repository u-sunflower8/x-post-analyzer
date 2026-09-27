// Imports the user's own original posts (no replies / retweets) from an X
// "Download your data" archive into own_posts. No X API calls, so no cost.
//
//   node --env-file=.env.local scripts/import-x-archive.mjs <archive>/data          # dry run
//   node --env-file=.env.local scripts/import-x-archive.mjs <archive>/data --apply  # write
//
// Rows use the tweet id as primary key with source='x_api' so a later X API
// auto-fetch upserts onto the same rows instead of duplicating them. Posts that
// already exist from an older import (same posted_at minute) are skipped so
// their impression counts are kept.
import { neon } from "@neondatabase/serverless";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
const apply = process.argv.includes("--apply");
if (!dir) {
  console.error("usage: import-x-archive.mjs <archive data dir> [--apply]");
  process.exit(1);
}

function loadYtd(file) {
  const path = join(dir, file);
  if (!existsSync(path)) return [];
  const s = readFileSync(path, "utf-8");
  return JSON.parse(s.slice(s.indexOf("=") + 1));
}

function decodeEntities(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

const tweets = loadYtd("tweets.js").map((x) => x.tweet);
const notesByTime = new Map(
  loadYtd("note-tweet.js").map((x) => [new Date(x.noteTweet.createdAt).getTime(), x.noteTweet.core.text]),
);

const originals = tweets.filter((t) => !t.full_text.startsWith("RT @") && !t.in_reply_to_status_id_str);

let notesUsed = 0;
const rows = originals.map((t) => {
  const postedAt = new Date(t.created_at);
  const note = notesByTime.get(postedAt.getTime());
  if (note) notesUsed++;
  // Strip trailing t.co links X appends for media / truncated long posts.
  const text = note ?? decodeEntities(t.full_text).replace(/\s*https:\/\/t\.co\/\w+$/, "").trim();
  return {
    id: t.id_str,
    source: "x_api",
    text,
    posted_at: postedAt.toISOString(),
    url: `https://x.com/i/web/status/${t.id_str}`,
    like_count: Number(t.favorite_count) || 0,
    repost_count: Number(t.retweet_count) || 0,
  };
});

const sql = neon(process.env.DATABASE_URL);
const existing = await sql`select id, posted_at from own_posts`;
const existingIds = new Set(existing.map((r) => r.id));
const existingMinutes = new Set(existing.map((r) => Math.floor(new Date(r.posted_at).getTime() / 60000)));

const toWrite = rows.filter(
  (r) => existingIds.has(r.id) || !existingMinutes.has(Math.floor(new Date(r.posted_at).getTime() / 60000)),
);
const skipped = rows.length - toWrite.length;

console.log(`tweets.js: ${tweets.length}, originals: ${originals.length}, long-post full text restored: ${notesUsed}`);
console.log(`already in DB from older import (skipped): ${skipped}, to write: ${toWrite.length}`);
console.log("sample:", toWrite.slice(0, 3).map((r) => ({ ...r, text: r.text.slice(0, 40) })));

if (!apply) {
  console.log("dry run — pass --apply to write");
  process.exit(0);
}

// reply_count / quote_count are not in the archive; only overwrite what it has.
for (let i = 0; i < toWrite.length; i += 50) {
  await Promise.all(
    toWrite.slice(i, i + 50).map(
      (r) => sql`
        insert into own_posts (id, source, text, posted_at, url, like_count, repost_count)
        values (${r.id}, ${r.source}, ${r.text}, ${r.posted_at}, ${r.url}, ${r.like_count}, ${r.repost_count})
        on conflict (id) do update set
          text = excluded.text,
          posted_at = excluded.posted_at,
          url = excluded.url,
          like_count = excluded.like_count,
          repost_count = excluded.repost_count
      `,
    ),
  );
}
const [{ count }] = await sql`select count(*)::int as count from own_posts`;
console.log(`done. own_posts now has ${count} rows`);
