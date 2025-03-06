import { writeClient } from "@/lib/sanity";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // FIXED: Removed NEXT_PUBLIC_ prefix for server-side env var

// Initialize Supabase client with admin privileges for storage operations
let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn("Supabase environment variables not set");
}

export async function POST(request) {
  try {
    const { variantId, filePath, downloadLinks } = await request.json();

    if (!variantId || !filePath || !downloadLinks) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters",
        },
        { status: 400 }
      );
    }

    console.log(`Processing cleanup for file: ${filePath}`);

    // 1. Remove file from Supabase storage (if Supabase client is available)
    if (supabase) {
      try {
        const bucketName = "product-files"; // Your bucket name

        // FIXED: Improved URL parsing logic
        let relativeFilePath;

        try {
          // Check if it's a full URL
          if (filePath.startsWith("http")) {
            const urlObj = new URL(filePath);
            const pathParts = urlObj.pathname.split("/");
            // Find the index after the bucket name in the path
            const bucketIndex = pathParts.findIndex(
              (part) => part === bucketName
            );
            if (bucketIndex !== -1) {
              // Get everything after the bucket name
              relativeFilePath = pathParts.slice(bucketIndex + 1).join("/");
            } else {
              // Fallback: just use the filename
              relativeFilePath = pathParts[pathParts.length - 1];
            }
          } else {
            // It's already a relative path
            relativeFilePath = filePath;
          }

          // Decode URI components
          relativeFilePath = decodeURIComponent(relativeFilePath);
        } catch (urlError) {
          console.error("Error parsing URL:", urlError);
          // Fallback to using the raw filePath
          relativeFilePath = filePath;
        }

        console.log(
          `Attempting to delete file: ${relativeFilePath} from bucket: ${bucketName}`
        );

        const { data, error: deleteError } = await supabase.storage
          .from(bucketName)
          .remove([relativeFilePath]);

        if (deleteError) {
          console.error("Error deleting file from storage:", deleteError);
          // Continue with Sanity update even if file deletion fails
        } else {
          console.log(`Successfully deleted file: ${relativeFilePath}`, data);
        }
      } catch (storageError) {
        console.error("Error with Supabase storage operation:", storageError);
        // Continue with Sanity update even if storage operation fails
      }
    } else {
      console.warn("Supabase client not initialized. Skipping file deletion.");
    }

    // 2. Update Sanity document to remove the used link
    try {
      // FIXED: First check if the variant exists
      const existingDoc = await writeClient.getDocument(variantId);

      if (!existingDoc) {
        return NextResponse.json(
          {
            success: false,
            error: `Variant with ID ${variantId} not found`,
          },
          { status: 404 }
        );
      }

      // Filter out the link to remove
      const updatedLinks = downloadLinks.filter(
        (link) => link.filePath !== filePath
      );

      console.log(`Updating Sanity document. Removing link: ${filePath}`);
      console.log(
        `Links before: ${downloadLinks.length}, Links after: ${updatedLinks.length}`
      );

      // FIXED: Added error handling for Sanity update
      const result = await writeClient
        .patch(variantId)
        .set({ downloadLinks: updatedLinks })
        .commit();

      console.log("Sanity update result:", result);

      return NextResponse.json({
        success: true,
        message: "Download link and file cleaned up successfully",
        remainingLinks: updatedLinks.length,
      });
    } catch (sanityError) {
      console.error("Error updating Sanity document:", sanityError);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to update Sanity document: ${sanityError.message}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in cleanup process:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to cleanup download link and file",
        stack: error.stack, // Include stack trace for debugging
      },
      { status: 500 }
    );
  }
}
