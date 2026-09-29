import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const sql = neon(process.env.DATABASE_URL);

const files = ["db/migrations/0001_init.sql", "db/migrations/0002_own_posts.sql", "db/migrations/0003_own_post_themes.sql"];

for (const file of files) {
  const content = readFileSync(file, "utf-8");
  console.log(`Running ${file}...`);
  const statements = content
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const stmt of statements) {
    await sql.query(stmt);
  }
  console.log(`Done ${file}`);
}

const tables = await sql`select table_name from information_schema.tables where table_schema = 'public' order by table_name`;
console.log(
  "Tables now:",
  tables.map((t) => t.table_name),
);
