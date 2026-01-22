/**
 * RESOURCE FAMILIES
 *
 * We organize Zotero items into 4 families based on their type:
 * - Bibliographic: Traditional academic sources (books, articles, etc.)
 * - Multimedia: Audio/visual content
 * - Technical & Tools: Software, datasets, code repositories
 * - Web Page: Online content and blog posts
 */

export const FAMILIES = {
  BIBLIOGRAPHIC: "bibliographic",
  MULTIMEDIA: "multimedia",
  TECHNICAL: "technical",
  WEB_PAGE: "webpage",
};

/**
 * FAMILY COLORS (Main theme colors)
 * Visual colors for each family in the UI
 */
export const FAMILY_COLORS = {
  [FAMILIES.BIBLIOGRAPHIC]: "blue",
  [FAMILIES.MULTIMEDIA]: "violet",
  [FAMILIES.TECHNICAL]: "orange",
  [FAMILIES.WEB_PAGE]: "yellow",
};

/**
 * ITEM TYPE COLOR VARIANTS
 *
 * Each item type gets a specific shade/variant of its family's main color.
 * This allows visual distinction between different resource types within the same family.
 *
 * Format: Tailwind color classes (e.g., 'blue-500', 'blue-600', 'blue-700')
 * Or custom hex colors if you prefer.
 *
 * Example: All bibliographic items share the "blue" theme, but:
 * - Books might be blue-700 (darker blue)
 * - Articles might be blue-500 (medium blue)
 * - Reports might be blue-300 (lighter blue)
 */
export const ITEM_TYPE_COLORS = {
  // BIBLIOGRAPHIC FAMILY (Blue variants)
  article: "blue-500",
  book: "blue-700",
  bookSection: "blue-600",
  journalArticle: "blue-500",
  magazineArticle: "blue-400",
  newspaperArticle: "blue-300",
  thesis: "blue-800",
  letter: "blue-400",
  manuscript: "blue-500",
  preprint: "blue-600",
  review: "blue-500",
  report: "blue-400",
  encyclopediaArticle: "blue-600",
  conferencePaper: "blue-700",
  document: "blue-300",

  // MULTIMEDIA FAMILY (Violet variants)
  film: "violet-700",
  presentation: "violet-600",
  videoRecording: "violet-600",
  audioRecording: "violet-500",
  interview: "violet-500",
  artwork: "violet-400",
  podcast: "violet-400",
  radioBroadcast: "violet-500",
  tvBroadcast: "violet-700",

  // TECHNICAL & TOOLS FAMILY (Orange variants)
  software: "orange-600",
  computerProgram: "orange-600",
  dataset: "orange-500",
  standard: "orange-500",
  map: "orange-400",
  patent: "orange-600",
  case: "orange-500",
  bill: "orange-400",
  statute: "orange-500",

  // WEB PAGE FAMILY (Yellow variants)
  webpage: "yellow-500",
  blogPost: "yellow-600",
  forumPost: "yellow-400",
  attachment: "yellow-300",
};

/**
 * ITEM TYPE TO FAMILY MAPPING
 *
 * This maps each Zotero item type to one of the 4 families.
 * Based on your spreadsheet mapping where colors indicate families.
 *
 * Example: When we get an item with type "book" from Zotero,
 * we know it belongs to the "bibliographic" family.
 */
