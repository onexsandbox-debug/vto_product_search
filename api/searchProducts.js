import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {
    console.log("ENV URL:", process.env.SUPABASE_URL);
    console.log("ENV KEY:", process.env.SUPABASE_KEY ? "Present" : "Missing");

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      return res.status(500).json({
        error: "ENV variables missing"
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL.trim(),
      process.env.SUPABASE_KEY.trim()
    );

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .limit(1);

    if (error) {
      return res.status(500).json({ error });
    }

    return res.status(200).json({
      success: true,
      data
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
