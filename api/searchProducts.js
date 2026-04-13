import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { filters } = req.body;

    const {
      name,
      gender,
      color,
      size,
      minPrice,
      maxPrice,
      category
    } = filters || {};

    let query = [];

    // ✅ Build filters dynamically
    if (name) query.push(`name=ilike.*${name}*`);
    if (gender) query.push(`gender_type=eq.${gender}`);
    if (color) query.push(`color=ilike.*${color}*`);
    if (size) query.push(`size=eq.${size}`);
    if (category) query.push(`category=eq.${category}`);
    if (minPrice) query.push(`price=gte.${minPrice}`);
    if (maxPrice) query.push(`price=lte.${maxPrice}`);

    const queryString = query.length ? `?${query.join("&")}` : "";

    const url = `${process.env.SUPABASE_URL}/rest/v1/products${queryString}&limit=5`;

    console.log("FINAL URL:", url); // 🔥 will help debug

    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: process.env.SUPABASE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: "Supabase error",
        details: data
      });
    }

    res.status(200).json({
      success: true,
      count: data.length,
      products: data
    });

  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({
      error: error.message
    });
  }
}
