import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { client } from "@/lib/sanity";

export async function POST(request) {
  console.log("Notification webhook received");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase environment variables are not set");
    return NextResponse.json(
      { message: "Server configuration error" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const payload = await request.json();
    console.log("Full notification payload:", JSON.stringify(payload, null, 2));

    // Extract document ID
    const documentId =
      payload._id ||
      (payload.result && payload.result._id) ||
      (payload.document && payload.document._id);

    if (!documentId) {
      console.error("No document ID found in payload");
      return NextResponse.json(
        { message: "No document ID found in payload" },
        { status: 400 }
      );
    }

    // Extract document type
    const documentType =
      payload._type ||
      (payload.result && payload.result._type) ||
      (payload.document && payload.document._type);

    // Check if document exists in Sanity - if not, it's a delete operation
    try {
      console.log(`Checking if document ${documentId} exists in Sanity...`);

      // Use the appropriate query based on document type
      let document;

      if (documentType === "product") {
        // Use your existing getProducts query but filter for this specific product
        const query = `*[_type == "product" && _id == $id][0] {
          _id,
          name,
          "slug": slug.current,
          "category": category->name,
          basePrice,
          "image": image.asset->url,
          status,
          "variants": variants[]->
        }`;

        document = await client.fetch(query, { id: documentId });
      } else if (documentType === "productVariant") {
        // Query for a specific variant
        const query = `*[_type == "productVariant" && _id == $id][0] {
          _id,
          name,
          "slug": slug.current,
          price,
          description,
          status,
          downloadLinks
        }`;

        document = await client.fetch(query, { id: documentId });
      } else if (documentType === "promoCode") {
        // Query for a specific promo code
        const query = `*[_type == "promoCode" && _id == $id][0] {
          _id,
          code,
          discount,
          isPercentage,
          validFrom,
          validTo,
          notificationText
        }`;

        document = await client.fetch(query, { id: documentId });
      } else {
        // Generic query for any document type
        const query = `*[_id == $id][0]`;
        document = await client.fetch(query, { id: documentId });
      }

      if (!document) {
        console.log(
          `Document ${documentId} not found in Sanity - this is a delete operation`
        );
        return NextResponse.json(
          {
            message: "Document not found in Sanity - delete operation detected",
          },
          { status: 200 }
        );
      }

      console.log(
        `Document found in Sanity:`,
        JSON.stringify(document, null, 2)
      );

      // Use the complete document from Sanity instead of the webhook payload
      const itemType = documentType;
      let itemName = "";

      // Extract name based on document type
      if (itemType === "product") {
        itemName = document.name || "New product";
        console.log(`Using product name: ${itemName}`);
      } else if (itemType === "productVariant") {
        itemName = document.name || "product variant";
        console.log(`Using variant name: ${itemName}`);
      } else if (itemType === "promoCode") {
        itemName = document.code || "discount code";
        console.log(`Using promo code: ${itemName}`);
      } else {
        console.log(`Unknown document type: ${itemType}`);
        return NextResponse.json(
          { message: "Unknown document type" },
          { status: 200 }
        );
      }

      // Get all users from Supabase
      const { data: usersData, error: userError } =
        await supabase.auth.admin.listUsers();

      if (userError) {
        console.error(
          "Error fetching users:",
          userError.message,
          userError.details
        );
        return NextResponse.json(
          { message: "Error fetching users", details: userError.message },
          { status: 500 }
        );
      }

      if (!usersData || !usersData.users || usersData.users.length === 0) {
        console.log("No users found in the database");
        return NextResponse.json(
          { message: "No users found" },
          { status: 204 }
        );
      }

      const users = usersData.users;
      console.log(`Found ${users.length} users to notify about ${itemName}`);

      // Create appropriate notification message based on content type
      let message;
      if (itemType === "product") {
        message = `New product added: ${itemName}`;
      } else if (itemType === "productVariant") {
        // For variants, check if there are available download links
        const availableLinks = (document.downloadLinks || []).filter(
          (link) => !link.isUsed
        ).length;

        if (availableLinks > 0) {
          message = `New download links available for: ${itemName}`;
        } else {
          // Don't send notification if no new links are available
          return NextResponse.json(
            { message: "No new links to notify about" },
            { status: 200 }
          );
        }
      } else if (itemType === "promoCode") {
        // Use custom notification text if available, otherwise use a default
        message =
          document.notificationText ||
          `New discount available: ${itemName}${
            document.isPercentage
              ? ` - ${document.discount}%`
              : document.discount
                ? ` - $${document.discount}`
                : ""
          }`;
      }

      // Send notifications to all users
      const notificationPromises = users.map(async (user) => {
        const notificationData = {
          user_id: user.id,
          message,
          read: false,
          email: user.email,
          created_at: new Date().toISOString(),
          // Set the appropriate ID field based on content type
          product_id: itemType === "product" ? document._id : null,
          variant_id: itemType === "productVariant" ? document._id : null,
          promo_code_id: itemType === "promoCode" ? document._id : null,
        };

        const { error: insertError } = await supabase
          .from("notifications")
          .insert([notificationData]);

        if (insertError) {
          console.error(
            `Error inserting notification for user ${user.id}:`,
            insertError.message,
            insertError.details
          );
          return {
            userId: user.id,
            success: false,
            error: insertError.message,
          };
        }
        return { userId: user.id, success: true };
      });

      const results = await Promise.all(notificationPromises);
      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.length - successCount;

      return NextResponse.json(
        {
          message: `Notifications processed: ${successCount} successful, ${failureCount} failed`,
          type: itemType,
          itemName,
          contentId: document._id,
          results,
        },
        { status: failureCount > 0 ? 207 : 200 }
      );
    } catch (sanityError) {
      console.error("Error querying Sanity:", sanityError);

      // If we get an error from Sanity, it might be because the document was deleted
      if (sanityError.message && sanityError.message.includes("not found")) {
        console.log(
          `Document ${documentId} not found in Sanity - this is a delete operation`
        );
        return NextResponse.json(
          {
            message: "Document not found in Sanity - delete operation detected",
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { message: "Error querying Sanity", details: sanityError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(
      "Unexpected error in notification webhook:",
      error.message,
      error.stack
    );
    return NextResponse.json(
      { message: "An unexpected error occurred", details: error.message },
      { status: 500 }
    );
  }
}
