/**
 * Zotero Version Tracking
 * 
 * This module tracks the library version for each collection to detect changes.
 * The version is stored in memory (can be upgraded to persistent storage like Redis/DB).
 * 
 * When revalidating, we check if the library version has changed since the last check.
 * If it hasn't, we skip the expensive Zotero API call and return cached data.
 * If it has, we fetch only the changed items using the ?since= parameter.
 */

import fs from "fs";
import path from "path";

// Store version info in a local file for persistence across server restarts
const VERSION_STORE_PATH = "./.zotero-versions.json";

/**
 * Load stored versions from disk
 */
function loadStoredVersions() {
  try {
    if (fs.existsSync(VERSION_STORE_PATH)) {
      const data = fs.readFileSync(VERSION_STORE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn("Could not load version store:", error.message);
  }
  return {};
}

/**
 * Save versions to disk
 */
function saveVersions(versions) {
  try {
    fs.writeFileSync(VERSION_STORE_PATH, JSON.stringify(versions, null, 2));
  } catch (error) {
    console.error("Failed to save versions:", error.message);
  }
}

/**
 * Get the last known version for a collection
 */
export function getLastKnownVersion(collectionKey) {
  const versions = loadStoredVersions();
  return versions[collectionKey] || "0";
}

/**
 * Update the stored version for a collection
 */
export function setCollectionVersion(collectionKey, version) {
  const versions = loadStoredVersions();
  versions[collectionKey] = version;
  saveVersions(versions);
  console.log(`📌 Updated version for ${collectionKey}: ${version}`);
}

/**
 * Check if a collection has been updated since last check
 * Returns { hasChanged: boolean, lastVersion: string }
 */
export function checkIfCollectionChanged(
  collectionKey,
  currentLibraryVersion
) {
  const lastVersion = getLastKnownVersion(collectionKey);
  const hasChanged = lastVersion !== currentLibraryVersion;

  return {
    hasChanged,
    lastVersion,
    currentVersion: currentLibraryVersion,
  };
}

/**
 * Log version info for debugging
 */
export function logVersionInfo(collectionKey, info) {
  if (info.hasChanged) {
    console.log(
      `🔄 ${collectionKey}: Version changed from ${info.lastVersion} → ${info.currentVersion}`
    );
  } else {
    console.log(
      `✓ ${collectionKey}: No changes since version ${info.lastVersion}`
    );
  }
}
