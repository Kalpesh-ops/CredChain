#!/usr/bin/env node
/**
 * One-off schema setup for the community feedback forum.
 *
 * Run once after provisioning a database:
 *   cd client && node scripts/init-db.mjs
 *
 * Reads DATABASE_URL from the environment (or .env / .env.local). Nothing is
 * hardcoded — if the variable is missing the script exits rather than falling
 * back to a baked-in connection string.
 *
 * This is deliberately NOT run from the request path. The previous version
 * executed the whole CREATE TABLE + policy block before every read and write.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const clientDir = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Minimal .env reader so the script works without extra dependencies. */
function loadEnvFile(name) {
  const path = join(clientDir, name);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf-8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.trim().replace(/^["']|["']$/g, "");
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL;

if (!url) {
  console.error(
    "ERROR: no database URL found.\n" +
      "Set DATABASE_URL in client/.env (or the environment) and re-run.\n" +
      "See client/.env.example for the expected format."
  );
  process.exit(1);
}

const sql = neon(url);

try {
  console.log("Creating table 'feedbacks'...");
  await sql`
    CREATE TABLE IF NOT EXISTS feedbacks (
      id          VARCHAR(100) PRIMARY KEY,
      address     VARCHAR(100) NOT NULL,
      rating      INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      category    VARCHAR(50)  NOT NULL DEFAULT 'General',
      comment     TEXT         NOT NULL CHECK (length(comment) > 0),
      timestamp   VARCHAR(50)  NOT NULL,
      wallet_type VARCHAR(50)  NOT NULL DEFAULT 'Direct Input',
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;

  console.log("Creating indexes...");
  await sql`CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks (created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_feedbacks_rating ON feedbacks (rating)`;

  const [{ count }] = await sql`SELECT count(*)::int AS count FROM feedbacks`;
  console.log(`\nDone. 'feedbacks' is ready and currently holds ${count} row(s).`);
} catch (err) {
  console.error("\nSchema setup failed:", err.message);
  process.exit(1);
}
