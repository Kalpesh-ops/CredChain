const { Pool } = require("pg");

const regions = [
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "eu-west-1", "eu-west-2", "eu-west-3", "eu-central-1",
  "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-northeast-2",
  "sa-east-1", "ca-central-1"
];

async function check() {
  for (const r of regions) {
    const dbUrl = `postgresql://postgres.bwsqowzczfuzrdjsiwvx:AF-XJ8xavtg$x8w@aws-0-${r}.pooler.supabase.com:6543/postgres`;
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 2000
    });
    try {
      const client = await pool.connect();
      console.log("MATCH FOUND! Region is:", r);
      client.release();
      await pool.end();
      return r;
    } catch (e) {
      if (!e.message.includes("not found")) {
        console.log("Region", r, "Response:", e.message);
      }
    }
    await pool.end();
  }
  console.log("Region search completed.");
}

check();
