import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(scriptDir, "..");
const envLocalPath = join(projectRoot, ".env.local");

function loadEnvLocal() {
  if (!existsSync(envLocalPath)) return;
  const text = readFileSync(envLocalPath, "utf8").replace(/^\uFEFF/, "");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

if (!process.env.DATABASE_URL) loadEnvLocal();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set.");
  console.error("Add it to .env.local (see .env.local.example), then run:");
  console.error("  npm run db:migrate");
  process.exit(1);
}

const supabaseDir = join(projectRoot, "supabase");
const files = [
  join(supabaseDir, "schema.sql"),
  ...readdirSync(join(supabaseDir, "migrations"))
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => join(supabaseDir, "migrations", f)),
];

const client = new Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

try {
  await client.connect();
  for (const file of files) {
    const sql = readFileSync(file, "utf8");
    console.log("Applying", file.split(/[/\\]/).pop());
    await client.query(sql);
  }
  const { rows } = await client.query(
    "select proname from pg_proc where proname = 'scores_insert_allowed'"
  );
  console.log(
    "OK:",
    rows.length ? "scores_insert_allowed installed" : "WARNING: function missing"
  );
} catch (err) {
  console.error("FAILED:", err.message);
  process.exitCode = 2;
} finally {
  await client.end().catch(() => {});
}
