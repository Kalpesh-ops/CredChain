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

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.SUPABASE_DATABASE_URL ||
  process.env.NEON_DATABASE_URL;

let pool: Pool | null = null;

if (connectionString) {
  try {
    pool = new Pool({
      connectionString,
      ssl:
        connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
          ? false
          : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
  } catch (err) {
    console.error("Failed to initialize PostgreSQL pool:", err);
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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id VARCHAR(100) PRIMARY KEY,
        address VARCHAR(100) NOT NULL,
        rating INT NOT NULL,
        category VARCHAR(50) NOT NULL,
        comment TEXT NOT NULL,
        timestamp VARCHAR(50) NOT NULL,
        wallet_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    return true;
  } catch (err) {
    console.error("Failed to initialize database schema:", err);
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
    console.error("Error fetching feedbacks from DB:", err);
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
    console.error("Error saving feedback to DB:", err);
    return false;
  }
}
