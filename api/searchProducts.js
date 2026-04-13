export default async function handler(req, res) {
  try {
    const { filters } = req.body;

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({
        error: "Missing Supabase environment variables"
      });
    }

    // Build query dynamically
    let query = `${SUPABASE_URL}/rest/v1/products?select=*`;

    if (filters.name) {
      query += `&name=ilike.*${filters.name}*`;
    }

    if (filters.gender) {
      query += `&gender_type=eq.${filters.gender}`;
    }

    if (filters.color) {
      query += `&color=ilike.*${filters.color}*`;
    }

    if (filters.size) {
      query += `&size=eq.${filters.size}`;
    }

    if (filters.category) {
      query += `&category=eq.${filters.category}`;
    }

    if (filters.minPrice) {
      query += `&price=gte.${filters.minPrice}`;
    }

    if (filters.maxPrice) {
      query += `&price=lte.${filters.maxPrice}`;
    }

    // LIMIT results
    query += `&limit=5`;

    console.log("FINAL QUERY:", query);

    const response = await fetch(query, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });

    const data = await response.json();

    return res.status(200).json({
      success: true,
      count: data.length,
      products: data
    });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({
      error: err.message
    });
  }
}
