/**
 * Test script for transform.js
 * Run with: node scripts/test-transform.mjs
 */

import dotenv from "dotenv";
import { fetchItemsFromCollection } from "../src/lib/zotero/client.js";
import {
  transformItems,
  groupByFamily,
  getResourceStats,
  prepareForCard,
  prepareForDetail,
} from "../src/lib/zotero/transform.js";

// Load environment variables
dotenv.config({ path: ".env.local" });

console.log("=== Testing Zotero Transform ===\n");

try {
  // Fetch items from Part 1 collection
  console.log(
    '1. Fetching items from "Part 1: Validity and Research integrity"...'
  );
  const rawItems = await fetchItemsFromCollection("F9DNTXQA", { limit: 10 });
  console.log(`   Fetched ${rawItems.length} raw items\n`);

  // Transform items with collection info
  console.log("2. Transforming items...");
  const resources = transformItems(rawItems, {
    collectionName: "Part 1: Validity and Research integrity",
    collectionKey: "F9DNTXQA",
  });
  console.log(`   Transformed ${resources.length} resources\n`);

  // Show first 2 transformed resources with all new fields
  console.log("3. Sample transformed resources (full detail):\n");
  resources.slice(0, 2).forEach((resource, index) => {
    console.log(`   ${index + 1}. ${resource.title}`);
    console.log(`      Type: ${resource.type}`);
    console.log(`      Family: ${resource.family}`);
    console.log(
      `      Color: ${resource.color} (theme: ${resource.themeColor})`
    );
    console.log(`      Manifesto Part: ${resource.manifestoPart || "(none)"}`);
    if (resource.creators) console.log(`      Creators: ${resource.creators}`);
    if (resource.year) console.log(`      Year: ${resource.year}`);
    if (resource.tags && resource.tags.length > 0) {
      console.log(`      Tags: ${resource.tags.join(", ")}`);
    }
    if (resource.abstractPreview) {
      console.log(`      Abstract (preview): ${resource.abstractPreview}`);
    }
    if (resource.citation) {
      console.log(`      APA Citation: ${resource.citation}`);
    }
    if (resource.doi) console.log(`      DOI: ${resource.doi}`);
    if (resource.url) console.log(`      URL: ${resource.url}`);
    console.log("");
  });

  // Test card view preparation
  console.log("3b. Card view format (first item):\n");
  const cardData = prepareForCard(resources[0]);
  console.log(JSON.stringify(cardData, null, 2));
  console.log("");

  // Group by family
  console.log("4. Grouping by family...");
  const grouped = groupByFamily(resources);
  Object.entries(grouped).forEach(([family, items]) => {
    console.log(`   ${family}: ${items.length} items`);
  });
  console.log("");

  // Get statistics
  console.log("5. Resource statistics:");
  const stats = getResourceStats(resources);
  console.log(`   Total: ${stats.total}`);
  console.log("   By Family:");
  Object.entries(stats.byFamily).forEach(([family, count]) => {
    console.log(`     - ${family}: ${count}`);
  });
  console.log("   By Type:");
  Object.entries(stats.byType).forEach(([type, count]) => {
    console.log(`     - ${type}: ${count}`);
  });

  console.log("\n=== Tests Passed! ===");
} catch (error) {
  console.error("\n❌ Test failed:", error.message);
  process.exit(1);
}
