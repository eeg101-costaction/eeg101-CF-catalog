# EEG101 Resource Catalog - Technical Documentation

## 1. Global Architecture

### Project Structure
```
eeg101/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.js          # Root layout with Header/Footer
│   │   ├── page.js            # Homepage
│   │   ├── about/             # About page
│   │   ├── resources/         # Resources catalog (ISR enabled)
│   │   │   └── [id]/          # Dynamic resource detail pages
│   │   └── api/resources/     # API endpoint (optional, not actively used)
│   ├── components/            # React components
│   │   ├── Layout/           # Header, Footer
│   │   ├── Resources/        # ResourceCard, FilterSidebar, ResourceDetail
│   │   └── ui/              # Reusable UI components
│   └── lib/                  # Backend logic
│       ├── zotero/          # Zotero API integration
│       │   ├── client.js    # API calls to Zotero
│       │   ├── constants.js # Type mappings & colors
│       │   └── transform.js # Data transformation
│       └── filterUtils.js   # Filter logic for resources
├── public/assets/           # Static assets (icons, images)
└── .env.local              # Environment variables (Zotero credentials)
```

### Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4 + CSS Variables
- **Data Source**: Zotero API (via zotero-api-client)
- **Rendering**: ISR (Incremental Static Regeneration) for performance
- **React**: Version 19

---

## 2. Zotero API Integration

### How It Works
The project fetches resources from a Zotero library organized into collections representing the Community Framework sections.

### Configuration
**File**: `.env.local` (create this file in project root)
```env
ZOTERO_KEY=your_api_key_here
ZOTERO_LIBRARY_TYPE=group
ZOTERO_LIBRARY_ID=your_library_id
```

### Key Functions

#### `client.js` - API Communication
- **`fetchCollections()`**: Gets all collections (Framework sections: Part 1, 2, 3)
- **`fetchItemsFromCollection(collectionKey)`**: Gets all resources in a collection
- **`fetchItem(itemKey)`**: Gets a single resource by ID
- **`fetchItemCollections(itemKey)`**: Gets collections containing a resource

#### `transform.js` - Data Processing
- **`transformItem(rawItem)`**: Converts raw Zotero data to simplified resource object
- **`transformItems(rawItems)`**: Batch transformation
- **`prepareForCard(resource)`**: Prepares minimal data for card display
- **`prepareForDetail(resource)`**: Prepares full data for detail page

#### `constants.js` - Type System
Organizes resources into 4 families with color coding:
- **Bibliographic** (blue): books, articles, reports
- **Multimedia** (violet): videos, podcasts, presentations
- **Technical** (orange): software, datasets, code
- **Web Page** (yellow): blog posts, websites

### Data Flow
```
Zotero API → client.js → transform.js → React Components
```

---

## 3. Customization Guide

### A. Modify Framework Sections (Collections)

**Location**: `src/app/resources/page.js` (line 8)
```javascript
const COLLECTION_KEYS = ["F9DNTXQA", "ZD2RV8H9", "L72L5WAP"];
```

**How to add/remove sections:**
1. Get collection key from Zotero (visible in collection URL or API)
2. Add/remove key from `COLLECTION_KEYS` array
3. Update manifesto URLs in `src/components/Resources/ResourceDetail.js` (lines 9-17)

**Example:**
```javascript
// Add a new "Part 4: Innovation"
const COLLECTION_KEYS = ["F9DNTXQA", "ZD2RV8H9", "L72L5WAP", "NEW_KEY_HERE"];

// Also update MANIFESTO_URLS in ResourceDetail.js:
const MANIFESTO_URLS = {
  "Part 1: Validity & Integrity": "https://...",
  "Part 2: Democratization": "https://...",
  "Part 3: Responsibility": "https://...",
  "Part 4: Innovation": "https://..." // Add this
};
```

### B. Modify Filter Categories

**Location**: `src/components/Resources/FilterSidebar.js`

**Current filters:**
- Framework Section (automatic from collections)
- Tags (automatic from Zotero tags)
- Type (automatic from resource types)
- Language (from Zotero language field)

**How to add a new filter:**

1. Add filter calculation in `filterOptions` (around line 130):
```javascript
// Example: Add "Year" filter
const years = new Map();
resources.forEach((resource) => {
  if (resource.year) {
    years.set(resource.year, (years.get(resource.year) || 0) + 1);
  }
});
// Add to return object
years: Array.from(years.entries()).map(([year, count]) => ({ year, count }))
```

2. Add filter state in `ResourcesPageClient.js` (line 17):
```javascript
const [activeFilters, setActiveFilters] = useState({
  frameworkSections: [],
  tags: [],
  types: [],
  languages: [],
  years: [], // Add this
});
```

3. Add filter UI in `FilterSidebar.js` (around line 350):
```javascript
<FilterSection title="Year">
  {filterOptions.years.map(({ year, count }) => (
    <FilterCheckbox
      key={year}
      id={`year-${year}`}
      label={year}
      count={count}
      checked={activeFilters.years?.includes(year) || false}
      onChange={() => toggleFilter("years", year)}
    />
  ))}
</FilterSection>
```

4. Add filter logic in `filterUtils.js`:
```javascript
// In matchesFilters function
if (activeFilters.years?.length > 0) {
  if (!activeFilters.years.includes(resource.year)) {
    return false;
  }
}
```

### C. Modify Resource Type Colors & Families

**Location**: `src/lib/zotero/constants.js`

