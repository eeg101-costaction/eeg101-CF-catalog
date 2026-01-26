# Documentation
# PFE - EEG101

---

**Floria Léger, Sofia Sojic**  
**January 29, 2026**

---

## Table of Contents

1. [Global Architecture](#1-global-architecture)
   - 1.1 [Technology Stack](#11-technology-stack)
   - 1.2 [Data Flow](#12-data-flow)
   - 1.3 [Resource Families](#13-resource-families)
2. [API - Backend](#2-api---backend)
   - 2.1 [Configuration](#21-configuration)
   - 2.2 [Key Functions](#22-key-functions)
   - 2.3 [Collection Keys](#23-collection-keys)
3. [Resources](#3-resources)
   - [Modifying Family Colors](#modifying-family-colors)
   - [Moving a Type to Another Family](#moving-a-type-to-another-family)
   - [Adding a New Zotero Type](#adding-a-new-zotero-type)
   - [Tag Color Nuances](#tag-color-nuances)
4. [Customization Guide](#4-customization-guide)
   - a) [Texts](#a-texts)
   - b) [Filters](#b-filters)
   - c) [Links](#c-links)
5. [Hosting](#5-hosting)
   - 5.1 [Platform: Vercel](#51-platform-vercel)
   - 5.2 [Vercel Configuration](#52-vercel-configuration)
   - 5.3 [Automatic Deployments](#53-automatic-deployments)
   - 5.4 [Deployment Architecture](#54-deployment-architecture)
   - 5.5 [Recommended Workflow Before Push](#55-recommended-workflow-before-push)

---

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
│   │   └── api/resources/     # API endpoint (optional)
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
└── .env.local              # Environment variables
```

### 1.1 Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4 + CSS Variables
- **Data Source**: Zotero API (via zotero-api-client)
- **Rendering**: ISR (Incremental Static Regeneration) for performance
- **React**: Version 19
- **Hosting**: Vercel

### 1.2 Data Flow

```
Zotero API → client.js → transform.js → Page Component → React Components
     ↑                                        ↓
     └────────── ISR Cache (1 hour) ─────────┘
```

**ISR Benefits:**
- ✅ Pre-generated pages (ultra-fast)
- ✅ Background revalidation every hour
- ✅ Fresh data without slowing users
- ✅ Drastically reduces Zotero API calls

### 1.3 Resource Families

The system organizes resources into **4 families** with theme color identifiers:

1. **Bibliographic** (Blue identifier)
   - Types: article, book, bookSection, journalArticle, magazineArticle, newspaperArticle, thesis, letter, manuscript, preprint, review, report, encyclopediaArticle, conferencePaper, document

2. **Multimedia** (Violet identifier)
   - Types: film, presentation, videoRecording, audioRecording, interview, artwork, podcast, radioBroadcast, tvBroadcast

3. **Technical** (Orange identifier)
   - Types: software, computerProgram, dataset, standard, map, patent, case, bill, statute

4. **Web Page** (Yellow identifier)
   - Types: webpage, blogPost, forumPost, attachment

**Actual CSS Colors:**

The real colors displayed in the interface are defined in `src/components/ui/Tags.js`:
- `blue`: Linear gradient from #76c9f3 to #90d4f6
- `violet`: Linear gradient from #b794f6 to #c9aef8
- `orange`: Linear gradient from #ffb366 to #ffc784
- `yellow`: Linear gradient from #ffd966 to #ffe384
- `grey`: rgba(201, 201, 201, 0.5)

---

## 2. API - Backend

The project fetches resources from a Zotero library organized into collections representing the Community Framework sections.

### 2.1 Configuration

**File**: Create `.env.local` at the project root and add:

```env
ZOTERO_KEY=api_key
ZOTERO_LIBRARY_TYPE=group
ZOTERO_LIBRARY_ID=5794905
```

**How to obtain credentials:**
1. Go to [zotero.org/settings/keys](https://www.zotero.org/settings/keys)
2. Create a new API key
3. Copy the key and your library/group ID

### 2.2 Key Functions

#### `client.js` - API Communication

- **`fetchCollections()`**: Gets all collections (Framework sections: Part 1, 2, 3)
- **`fetchItemsFromCollection(collectionKey)`**: Gets all resources in a collection
- **`fetchItem(itemKey)`**: Gets a specific resource by ID
- **`fetchItemCollections(itemKey)`**: Gets collections containing a resource

#### `transform.js` - Data Processing

- **`transformItem(rawItem)`**: Converts raw Zotero data to simplified resource object
- **`transformItems(rawItems)`**: Batch transformation
- **`prepareForCard(resource)`**: Prepares minimal data for card display
- **`prepareForDetail(resource)`**: Prepares full data for detail page

#### `constants.js` - Type System

Organizes resources into 4 families with color coding (see Global Architecture section).

**File**: `src/lib/zotero/constants.js`

```javascript
export const FAMILIES = {
  BIBLIOGRAPHIC: "bibliographic",
  MULTIMEDIA: "multimedia",
  TECHNICAL: "technical",
  WEB_PAGE: "webpage",
};

export const FAMILY_COLORS = {
  [FAMILIES.BIBLIOGRAPHIC]: "blue",
  [FAMILIES.MULTIMEDIA]: "violet",
  [FAMILIES.TECHNICAL]: "orange",
  [FAMILIES.WEB_PAGE]: "yellow",
};
```

### 2.3 Collection Keys

**File**: `src/app/resources/page.js` (line 11)

```javascript
const COLLECTION_KEYS = ["F9DNTXQA", "ZD2RV8H9", "L72L5WAP"];
```

These keys correspond to Zotero collections:
- `F9DNTXQA`: Part 1: Validity & Integrity
- `ZD2RV8H9`: Part 2: Democratization
- `L72L5WAP`: Part 3: Responsibility

**To modify:**
1. Get the collection key from Zotero (visible in URL or via API)
2. Add/remove the key from the `COLLECTION_KEYS` array
3. Update manifesto URLs in `ResourceDetail.js` (lines 9-17)

---

## 3. Resources

### Modifying Family Colors

**⚠️ CRITICAL:** To change the visual appearance of tags, you must modify TWO files: the backend AND the frontend.

**Files involved:**
- Backend: `src/lib/zotero/constants.js` (color identifiers)
- Frontend: `src/components/ui/Tags.js` (actual CSS colors)

#### Step 1: Modify identifier in backend (`src/lib/zotero/constants.js`)

```javascript
export const FAMILY_COLORS = {
  [FAMILIES.BIBLIOGRAPHIC]: "green",    // Changed from "blue" to "green"
  [FAMILIES.MULTIMEDIA]: "violet",
  [FAMILIES.TECHNICAL]: "orange",
  [FAMILIES.WEB_PAGE]: "yellow",
};
```

#### Step 2: Define actual CSS color in frontend (`src/components/ui/Tags.js`)

```javascript
const colorGradients = {
  blue: "linear-gradient(to bottom, #76c9f3 0%, #90d4f6 100%)",
  violet: "linear-gradient(to bottom, #b794f6 0%, #c9aef8 100%)",
  orange: "linear-gradient(to bottom, #ffb366 0%, #ffc784 100%)",
  yellow: "linear-gradient(to bottom, #ffd966 0%, #ffe384 100%)",
  green: "linear-gradient(to bottom, #66ff99 0%, #84ffaa 100%)", // ADD THIS
  grey: "rgba(201, 201, 201, 0.5)",
};
```

**⚠️ IMPORTANT:**
- Only the 5 color keys currently in `colorGradients` (blue, violet, orange, yellow, grey) control the actual appearance
- To add a new color like "red", you MUST add it to `FAMILY_COLORS` (backend) AND `colorGradients` (frontend)
- The `ITEM_TYPE_COLORS` values in `constants.js` (e.g., "blue-500", "blue-700") are **legacy** and have **NO visual effect**

### Moving a Type to Another Family

**Example:** Move "podcast" from Multimedia to Web Page

```javascript
export const ITEM_TYPE_TO_FAMILY = {
  // ... other types ...
  
  // BEFORE:
  // podcast: FAMILIES.MULTIMEDIA,
  
  // AFTER:
  podcast: FAMILIES.WEB_PAGE,
  
  // ... other types ...
};
```

### Adding a New Zotero Type

If Zotero adds new item types or you have custom types:

```javascript
export const ITEM_TYPE_TO_FAMILY = {
  // ... existing types ...
  
  // New type
  newItemType: FAMILIES.BIBLIOGRAPHIC, // Choose the family
};
```

**Complete steps:**
1. Identify the item type in Zotero
2. Add it to `ITEM_TYPE_TO_FAMILY`
3. Choose the family (`BIBLIOGRAPHIC`, `MULTIMEDIA`, `TECHNICAL`, or `WEB_PAGE`)
4. Test with an item of this type in Zotero
5. Verify display on the site

### Tag Color Nuances

**Global theme colors** (`src/app/globals.css`, lines 4-18)

```css
:root {
  --brand-primary: rgb(118, 166, 230);  
  --background-primary: rgba(251, 251, 251, 1);
  --text-primary: rgba(0, 0, 0, 0.85);
  /* ... modify these RGB/RGBA values ... */
}
```

**Available variables:**
- `--brand-primary`: Main brand color
- `--background-primary`: Background color
- `--text-primary`: Primary text color
- `--text-secondary`: Secondary text color
- `--separator-subtle`: Light separator color
- etc.

---

## 4. Customization Guide

### a) Texts

**How to modify application texts**

#### Homepage (`src/app/page.js`)

**Modifiable texts:**
1. **Hero title** (line ~14-15)
2. **Section titles** (lines ~21, 27)
3. **Information cards** (lines ~33-35)

#### About Page (`src/app/about/page.js`)

All texts are directly in JSX. Simply modify the content of `<p>`, `<h1>`, `<h2>`, etc. tags.

#### Footer (`src/components/Layout/Footer.js`)

**Modifiable information:**
1. **Organization info** (lines 11-28)
2. **Contact details** (lines 75-90)
3. **Social media links** (lines 95-125)
4. **Copyright** (line ~145)
5. **Site credits** (line ~153)

#### Header (`src/components/Layout/Header.js`)

**Navigation menu:** Modify links and labels in the menu.

#### Button Labels (`src/components/ui/Button.js`)

Modify the text passed as props to button components.

### b) Filters

The filtering system currently includes 3 categories:

1. **Framework Section**

**Possible values:**
- Part 1: Validity & Integrity
- Part 2: Democratization  
- Part 3: Responsibility

**Source:** Zotero collections  
**Automatic:** Based on configured collections  
**File:** `src/app/resources/page.js` (COLLECTION_KEYS)

2. **Type (Resource type)**

**Available families:**
- Bibliographic: books, articles, reports
- Multimedia: videos, podcasts, presentations
- Technical: software, datasets, code
- Web Page: blogs, websites

**Source:** Zotero item types  
**Mapped via:** `src/lib/zotero/constants.js`

3. **Language**

**Source:** Zotero "language" field  
**Default value:** "Unknown" for resources without specified language

#### Files involved in filters

1. `src/components/Resources/FilterSidebar.js`
   - User interface for filters
   - Calculation of available options
   - Management of active/inactive states

2. `src/components/Resources/ResourcesPageClient.js`
   - Filter state (`activeFilters`)
   - Combination of filters + search

3. `src/lib/filterUtils.js`
   - `matchesFilters()` function: filtering logic
   - Formatting of type and language names

#### How to add a new filter

**Example:** Add a "Year" filter

**Step 1:** Add calculation in `FilterSidebar.js` (~line 130)

```javascript
const filterOptions = React.useMemo(() => {
  const frameworkSections = new Set();
  const types = new Map();
  const languages = new Map();
  const years = new Map(); // ADD

  resources.forEach((resource) => {
    // ... existing code ...
  });

  return {
    // ... existing returns ...
    years: Array.from(years.entries()).map(([year, count]) => ({ year, count }))
  };
}, [resources]);
```

**Step 2:** Add state in `ResourcesPageClient.js` (line 17)

```javascript
const [activeFilters, setActiveFilters] = useState({
  frameworkSections: [],
  types: [],
  languages: [],
  years: [], // ADD
});
```

**Step 3:** Add interface in `FilterSidebar.js` (~line 350)

```javascript
<FilterSection title="Year">
  {filterOptions.years.length > 0 ? (
    filterOptions.years.map(({ year, count }) => (
      <FilterCheckbox
        key={year}
        label={year}
        count={count}
        checked={activeFilters.years?.includes(year)}
        onChange={() => toggleFilter("years", year)}
      />
    ))
  ) : (
    <p>No years available</p>
  )}
</FilterSection>
```

**Step 4:** Add logic in `filterUtils.js`

```javascript
export function matchesFilters(resource, activeFilters) {
  // ... existing code (Framework Section, Type, Language) ...
  
  // Year filter // ADD
  if (activeFilters.years?.length > 0) {
    if (!activeFilters.years.includes(resource.year)) {
      return false;
    }
  }

  return true;
}
```

**Step 5:** Update `clearAllFilters` in `FilterSidebar.js`

```javascript
const clearAllFilters = () => {
  onFilterChange({
    frameworkSections: [],
    types: [],
    languages: [],
    years: [], // ADD
  });
};
```

### c) Links

**Configurable external links in the application**

#### 1. Framework/Manifesto Links

**File**: `src/components/Resources/ResourceDetail.js` (lines 9-17)

```javascript
const MANIFESTO_URLS = {
  "Part 1: Validity & Integrity": "https://example.com/part1",
  "Part 2: Democratization": "https://example.com/part2",
  "Part 3: Responsibility": "https://example.com/part3",
};
```

**How to modify:**
1. Replace URLs with your links to the manifesto
2. Ensure keys exactly match collection names

#### 2. "Sign Framework" Button

**File**: `src/components/ui/Button.js` (line ~48)

```javascript
<SignFrameworkButton href="https://forms.gle/your-form" />
```

**How to modify:** Search for `SignFrameworkButton` and modify the `href` attribute.

#### 3. Social Media

**File**: `src/components/Layout/Footer.js` (lines 95-125)

```javascript
{/* Twitter */}
<a
  href="https://twitter.com/cnrs"
  target="_blank"
  rel="noopener noreferrer"
>
  {/* Twitter Icon */}
</a>

{/* LinkedIn */}
<a
  href="https://www.linkedin.com/company/cnrs"
  target="_blank"
  rel="noopener noreferrer"
>
  {/* LinkedIn Icon */}
</a>
```

**How to modify:**
1. Search for `href="https://twitter.com`
2. Replace with your social media URLs
3. Keep `target="_blank"` and `rel="noopener noreferrer"` for security

#### 4. About Page Links

**File**: `src/app/about/page.js`

Search for all `<a href="...">` tags and modify URLs as needed.

#### 5. Contact Email

**File**: `src/components/Layout/Footer.js` (line ~88)

```javascript
<a href="mailto:eegcf@proton.me">eegcf@proton.me</a>
```

**How to modify:** Replace `eegcf@proton.me` with another email address (in both `href` AND visible text).

#### 6. Legal Links (footer)

**File**: `src/components/Layout/Footer.js` (lines ~147-151)

```javascript
<a href="#" className="...">Legal Notice</a>
<a href="#" className="...">Privacy Policy</a>
<a href="#" className="...">Sitemap</a>
```

**How to modify:**
1. Replace `#` with the URL of your legal pages
2. Or create dedicated Next.js pages (e.g.: `/legal`, `/privacy`)

---

## 5. Hosting

### 5.1 Platform: Vercel

**Current production URL**: https://eeg101-zeta.vercel.app/

#### Why Vercel?

Vercel was the best solution for this project:
- ✅ Optimized for Next.js (created by Next.js developers)
- ✅ Automatic deployment from GitHub
- ✅ Global CDN for optimal performance worldwide
- ✅ Native ISR (Incremental Static Regeneration) support
- ✅ Automatic and free SSL/HTTPS certificate
- ✅ Free for personal and open-source projects
- ✅ Automatic preview for pull requests
- ✅ Easy rollback with one click

### 5.2 Vercel Configuration

#### Prerequisites

1. Vercel account (free)
2. GitHub repository of the project
3. Zotero API keys

#### Initial Deployment Steps

**Step 1: Push code to GitHub**

```bash
# In your terminal, at the project root
git add .
git commit -m "Ready for deployment"
git push origin main
```

**Step 2: Connect GitHub to Vercel**

1. Go to [vercel.com](https://vercel.com)
2. Log in with your GitHub account
3. Click on "New Project"
4. Authorize Vercel to access your GitHub repositories

**Step 3: Import the project**

1. In the list, select your repository: `eeg101-costaction/eeg101-CF-catalog`
2. Vercel automatically detects it's a Next.js project
3. **Framework Preset**: Next.js (pre-filled normally)
4. **Root Directory**: leave default (./)
5. Add environment variables (see next step)
6. Click "Deploy"

**Step 4: Configure environment variables**

Before clicking "Deploy", add environment variables.

In the "Environment Variables" section in the settings page, for each variable:
1. Enter the name (e.g., `ZOTERO_KEY`)
2. Enter the value
3. Select environments: Production, Preview, Development (all)
4. Click "Add"

**Step 5: Deploy**

1. Click on "Deploy"
2. Vercel will:
   - Install dependencies (`npm install`)
   - Build the project (`npm run build`)
   - Deploy on CDN

**Step 6: Verify deployment**

1. Once finished, Vercel displays the production URL
2. Click on "Visit" to see your site online
3. Verify that resources load correctly

### 5.3 Automatic Deployments

Once configured, Vercel automatically deploys:

1. **Push on `main`**: Production deployment
   ```bash
   git push origin main
   ```

2. **Pull Request**: Preview deployment
   - Each PR gets a unique preview URL
   - Allows testing before merging
   - URL format: `eeg101-catalog-git-branch-name.vercel.app`

3. **Commits on branches**: Preview deployment
   - Useful for testing features in development

### 5.4 Deployment Architecture

```
┌─────────────────────────────────────────────┐
│          GitHub Repository                  │
│   eeg101-costaction/eeg101-CF-catalog      │
└────────────────┬────────────────────────────┘
                 │
                 │ Push detected
                 ↓
┌─────────────────────────────────────────────┐
│         Vercel Build Process                │
│                                             │
│  1. git clone repository                    │
│  2. npm install                             │
│  3. npm run build                           │
│  4. Fetch Zotero API                        │
│  5. Generate ISR pages                      │
│  6. Optimize images                         │
└────────────────┬────────────────────────────┘
                 │
                 │ Deployment
                 ↓
┌─────────────────────────────────────────────┐
│         Vercel Edge Network (CDN)           │
│      (Servers worldwide)                    │
└────────────────┬────────────────────────────┘
                 │
                 │ HTTPS
                 ↓
┌─────────────────────────────────────────────┐
│              User                           │
│    https://eeg101-zeta.vercel.app/         │
└─────────────────────────────────────────────┘
```

### 5.5 Recommended Workflow Before Push

```bash
# 1. Test in dev
npm run dev
# Visually check changes

# 2. Test the build
npm run build
# Ensure there are no errors

# 3. Lint
npm run lint
# Fix warnings

# 4. Commit and push
git add .
git commit -m "Description of changes"
git push origin main
# Vercel deploys automatically
```

---

**Document created - January 2026**  
**Project**: EEG101 Community Framework Catalog  
**Authors**: Floria Léger, Sofia Sojic

### Version Control Best Practices
```bash
# Before making changes
git checkout -b feature/your-feature-name

# After testing locally
git add .
git commit -m "Description of changes"
git push origin feature/your-feature-name

# Create pull request for review
# After merge, Vercel auto-deploys to production
```

---

## 11. Contact & Support

For issues related to:
- **Zotero API**: Check [Zotero API Documentation](https://www.zotero.org/support/dev/web_api/v3/start)
- **Next.js**: Check [Next.js Documentation](https://nextjs.org/docs)
- **Deployment**: Check [Vercel Documentation](https://vercel.com/docs)
- **Project-specific questions**: Create an issue in the GitHub repository
