import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { filters } = req.body;

    if (!filters) {
      return res.status(400).json({ error: "Missing filters" });
    }

    let query = supabase.from("products").select("*");

    // ✅ NAME (fuzzy match)
    if (filters.name) {
      query = query.ilike("name", `%${filters.name}%`);
    }

    // ✅ GENDER
    if (filters.gender) {
      query = query.eq("gender_type", filters.gender);
    }

    // ✅ COLOR
    if (filters.color) {
      query = query.ilike("color", `%${filters.color}%`);
    }

    // ✅ SIZE (JSONB contains)
    if (filters.size) {
      query = query.contains("available_sizes", [filters.size]);
    }

    // ✅ PRICE RANGE
    if (filters.minPrice) {
      query = query.gte("price", filters.minPrice);
    }

    if (filters.maxPrice) {
      query = query.lte("price", filters.maxPrice);
    }

    // ✅ POPULARITY (0–1 scale)
    if (filters.popularity) {
      query = query.gte("popularity", filters.popularity);
    }

    // ✅ CATEGORY
    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    // ✅ LIMIT RESULTS
    query = query.limit(5);

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      data
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
