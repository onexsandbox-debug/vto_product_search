import { createClient } from '@supabase/supabase-js';

// 🔍 ENV DEBUG
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

// 🔧 Utility: validate input
const isValid = (val) => {
  return (
    val !== undefined &&
    val !== null &&
    val !== "null" &&
    val !== "" &&
    !(typeof val === "string" && val.trim() === "")
  );
};

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
    // APPLY FILTERS (SAFE)
    // =========================

    // 🔍 Name search (fuzzy)
    if (isValid(filters.name)) {
      query = query.ilike('name', `%${filters.name.trim()}%`);
    }

    // 👩 Gender
    if (isValid(filters.gender)) {
      query = query.eq('gender_type', filters.gender.trim().toLowerCase());
    }

    // 🎨 Color
    if (isValid(filters.color)) {
      query = query.eq('color', filters.color.trim().toLowerCase());
    }

    // 📦 Category
    if (isValid(filters.category)) {
      query = query.eq('category', filters.category.trim().toLowerCase());
    }

    // 💰 Price range
    if (isValid(filters.minPrice)) {
      query = query.gte('price', filters.minPrice);
    }

    if (isValid(filters.maxPrice)) {
      query = query.lte('price', filters.maxPrice);
    }

    // ⭐ Popularity
    if (isValid(filters.popularity)) {
      query = query.gte('popularity', filters.popularity);
    }

    // ❌ SIZE FILTER REMOVED (as per your requirement)
    // We DO NOT filter by size anymore

    console.log("Executing query...");

    // 🔥 Sorting (best practice)
    query = query.order('popularity', { ascending: false });

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
      filtersApplied: {
        ...filters,
        size: "ignored (returned in results only)"
      },
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
