import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request) {
  const supabase = createClient()

  try {
    // Parse the webhook data (Sanity product)
    const { product } = await request.json()

    // Check if product data exists
    if (!product || !product._id || !product.name) {
      return NextResponse.json({ message: "Invalid product data" }, { status: 400 })
    }

    // Get all users from Supabase
    const { data: users, error } = await supabase.from("users").select("id, email")

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ message: "Error fetching users" }, { status: 500 })
    }

    // For each user, send them a notification about the new product
    const notificationPromises = users.map(async (user) => {
      const { error } = await supabase.from("notifications").insert([
        {
          user_id: user.id,
          message: `New product added: ${product.name}`,
          product_id: product._id,
          email: user.email,
          read: false,
        },
      ])

      if (error) {
        console.error("Error inserting notification:", error)
        return false
      }
      return true
    })

    const results = await Promise.all(notificationPromises)
    const allSuccessful = results.every(Boolean)

    if (allSuccessful) {
      return NextResponse.json({ message: "Notifications sent successfully" }, { status: 200 })
    } else {
      return NextResponse.json({ message: "Some notifications failed to send" }, { status: 207 })
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 })
  }
}

