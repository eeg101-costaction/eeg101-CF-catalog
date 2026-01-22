/**
 * Test workshop flag detection
 * Run with: node scripts/test-workshop.mjs
 */

import dotenv from "dotenv";
import { fetchItemsFromCollection } from "../src/lib/zotero/client.js";
import { transformItems } from "../src/lib/zotero/transform.js";

dotenv.config({ path: ".env.local" });

console.log("=== Testing Workshop Flag Detection ===\n");

try {
  // Fetch items from Part 1
  const rawItems = await fetchItemsFromCollection("F9DNTXQA", { limit: 20 });

  // Transform with collection info
  const resources = transformItems(rawItems, {
    collectionName: "Part 1: Validity and Research integrity",
    collectionKey: "F9DNTXQA",
  });

  console.log(`Total resources: ${resources.length}\n`);

  // Find workshop items
  const workshopItems = resources.filter((r) => r.isWorkshop);
  console.log(`Resources with "workshop" tag: ${workshopItems.length}\n`);

  if (workshopItems.length > 0) {
    console.log("Workshop items found:");
    workshopItems.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.title}`);
      console.log(`   Tags: ${item.tags.join(", ")}`);
      console.log(`   isWorkshop: ${item.isWorkshop}`);
    });
  } else {
    console.log("No workshop items found in this collection.");
    console.log("\nShowing all items with their tags:");
    resources.slice(0, 5).forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.title}`);
      console.log(`   Tags: ${item.tags?.join(", ") || "(no tags)"}`);
      console.log(`   isWorkshop: ${item.isWorkshop || false}`);
    });
  }

  console.log("\n=== Test Complete ===");
} catch (error) {
  console.error("\n❌ Test failed:", error.message);
  process.exit(1);
}
