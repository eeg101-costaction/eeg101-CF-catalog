/**
 * Revalidation API Endpoint
 *
 * POST /api/revalidate
 *
 * Forces a refresh of cached Zotero data.
 * Optionally protected by a secret token.
 */

import { revalidateTag, revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Optional: Add secret token protection
    // const { searchParams } = new URL(request.url);
    // const token = searchParams.get("token");
    // if (token !== process.env.REVALIDATE_SECRET) {
    //   return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    // }

    // Revalidate the resources cache tag
    revalidateTag("resources");

    // Also revalidate the resources page path
    revalidatePath("/resources");

    return NextResponse.json({
      success: true,
      message: "Cache revalidated successfully",
      revalidatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to revalidate cache",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
