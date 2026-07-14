// Usage: node scripts/update-block.js <page> <blockKey> <path/to/data.json>
const fs = require("fs");

async function main() {
  const [page, blockKey, dataFile] = process.argv.slice(2);
  const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/site_content_blocks?page=eq.${page}&block_key=eq.${blockKey}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ data }),
  });
  console.log(res.status);
  console.log(await res.text());
}

main();
