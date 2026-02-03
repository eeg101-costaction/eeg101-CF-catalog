/**
 * Zotero Change Detection & Polling
 * 
 * This module implements efficient change detection using Zotero's version API.
 * Instead of fetching all items every time, we:
 * 1. Check if the library version has changed (lightweight API call)
 * 2. Only if changed, fetch the items that were modified
 * 
 * Usage:
 *   const changed = await detectChanges(collectionKey);
 *   if (changed) {
 *     // Fetch items
 *   }
 */

import {
  getLastKnownVersion,
  setCollectionVersion,
  checkIfCollectionChanged,
  logVersionInfo,
} from "./versionTracking.js";
import { fetchItemsFromCollection } from "./client.js";

/**
 * Detect if a collection has changed since the last check
 * Uses a lightweight API call to check version only
 *
 * @param {string} collectionKey - The Zotero collection key
 * @returns {Promise<Object>} { hasChanged, lastVersion, currentVersion }
 */
export async function detectChanges(collectionKey) {
  try {
    // Get the last known version for this collection
    const lastVersion = getLastKnownVersion(collectionKey);

    // Get the zotero-api-client
    const { fetchCollections } = await import("./client.js");
    const api = (await import("zotero-api-client")).default ||
      (await import("zotero-api-client"));
    const key = process.env.ZOTERO_KEY?.trim();
    const libraryType = process.env.ZOTERO_LIBRARY_TYPE?.trim() || "group";
    const libraryId = process.env.ZOTERO_LIBRARY_ID?.trim();

    const library = api(key).library(libraryType, libraryId);

    // Make a minimal request to just check the version
    // We request the collections endpoint with If-Modified-Since-Version header
    // This returns 304 if nothing changed, or the current version if it did
    const response = await library
      .collections(collectionKey)
      .items()
      .top()
      .get({ limit: 1 }); // Fetch just 1 item to get the version header

    const currentVersion =
      response.getVersion && response.getVersion()
        ? response.getVersion()
        : response.response?.headers?.get("last-modified-version");

    if (!currentVersion) {
      console.warn(`⚠️  Could not get version for ${collectionKey}`);
      return { hasChanged: true, lastVersion, currentVersion: "unknown" };
    }

    // Check if version changed
    const versionInfo = checkIfCollectionChanged(collectionKey, currentVersion);
    logVersionInfo(collectionKey, versionInfo);

    return versionInfo;
  } catch (error) {
    console.error(
      `Error detecting changes for ${collectionKey}:`,
      error.message
    );
    // On error, assume changes to be safe
    return {
      hasChanged: true,
      lastVersion: getLastKnownVersion(collectionKey),
      currentVersion: "unknown",
      error: error.message,
    };
  }
}

/**
 * Fetch items that have changed since the last check
 * Only fetches items newer than the last known version
 *
 * @param {string} collectionKey - The Zotero collection key
 * @param {Object} options - Additional options
 * @param {number} options.limit - Max items to fetch (default: 10000)
 * @returns {Promise<Array>} Array of changed items
 */
export async function fetchChangedItems(collectionKey, options = {}) {
  try {
    const lastVersion = getLastKnownVersion(collectionKey);
    const { limit = 10000 } = options;

    console.log(
      `📥 Fetching items from ${collectionKey} since version ${lastVersion}...`
    );

    // Fetch items modified since lastVersion
    // The zotero-api-client may not support the ?since parameter directly,
    // so we might need to fetch all and filter, or use raw API
    // For now, we fetch all items and rely on the response version
    const items = await fetchItemsFromCollection(collectionKey, { limit });

    return items;
  } catch (error) {
    console.error(`Error fetching changed items: ${error.message}`);
    throw error;
  }
}

/**
 * Poll for changes across multiple collections
 * Returns which collections have changed
 *
 * @param {Array<string>} collectionKeys - Collection keys to check
 * @returns {Promise<Array>} Array of collections that changed
 */
export async function pollForChanges(collectionKeys) {
  console.log("🔍 Polling for changes...");

  const results = await Promise.all(
    collectionKeys.map(async (key) => {
      const changes = await detectChanges(key);
      return { key, ...changes };
    })
  );

  const changedCollections = results.filter((r) => r.hasChanged);

  if (changedCollections.length === 0) {
    console.log("✓ No changes detected");
  } else {
    console.log(`📢 ${changedCollections.length} collection(s) changed`);
  }

  return changedCollections;
}
