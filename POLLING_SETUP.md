# Zotero Polling Setup Guide

This document explains how to set up automatic polling to detect changes in Zotero and update the resource catalog.

## How It Works

Instead of webhooks, we use **efficient polling with version detection**:

1. **Lightweight version check** - Every 5-10 minutes, check if the Zotero library version changed
2. **Only fetch if changed** - If version changed, fetch the modified items
3. **Invalidate cache** - Update the cached resource list
4. **Fallback** - If polling fails, cache expires after 1 hour anyway

## Why This Works

Zotero's API provides:
- **Version numbers** for each library
- **`If-Modified-Since-Version` header** for efficient checks (returns `304 Not Modified` if nothing changed)
- **`?since=<version>` parameter** to fetch only changed items

This means each poll can use minimal bandwidth - often just a few bytes to check if anything changed!

## Setup

### 1. Set Environment Variable (Optional but Recommended)

For security, add a secret token to environment variables:

```env
CRON_SECRET=your-secret-token-12345
```

If not set, the endpoint is unprotected but still safe (it only invalidates cache).

### 2. Choose a Polling Method

Pick one of the options below:

---

### **Option A: Vercel Crons (Easiest if on Vercel)**

Vercel has built-in cron jobs that can call your API endpoints.

1. Create/edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/poll-zotero",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

This runs every 5 minutes. Change the schedule as needed:
- `*/5 * * * *` = Every 5 minutes
- `*/10 * * * *` = Every 10 minutes
- `0 * * * *` = Every hour

2. Deploy to Vercel:
```bash
git add vercel.json
git commit -m "Add Zotero polling cron"
git push
```

3. Verify in Vercel dashboard:
   - Go to Settings > Crons
   - See your polling job listed and monitor its runs

---

### **Option B: EasyCron (Free External Service)**

Works on any hosting (Vercel, traditional servers, etc).

1. Go to [easycron.com](https://www.easycron.com/)
2. Sign up (free)
3. Create a new cron job:
   - **URL**: `https://your-domain.com/api/cron/poll-zotero`
   - **Frequency**: Every 5-10 minutes
   - **Headers** (if using CRON_SECRET):
     ```
     Authorization: Bearer your-secret-token-12345
     ```
4. Save and activate

EasyCron will call your endpoint on the schedule you set.

---

### **Option C: GitHub Actions**

Runs workflows on a schedule. Good for testing or backup polling.

Create `.github/workflows/poll-zotero.yml`:

```yaml
name: Poll Zotero Changes

on:
  schedule:
    - cron: '*/10 * * * *'  # Every 10 minutes

jobs:
  poll:
    runs-on: ubuntu-latest
    steps:
      - name: Poll Zotero
        run: |
          curl -X GET "https://your-domain.com/api/cron/poll-zotero" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

Then add `CRON_SECRET` as a GitHub secret.

---

### **Option D: AWS Lambda + EventBridge**

For serverless deployments.

1. Create Lambda function that calls your endpoint
2. Set up EventBridge rule to trigger every 5-10 minutes

(See AWS documentation for details)

---

## Testing Locally

Test the polling endpoint:

```bash
curl http://localhost:3000/api/cron/poll-zotero
```

Or with a secret token:

```bash
curl -H "Authorization: Bearer your-secret-token-12345" \
  http://localhost:3000/api/cron/poll-zotero
```

Response:
```json
{
  "success": true,
  "checked": 3,
  "changed": 1,
  "timestamp": "2026-01-28T10:00:00.000Z",
  "collections": [
    {
      "key": "F9DNTXQA",
      "name": "Part 1: Validity",
      "hasChanged": true,
      "lastVersion": "1234",
      "currentVersion": "1235"
    }
  ]
}
```

## How to Know It's Working

### Check the logs:

**On Vercel**:
- Vercel Dashboard > Logs (Function Logs)
- Look for: `⏰ Polling cron job started`

**On local dev**:
- Dev server console: `npm run dev`
- Look for: `🔍 Polling for changes...`

### Look for these log patterns:

```
✓ Collections with no changes:
✓ F9DNTXQA: No changes since version 1234

📢 Collections that changed:
🔄 F9DNTXQA: Version changed from 1234 → 1235
🔄 Invalidating cache for zotero-resources
```

## Monitoring

To monitor polling health, you can:

1. **Check the endpoint status** - Health check every hour:
   ```bash
   curl -I https://your-domain.com/api/cron/poll-zotero
   ```
   Should return `200 OK`

2. **Set up alerts** - Most cron services let you get notified if a job fails

3. **Add logging** - The endpoint logs all results, check your platform's logs

## How Fast Are Updates?

With polling set to **5 minutes**:
- You add an item to Zotero
- Within **5-10 minutes** it appears on your website
- Typical wait: 2-5 minutes

With polling set to **10 minutes**:
- Add to Zotero → See on site in 5-15 minutes

With **1 hour fallback**:
- If polling breaks → Updates still happen within 1 hour

## Troubleshooting

### Polling endpoint returns 401
**Problem**: Secret token is wrong or missing
**Solution**: 
- Check `CRON_SECRET` environment variable matches your Authorization header
- If no token set, remove the header from your cron config

### Polling shows "no changes" but you added items
**Problem**: Zotero API delay or version update pending
**Solution**:
- Wait a few minutes for Zotero to update
- Check Zotero API status: https://status.zotero.org/
- Try polling again manually

### Cache not invalidating
**Problem**: `revalidateTag()` might be failing
**Solution**:
- Check server logs for errors
- Cache will still expire after 1 hour automatically
- Restart the server to clear cache immediately

## Reducing API Usage

Current strategy uses minimal API calls:
- Per poll cycle: ~3 calls (one per collection to check version)
- Most calls get `304 Not Modified` (no bandwidth used)
- Only fetches full data if version changed

To use even less:
- Increase polling interval from 5 to 10+ minutes
- Or use 1-hour fallback only and remove polling entirely

## Files Added

- `src/lib/zotero/versionTracking.js` - Version storage and tracking
- `src/lib/zotero/changeDetection.js` - Change detection logic
- `src/app/api/cron/poll-zotero/route.js` - Polling endpoint
- `vercel.json` (optional) - Vercel cron configuration
- `POLLING_SETUP.md` - This file

## Next Steps

1. Choose your polling method (Vercel Crons recommended if on Vercel)
2. Set optional `CRON_SECRET` environment variable
3. Deploy and test
4. Monitor logs to verify it's working
5. Add to `.gitignore`: `.zotero-versions.json` (version tracking file)
