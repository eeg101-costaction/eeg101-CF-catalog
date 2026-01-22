import Hero from "@/components/ui/Hero";
import { ResourcesPageClient } from "@/components/Resources/ResourcesPageClient";
import {
  fetchItemsFromCollection,
  fetchCollections,
} from "@/lib/zotero/client";
import { transformItems } from "@/lib/zotero/transform";
import { unstable_cache } from "next/cache";
import { cache } from "react";

const COLLECTION_KEYS = ["F9DNTXQA", "ZD2RV8H9", "L72L5WAP"];

// Enable static generation for instant page loads
export const revalidate = 3600; // Revalidate cache every hour

// Add metadata for better SEO
export const metadata = {
  title: "Resource Catalog - EEG101",
  description:
    "Search, filter, and use resources that advance EEG science in an ethical and concrete way.",
};

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

// Prepare resource data for card view
function prepareForCard(resource) {
  return {
    id: resource.id,
    type: resource.type,
    family: resource.family,
    color: resource.color,
    themeColor: resource.themeColor,
    title: resource.title,
    creators: resource.creators || "",
    manifestoPart: resource.manifestoPart || "",
    year: resource.year || "",
    abstractPreview: resource.abstractPreview || "",
    tags: resource.tags || [],
    language: resource.language || undefined,
  };
}

// Cache the resource fetching for 1 hour (3600 seconds)
// This makes subsequent page loads instant by serving from cache
const getCachedResources = cache(
  unstable_cache(
    async () => {
      console.log("🔄 Fetching fresh data from Zotero...");
      const startTime = Date.now();

      try {
        // Get collection info
        let collectionNames = {};
        try {
          const collections = await fetchCollections();
          COLLECTION_KEYS.forEach((key) => {
            const collection = collections.find((c) => c.key === key);
            if (collection) collectionNames[key] = collection.name;
          });
        } catch (error) {
          console.warn("Could not fetch collection names:", error.message);
        }

        // Fetch and transform items from all collections in parallel
        const allResources = (
          await Promise.all(
            COLLECTION_KEYS.map(async (collectionKey) => {
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
        const resources = deduplicateResources(allResources);

        // Format resources for card view
        const result = resources.map(prepareForCard);

        console.log(
          `✅ Fetched ${result.length} resources in ${Date.now() - startTime}ms`
        );
        return result;
      } catch (error) {
        console.error("Error fetching resources:", error);
        return [];
      }
    },
    ["resources-all"], // Cache key
    {
      revalidate: 3600, // Cache for 1 hour
      tags: ["resources"],
    }
  )
);

export default async function ResourcesPage() {
  // Use cached resources for instant page loads
  const resources = await getCachedResources();

  return (
    <div>
      <Hero
        title="Resource catalog of the EEG101 Community Framework"
        subtitle="Search, filter, and use resources that advance EEG science in an ethical and concrete way just below."
      />
      <ResourcesPageClient initialResources={resources} />
    </div>
  );
}
