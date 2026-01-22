/**
 * EEG101 Resources API Endpoint
 *
 * GET /api/resources
 *
 * Query parameters:
 * - collection: Collection key(s), comma-separated (e.g., 'F9DNTXQA,ZD2RV8H9,L72L5WAP') [required]
 * - family: Filter by family ('bibliographic', 'multimedia', 'technical', 'webpage') [optional]
 * - page: Page number for pagination (default: 1) [optional]
 * - perPage: Items per page (default: 20, max: 100) [optional]
 * - format: 'card' or 'detail' (default: 'card') [optional]
 */

import { NextResponse } from "next/server";
import {
  fetchItemsFromCollection,
  fetchCollections,
} from "@/lib/zotero/client";
import {
  transformItems,
  groupByFamily,
  getResourceStats,
  prepareForCard,
  prepareForDetail,
} from "@/lib/zotero/transform";

// Deduplicate and merge manifestoPart arrays for resources with the same id
function deduplicateResources(resources) {
  const map = new Map();

  resources.forEach((res) => {
    const id = res.id;
    const parts = Array.isArray(res.manifestoPart)
      ? res.manifestoPart
      : res.manifestoPart
      ? [res.manifestoPart]
      : [];

    if (!map.has(id)) {
      map.set(id, { ...res, manifestoPart: parts });
    } else {
      const existing = map.get(id);
      const mergedParts = Array.from(
        new Set([...existing.manifestoPart, ...parts])
      );
      map.set(id, { ...existing, ...res, manifestoPart: mergedParts });
    }
  });

  return Array.from(map.values());
}

export async function GET(request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const collectionParam = searchParams.get("collection");
    const familyFilter = searchParams.get("family");
    const format = searchParams.get("format") || "card"; // 'card' or 'detail'
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const perPage = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("perPage") || "20", 10))
    );

    // Validate parameters
    if (!collectionParam) {
      return NextResponse.json(
        { error: "Missing required parameter: collection" },
        { status: 400 }
      );
    }

    if (
      familyFilter &&
      !["bibliographic", "multimedia", "technical", "webpage"].includes(
        familyFilter
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid family. Must be: bibliographic, multimedia, technical, or webpage",
        },
        { status: 400 }
      );
    }

    // Support multiple collections (comma-separated)
    const collectionKeys = collectionParam.split(",").map((k) => k.trim());

    // Get collection info to include the name in transformed items
    let collections = [];
    let collectionNames = {};
    try {
      collections = await fetchCollections();
      collectionKeys.forEach((key) => {
        const collection = collections.find((c) => c.key === key);
        if (collection) collectionNames[key] = collection.name;
      });
    } catch (error) {
      console.warn("Could not fetch collection names:", error.message);
    }

    // Fetch and transform items from all collections in parallel
    const allResources = (
      await Promise.all(
        collectionKeys.map(async (collectionKey) => {
          const rawItems = await fetchItemsFromCollection(collectionKey, {
            limit: 10000, // Fetch all items per collection
          });
          return transformItems(rawItems, {
            collectionName: collectionNames[collectionKey] || "",
            collectionKey,
          });
        })
      )
    ).flat();

    // Deduplicate and merge manifestoPart arrays
    let resources = deduplicateResources(allResources);

    // Filter by family if specified
    if (familyFilter) {
      resources = resources.filter((r) => r.family === familyFilter);
    }

    // Pagination
    const total = resources.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const pagedResources = resources.slice(start, end);

    // Format resources based on requested format
    const formattedResources =
      format === "card"
        ? pagedResources.map(prepareForCard)
        : pagedResources.map(prepareForDetail);

    // Get statistics
    const stats = getResourceStats(resources);
    const grouped = groupByFamily(resources);

    // Return response
    return NextResponse.json({
      success: true,
      data: formattedResources,
      meta: {
        total,
        page,
        perPage,
        totalPages,
        collections: collectionKeys.map((key) => ({
          key,
          name: collectionNames[key] || "",
        })),
        familyFilter: familyFilter || null,
        format,
        stats,
        countByFamily: {
          bibliographic: grouped.bibliographic.length,
          multimedia: grouped.multimedia.length,
          technical: grouped.technical.length,
          webpage: grouped.webpage.length,
        },
      },
    });
  } catch (error) {
    console.error("Resources API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch resources",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
