# EEG101 Resource Catalog - Technical Documentation

**Last Updated**: January 24, 2026  
**Live Site**: https://eeg101-zeta.vercel.app/  
**Framework**: Next.js 16 + React 19  
**Data Source**: Zotero API (no database)

---

## Table of Contents

1. [Global Architecture](#1-global-architecture)
2. [API - Backend](#2-api---backend)
3. [Customization Guide](#3-customization-guide)
   - a) [Texts](#a-texts)
   - b) [Filters](#b-filters)
   - c) [Links](#c-links)
4. [Deployment](#4-deployment)

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

## 2. API - Backend

### 2.1. Zotero API Integration

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

### a) Texts

**How to modify application texts**

#### Homepage
**File**: `src/app/page.js`

**Modifiable texts:**
- **Hero title** (line 14-15): 
  ```javascript
  title="EEG101 Community Framework"
  ```
- **Hero sous-titre** (ligne 16-17):
  ```javascript
  subtitle="A community-driven framework for ethical EEG research"
  ```
- **Titres de sections** (lignes 21, 27):
  ```javascript
  <h2>Our Mission</h2>
  <h2>Featured Resources</h2>
  ```
- **Cartes d'information** (lignes 33-35):
  ```javascript
  <InformationCard 
    title="Validity & Integrity"
    description="..."
  />
  ```

#### About Page
**File**: `src/app/about/page.js`

All texts are directly in JSX and easily modifiable.

#### Footer
**File**: `src/components/Layout/Footer.js`

**Modifiable information:**
- **Organization info** (lines 11-28):
  ```javascript
  <p>EEG101 Community Framework</p>
  <p>Advancing ethical EEG research</p>
  ```
- **Contact details** (lines 61-69):
  ```javascript
  <p>Email: eegcf@proton.me</p>
  <p>Address: ...</p>
  ```
- **Social media links** (lines 78-90)

#### Button Labels
**File**: `src/components/ui/Button.js`

Modifier le texte des paramètres des composants.

---

### b) Filters

**Current filter state (after modifications):**

The filtering system now includes **3 categories** ("Tag" filter has been removed):

1. **Framework Section**
   - Part 1: Validity & Integrity
   - Part 2: Democratization  
   - Part 3: Responsibility
   - Source: Zotero collections
   - Automatic from collections

2. **Type**
   - Bibliographic (blue): books, articles, reports
   - Multimedia (violet): videos, podcasts, presentations
   - Technical (orange): software, datasets, code
   - Web Page (yellow): blogs, websites
   - Source: Zotero item types
   - Mapped via `lib/zotero/constants.js`

3. **Language**
   - Extracted from Zotero "language" field
   - "Unknown" for resources without specified language

**Files involved:**
- `src/components/Resources/FilterSidebar.js` - Filter interface
- `src/components/Resources/ResourcesPageClient.js` - Filter state
- `src/lib/filterUtils.js` - Filtering logic

**How to add a new filter:**

1. Ajouter le calcul dans `FilterSidebar.js` (ligne ~130):
```javascript
const years = new Map();
resources.forEach((resource) => {
  if (resource.year) {
    years.set(resource.year, (years.get(resource.year) || 0) + 1);
  }
});
```

2. Add state in `ResourcesPageClient.js` (line 17):
```javascript
const [activeFilters, setActiveFilters] = useState({
  frameworkSections: [],
  types: [],
  languages: [],
  years: [], // New
});
```

3. Add UI in `FilterSidebar.js`:
```javascript
<FilterSection title="Year">
  {filterOptions.years.map(({ year, count }) => (
    <FilterCheckbox
      key={year}
      label={year}
      count={count}
      checked={activeFilters.years?.includes(year)}
      onChange={() => toggleFilter("years", year)}
    />
  ))}
</FilterSection>
```

4. Add logic in `filterUtils.js`:
```javascript
if (activeFilters.years?.length > 0) {
  if (!activeFilters.years.includes(resource.year)) {
    return false;
  }
}
```

---

### c) Links

**Configurable external links:**

#### 1. Framework/Manifesto Links
**Fichier**: `src/components/Resources/ResourceDetail.js` (lignes 9-17)
```javascript
const MANIFESTO_URLS = {
  "Part 1: Validity & Integrity": "https://...",
  "Part 2: Democratization": "https://...",
  "Part 3: Responsibility": "https://...",
};
```

#### 2. Bouton "Sign Framework"
**Fichier**: `src/components/ui/Button.js` (ligne 48)
```javascript
<SignFrameworkButton href="https://forms.gle/xyz" />
```

#### 3. Social Media
**File**: `src/components/Layout/Footer.js` (lines 78-90)
```javascript
<a href="https://twitter.com/eeg101">Twitter</a>
<a href="https://github.com/eeg101">GitHub</a>
<a href="https://linkedin.com/company/eeg101">LinkedIn</a>
```

#### 4. About Page

---

## 3. Customization Guide (Continued)

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
- **Logic**: Searches in title, creators, and abstract
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

## 4. Hébergement

### 4.1. Plateforme: Vercel

**Production URL**: https://eeg101-zeta.vercel.app/

### 4.2. Vercel Configuration

#### Prerequisites
- Vercel account connected to your GitHub repository
- Zotero API credentials

#### Deployment Steps

**1. GitHub → Vercel Connection**
```bash
# Push your code to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

**2. Import to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Framework Preset: Next.js (auto-detected)

**3. Environment Variables**

In Vercel Dashboard → Settings → Environment Variables:

```env
ZOTERO_KEY=your_api_key
ZOTERO_LIBRARY_TYPE=group
ZOTERO_LIBRARY_ID=5794905
```

⚠️ **Important**: These variables must be set for **all environments** (Production, Preview, Development)

**4. Deploy**
- Click "Deploy"
- First deployment: ~2-3 minutes
- Subsequent deployments: ~1-2 minutes
- Vercel auto-deploys on every push to `main`

### 4.3. Deployment Architecture

```
GitHub (main branch)
       ↓
   [Push detected]
       ↓
 Vercel Build Process
       ↓
   [Build Next.js]
       ↓
   [Fetch Zotero]
       ↓
  [Generate ISR pages]
       ↓
   Deploy to CDN
       ↓
https://eeg101-zeta.vercel.app/
```

### 4.4. Production Data Flow

```
User → Vercel CDN → ISR Pages (1h cache)
                        ↓
                   Zotero API
                   (120 req/min)
```

**ISR Advantages:**
- ✅ Pre-generated pages (ultra-fast)
- ✅ Background revalidation (1h)
- ✅ Fresh data without slowing users  
- ✅ Reduces Zotero API calls

### 4.5. Environment Variables

#### Production (Vercel Dashboard)
```env
ZOTERO_KEY=<your_production_key>
ZOTERO_LIBRARY_TYPE=group
ZOTERO_LIBRARY_ID=5794905
```

#### Local Development (.env.local)
```env
ZOTERO_KEY=<your_dev_key>
ZOTERO_LIBRARY_TYPE=group
ZOTERO_LIBRARY_ID=5794905
```

**Note**: The `.env.local` file is never committed (in `.gitignore`)

### 4.6. Monitoring and Logs

#### Access Logs
1. Vercel Dashboard
2. "Deployments" tab
3. Click on deployment
4. "View Function Logs"

#### Available Metrics
- Build time
- Deployment errors
- API requests
- Performance (Core Web Vitals)
- Bandwidth used

### 4.7. Custom Domain (Optional)

**Add your own domain:**

1. Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `catalog.eeg101.org`)
3. Configure DNS at your registrar:
   ```
   Type: CNAME
   Name: catalog (or @)
   Value: cname.vercel-dns.com
   ```
4. Vercel automatically configures SSL

### 4.8. Troubleshooting

#### Resources Not Loading
**Symptoms**: Empty catalog, loading errors

**Solutions**:
1. Vérifier les variables d'environnement dans Vercel
2. Consulter les logs: Dashboard → Deployments → [Latest] → Function Logs
3. Tester l'API Zotero directement:
   ```bash
   curl https://api.zotero.org/groups/5794905/collections
   ```
4. Vérifier les permissions de la clé API Zotero

#### Build Fails
**Symptoms**: Deployment fails

**Solutions**:
1. Check build logs in Vercel
2. Reproduce locally: `npm run build`
3. Verify `package.json` (all dependencies present)
4. Node.js version: Minimum 18.17+ (Next.js 16)

#### Stale Data
**Symptoms**: New Zotero resources don't appear

**Solutions**:
1. Wait for revalidation (max 1 hour)
2. Manually redeploy: Vercel Dashboard → Deployments → Redeploy
3. Adjust `revalidate` in `src/app/resources/page.js`:
   ```javascript
   export const revalidate = 1800; // 30 minutes instead of 1h
   ```

#### API Rate Limit Exceeded
**Symptoms**: 429 errors (Too Many Requests)

**Solutions**:
1. Verify ISR is active (1h cache)
2. Increase `revalidate` to reduce API calls
3. Check that no code makes direct calls in a loop

### 4.9. Production Performance

**Expected Metrics:**
- **TTFB** (Time to First Byte): < 200ms
- **FCP** (First Contentful Paint): < 1s
- **LCP** (Largest Contentful Paint): < 2.5s
- **Build time**: 2-3 minutes
- **Page load**: < 1s (thanks to ISR)

**Active Optimizations:**
- ISR with 1h cache
- Next.js Image optimization
- Automatic compression (Vercel)
- Global CDN (Vercel Edge Network)
- Tree shaking (Tailwind CSS)

### 4.10. Backup and Rollback

**Roll back to previous version:**

1. Vercel Dashboard → Deployments
2. Find stable deployment
3. Click "⋯" → "Promote to Production"

Or via Git:
```bash
git revert HEAD
git push origin main
```

**Vercel keeps history** of all deployments indefinitely.

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

## 7. Deployment Guide

### Vercel Deployment (Recommended)

This project is deployed on Vercel at: https://eeg101-zeta.vercel.app/

**Prerequisites:**
- Vercel account connected to your GitHub repository
- Zotero API credentials ready

**Deployment Steps:**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Framework preset: Next.js (auto-detected)

3. **Configure Environment Variables**
   In Vercel Dashboard → Settings → Environment Variables, add:
   ```
   ZOTERO_KEY=your_api_key_here
   ZOTERO_LIBRARY_TYPE=group
   ZOTERO_LIBRARY_ID=5794905
   ```

4. **Deploy**
   - Vercel will automatically deploy on every push to main branch
   - First deployment takes ~2-3 minutes
   - Subsequent deployments are faster (~1-2 minutes)

**Important Notes:**
- The project uses **Zotero API directly** (no database required)
- ISR (Incremental Static Regeneration) ensures fast page loads
- Pages revalidate every hour (configurable in `resources/page.js`)
- No Supabase or other database needed

### Environment Variables

**Production (.env on Vercel):**
```env
ZOTERO_KEY=your_production_key
ZOTERO_LIBRARY_TYPE=group
ZOTERO_LIBRARY_ID=5794905
```

**Local Development (.env.local):**
Create a `.env.local` file in the project root:
```env
ZOTERO_KEY=your_development_key
ZOTERO_LIBRARY_TYPE=group
ZOTERO_LIBRARY_ID=5794905
```

### Troubleshooting Deployment

**Resources not loading on production:**
- Verify environment variables are set correctly in Vercel
- Check Vercel logs: Dashboard → Deployments → [Latest] → View Function Logs
- Ensure Zotero API key has read permissions

**Build failing:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility (Next.js 16 requires Node 18.17+)

**Stale data:**
- Adjust `revalidate` time in `src/app/resources/page.js`
- Trigger manual revalidation: Vercel Dashboard → Deployments → Redeploy

---

## 7. Troubleshooting

**Resources not loading:**
- Check `.env.local` has correct Zotero credentials
- Verify collection keys in `COLLECTION_KEYS`
- Check Zotero API is accessible
- Review browser console for errors

**Filters not working:**
- Verify filter logic in `filterUtils.js`
- Check state updates in `ResourcesPageClient.js`
- Ensure activeFilters object has correct structure

**Styling issues:**
- Check Tailwind classes are valid
- Verify CSS variables in `globals.css`
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

**Cache not updating:**
- Reduce `revalidate` time in `resources/page.js`
- During development, delete `.next` folder
- Use `npm run build` to test production cache behavior

**API Rate Limiting:**
- Zotero API has rate limits (120 requests/minute)
- ISR reduces API calls significantly
- Adjust cache duration if needed

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
- **No database required** - fetches directly from Zotero API
- **No Supabase integration** - pure Zotero API implementation

---

## 9. System Architecture

### Data Flow
```
Zotero API → client.js → transform.js → Page Component → React Components
     ↑                                        ↓
     └────────── ISR Cache (1 hour) ───────┘
```

### Key Components
1. **Zotero API Client** (`lib/zotero/client.js`)
   - Handles authentication with Zotero
   - Fetches collections and items
   - Manages API requests

2. **Data Transformation** (`lib/zotero/transform.js`)
   - Converts raw Zotero data to frontend-ready format
   - Categorizes resources into families
   - Applies color coding
   - Formats metadata

3. **Type System** (`lib/zotero/constants.js`)
   - Maps 31+ Zotero item types to 4 families
   - Defines color scheme
   - Maintains type consistency

4. **Filter System** (`lib/filterUtils.js` + `FilterSidebar.js`)
   - Framework Section filtering
   - Type filtering
   - Language filtering
   - Search functionality

5. **ISR (Incremental Static Regeneration)**
   - Pages are pre-generated at build time
   - Background revalidation every hour
   - Instant page loads for users
   - Reduces API calls to Zotero

### Performance Optimizations
- **Caching**: `unstable_cache` wrapper for Zotero data
- **Parallel Fetching**: All collections fetched simultaneously
- **Deduplication**: Resources in multiple collections are merged
- **Lazy Loading**: Only essential data on initial load
- **Image Optimization**: Next.js Image component with priority flags

---

## 10. Maintenance & Updates

### Regular Maintenance Tasks
1. **Update Dependencies** (monthly)
   ```bash
   npm outdated
   npm update
   npm audit fix
   ```

2. **Monitor Zotero Library**
   - Ensure collection structure remains consistent
   - Verify new item types are mapped in `constants.js`
   - Check for broken links or missing metadata

3. **Performance Monitoring**
   - Review Vercel analytics
   - Check Core Web Vitals
   - Monitor API rate limits

### Adding New Resource Types
If Zotero adds new item types or you need custom categorization:

1. **Update `constants.js`**:
   ```javascript
   export const ITEM_TYPE_TO_FAMILY = {
     // ... existing mappings
     newItemType: FAMILIES.BIBLIOGRAPHIC, // Choose appropriate family
   };
   ```

2. **Test the integration**:
   ```bash
   npm run dev
   # Add a test item in Zotero with the new type
   # Verify it appears correctly on the site
   ```

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
