/**
 * Zotero API Client
 *
 * This file handles all communication with the Zotero API.
 * It reads credentials from environment variables and provides
 * simple functions to fetch collections and items.
 */

import api from "zotero-api-client";

/**
 * Get Zotero API configuration from environment variables
 *
 * Environment variables needed:
 * - ZOTERO_KEY: Your Zotero API key
 * - ZOTERO_LIBRARY_TYPE: Either 'user' or 'group'
 * - ZOTERO_LIBRARY_ID: Your library ID (user ID or group ID)
 */
function getZoteroConfig() {
  const key = process.env.ZOTERO_KEY?.trim();
  const libraryType = process.env.ZOTERO_LIBRARY_TYPE?.trim() || "group";
  const libraryId = process.env.ZOTERO_LIBRARY_ID?.trim();

  if (!key || !libraryId) {
    throw new Error(
      "Missing Zotero credentials. Please set ZOTERO_KEY and ZOTERO_LIBRARY_ID in .env.local"
    );
  }

  return { key, libraryType, libraryId };
}

/**
 * Create a Zotero API client instance
 *
 * This creates the connection to your Zotero library.
 * It uses the credentials from .env.local file.
 *
 * @returns {Object} Zotero API client configured for your library
 */
function createZoteroClient() {
  const { key, libraryType, libraryId } = getZoteroConfig();

  // Handle different export formats of zotero-api-client
  const zoteroApi = api.default || api;

  return zoteroApi(key).library(libraryType, libraryId);
}

/**
 * Fetch all collections from the Zotero library
 *
 * Collections are folders in Zotero (like "Part 1: Validity", "Part 2: Democratization").
 *
 * @returns {Promise<Array>} Array of collection objects with { key, name, parentCollection }
 *
 * Example return:
 * [
 *   { key: 'ASWVI2UU', name: 'Part 1: Validity', parentCollection: null },
 *   { key: 'F9DNTXQA', name: 'Part 2: Democratization', parentCollection: null }
 * ]
 */
export async function fetchCollections() {
  try {
    const library = createZoteroClient();
    const response = await library.collections().get();

    // Extract just the data we need
    // Handle both response formats (some have data nested, some don't)
    return response.getData().map((collection) => ({
      key: collection.key || collection.data?.key,
      name: collection.data?.name || collection.name,
      parentCollection:
        collection.data?.parentCollection ||
        collection.parentCollection ||
        null,
      numItems: collection.meta?.numItems || 0,
    }));
  } catch (error) {
    console.error("Error fetching collections:", error.message);
    throw new Error(`Failed to fetch collections: ${error.message}`);
  }
}

/**
 * Fetch all items from a specific collection
 *
 * @param {string} collectionKey - The key of the collection (e.g., 'ASWVI2UU')
 * @param {Object} options - Optional parameters
 * @param {number} options.limit - Maximum number of items to fetch (default: 100)
 * @returns {Promise<Array>} Array of raw Zotero item objects
 *
 * Example usage:
 * const items = await fetchItemsFromCollection('ASWVI2UU');
 * const limitedItems = await fetchItemsFromCollection('ASWVI2UU', { limit: 50 });
 */
export async function fetchItemsFromCollection(collectionKey, options = {}) {
  try {
    const library = createZoteroClient();
    const { limit = 100 } = options;

    // Fetch all items by making multiple requests if needed
    let allItems = [];
    let start = 0;
    const batchSize = 100; // Zotero API limit per request

    while (true) {
      const response = await library
        .collections(collectionKey)
        .items()
        .top() // Only get top-level items (not attachments/notes)
        .get({ limit: batchSize, start });

      const items = response.getData();
      allItems = allItems.concat(items);

      // Check if we've fetched all items or reached the requested limit
      if (items.length < batchSize || allItems.length >= limit) {
        break;
      }

      start += batchSize;
    }

    return allItems.slice(0, limit);
  } catch (error) {
    console.error(
      `Error fetching items from collection ${collectionKey}:`,
      error.message
    );
    throw new Error(`Failed to fetch items from collection: ${error.message}`);
  }
}

/**
 * Fetch all top-level items from the entire library
 * (not filtered by collection)
 *
 * @param {Object} options - Optional parameters
 * @param {number} options.limit - Maximum number of items to fetch (default: 100)
 * @returns {Promise<Array>} Array of raw Zotero item objects
 */
export async function fetchAllItems(options = {}) {
  try {
    const library = createZoteroClient();
    const { limit = 100 } = options;

    const response = await library
      .items()
      .top() // Only get top-level items (not attachments/notes)
      .get({ limit });

    return response.getData();
  } catch (error) {
    console.error("Error fetching all items:", error.message);
    throw new Error(`Failed to fetch all items: ${error.message}`);
  }
}

/**
 * Fetch a single item by its key
 *
 * @param {string} itemKey - The key of the item
 * @returns {Promise<Object>} The raw Zotero item object
 */
export async function fetchItem(itemKey) {
  try {
    const library = createZoteroClient();
    const response = await library.items(itemKey).get();
    return response.getData();
  } catch (error) {
    console.error(`Error fetching item ${itemKey}:`, error.message);
    throw new Error(`Failed to fetch item: ${error.message}`);
  }
}

/**
 * Fetch collections that contain a specific item
 *
 * @param {string} itemKey - The key of the item
 * @returns {Promise<Array>} Array of collection objects
 */
export async function fetchItemCollections(itemKey) {
  try {
    const library = createZoteroClient();
    const item = await library.items(itemKey).get();
    const itemData = item.getData();

    // Get collection keys from the item
    const collectionKeys = itemData.collections || [];

    if (collectionKeys.length === 0) {
      return [];
    }

    // Fetch all collections to get their names
    const allCollections = await fetchCollections();

    // Filter to only the collections this item belongs to
    return allCollections.filter((c) => collectionKeys.includes(c.key));
  } catch (error) {
    console.error(
      `Error fetching collections for item ${itemKey}:`,
      error.message
    );
    return []; // Return empty array on error
  }
}

/**
 * Search items by query string
 *
 * @param {string} query - Search query
 * @param {Object} options - Optional parameters
 * @param {number} options.limit - Maximum number of items to fetch (default: 50)
 * @returns {Promise<Array>} Array of raw Zotero item objects matching the query
 */
export async function searchItems(query, options = {}) {
  try {
    const library = createZoteroClient();
    const { limit = 50 } = options;

    const response = await library.items().top().get({ q: query, limit });

    return response.getData();
  } catch (error) {
    console.error(
      `Error searching items with query "${query}":`,
      error.message
    );
    throw new Error(`Failed to search items: ${error.message}`);
  }
}
