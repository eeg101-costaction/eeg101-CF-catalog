# Vercel Cron Setup Instructions

This guide walks you through setting up Zotero polling on Vercel using their built-in cron jobs.

## ✅ Already Done

The following files are already configured:

- `vercel.json` - Cron schedule set to **every 5 minutes** (`*/5 * * * *`)
- `src/app/api/cron/poll-zotero/route.js` - Polling endpoint ready
- `.env.example` - Environment variables documented

## 🚀 Setup Steps

### 1. Add Environment Variable to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings > Environment Variables**
4. Click **Add New**
5. Create a new variable:
   - **Name**: `CRON_SECRET`
   - **Value**: Generate a secure random token (e.g., use this bash command):
     ```bash
     openssl rand -hex 32
     ```
   - **Environments**: Select all (Production, Preview, Development)
6. Click **Save**

**Example secure token:**
```
a7f8e2c1b9d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8
```

### 2. Deploy to Vercel

```bash
git add vercel.json .env.example
git commit -m "Set up Vercel cron jobs for Zotero polling"
git push
```

Vercel will automatically detect `vercel.json` and set up the cron job.

### 3. Verify Cron Setup on Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** > **Crons** (or look for Crons in the sidebar)
3. You should see:
   ```
   POST /api/cron/poll-zotero
   Schedule: */5 * * * *  (every 5 minutes)
   Status: Active ✓
   ```

### 4. Monitor the Cron Job

**View Cron Runs:**
1. Vercel Dashboard > **Logs** (or **Functions** tab)
2. Filter for `/api/cron/poll-zotero`
3. Look for successful `200` responses

**Expected Log Output:**
```
✅ GET /api/cron/poll-zotero 200 in 760ms
⏰ Polling cron job started
🔍 Polling for changes...
📢 3 collection(s) changed
🔄 Invalidating cache for zotero-resources
```

**If you see 401 Unauthorized:**
- `CRON_SECRET` environment variable not set
- Or secret value doesn't match what's in the code
- Check Vercel Environment Variables again

### 5. How Vercel Crons Work

Vercel automatically:
- ✅ Calls your endpoint on the schedule (every 5 minutes)
- ✅ No Bearer token needed - Vercel handles it internally
- ✅ Returns `200 OK` if successful
- ✅ Retries on `5xx` errors automatically
- ✅ Logs all executions in Function Logs

### 6. Testing Before Full Deploy

To test the cron endpoint manually:

```bash
# Without secret (for testing)
curl https://your-domain.vercel.app/api/cron/poll-zotero

# With secret (production)
curl -H "Authorization: Bearer your-cron-secret-here" \
  https://your-domain.vercel.app/api/cron/poll-zotero
```

Expected response:
```json
{
  "success": true,
  "checked": 3,
  "changed": 0,
  "timestamp": "2026-01-28T10:00:00.000Z",
  "collections": []
}
```

## 📊 Cron Schedule Reference

The schedule `*/5 * * * *` means:
- **`*/5`** - Every 5 minutes
- **First `*`** - Every hour (0-23)
- **Second `*`** - Every day (1-31)
- **Third `*`** - Every month (1-12)
- **Fourth `*`** - Every day of week (0-6)

**Other common schedules:**
- `*/10 * * * *` - Every 10 minutes
- `0 * * * *` - Every hour
- `0 0 * * *` - Every day at midnight

To change: Edit `vercel.json` and deploy again.

## 🔐 Security Notes

- `CRON_SECRET` prevents unauthorized API calls
- Vercel's built-in cron jobs are private (only Vercel can call them)
- You can still call the endpoint with curl using the secret
- Without secret, endpoint is still safe (only clears cache)

## 🚨 Troubleshooting

### Cron job not showing up
- `vercel.json` not committed? Try: `git add vercel.json && git push`
- Wait 1-2 minutes for Vercel to process
- Refresh the dashboard

### Cron running but not detecting changes
- Check Zotero API credentials (`ZOTERO_KEY`, `ZOTERO_LIBRARY_ID`)
- Check server logs for errors
- Verify items actually changed in Zotero (new version created)

### High latency on cron runs
- First run compiles the function (slower)
- Subsequent runs are faster
- Normal latency: 200-800ms

### Need to stop the cron
- Edit `vercel.json` and remove the cron entry
- Or delete `vercel.json` entirely
- Deploy and cron will be disabled

## 📝 Files Modified

- `vercel.json` - New file with cron schedule
- `.env.example` - Environment variables reference
- No changes needed to code

## ✅ You're All Set!

Once deployed:
1. Cron runs automatically every 5 minutes
2. Checks for Zotero library changes
3. Invalidates cache if changes detected
4. New resources appear on your site within 5-10 minutes

Monitor in Vercel dashboard to confirm everything is working!
