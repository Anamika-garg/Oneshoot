import { createClient } from "@/utils/supabase/server";

export async function handler(req, res) {
  // Ensure the request is a POST request from Sanity webhook
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Log the request body to see the incoming data
  console.log("Received data from webhook:", req.body);

  // Parse the webhook data (Sanity product)
  const { product } = req.body;

  // Check if product data exists
  if (!product || !product._id || !product.name) {
    return res.status(400).json({ message: "Invalid product data" });
  }

  // Get all users from Supabase
  const supabase = createClient();
  const { data: users, error } = await supabase
    .from("users")
    .select("id, email");

  if (error) {
    return res.status(500).json({ message: "Error fetching users" });
  }

  // Log the users to ensure we're fetching them correctly
  console.log("Fetched users:", users);

  // For each user, send them a notification about the new product
  users.forEach(async (user) => {
    const { data, error } = await supabase.from("notifications").insert([
      {
        user_id: user.id,
        message: `New product added: ${product.name}`,
        product_id: product._id,
        email: user.email, // Include email for reference
        read: false,
      },
    ]);

    if (error) {
      console.error("Error inserting notification:", error);
    } else {
      console.log("Notification sent to user:", user.email);
    }
  });

  return res.status(200).json({ message: "Notifications sent" });
}
