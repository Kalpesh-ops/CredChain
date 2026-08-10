import { neon } from "@neondatabase/serverless";

/**
 * Persistence for the community feedback forum.
 *
 * Everything that touches the database lives in this module, so swapping
 * providers means rewriting one file rather than hunting through route handlers.
 *
 * Design rules, learned from the previous implementation:
 *
 *  1. A write either persists or reports failure. There is no "saved to memory"
 *     or "written to a JSON file" fallback that makes a lost post look like a
 *     successful one. On Vercel the filesystem is read-only and each lambda has
 *     its own memory, so those fallbacks silently dropped every post.
 *  2. No credentials in source. The connection string comes from the environment
 *     or the store reports itself unconfigured.
 *  3. Schema creation is a one-off migration (scripts/init-db.mjs), not something
 *     re-run on every request.
 */

export interface FeedbackItem {
  id: string;
  address: string;
  rating: number;
  category: string;
  comment: string;
  timestamp: string;
  walletType: string;
}

export type StoreStatus = "ready" | "unconfigured" | "unreachable";

/** Row shape as stored; snake_case matches the column names. */
interface FeedbackRow {
  id: string;
  address: string;
  rating: number;
  category: string;
  comment: string;
  timestamp: string;
  wallet_type: string;
}

const MAX_FEEDBACKS = 200;

/** Exact names checked first, in priority order. */
const EXACT_URL_VARS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "NEON_DATABASE_URL",
] as const;

/**
 * Vercel storage integrations can be attached with a custom variable prefix, so
 * the same Neon database may surface as DATABASE_URL or as
 * <prefix>_DATABASE_URL. Matching on the suffix means the app works under any
 * prefix without duplicating the credential into a second variable that would
 * go stale the moment Neon rotates it.
 *
 * The `$` anchors matter: they keep DATABASE_URL_UNPOOLED,
 * POSTGRES_URL_NON_POOLING and POSTGRES_URL_NO_SSL out, so we always land on
 * the pooled connection string.
 */
const SUFFIX_URL_PATTERNS = [/_DATABASE_URL$/, /_POSTGRES_URL$/];

function clean(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim().replace(/^["']|["']$/g, "");
  return trimmed.length > 0 ? trimmed : null;
}

export function connectionString(): string | null {
  for (const name of EXACT_URL_VARS) {
    const found = clean(process.env[name]);
    if (found) return found;
  }

  for (const pattern of SUFFIX_URL_PATTERNS) {
    // Sort for deterministic selection when several prefixes are present.
    const key = Object.keys(process.env).filter((k) => pattern.test(k)).sort()[0];
    const found = clean(process.env[key ?? ""]);
    if (found) return found;
  }

  return null;
}

export function isConfigured(): boolean {
  return connectionString() !== null;
}

function client() {
  const url = connectionString();
  if (!url) return null;
  // The HTTP driver issues one fetch per query — no TCP pool to exhaust across
  // serverless invocations, and it wakes a scaled-to-zero Neon compute on demand.
  return neon(url);
}

function toItem(row: FeedbackRow): FeedbackItem {
  return {
    id: row.id,
    address: row.address,
    rating: row.rating,
    category: row.category,
    comment: row.comment,
    timestamp: row.timestamp,
    walletType: row.wallet_type,
  };
}

export async function listFeedbacks(): Promise<
  { status: "ready"; items: FeedbackItem[] } | { status: Exclude<StoreStatus, "ready"> }
> {
  const sql = client();
  if (!sql) return { status: "unconfigured" };

  try {
    const rows = (await sql`
      SELECT id, address, rating, category, comment, timestamp, wallet_type
      FROM feedbacks
      ORDER BY created_at DESC
      LIMIT ${MAX_FEEDBACKS}
    `) as FeedbackRow[];
    return { status: "ready", items: rows.map(toItem) };
  } catch (err) {
    console.error("[feedback-store] read failed:", err);
    return { status: "unreachable" };
  }
}

/**
 * Inserts one item. Returns false if the write did not reach the database, so
 * the caller can surface a real error instead of pretending it was saved.
 */
export async function saveFeedback(item: FeedbackItem): Promise<boolean> {
  const sql = client();
  if (!sql) return false;

  try {
    await sql`
      INSERT INTO feedbacks (id, address, rating, category, comment, timestamp, wallet_type)
      VALUES (
        ${item.id}, ${item.address}, ${item.rating}, ${item.category},
        ${item.comment}, ${item.timestamp}, ${item.walletType}
      )
      ON CONFLICT (id) DO NOTHING
    `;
    return true;
  } catch (err) {
    console.error("[feedback-store] write failed:", err);
    return false;
  }
}
