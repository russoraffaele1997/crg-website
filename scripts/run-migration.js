const { Client } = require("pg");
const fs = require("fs");

const client = new Client({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();
  const sql = fs.readFileSync(process.argv[2], "utf8");
  await client.query(sql);
  console.log("Migration applied successfully.");
  await client.end();
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
