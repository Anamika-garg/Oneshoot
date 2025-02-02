import { createClient } from "@/utils/supabase/server";

export async function handler(req, res) {
  // Ensure the request is a POST request from Sanity webhook
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Parse the webhook data (Sanity product)
  const { product } = req.body;

  // Get all users from Supabase
  const supabase = createClient();
  const { data: users, error } = await supabase
    .from("users")
    .select("id, email");

  if (error) {
    return res.status(500).json({ message: "Error fetching users" });
  }

  // For each user, send them a notification about the new product
  users.forEach(async (user) => {
    await supabase.from("notifications").insert([
      {
        user_id: user.id,
        message: `New product added: ${product.name}`,
        product_id: product._id,
      },
    ]);
  });

  return res.status(200).json({ message: "Notifications sent" });
}
