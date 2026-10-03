require('dotenv').config();
const { Client } = require('pg');

async function debugDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL directly.");

    // Check if profiles table exists
    const tableRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'profiles';
    `);
    console.log("Profiles Table Columns:");
    console.table(tableRes.rows);

    // Try a direct insert into profiles (using a dummy UUID to see if it complains about foreign key or something else)
    // Wait, let's look at the trigger definition.
    const triggerRes = await client.query(`
      SELECT pg_get_functiondef(oid) 
      FROM pg_proc 
      WHERE proname = 'handle_new_user';
    `);
    console.log("Trigger Definition:");
    console.log(triggerRes.rows[0]?.pg_get_functiondef);

  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await client.end();
  }
}

debugDatabase();
