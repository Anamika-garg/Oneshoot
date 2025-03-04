import { NextResponse } from "next/server";
import crypto from "crypto";

// Use the correct environment variable name
const WEBHOOK_SECRET = process.env.NEXT_PUBLIC_SANITY_WEBHOOK_SECRET;

export async function POST(request) {
  console.log("Sanity webhook received");

  try {
    // For testing purposes, you can set this to true to bypass verification
    const bypassVerification = true;

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

      const payload = JSON.parse(rawBody);
      console.log("Webhook payload:", payload);
      return processWebhook(payload, request);
    } else {
      console.log("Bypassing signature verification");
      const payload = await request.json();
      console.log("Webhook payload:", payload);
      return processWebhook(payload, request);
    }
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
  // Check for "ids", "documentId", or fallback to "_id"
  let documentIds = [];
  if (payload.ids && Array.isArray(payload.ids) && payload.ids.length > 0) {
    documentIds = payload.ids;
  } else if (payload.documentId) {
    documentIds = [payload.documentId];
  } else if (payload._id) {
    documentIds = [payload._id];
  } else {
    console.error("Webhook payload missing document identifiers", payload);
    return NextResponse.json({ message: "No document IDs to process" });
  }

  console.log(`Processing ${documentIds.length} document ID(s) from webhook`);

  // Use a base URL from env or fallback to http://localhost:3000
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const results = [];
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
        console.error(`Error response from assign-pending-links: ${errorText}`);
        throw new Error(
          `Failed to assign pending links: ${response.status} ${errorText}`
        );
      }

      const result = await response.json();
      console.log(`Result for document ${documentId}:`, result);
      results.push({ documentId, success: true, result });
    } catch (error) {
      console.error(`Error processing document ${documentId}:`, error);
      results.push({ documentId, success: false, error: error.message });
    }
  }

  return NextResponse.json({ message: "Webhook processed", results });
}
