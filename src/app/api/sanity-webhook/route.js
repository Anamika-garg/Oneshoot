import { NextResponse } from "next/server";
import crypto from "crypto";

// Use the correct environment variable name
const WEBHOOK_SECRET = process.env.NEXT_PUBLIC_SANITY_WEBHOOK_SECRET;

export async function POST(request) {
  console.log("Sanity webhook received");

  try {
    // For testing purposes, you can set this to true to bypass verification
    const bypassVerification = process.env.NODE_ENV === "development";

    let payload;

    if (WEBHOOK_SECRET && !bypassVerification) {
      const signatureHeader = request.headers.get("sanity-webhook-signature");
      console.log("Received signature:", signatureHeader);

      if (!signatureHeader) {
        console.error("Missing Sanity webhook signature");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const rawBody = await request.text();
      console.log("Request body (first 100 chars):", rawBody.substring(0, 100));

      if (!verifyWebhookSignature(signatureHeader, rawBody, WEBHOOK_SECRET)) {
        console.error("Invalid Sanity webhook signature");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      payload = JSON.parse(rawBody);
    } else {
      console.log("Bypassing signature verification");
      payload = await request.json();
    }

    console.log("Webhook payload:", JSON.stringify(payload, null, 2));

    // Forward to debug endpoint first
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const debugUrl = `${baseUrl}/api/debug-webhook`;

      await fetch(debugUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Forwarded to debug endpoint");
    } catch (debugError) {
      console.error("Error forwarding to debug endpoint:", debugError);
    }

    return processWebhook(payload, request);
  } catch (error) {
    console.error("Error processing Sanity webhook:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process webhook" },
      { status: 500 }
    );
  }
}

function verifyWebhookSignature(signatureHeader, body, secret) {
  try {
    const components = signatureHeader.split(",");
    const timestamp = components.find((c) => c.startsWith("t="))?.substring(2);
    const signature = components.find((c) => c.startsWith("v1="))?.substring(3);

    if (!timestamp || !signature) {
      console.error("Missing timestamp or signature components");
      return false;
    }

    const signedContent = `${timestamp}.${body}`;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(signedContent);
    const expectedSignature = hmac.digest("hex");

    console.log("Expected signature:", expectedSignature);
    console.log("Received signature:", signature);

    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

async function processWebhook(payload, request) {
  // More robust detection of delete operations
  const isDeleteOperation =
    payload.operation === "delete" ||
    payload._type === "delete" ||
    payload.transition === "disappear" ||
    payload.transactionType === "disappear" ||
    payload.transactionType === "delete" ||
    payload.eventType === "delete" ||
    (payload.mutations && payload.mutations.some((m) => m.delete));

  if (isDeleteOperation) {
    console.log(
      "Delete operation detected - will still process but notification endpoint will skip sending"
    );
  }

  // Check for "ids", "documentId", or fallback to "_id"
  let documentIds = [];
  if (payload.ids && Array.isArray(payload.ids) && payload.ids.length > 0) {
    documentIds = payload.ids;
  } else if (payload.documentId) {
    documentIds = [payload.documentId];
  } else if (payload._id) {
    documentIds = [payload._id];
  } else if (payload.result && payload.result._id) {
    documentIds = [payload.result._id];
  } else if (payload.document && payload.document._id) {
    documentIds = [payload.document._id];
  } else {
    console.error("Webhook payload missing document identifiers", payload);
    return NextResponse.json({ message: "No document IDs to process" });
  }

  console.log(`Processing ${documentIds.length} document ID(s) from webhook`);

  // Use a base URL from env or fallback to http://localhost:3000
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const results = [];

  // First, try to process assign-pending-links if needed
  try {
    // Only call assign-pending-links for product variants
    if (
      payload._type === "productVariant" ||
      (payload.result && payload.result._type === "productVariant") ||
      (payload.document && payload.document._type === "productVariant")
    ) {
      for (const documentId of documentIds) {
        try {
          console.log(`Processing document ID: ${documentId}`);

          // Build assign URL using the base URL
          const assignUrl = `${baseUrl}/api/assign-pending-links`;
          console.log(`Calling endpoint: ${assignUrl}`);

          const response = await fetch(assignUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ variantId: documentId }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(
              `Error response from assign-pending-links: ${errorText}`
            );
            results.push({
              type: "assign-pending-links",
              documentId,
              success: false,
              error: `Failed: ${response.status} ${errorText}`,
            });
          } else {
            const result = await response.json();
            console.log(`Result for document ${documentId}:`, result);
            results.push({
              type: "assign-pending-links",
              documentId,
              success: true,
              result,
            });
          }
        } catch (error) {
          console.error(`Error processing document ${documentId}:`, error);
          results.push({
            type: "assign-pending-links",
            documentId,
            success: false,
            error: error.message,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error in assign-pending-links processing:", error);
    results.push({
      type: "assign-pending-links",
      success: false,
      error: error.message,
    });
  }

  // Now, trigger the notification webhook
  try {
    // Make sure to use the correct path for your notifications endpoint
    const notificationUrl = `${baseUrl}/api/notification`;
    console.log(`Calling notification endpoint: ${notificationUrl}`);

    // Forward the original payload to the notification webhook
    const notificationResponse = await fetch(notificationUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!notificationResponse.ok) {
      const errorText = await notificationResponse.text();
      console.error(`Error response from notifications webhook: ${errorText}`);
      results.push({
        type: "notification",
        success: false,
        error: `Failed to send notifications: ${notificationResponse.status} ${errorText}`,
      });
    } else {
      const notificationResult = await notificationResponse.json();
      console.log(`Notification result:`, notificationResult);
      results.push({
        type: "notification",
        success: true,
        result: notificationResult,
      });
    }
  } catch (error) {
    console.error(`Error sending notifications:`, error);
    results.push({
      type: "notification",
      success: false,
      error: error.message,
    });
  }

  return NextResponse.json({ message: "Webhook processed", results });
}
