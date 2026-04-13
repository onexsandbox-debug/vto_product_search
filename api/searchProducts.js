import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // 1. Check if the keys actually exist in Vercel
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ 
      error: "Configuration Error", 
      message: "Vercel is missing your Supabase URL or Key. Please check Environment Variables." 
    });
  }

  // 2. Setup the connection
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { filters } = req.body;

    // 3. Start the query
    let query = supabase.from('products').select('*');

    // Add filters only if the user sent them
    if (filters?.name) query = query.ilike('name', `%${filters.name}%`);
    if (filters?.gender) query = query.eq('gender_type', filters.gender);
    if (filters?.color) query = query.ilike('color', `%${filters.color}%`);
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.minPrice) query = query.gte('price', filters.minPrice);
    if (filters?.maxPrice) query = query.lte('price', filters.maxPrice);

    // 4. Run it
    const { data, error } = await query.limit(5);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data?.length || 0,
      products: data
    });

  } catch (err) {
    console.error("Supabase Error:", err.message);
    return res.status(500).json({
      error: "Database Query Failed",
      details: err.message
    });
  }
}
