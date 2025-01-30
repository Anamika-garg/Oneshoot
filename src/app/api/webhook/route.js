import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { body } = req;

  if (body._type !== "product") {
    return res.status(200).json({ message: "Not a product, ignoring" });
  }

  try {
    const { data: users, error: usersError } = await supabase
      .from("auth.users")
      .select("id");

    if (usersError) throw usersError;

    const notifications = users.map((user) => ({
      user_id: user.id,
      message: `New product added: ${body.title}`,
      product_id: body._id,
      created_at: new Date().toISOString(),
    }));

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert(notifications);

    if (notificationError) throw notificationError;

    res.status(200).json({ message: "Notifications created successfully" });
  } catch (error) {
    console.error("Error creating notifications:", error);
    res.status(500).json({ message: "Error creating notifications" });
  }
}
