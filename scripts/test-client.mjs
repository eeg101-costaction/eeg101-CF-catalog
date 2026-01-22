/**
 * Test script for client.js
 * Run with: node scripts/test-client.mjs
 */

import dotenv from "dotenv";
import {
  fetchCollections,
  fetchItemsFromCollection,
} from "../src/lib/zotero/client.js";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

console.log("=== Testing Zotero Client ===\n");

try {
  // Test 1: Fetch collections
  console.log("1. Fetching collections...");
  const collections = await fetchCollections();

  console.log(`   Found ${collections.length} collections:\n`);
  collections.forEach((col) => {
    console.log(`   - ${col.name}`);
    console.log(`     Key: ${col.key}`);
    console.log(`     Items: ${col.numItems}`);
    console.log("");
  });

  // Test 2: Fetch items from the 3 parts (Part 1, 2, and 3)
  const partsToTest = collections.filter(
    (col) =>
      col.name.includes("Part 1:") ||
      col.name.includes("Part 2:") ||
      col.name.includes("Part 3:")
  );

  if (partsToTest.length > 0) {
    console.log(`2. Fetching items from Parts 1, 2, and 3...\n`);

    for (const collection of partsToTest) {
      console.log(`   Collection: "${collection.name}" (${collection.key})`);

      // First, get all items to see total count
      const allItems = await fetchItemsFromCollection(collection.key, {
        limit: 100,
      });
      console.log(`   Total items: ${allItems.length}`);
      console.log(`   Showing first 5:\n`);

      const itemsToShow = allItems.slice(0, 5);

      if (allItems.length === 0) {
        console.log(`     (No items in this collection)\n`);
      } else {
        itemsToShow.forEach((item, index) => {
          const title = item.data?.title || item.title || "(No title)";
          const itemType = item.data?.itemType || item.itemType || "unknown";
          console.log(`     ${index + 1}. ${title}`);
          console.log(`        Type: ${itemType}`);
          console.log(`        Key: ${item.key}`);
          console.log("");
        });
      }
    }
  } else {
    console.log("\n2. No Part 1, 2, or 3 collections found.");
  }

  console.log("=== Tests Passed! ===");
} catch (error) {
  console.error("\nTest failed:", error.message);
  process.exit(1);
}
