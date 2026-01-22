# EEG-101 Backend Architecture Documentation

**Last Updated:** November 28, 2025  
**Version:** 1.0  
**Purpose:** Resource catalog backend for filtering and displaying Zotero library items

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [File Structure & Purpose](#file-structure--purpose)
4. [Data Flow: From Zotero to Frontend](#data-flow-from-zotero-to-frontend)
5. [Configuration Guide](#configuration-guide)
6. [How to Customize](#how-to-customize)
7. [Testing Guide](#testing-guide)
8. [API Reference](#api-reference)

---

## Overview

The backend system fetches resources from a Zotero library, categorizes them into 4 families (Bibliographic, Multimedia, Technical & Tools, Web Page), adds color coding, and provides clean, frontend-ready data through a REST API.

**Key Features:**

- ✅ Automatic categorization of 31+ Zotero item types into 4 families
- ✅ Color-coded resources (blue/violet/orange/yellow theme + specific shades)
- ✅ Manifesto part tracking (Part 1, 2, 3)
- ✅ Special flags (workshop resources)
- ✅ APA citation generation for bibliographic items
- ✅ Card view vs. Detail view formatting
- ✅ Tag support
- ✅ Abstract previews for cards

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ZOTERO LIBRARY                              │
│                    (Group ID: 5794905)                              │
│                                                                     │
│  Collections:                                                       │
│  - Part 1: Validity (F9DNTXQA)                                      │
│  - Part 2: Democratization (ZD2RV8H9)                               │
│  - Part 3: Responsibility (L72L5WAP)                                │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            │ Raw Zotero JSON
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (client.js)                         │
│  • Manages API connection                                           │
│  • Fetches collections & items                                      │
│  • Handles authentication (API key from .env.local)                 │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            │ Raw Items Array
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                TRANSFORMATION LAYER (transform.js)                  │
│  • Maps item types to families (book → bibliographic)               │
│  • Assigns colors (book → blue-700)                                 │
│  • Formats creators (array → "John Doe, Jane Smith")                │
│  • Generates APA citations                                          │
│  • Adds manifesto part info                                         │
│  • Detects special tags (workshop)                                  │
│  • Creates card vs. detail views                                    │ 
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            │ Transformed Resources
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     API ENDPOINT (route.js)                         │
│  • GET /api/resources?collection=...&family=...                     │
│  • Filters by collection and/or family                              │
│  • Returns JSON with metadata and statistics                        │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            │ JSON Response
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                    │
│  • Receives clean, ready-to-display data                            │
│  • Shows resource cards                                             │
│  • Shows detail pages                                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## File Structure & Purpose

### 📁 Core Files

```
src/
├── lib/zotero/
│   ├── constants.js        ← Configuration: families, colors, mappings
│   ├── client.js          ← Zotero API communication
│   └── transform.js       ← Data transformation logic
│
├── app/api/
│   ├── resources/route.js ← Main API endpoint (use this)
│   └── zotero/route.js    ← Raw Zotero proxy (debugging only)
│
scripts/
├── check-library.mjs      ← Verify Zotero connection
├── test-client.mjs        ← Test client functions
├── test-constants.mjs     ← Test color mappings
├── test-transform.mjs     ← Test transformation
└── test-workshop.mjs      ← Test workshop flag
```

---

### 🔧 **1. `constants.js` - Configuration Center**

**Purpose:** Defines the categorization rules, colors, and display fields.

**Key Exports:**

- `FAMILIES` - The 4 family names
- `FAMILY_COLORS` - Theme colors (blue, violet, orange, yellow)
- `ITEM_TYPE_COLORS` - Specific shades for each Zotero type
- `ITEM_TYPE_TO_FAMILY` - Mapping: which type belongs to which family
- `FAMILY_DISPLAY_FIELDS` - Which fields to show for each family

**When to Edit:**

- Adding a new Zotero item type
- Changing color schemes
- Modifying which fields display for a family

---

### 🌐 **2. `client.js` - Zotero API Client**

**Purpose:** Handles all communication with the Zotero API.

**Key Functions:**

```javascript
fetchCollections(); // Get all collections
fetchItemsFromCollection(key, opts); // Get items from one collection
fetchAllItems(opts); // Get all items from library
fetchItem(key); // Get single item by key
searchItems(query, opts); // Search items
```

**Environment Variables Required:**

```env
ZOTERO_KEY=your_api_key_here
ZOTERO_LIBRARY_TYPE=group
ZOTERO_LIBRARY_ID=5794905
```

**When to Edit:**

- Changing Zotero library
- Adding new query parameters
- Modifying rate limiting

---

### 🔄 **3. `transform.js` - Transformation Engine**

**Purpose:** Converts raw Zotero data into clean, frontend-ready resources.

**Key Functions:**

```javascript
transformItem(rawItem, options); // Transform single item
transformItems(rawItems, options); // Transform array of items
groupByFamily(resources); // Group by family
getResourceStats(resources); // Get statistics
prepareForCard(resource); // Format for card view
prepareForDetail(resource); // Format for detail view
```

**Transformation Steps:**

1. Extract item type → Determine family
2. Assign colors (theme + specific)
3. Format creators (array → string)
4. Extract year from date
5. Add manifesto part info
6. Format tags
7. Check for special flags (workshop)
8. Generate APA citation (bibliographic only)
9. Truncate abstract for card preview
10. Add family-specific fields

**When to Edit:**

- Adding new special flags (like workshop)
- Changing APA citation format
- Modifying abstract preview length
- Adding new computed fields

---

### 🚀 **4. `api/resources/route.js` - Main API Endpoint**

**Purpose:** REST API endpoint that serves transformed resources.

**Query Parameters:**

- `collection` (required) - Collection key (e.g., F9DNTXQA)
- `family` (optional) - Filter by family (bibliographic, multimedia, technical, webpage)
- `limit` (optional) - Max items to return (default: 50, max: 200)
- `format` (optional) - 'card' or 'detail' (default: 'card')

**Response Structure:**

```json
{
  "success": true,
  "data": [
    {
      "id": "ABC123",
      "type": "journalArticle",
      "family": "bibliographic",
      "color": "blue-500",
      "themeColor": "blue",
      "title": "...",
      "creators": "John Doe, Jane Smith",
      "manifestoPart": "Part 1: Validity",
      "year": "2024",
      "tags": ["workshop", "EEG"],
      "isWorkshop": true,
      "abstractPreview": "...",
      "url": "...",
      "doi": "..."
    }
  ],
  "meta": {
    "total": 10,
    "limit": 50,
    "collection": {
      "key": "F9DNTXQA",
      "name": "Part 1: Validity and Research integrity"
    },
    "familyFilter": null,
    "format": "card",
    "stats": { ... },
    "countByFamily": {
      "bibliographic": 8,
      "multimedia": 1,
      "technical": 1,
      "webpage": 0
    }
  }
}
```

**When to Edit:**

- Adding new query parameters
- Changing response structure
- Adding new filters

---

## Data Flow: From Zotero to Frontend

### Step-by-Step Journey of a Resource

```
1. USER REQUEST
   GET /api/resources?collection=F9DNTXQA&limit=5

2. API ENDPOINT (route.js)
   • Validates query parameters
   • Calls fetchCollections() to get collection name
   • Calls fetchItemsFromCollection('F9DNTXQA', { limit: 5 })

3. CLIENT (client.js)
   • Connects to Zotero API with credentials
   • Fetches raw items from collection
   • Returns array of raw Zotero objects

   Raw Item Example:
   {
     key: 'ABC123',
     data: {
       itemType: 'book',
       title: 'EEG Handbook',
       creators: [
         { creatorType: 'author', firstName: 'John', lastName: 'Doe' }
       ],
       date: '2024-03-15',
       tags: [{ tag: 'workshop' }, { tag: 'EEG' }],
       abstractNote: 'Long abstract text...',
       DOI: '10.1234/abc',
       // ... 50+ more fields
     }
   }

4. TRANSFORMATION (transform.js)
   • transformItems() called with collection info

   For each item:
   a) getFamilyForItemType('book') → 'bibliographic'
   b) getColorForItemType('book') → 'blue-700'
   c) getColorForFamily('bibliographic') → 'blue'
   d) formatCreators([...]) → "John Doe"
   e) extractYear('2024-03-15') → '2024'
   f) formatTags([...]) → ['workshop', 'EEG']
   g) hasTag([...], 'workshop') → true, set isWorkshop: true
   h) truncateText(abstract, 150) → "Long abstract text..."
   i) generateAPACitation(...) → "Doe, J. (2024). EEG Handbook. ..."
   j) Add manifestoPart: "Part 1: Validity"

   Transformed Resource:
   {
     id: 'ABC123',
     type: 'book',
     family: 'bibliographic',
     color: 'blue-700',
     themeColor: 'blue',
     title: 'EEG Handbook',
     creators: 'John Doe',
     manifestoPart: 'Part 1: Validity',
     year: '2024',
     tags: ['workshop', 'EEG'],
     isWorkshop: true,
     abstract: 'Long abstract text...',
     abstractPreview: 'Long abstract text...',
     citation: 'Doe, J. (2024). EEG Handbook. ...',
     doi: '10.1234/abc',
     publisher: '...',
     pages: '...'
   }

5. FORMATTING (transform.js)
   • If format=card: prepareForCard() → Keep only card fields
   • If format=detail: prepareForDetail() → Keep all fields

   Card Format (smaller):
   {
     id, type, family, color, themeColor,
     title, creators, manifestoPart, year,
     abstractPreview, tags
   }

6. STATISTICS (route.js)
   • getResourceStats() → Count totals
   • groupByFamily() → Count by family

7. RESPONSE (route.js)
   • Build JSON response with data + meta
   • Return to frontend

8. FRONTEND
   • Receives clean data
   • Renders cards or detail pages
   • Shows workshop icon if isWorkshop === true
```

---

## Configuration Guide

### 🔵 Adding a New Zotero Item Type

**Example:** Adding "presentation" type to Multimedia family

1. **Edit `constants.js`:**

```javascript
// Add to ITEM_TYPE_COLORS
export const ITEM_TYPE_COLORS = {
  // ... existing colors
  presentation: "violet-500", // ← Add this
};

// Add to ITEM_TYPE_TO_FAMILY
export const ITEM_TYPE_TO_FAMILY = {
  // ... existing mappings
  presentation: FAMILIES.MULTIMEDIA, // ← Add this
};
```

2. **Test:** Run `node scripts/test-constants.mjs`

---

### 🎨 Changing Color Schemes

**Example:** Change bibliographic theme from blue to green

1. **Edit `constants.js`:**

```javascript
export const FAMILY_COLORS = {
  [FAMILIES.BIBLIOGRAPHIC]: "green", // ← Changed from "blue"
  // ... rest unchanged
};

// Update all blue shades to green shades
export const ITEM_TYPE_COLORS = {
  book: "green-700", // ← Changed from "blue-700"
  journalArticle: "green-500", // ← Changed from "blue-500"
  // ... etc.
};
```

2. **Test:** Run `node scripts/test-constants.mjs`

---

### 🏷️ Adding a New Special Flag

**Example:** Add "featured" flag like workshop

1. **Edit `transform.js` - Add checker function:**

```javascript
// After hasTag() function
function hasFeaturedTag(tags) {
  return hasTag(tags, "featured");
}
```

2. **Edit `transform.js` - Add flag in transformItem():**

```javascript
// In transformItem(), after isWorkshop check
if (data.tags && data.tags.length > 0) {
  resource.tags = formatTags(data.tags);
  resource.isWorkshop = hasTag(data.tags, "workshop");
  resource.isFeatured = hasFeaturedTag(data.tags); // ← Add this
}
```

3. **Test:** Run `node scripts/test-transform.mjs`

---

### 📚 Changing Collection Keys

**Example:** Update collection keys for different manifesto parts

1. **Update environment or frontend code:**

```javascript
// Old keys
const PART_1_KEY = "F9DNTXQA";
const PART_2_KEY = "ZD2RV8H9";
const PART_3_KEY = "L72L5WAP";

// New keys (after creating new collections)
const PART_1_KEY = "NEWKEY1";
const PART_2_KEY = "NEWKEY2";
const PART_3_KEY = "NEWKEY3";
```

2. **Test:** `GET /api/resources?collection=NEWKEY1`

---

### 🔄 Switching Zotero Libraries

**Example:** Move to a different Zotero group

1. **Edit `.env.local`:**

```env
ZOTERO_KEY=your_new_api_key
ZOTERO_LIBRARY_TYPE=group
ZOTERO_LIBRARY_ID=1234567  # ← New library ID
```

2. **Verify:** Run `node scripts/check-library.mjs`

---

## Testing Guide

### 🧪 Available Test Scripts

```bash
# Test family/color constants
node scripts/test-constants.mjs

# Test Zotero connection and collections
node scripts/check-library.mjs

# Test client functions (fetch collections & items)
node scripts/test-client.mjs

# Test transformation layer
node scripts/test-transform.mjs

# Test workshop flag detection
node scripts/test-workshop.mjs
```

### 🌐 Testing API Endpoints

**Start dev server:**

```bash
npm run dev
```

**Test URLs in browser:**

```
# Get 5 resources from Part 1
http://localhost:3000/api/resources?collection=F9DNTXQA&limit=5

# Get only bibliographic resources
http://localhost:3000/api/resources?collection=F9DNTXQA&family=bibliographic

# Get full detail format
http://localhost:3000/api/resources?collection=F9DNTXQA&format=detail&limit=3

# Get Part 2 resources
http://localhost:3000/api/resources?collection=ZD2RV8H9&limit=10

# Get Part 3 resources
http://localhost:3000/api/resources?collection=L72L5WAP&limit=10
```

---

## API Reference

### Endpoint: `/api/resources`

**Method:** GET

**Query Parameters:**

| Parameter    | Type   | Required | Default | Description                                                     |
| ------------ | ------ | -------- | ------- | --------------------------------------------------------------- |
| `collection` | string | Yes      | -       | Collection key (e.g., F9DNTXQA)                                 |
| `family`     | string | No       | null    | Filter by family: bibliographic, multimedia, technical, webpage |
| `limit`      | number | No       | 50      | Max items (1-200)                                               |
| `format`     | string | No       | 'card'  | Response format: 'card' or 'detail'                             |

**Example Request:**

```
GET /api/resources?collection=F9DNTXQA&family=bibliographic&limit=10&format=card
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [ /* array of resources */ ],
  "meta": {
    "total": 10,
    "limit": 50,
    "collection": { "key": "...", "name": "..." },
    "familyFilter": "bibliographic",
    "format": "card",
    "stats": { "total": 10, "byFamily": {...}, "byType": {...} },
    "countByFamily": { "bibliographic": 8, "multimedia": 0, ... }
  }
}
```

**Error Response (400/500):**

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

---

## Collection Keys Reference

| Collection Name                         | Key        | Description                       |
| --------------------------------------- | ---------- | --------------------------------- |
| Part 1: Validity and Research integrity | `F9DNTXQA` | Resources about research validity |
| Part 2: Democratization                 | `ZD2RV8H9` | Resources about democratization   |
| Part 3: Responsibility                  | `L72L5WAP` | Resources about responsibility    |

---

## Family System

### The 4 Families

| Family                | Theme Color | Item Types                      | Purpose                       |
| --------------------- | ----------- | ------------------------------- | ----------------------------- |
| **Bibliographic**     | Blue        | Books, articles, papers, theses | Traditional academic sources  |
| **Multimedia**        | Violet      | Videos, podcasts, audio         | Audio/visual content          |
| **Technical & Tools** | Orange      | Software, datasets              | Tools and technical resources |
| **Web Page**          | Yellow      | Webpages, blog posts            | Online content                |

### Color Variants

Each item type gets a specific shade within its family theme:

- **Blue variants:** blue-300 to blue-800
- **Violet variants:** violet-400 to violet-700
- **Orange variants:** orange-500 to orange-600
- **Yellow variants:** yellow-300 to yellow-600

---

## Troubleshooting

### "Missing Zotero credentials" Error

**Fix:** Check `.env.local` has `ZOTERO_KEY` and `ZOTERO_LIBRARY_ID`

### "Collection not found" Error

**Fix:** Verify collection key is correct using `node scripts/check-library.mjs`

### Resources show wrong family

**Fix:** Check `ITEM_TYPE_TO_FAMILY` mapping in `constants.js`

### Workshop flag not working

**Fix:** Ensure Zotero items have exact tag "workshop" (case-insensitive)

### API returns 500 error

**Fix:** Check Next.js dev server logs for detailed error message

---

## Future Enhancements

### Potential Features to Add:

1. **Pagination:** Add `offset` parameter for paginated results
2. **Search:** Full-text search across titles, creators, abstracts
3. **Sorting:** Sort by date, title, creators
4. **Date Range Filtering:** Filter by publication year range
5. **Multiple Collections:** Query multiple collections at once
6. **Caching:** Cache frequently requested collections
7. **More Special Flags:** Add flags for different resource types (e.g., "recommended", "beginner-friendly")

---

## Contact & Maintenance

**Repository:** sosojic/EEG-101  
**Branch:** main  
**Last Updated:** November 28, 2025

For questions or modifications, refer to this document and the inline code comments.

---

**End of Documentation**
