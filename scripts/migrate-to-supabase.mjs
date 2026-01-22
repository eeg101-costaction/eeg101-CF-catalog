/**
 * Migration Script: Zotero → Supabase
 *
 * This script fetches all resources from Zotero and inserts them into Supabase.
 * Run with: node scripts/migrate-to-supabase.mjs
 */

import { fetchItemsFromCollection } from "../src/lib/zotero/client.js";
import { transformItems } from "../src/lib/zotero/transform.js";
import { supabase } from "../src/lib/supabase/server.js";
import { COLLECTION_KEYS } from "../src/lib/zotero/constants.js";

async function migrateToSupabase() {
  console.log("🚀 Starting migration from Zotero to Supabase...\n");

  try {
    // Fetch all items from all collections
    console.log("📥 Fetching items from Zotero...");
    const allItems = await fetchItemsFromCollection(COLLECTION_KEYS.join(","));
    console.log(`✅ Fetched ${allItems.length} items from Zotero\n`);

    // Transform items
    console.log("🔄 Transforming items...");
    const transformedItems = transformItems(allItems);
    console.log(`✅ Transformed ${transformedItems.length} items\n`);

    // Prepare data for Supabase
    const supabaseData = transformedItems.map((item) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      family: item.family,
      color: item.color,
      creators: item.creators,
      date: item.date,
      url: item.url,
      abstract: item.abstract,
      tags: item.tags || [],
      manifesto_part: Array.isArray(item.manifestoPart)
        ? item.manifestoPart
        : [item.manifestoPart],
      workshop: item.workshop || false,
      citation: item.citation,
    }));

    // Insert into Supabase (upsert to avoid duplicates)
    console.log("💾 Inserting into Supabase...");
    const { data, error } = await supabase
      .from("resources")
      .upsert(supabaseData, { onConflict: "id" });

    if (error) {
      throw error;
    }

    console.log(
      `✅ Successfully migrated ${supabaseData.length} resources to Supabase!\n`
    );
    console.log("🎉 Migration complete!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateToSupabase();
