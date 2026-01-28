# Repository Overview

## Project

**eeg101-CF-catalog** - A Next.js application serving a catalog of EEG research resources from Zotero.

## Key Features

- **Resource Catalog** - Browse and filter resources synced from Zotero
- **Automatic Updates** - GitHub Actions polls Zotero every 5 minutes for changes
- **Smart Caching** - Next.js cache tags enable selective cache invalidation
- **Responsive Design** - Tailwind CSS for mobile-friendly UI

## Project Structure

```
src/
├── app/
│   ├── api/cron/poll-zotero/       # Polling endpoint (validates CRON_SECRET)
│   ├── resources/page.js            # Main catalog page (cached)
│   ├── about/page.js                # About page
│   ├── layout.js                    # Root layout
│   └── globals.css                  # Global styles
│
├── components/
│   ├── Layout/                      # Header, Footer
│   ├── Resources/                   # Resource cards, filtering, detail view
│   └── ui/                          # Buttons, search, tags, sections
│
├── lib/
│   └── zotero/
│       ├── client.js                # Zotero API client
│       ├── constants.js             # Collection keys, endpoints
│       ├── transform.js             # Data transformation
│       ├── changeDetection.js       # Polling logic
│       └── versionTracking.js       # Version persistence
│
└── public/assets/                   # Icons and images
```

## How Data Flows

```
GitHub Actions (*/5 min)
    ↓
GET /api/cron/poll-zotero (with CRON_SECRET header)
    ↓
changeDetection.pollForChanges()
    ├→ versionTracking.checkIfCollectionChanged()
    ├→ Zotero API (only if version changed)
    └→ revalidateTag("zotero-resources")
    ↓
Next.js invalidates cache for /resources page
    ↓
/resources fetches fresh data from Zotero
    ↓
Browser shows updated resources
```

## Core Technologies

- **Framework**: Next.js 16.0.7 (App Router)
- **Styling**: Tailwind CSS 4
- **API**: Zotero v3 REST API
- **Deployment**: Vercel
- **Scheduling**: GitHub Actions

## Environment Variables

**Required:**
- `ZOTERO_KEY` - Zotero API key
- `ZOTERO_LIBRARY_TYPE` - "group"
- `ZOTERO_LIBRARY_ID` - "5794905"

**Optional:**
- `CRON_SECRET` - Token for validating polling requests (recommended)

Set these in Vercel's Environment Variables section.

## Scripts

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm start            # Run production server
npm run lint         # Run ESLint checks
npm run test:polling # Test the polling endpoint locally
```

## Key Files to Know

### Polling System

- `.github/workflows/poll-zotero.yml` - GitHub Actions schedule
- `src/app/api/cron/poll-zotero/route.js` - Endpoint that runs on schedule
- `src/lib/zotero/changeDetection.js` - Core polling logic
- `src/lib/zotero/versionTracking.js` - Tracks library versions

### Resources Page

- `src/app/resources/page.js` - Main catalog (uses cache tags)
- `src/components/Resources/CardGrid.js` - Resource grid display
- `src/components/Resources/FilterSidebar.js` - Filtering controls
- `src/components/Resources/ResourceCard.js` - Individual resource card
- `src/components/Resources/ResourceDetail.js` - Full resource view

### Configuration

- `next.config.mjs` - Next.js configuration
- `jsconfig.json` - JavaScript/import aliases
- `eslint.config.mjs` - Linting rules
- `tailwind.config.js` - Tailwind CSS settings
- `postcss.config.mjs` - PostCSS configuration
- `.env.example` - Environment variable template

## Zotero Collections

The app syncs 3 collections:

| Key | Name | Purpose |
|-----|------|---------|
| F9DNTXQA | Part 1: Validity | Validity studies |
| ZD2RV8H9 | Part 2: Reliability | Reliability studies |
| L72L5WAP | Part 3: Responsiveness | Responsiveness studies |

Library ID: 5794905 (group library)

## Deployment

**Auto-deployment**: Any push to `main` branch → Vercel builds and deploys

**Polling**: GitHub Actions calls endpoint every 5 minutes to check for Zotero updates

**Cache**: Next.js caches resources for up to 1 hour; polling can invalidate earlier

## Documentation Files

- **ZOTERO_POLLING_SETUP.md** - How polling works and how to configure it
- **PROJECT_DOCUMENTATION.md** - General project details
- **BACKEND_DOCUMENTATION.md** - API documentation
- **README.md** - Quick start guide

## Recent Changes

- ✅ Removed Vercel Crons config (not available on free plan)
- ✅ Added GitHub Actions workflow for polling
- ✅ Fixed ESLint issues (Header component)
- ✅ Implemented version-based change detection
- ✅ Configured cache tags for selective invalidation

## Next Steps / TODOs

- [ ] Set `CRON_SECRET` in Vercel Environment Variables
- [ ] Verify GitHub Actions workflow runs successfully
- [ ] Test that cache invalidation works when items change in Zotero
- [ ] Monitor Vercel logs to confirm polling endpoint is called
- [ ] Consider monitoring/alerting for polling failures (optional)

## Support

For questions about:
- **Polling setup** → See [ZOTERO_POLLING_SETUP.md](ZOTERO_POLLING_SETUP.md)
- **Project overview** → See [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)
- **API details** → See [BACKEND_DOCUMENTATION.md](BACKEND_DOCUMENTATION.md)
- **Getting started** → See [README.md](README.md)
