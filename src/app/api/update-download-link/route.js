import { writeClient } from "@/lib/sanity";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { variantId, downloadLinks } = await request.json();

    if (!variantId || !downloadLinks) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log(`Updating download links for variant: ${variantId}`);
    console.log(`Number of links: ${downloadLinks.length}`);

    // Add a small delay to ensure sequential processing
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Update the variant in Sanity
    const result = await writeClient
      .patch(variantId)
      .set({ downloadLinks: downloadLinks })
      .commit();

    console.log(
      `Successfully updated download links for variant: ${variantId}`
    );

    return NextResponse.json({
      success: true,
      message: "Download links updated successfully",
      result,
    });
  } catch (error) {
    console.error("Error updating download links:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update download links",
      },
      { status: 500 }
    );
  }
}
