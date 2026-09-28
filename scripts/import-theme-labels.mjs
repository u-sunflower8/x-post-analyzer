// Writes hand-made theme/hook labels onto own_posts.
//
//   node --env-file=.env.local scripts/import-theme-labels.mjs <labels.json>          # dry run
//   node --env-file=.env.local scripts/import-theme-labels.mjs <labels.json> --apply  # write
//
// <labels.json> is an array of { id, at: "YYYY-MM-DD HH:MM" (JST), theme, hook }.
// Rows are matched by tweet id, falling back to the posting minute for posts
// that were imported earlier under a different id (e.g. CSV rows "row-1").
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const THEMES = ["inv", "fire", "society", "love", "life", "save", "daily", "community"];
const HOOKS = ["ask", "aruaru", "data", "claim", "list", "story", "greet"];

const file = process.argv[2];
const apply = process.argv.includes("--apply");
if (!file) {
  console.error("usage: import-theme-labels.mjs <labels.json> [--apply]");
  process.exit(1);
}

const labels = JSON.parse(readFileSync(file, "utf-8"));
const invalid = labels.filter((l) => !THEMES.includes(l.theme) || !HOOKS.includes(l.hook));
if (invalid.length > 0) {
  console.error("unknown theme/hook codes:", invalid.slice(0, 5));
  process.exit(1);
}

const minuteOf = (date) => Math.floor(date.getTime() / 60000);
const sql = neon(process.env.DATABASE_URL);
const rows = await sql`select id, posted_at from own_posts`;
const byId = new Set(rows.map((r) => r.id));
const byMinute = new Map(rows.filter((r) => r.posted_at).map((r) => [minuteOf(new Date(r.posted_at)), r.id]));

const updates = [];
const unmatched = [];
for (const l of labels) {
  const rowId = byId.has(l.id) ? l.id : byMinute.get(minuteOf(new Date(`${l.at.replace(" ", "T")}:00+09:00`)));
  if (rowId) updates.push({ id: rowId, theme: l.theme, hook: l.hook });
  else unmatched.push(l.id);
}

console.log(`labels: ${labels.length}, matched: ${updates.length}, unmatched: ${unmatched.length}`);
if (unmatched.length > 0) console.log("unmatched ids:", unmatched.slice(0, 10));

if (!apply) {
  console.log("dry run — pass --apply to write");
  process.exit(0);
}

for (let i = 0; i < updates.length; i += 50) {
  await Promise.all(
    updates.slice(i, i + 50).map((u) => sql`update own_posts set theme = ${u.theme}, hook = ${u.hook} where id = ${u.id}`),
  );
}
const [{ count }] = await sql`select count(*)::int as count from own_posts where theme is not null`;
console.log(`done. classified posts: ${count}`);
