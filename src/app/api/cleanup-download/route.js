import { writeClient } from "@/lib/sanity";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

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
    console.log(`Processing cleanup for file: ${filePath}`);

    // 1. Remove file from Supabase storage (if Supabase client is available)
    if (supabase) {
      try {
        const bucketName = "product-files"; // Your bucket name

        // Parse the file URL to extract the relative path.
        // Example URL: https://<project>.supabase.co/storage/v1/object/sign/product-files/Spanish%20Banks/BNext/ssdf33234.zip?token=...
        const urlObj = new URL(filePath);
        const pathname = urlObj.pathname; // e.g. "/storage/v1/object/sign/product-files/Spanish%20Banks/BNext/ssdf33234.zip"
        const prefix = `/storage/v1/object/sign/${bucketName}/`;
        const relativeFilePath = pathname.startsWith(prefix)
          ? decodeURIComponent(pathname.slice(prefix.length))
          : decodeURIComponent(pathname);

        console.log(
          `Attempting to delete file: ${relativeFilePath} from bucket: ${bucketName}`
        );

        const { error: deleteError } = await supabase.storage
          .from(bucketName)
          .remove([relativeFilePath]);

        if (deleteError) {
          console.error("Error deleting file from storage:", deleteError);
          // Continue with Sanity update even if file deletion fails
        } else {
          console.log(`Successfully deleted file: ${relativeFilePath}`);
        }
      } catch (storageError) {
        console.error("Error with Supabase storage operation:", storageError);
        // Continue with Sanity update even if storage operation fails
      }
    } else {
      console.warn("Supabase client not initialized. Skipping file deletion.");
    }

    // 2. Update Sanity document to remove the used link
    const updatedLinks = downloadLinks.filter(
      (link) => link.filePath !== filePath
    );
    console.log(`Updating Sanity document. Removing link: ${filePath}`);
    console.log(
      `Links before: ${downloadLinks.length}, Links after: ${updatedLinks.length}`
    );

    await writeClient
      .patch(variantId)
      .set({ downloadLinks: updatedLinks })
      .commit();

    return NextResponse.json({
      success: true,
      message: "Download link and file cleaned up successfully",
      remainingLinks: updatedLinks.length,
    });
  } catch (error) {
    console.error("Error in cleanup process:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to cleanup download link and file",
      },
      { status: 500 }
    );
  }
}
