# Zotero Polling Setup

This document explains the automatic polling system for detecting changes in Zotero and updating the resource catalog.

## Architecture Overview

Instead of webhooks (which Zotero doesn't support), we use **efficient polling with version detection**:

1. **GitHub Actions** - Runs on schedule every 5 minutes (free)
2. **Polling Endpoint** - `GET /api/cron/poll-zotero` detects changes using Zotero API version headers
3. **Cache Invalidation** - Clears Next.js cache tags when changes are detected
4. **Fallback** - Cache expires after 1 hour if polling fails

## How It Works

### Zotero Version Tracking

- Zotero API returns `Last-Modified-Version` header for each library
- We store the last known version in `.zotero-versions.json`
- Each poll compares versions to detect changes
- If version changed, we fetch modified items and invalidate cache

### Why This Is Efficient

- Most polls return `304 Not Modified` (only headers, no body)
- Only fetches data when something actually changed
- Minimal bandwidth per poll (often < 1KB)

## Setup Instructions

### 1. Environment Variables (Vercel)

Add to your Vercel project at `Settings > Environment Variables`:

```
CRON_SECRET=8fe8a987954ad9ff4d15653dba94e018c0a20e9b14d19ba81eb76bde789c8d17
ZOTERO_KEY=your-zotero-api-key
ZOTERO_LIBRARY_TYPE=group
ZOTERO_LIBRARY_ID=5794905
```

Replace with your actual Zotero credentials.

### 2. GitHub Secret

Add to your GitHub repo at `Settings > Secrets and variables > Actions`:

```
CRON_SECRET=8fe8a987954ad9ff4d15653dba94e018c0a20e9b14d19ba81eb76bde789c8d17
```

Use the same value as in Vercel.

### 3. Test Locally

```bash
npm run test:polling
```

Expected output:
```json
{
  "success": true,
  "checked": 3,
  "changed": 0,
  "timestamp": "2026-01-28T...",
  "collections": [...]
}
```

## How to Verify It's Working

### Check GitHub Actions

1. Go to your repo's **Actions** tab
2. Select "Poll Zotero Changes" workflow
3. You should see runs every 5 minutes
4. Each run should show status: ✓ Success

### Check Vercel Logs

1. Go to Vercel dashboard > your project > **Deployments**
2. Click recent deployment > **Logs**
3. Filter for `poll-zotero`
4. Should see `200 OK` responses with polling output

### Manual Test

```bash
curl -H "Authorization: Bearer 8fe8a987954ad9ff4d15653dba94e018c0a20e9b14d19ba81eb76bde789c8d17" \
  https://your-domain.vercel.app/api/cron/poll-zotero
```

## Files Involved

### Core Files

- **`src/app/api/cron/poll-zotero/route.js`** - Polling endpoint (validates CRON_SECRET, calls polling logic, invalidates cache)
- **`src/lib/zotero/changeDetection.js`** - Polling logic (detects version changes, fetches modified items)
- **`src/lib/zotero/versionTracking.js`** - Persistent version storage (reads/writes `.zotero-versions.json`)
- **`src/lib/zotero/client.js`** - Zotero API client (shared with resources page)

### Configuration Files

- **`.github/workflows/poll-zotero.yml`** - GitHub Actions schedule (every 5 minutes)
- **`.zotero-versions.json`** - Runtime file tracking library versions (gitignored)

### Testing

- **`scripts/test-polling.mjs`** - Local endpoint testing script

## Polling Schedule

The GitHub Actions workflow runs on: `*/5 * * * *`

This means:
- Every 5 minutes
- 24 hours a day
- 7 days a week
- 288 times per day

To change the schedule, edit `.github/workflows/poll-zotero.yml` and modify the `schedule` section.

## Troubleshooting

### GitHub Actions not running

- Workflow file at `.github/workflows/poll-zotero.yml`? ✓
- CRON_SECRET set in GitHub secrets? ✓
- Push changes to `main` branch? ✓
- Wait 1-2 minutes for first run to appear

### Polling endpoint returns 401

- `CRON_SECRET` set in Vercel environment? 
- Does Vercel value match GitHub secret value?
- Redeploy after changing environment variables

### Polling endpoint returns 500

- Check Vercel logs for detailed error
- Verify `ZOTERO_KEY` and `ZOTERO_LIBRARY_ID` are correct
- Try `npm run test:polling` locally to debug

### Changes not appearing on site

- Check polling endpoint is returning `"success": true`
- Verify `collections` show `"hasChanged": true`
- Cache invalidation happens automatically (look for "Invalidating cache" in logs)
- Manual refresh: Clear your browser cache or wait 1 hour for cache expiry

## Security

- `CRON_SECRET` prevents unauthorized cache invalidations
- Token is 64 characters (256 bits) - cryptographically secure
- Only used internally between GitHub Actions and your endpoint
- Never commit the secret to git

## Performance Notes

- First poll after 5 minutes: ~500-800ms (cold start)
- Subsequent polls: ~200-300ms
- When no changes detected: Often returns in <100ms (304 Not Modified)
- Cache is tagged `["zotero-resources"]` for selective invalidation

## Extending the Setup

### Change polling frequency

Edit `.github/workflows/poll-zotero.yml`:
```yaml
schedule:
  - cron: '*/10 * * * *'  # Change to every 10 minutes
```

### Add more collections

Edit `src/app/api/cron/poll-zotero/route.js`:
```javascript
const COLLECTION_KEYS = ["F9DNTXQA", "ZD2RV8H9", "L72L5WAP", "NEW_KEY"];
```

### Disable polling

Delete `.github/workflows/poll-zotero.yml` or rename to `.disabled`

## References

- [Zotero API v3 Documentation](https://www.zotero.org/support/dev/web_api/v3)
- [GitHub Actions Scheduling](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- [Next.js Cache Tags](https://nextjs.org/docs/app/building-your-application/caching#revalidateTag)
