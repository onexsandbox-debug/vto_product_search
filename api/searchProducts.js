import { createClient } from '@supabase/supabase-js'

// We initialize this OUTSIDE the handler to prevent 
// re-connecting on every single click.
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  // Add these headers to allow your Postman/App to connect without CORS issues
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { filters } = req.body;

    // A very simple test query first
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    if (error) {
      console.error("Supabase Logic Error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      success: true,
      data: data
    });

  } catch (err) {
    console.error("Connection Error:", err.message);
    return res.status(500).json({
      error: "Fetch Failed",
      message: "Check if Supabase is reachable from Vercel",
      details: err.message
    });
  }
}