**Change a resource type's family:**
```javascript
// Move "podcast" from multimedia to webpage family
export const ITEM_TYPE_TO_FAMILY = {
  // ...
  podcast: FAMILIES.WEB_PAGE, // Changed from FAMILIES.MULTIMEDIA
};
```

**Change theme colors:**
```javascript
export const FAMILY_COLORS = {
  [FAMILIES.BIBLIOGRAPHIC]: "blue",    // Change to "green"
  [FAMILIES.MULTIMEDIA]: "violet",
  [FAMILIES.TECHNICAL]: "orange",
  [FAMILIES.WEB_PAGE]: "yellow",
};
```

### D. Modify Text Content

#### Homepage Texts
**Location**: `src/app/page.js`
- Hero title/subtitle (lines 14-17)
- Section titles (lines 21, 27)
- Information cards (lines 33-35)

#### About Page Texts
**Location**: `src/app/about/page.js`
- All content is in JSX, easily editable

#### Footer Contact Info
**Location**: `src/components/Layout/Footer.js`
- Organization info (lines 11-28)
- Contact details (lines 61-69)
- Social links (lines 78-90)

#### Button Labels
**Location**: `src/components/ui/Button.js`
- Change default text in component parameters (e.g., line 3)

### E. Modify External Links

**Framework/Manifesto Links:**
- `src/components/ui/Button.js` (line 48): SignFrameworkButton URL
- `src/components/Resources/ResourceDetail.js` (lines 9-17): MANIFESTO_URLS

**Social Media Links:**
- `src/components/Layout/Footer.js` (lines 78-90)

**About Page Links:**
- `src/app/about/page.js` (lines 17, 31, 38, 92)

### F. Modify Styling

**Color Scheme:**
**Location**: `src/app/globals.css` (lines 4-18)
```css
:root {
  --brand-primary: rgb(118, 166, 230);     /* Main blue color */
  --background-primary: rgba(251, 251, 251, 1);
  /* ... modify colors here */
}
```

**Typography Sizes:**
**Location**: `src/app/globals.css` (lines 20-27)
```css
:root {
  --font-size-h1: clamp(1.8rem, 5vw, 2.7rem);
  /* ... modify sizes here */
}
```

**Tailwind Configuration:**
Tailwind 4 uses CSS instead of config file. All customization in `globals.css`.

### G. Modify Cache/Revalidation Time

**Location**: `src/app/resources/page.js` (line 11)
```javascript
export const revalidate = 3600; // Seconds (currently 1 hour)
```

Change to update frequency:
- `300` = 5 minutes
- `1800` = 30 minutes
- `7200` = 2 hours
- `86400` = 24 hours

---

## 4. Key Features & Implementation

### Search Functionality
- **Component**: `SearchBar.js`
- **Logic**: Searches in title, creators, tags, and abstract
- **Location of logic**: `ResourcesPageClient.js` (lines 30-47)

### Filter System
- **Component**: `FilterSidebar.js`
- **Logic**: `filterUtils.js` (matchesFilters function)
- **State management**: `ResourcesPageClient.js`

### Resource Deduplication
Resources appearing in multiple collections are merged with combined manifestoPart arrays.
- **Logic**: `resources/page.js` (lines 21-39)

### Performance Optimization
- **ISR**: Pages pre-generated, revalidated every hour
- **Caching**: `unstable_cache` wrapper for Zotero data
- **Image Optimization**: Next.js Image component with priority flags

---

## 5. Development Commands

```bash
npm run dev        # Start development server (localhost:3000)
npm run build      # Build for production
npm run start      # Run production build
npm run lint       # Check code quality
```

---

## 6. Common Modifications - Quick Reference

| What to Change | File Location | Line(s) |
|----------------|---------------|---------|
| Framework collections | `resources/page.js` | 8 |
| Homepage hero text | `app/page.js` | 14-17 |
| Footer contact info | `Layout/Footer.js` | 61-69 |
| Color scheme | `globals.css` | 4-18 |
| Add new filter | `FilterSidebar.js` + `filterUtils.js` | ~130, ~45 |
| Manifesto links | `ResourceDetail.js` | 9-17 |
| Cache duration | `resources/page.js` | 11 |
| Zotero credentials | `.env.local` | entire file |

---

## 7. Troubleshooting

**Resources not loading:**
- Check `.env.local` has correct Zotero credentials
- Verify collection keys in `COLLECTION_KEYS`
- Check Zotero API is accessible

**Filters not working:**
- Verify filter logic in `filterUtils.js`
- Check state updates in `ResourcesPageClient.js`

**Styling issues:**
- Check Tailwind classes are valid
- Verify CSS variables in `globals.css`
- Clear `.next` folder and rebuild

**Cache not updating:**
- Reduce `revalidate` time in `resources/page.js`
- During development, delete `.next` folder

---

## 8. File Dependencies Map

```
resources/page.js
  └─ uses: client.js, transform.js
       └─ uses: constants.js

ResourcesPageClient.js
  └─ uses: filterUtils.js, FilterSidebar.js, ResourceCard.js, SearchBar.js

FilterSidebar.js
  └─ uses: filterUtils.js

ResourceDetail.js
  └─ uses: Button.js, Tags.js
```

---

## Notes
- All backend functions in `lib/` are actively used by the frontend
- The `api/resources/route.js` endpoint exists but is not currently used (ISR is preferred) => still useful for testing Zotero integration independently
- Resource deduplication logic is implemented in both API route and page component
- Color system uses both Tailwind and CSS variables for flexibility
