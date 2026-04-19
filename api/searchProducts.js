import { createClient } from '@supabase/supabase-js';

// 🔍 ENV DEBUG (runs once on cold start)
console.log("INIT: SUPABASE_URL =", process.env.SUPABASE_URL);
console.log(
  "INIT: SUPABASE_ANON_KEY =",
  process.env.SUPABASE_ANON_KEY ? "Loaded ✅" : "Missing ❌"
);

// ✅ Correct key used here
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  console.log("---- API INVOKED ----");
  console.log("Method:", req.method);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log("OPTIONS request handled");
    return res.status(200).end();
  }

  try {
    const body = req.body || {};
    console.log("Request Body:", body);

    const { filters } = body;
    console.log("Filters received:", filters);

    console.log("Calling Supabase...");

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    console.log("Supabase response received");

    if (error) {
      console.error("❌ Supabase Error:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ Data fetched. Count:", data?.length);

    return res.status(200).json({
      success: true,
      data
    });

  } catch (err) {
    console.error("❌ Connection Error FULL:", err);

    return res.status(500).json({
      error: "Fetch Failed",
      message: "Check if Supabase is reachable from Vercel",
      details: err.message
    });
  }
}
