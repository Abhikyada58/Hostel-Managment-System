require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function updateDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL.");

    const sqlPath = path.join(__dirname, '..', 'update_storage_policies.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await client.query(sql);
    console.log("Successfully ran update_laundry_workflow.sql");

  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await client.end();
  }
}

updateDb();
