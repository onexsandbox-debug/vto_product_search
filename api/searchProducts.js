import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // 1. Initialize Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  try {
    const { filters } = req.body;

    // 2. Start the query on your "products" table
    let query = supabase.from('products').select('*');

    // 3. Add filters only if they exist in the request
    if (filters.name) query = query.ilike('name', `%${filters.name}%`);
    if (filters.gender) query = query.eq('gender_type', filters.gender);
    if (filters.color) query = query.ilike('color', `%${filters.color}%`);
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.minPrice) query = query.gte('price', filters.minPrice);
    if (filters.maxPrice) query = query.lte('price', filters.maxPrice);

    // 4. Execute the query
    const { data, error } = await query.limit(5);

    // If Supabase returns an error, catch it here
    if (error) throw error;

    return res.status(200).json({
      success: true,
      products: data
    });

  } catch (err) {
    // This will tell you exactly WHY it failed in Postman
    return res.status(500).json({
      error: "Connection Failed",
      details: err.message
    });
  }
}
