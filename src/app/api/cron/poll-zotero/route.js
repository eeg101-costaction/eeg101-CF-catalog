/**
 * Cron Job Endpoint for Polling Zotero Changes
 *
 * This endpoint detects changes in Zotero collections and revalidates the cache if needed.
 * Can be called by:
 * - Vercel Crons (built-in cron jobs)
 * - External services like EasyCron, AWS Lambda, GitHub Actions
 * - Manual API calls
 *
 * Usage:
 * GET /api/cron/poll-zotero
 * With optional header: Authorization: Bearer YOUR_SECRET_TOKEN
 *
 * Returns:
 * {
 *   "success": true,
 *   "checked": 3,
 *   "changed": 1,
 *   "collections": [
 *     {
 *       "key": "F9DNTXQA",
 *       "name": "Part 1: Validity",
 *       "hasChanged": true,
 *       "lastVersion": "1234",
 *       "currentVersion": "1235"
 *     }
 *   ]
 * }
 */

import { NextResponse } from "next/server";
import { pollForChanges } from "@/lib/zotero/changeDetection";
import { fetchCollections } from "@/lib/zotero/client";
import { revalidateTag } from "next/cache";

const COLLECTION_KEYS = ["F9DNTXQA", "ZD2RV8H9", "L72L5WAP"];

/**
 * Verify the cron job secret token
 * This prevents unauthorized cache invalidations
 */
function verifyToken(request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const expectedToken = process.env.CRON_SECRET;

  // If no CRON_SECRET is set, allow requests (useful for local development)
  if (!expectedToken) {
    console.warn(
      "⚠️  CRON_SECRET not set in environment. Cron endpoint is unprotected."
    );
    return true;
  }

  return token === expectedToken;
}

export async function GET(request) {
  try {
    // Verify token if it exists
    if (!verifyToken(request)) {
      console.warn("🚫 Unauthorized cron request");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("⏰ Polling cron job started");

    // Get collection names for the response
    let collectionInfo = {};
    try {
      const collections = await fetchCollections();
      COLLECTION_KEYS.forEach((key) => {
        const collection = collections.find((c) => c.key === key);
        if (collection) {
          collectionInfo[key] = collection.name;
        }
      });
    } catch (error) {
      console.warn("Could not fetch collection names:", error.message);
    }

    // Poll for changes
    const changedCollections = await pollForChanges(COLLECTION_KEYS);

    // If anything changed, invalidate the cache
    if (changedCollections.length > 0) {
      console.log("🔄 Invalidating cache for zotero-resources");
      try {
        revalidateTag("zotero-resources");
      } catch (error) {
        console.warn("Could not revalidate cache:", error.message);
        // Don't fail if cache revalidation doesn't work
      }
    }

    // Prepare response with collection details
    const changedWithInfo = changedCollections.map((col) => ({
      key: col.key,
      name: collectionInfo[col.key] || "Unknown",
      hasChanged: col.hasChanged,
      lastVersion: col.lastVersion,
      currentVersion: col.currentVersion,
    }));

    return NextResponse.json({
      success: true,
      checked: COLLECTION_KEYS.length,
      changed: changedCollections.length,
      timestamp: new Date().toISOString(),
      collections: changedWithInfo,
    });
  } catch (error) {
    console.error("Cron polling error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to poll for changes",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Support HEAD requests for monitoring/health checks
 */
export async function HEAD() {
  return new Response(null, { status: 200 });
}
