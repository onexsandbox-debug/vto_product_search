export default async function handler(req, res) {
  try {
    const { filters } = req.body || {};

    if (!filters) {
      return res.status(400).json({ error: "Filters missing" });
    }

    const {
      name,
      gender,
      color,
      size,
      minPrice,
      maxPrice,
      category
    } = filters;

    let query = [];

    if (name) query.push(`name=ilike.*${name}*`);
    if (gender) query.push(`gender_type=eq.${gender}`);
    if (color) query.push(`color=ilike.*${color}*`);
    if (size) query.push(`size=eq.${size}`);
    if (category) query.push(`category=eq.${category}`);
    if (minPrice) query.push(`price=gte.${minPrice}`);
    if (maxPrice) query.push(`price=lte.${maxPrice}`);

    let url = `${process.env.SUPABASE_URL}/rest/v1/products`;

    if (query.length > 0) {
      url += `?${query.join("&")}&limit=5`;
    } else {
      url += `?limit=5`;
    }

    console.log("URL:", url);

    // ✅ USE NATIVE FETCH (IMPORTANT)
    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: process.env.SUPABASE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    return res.status(200).json({
      success: true,
      count: data.length,
      products: data
    });

  } catch (err) {
    console.error("CRASH:", err);

    return res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
}
