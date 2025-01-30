// pages/api/sanity-webhook.js

import { createClient } from "@/utils/supabase/client";


const supabase = createClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    // Verify the webhook secret if you've set one in Sanity
    // const sanitySecret = req.headers['sanity-webhook-secret'];
    // if (sanitySecret !== process.env.SANITY_WEBHOOK_SECRET) {
    //   return res.status(401).json({ message: 'Unauthorized' });
    // }

    const { name } = req.body;

    try {
      // Get all users
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id");

      if (usersError) throw usersError;

      // Create notifications for all users
      const notifications = users.map((user) => ({
        user_id: user.id,
        message: `New product added: ${name}`,
        read: false,
      }));

      const { error: notificationsError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (notificationsError) throw notificationsError;

      res.status(200).json({ message: "Notifications added successfully" });
    } catch (error) {
      console.error("Error adding notifications:", error);
      res.status(500).json({ error: "Error adding notifications" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}