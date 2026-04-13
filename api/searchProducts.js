import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default async function handler(req, res) {
  try {
    const { filters } = req.body;

    let query = supabase.from('products').select('*');

    if (filters.name) query = query.ilike('name', `%${filters.name}%`);
    if (filters.gender) query = query.eq('gender_type', filters.gender);
    if (filters.color) query = query.ilike('color', `%${filters.color}%`);
    if (filters.size) query = query.eq('size', filters.size);
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.minPrice) query = query.gte('price', filters.minPrice);
    if (filters.maxPrice) query = query.lte('price', filters.maxPrice);

    const { data, error } = await query.limit(5);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: data.length,
      products: data
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
