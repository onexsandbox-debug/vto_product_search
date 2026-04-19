import { createClient } from '@supabase/supabase-js';

// 🔍 ENV DEBUG (runs on cold start)
console.log("INIT: SUPABASE_URL =", process.env.SUPABASE_URL);
console.log(
  "INIT: SUPABASE_ANON_KEY =",
  process.env.SUPABASE_ANON_KEY ? "Loaded ✅" : "Missing ❌"
);

// ✅ Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  console.log("---- API INVOKED ----");
  console.log("Method:", req.method);

  // ✅ CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = req.body || {};
    const filters = body.filters || {};

    console.log("Incoming Filters:", filters);

    // 🔥 Base query
    let query = supabase.from('products').select('*');

    // =========================
    // APPLY FILTERS (STRICT)
    // =========================

    // 🔍 Name search
    if (filters.name?.trim()) {
      query = query.ilike('name', `%${filters.name.trim()}%`);
    }

    // 👩 Gender (STRICT + lowercase match)
    if (filters.gender?.trim()) {
      query = query.eq('gender_type', filters.gender.trim().toLowerCase());
    }

    // 🎨 Color
    if (filters.color?.trim()) {
      query = query.eq('color', filters.color.trim().toLowerCase());
    }

    // 📦 Category
    if (filters.category?.trim()) {
      query = query.eq('category', filters.category.trim().toLowerCase());
    }

    // 💰 Price range
    if (filters.minPrice !== undefined && filters.minPrice !== null) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
      query = query.lte('price', filters.maxPrice);
    }

    // ⭐ Popularity
    if (filters.popularity !== undefined && filters.popularity !== null) {
      query = query.gte('popularity', filters.popularity);
    }

    // 👕 Size (JSON array contains)
    if (filters.size?.trim()) {
      query = query.contains('available_sizes', [filters.size.trim()]);
    }

    console.log("Executing query with filters...");

    // Execute query
    const { data, error } = await query.limit(20);

    if (error) {
      console.error("❌ Supabase Error:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log(`✅ Results fetched: ${data?.length}`);

    return res.status(200).json({
      success: true,
      count: data.length,
      data
    });

  } catch (err) {
    console.error("❌ Connection Error:", err);

    return res.status(500).json({
      error: "Fetch Failed",
      details: err.message
    });
  }
}
