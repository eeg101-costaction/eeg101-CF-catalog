/**
 * Quick test script to see your Zotero resource IDs
 * Run with: node scripts/check-resources.mjs
 */

import "dotenv/config";
import { fetchAllItems } from "../src/lib/zotero/client.js";
import { transformItems } from "../src/lib/zotero/transform.js";

async function main() {
  console.log("Fetching resources from Zotero...\n");

  try {
    const rawItems = await fetchAllItems({ limit: 10 });
    const resources = transformItems(rawItems);

    console.log(`Found ${resources.length} resources:\n`);

    resources.forEach((resource, index) => {
      console.log(`${index + 1}. ID: ${resource.id}`);
      console.log(`   Title: ${resource.title}`);
      console.log(`   Type: ${resource.type}`);
      console.log(
        `   URL to test: http://localhost:3000/resources/${resource.id}`
      );
      console.log("");
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
