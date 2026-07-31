import { Pool } from "pg";

export interface FeedbackRecord {
  id: string;
  address: string;
  rating: number;
  category: string;
  comment: string;
  timestamp: string;
  wallet_type: string;
}

function buildConnectionString(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.POSTGRES_URL) return process.env.POSTGRES_URL;
  if (process.env.POSTGRES_PRISMA_URL) return process.env.POSTGRES_PRISMA_URL;
  if (process.env.POSTGRES_URL_NON_POOLING) return process.env.POSTGRES_URL_NON_POOLING;
  if (process.env.SUPABASE_DATABASE_URL) return process.env.SUPABASE_DATABASE_URL;
  if (process.env.NEON_DATABASE_URL) return process.env.NEON_DATABASE_URL;

  if (process.env.POSTGRES_USER && process.env.POSTGRES_PASSWORD && process.env.POSTGRES_HOST) {
    const user = process.env.POSTGRES_USER;
    const pass = process.env.POSTGRES_PASSWORD;
    const host = process.env.POSTGRES_HOST;
    const db = process.env.POSTGRES_DATABASE || "postgres";
    return `postgresql://${user}:${pass}@${host}:5432/${db}?sslmode=require`;
  }

  return "postgresql://postgres.bwsqowzczfuzrdjsiwvx:AF-XJ8xavtg$x8w@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";
}

const rawConnectionString = buildConnectionString();

let pool: Pool | null = null;

if (rawConnectionString) {
  try {
    const connectionString = rawConnectionString.trim().replace(/^["']|["']$/g, "");
    pool = new Pool({
      connectionString,
      ssl:
        connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
          ? false
          : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  } catch (err) {
    console.error("[Database] Failed to initialize PostgreSQL connection pool:", err);
  }
}

export async function isDbConnected(): Promise<boolean> {
  if (!pool) return false;
  try {
    const client = await pool.connect();
    client.release();
    return true;
  } catch {
    return false;
  }
}

export async function initDbSchema(): Promise<boolean> {
  if (!pool) return false;
  try {
    // Schema & Security Operations (Row Level Security & Indices)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id VARCHAR(100) PRIMARY KEY,
        address VARCHAR(100) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        category VARCHAR(50) NOT NULL DEFAULT 'General',
        comment TEXT NOT NULL,
        timestamp VARCHAR(50) NOT NULL,
        wallet_type VARCHAR(50) NOT NULL DEFAULT 'Direct Input',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_feedbacks_rating ON feedbacks(rating);

      ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'feedbacks' AND policyname = 'Allow public read access'
        ) THEN
          CREATE POLICY "Allow public read access" ON feedbacks FOR SELECT USING (true);
        END IF;
      END $$;

      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'feedbacks' AND policyname = 'Allow public insert'
        ) THEN
          CREATE POLICY "Allow public insert" ON feedbacks FOR INSERT WITH CHECK (rating >= 1 AND rating <= 5 AND length(comment) > 0);
        END IF;
      END $$;
    `);
    return true;
  } catch (err) {
    console.error("[Database] Failed to initialize database schema & security RLS:", err);
    return false;
  }
}

export async function getFeedbacksFromDb(): Promise<FeedbackRecord[] | null> {
  if (!pool) return null;
  try {
    await initDbSchema();
    const result = await pool.query(`
      SELECT id, address, rating, category, comment, timestamp, wallet_type 
      FROM feedbacks 
      ORDER BY created_at DESC 
      LIMIT 200;
    `);
    return result.rows;
  } catch (err) {
    console.error("[Database] Error fetching feedbacks from DB:", err);
    return null;
  }
}

export async function saveFeedbackToDb(item: {
  id: string;
  address: string;
  rating: number;
  category: string;
  comment: string;
  timestamp: string;
  walletType: string;
}): Promise<boolean> {
  if (!pool) return false;
  try {
    await initDbSchema();
    await pool.query(
      `
      INSERT INTO feedbacks (id, address, rating, category, comment, timestamp, wallet_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO NOTHING;
    `,
      [item.id, item.address, item.rating, item.category, item.comment, item.timestamp, item.walletType]
    );
    return true;
  } catch (err) {
    console.error("[Database] Error saving feedback to DB:", err);
    return false;
  }
}