export const ITEM_TYPE_TO_FAMILY = {
  // BIBLIOGRAPHIC FAMILY (Blue)
  article: FAMILIES.BIBLIOGRAPHIC,
  book: FAMILIES.BIBLIOGRAPHIC,
  bookSection: FAMILIES.BIBLIOGRAPHIC,
  journalArticle: FAMILIES.BIBLIOGRAPHIC,
  magazineArticle: FAMILIES.BIBLIOGRAPHIC,
  newspaperArticle: FAMILIES.BIBLIOGRAPHIC,
  thesis: FAMILIES.BIBLIOGRAPHIC,
  letter: FAMILIES.BIBLIOGRAPHIC,
  manuscript: FAMILIES.BIBLIOGRAPHIC,
  preprint: FAMILIES.BIBLIOGRAPHIC,
  review: FAMILIES.BIBLIOGRAPHIC,
  report: FAMILIES.BIBLIOGRAPHIC,
  encyclopediaArticle: FAMILIES.BIBLIOGRAPHIC,
  conferencePaper: FAMILIES.BIBLIOGRAPHIC,
  document: FAMILIES.BIBLIOGRAPHIC,

  // MULTIMEDIA FAMILY (Violet)
  film: FAMILIES.MULTIMEDIA,
  presentation: FAMILIES.MULTIMEDIA,
  videoRecording: FAMILIES.MULTIMEDIA,
  audioRecording: FAMILIES.MULTIMEDIA,
  interview: FAMILIES.MULTIMEDIA,
  artwork: FAMILIES.MULTIMEDIA,
  podcast: FAMILIES.MULTIMEDIA,
  radioBroadcast: FAMILIES.MULTIMEDIA,
  tvBroadcast: FAMILIES.MULTIMEDIA,

  // TECHNICAL & TOOLS FAMILY (Orange)
  software: FAMILIES.TECHNICAL,
  computerProgram: FAMILIES.TECHNICAL,
  dataset: FAMILIES.TECHNICAL,
  standard: FAMILIES.TECHNICAL,
  map: FAMILIES.TECHNICAL,
  patent: FAMILIES.TECHNICAL,
  case: FAMILIES.TECHNICAL,
  bill: FAMILIES.TECHNICAL,
  statute: FAMILIES.TECHNICAL,

  // WEB PAGE FAMILY (Yellow)
  webpage: FAMILIES.WEB_PAGE,
  blogPost: FAMILIES.WEB_PAGE,
  forumPost: FAMILIES.WEB_PAGE,
  attachment: FAMILIES.WEB_PAGE,
};

/**
 * DISPLAY FIELDS PER FAMILY
 *
 * Each family shows different information:
 * - Bibliographic: authors, title, publication year, journal/publisher
 * - Multimedia: director/creator, title, duration, release year
 * - Technical: version, title, release date, repository
 * - Web Page: title, URL, access date, website name
 */
export const FAMILY_DISPLAY_FIELDS = {
  [FAMILIES.BIBLIOGRAPHIC]: [
    "creators", // Authors/Editors
    "title",
    "date", // Publication year
    "publicationTitle", // Journal or Book title
    "publisher",
    "pages",
    "DOI",
    "url",
  ],

  [FAMILIES.MULTIMEDIA]: [
    "creators", // Director/Producer
    "title",
    "date", // Release year
    "runningTime", // Duration
    "studio", // Production company
    "url",
  ],

  [FAMILIES.TECHNICAL]: [
    "title",
    "versionNumber",
    "date", // Release date
    "company", // Developer
    "programmingLanguage",
    "repository",
    "url",
  ],

  [FAMILIES.WEB_PAGE]: [
    "title",
    "url",
    "accessDate",
    "websiteTitle", // Site name
    "creators", // Author if available
  ],
};

/**
 * Helper function to get the family for a given Zotero item type
 *
 * @param {string} itemType - The Zotero item type (e.g., 'book', 'videoRecording')
 * @returns {string} The family this item belongs to
 */
export function getFamilyForItemType(itemType) {
  return ITEM_TYPE_TO_FAMILY[itemType] || FAMILIES.BIBLIOGRAPHIC; // Default to bibliographic if unknown
}

/**
 * Helper function to get the main theme color for a given family
 *
 * @param {string} family - The family name
 * @returns {string} The main theme color associated with this family
 */
export function getColorForFamily(family) {
  return FAMILY_COLORS[family] || "blue";
}

/**
 * Helper function to get the specific color variant for an item type
 *
 * @param {string} itemType - The Zotero item type (e.g., 'book', 'videoRecording')
 * @returns {string} The specific color variant for this item type
 */
export function getColorForItemType(itemType) {
  return ITEM_TYPE_COLORS[itemType] || "blue-500"; // Default to medium blue if unknown
}
