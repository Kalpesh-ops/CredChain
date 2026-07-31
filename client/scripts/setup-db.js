const { Pool } = require("pg");

const poolerUrl = "postgresql://postgres.bwsqowzczfuzrdjsiwvx:AF-XJ8xavtg$x8w@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";

console.log("Connecting to Supabase via IPv4 Pooler:", poolerUrl.split("@")[1]);

const pool = new Pool({
  connectionString: poolerUrl,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    console.log("1. Creating 'feedbacks' table...");
    await client.query(`
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
    `);
    console.log("   -> Table 'feedbacks' created successfully!");

    console.log("2. Creating performance indices...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_feedbacks_rating ON feedbacks(rating);
    `);
    console.log("   -> Indices created!");

    console.log("3. Enabling Row Level Security (RLS)...");
    await client.query(`ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;`);
    console.log("   -> RLS Enabled!");

    console.log("4. Applying Security Policies...");
    await client.query(`
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
    console.log("   -> Security Policies Applied!");

    console.log("5. Testing query on Supabase DB...");
    const res = await client.query("SELECT count(*) FROM feedbacks;");
    console.log("   -> SUCCESS! Current feedback record count in Supabase DB:", res.rows[0].count);
  } catch (err) {
    console.error("SETUP ERROR:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
