import dotenv from 'dotenv';
dotenv.config();

async function check() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  const spec = await res.json();
  const tables = Object.keys(spec.definitions);
  console.log("Tables in API:", tables);
}

check();
