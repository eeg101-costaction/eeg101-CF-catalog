# Setup Checklist ✅

Complete the following steps to get the Zotero polling system fully operational.

## Phase 1: Environment Variables (Required)

### Vercel Dashboard
- [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Select your project
- [ ] Go to **Settings > Environment Variables**
- [ ] Add `CRON_SECRET`:
  - Name: `CRON_SECRET`
  - Value: `8fe8a987954ad9ff4d15653dba94e018c0a20e9b14d19ba81eb76bde789c8d17`
  - Environments: Production, Preview, Development
- [ ] Add `ZOTERO_KEY` (your API key)
- [ ] Add `ZOTERO_LIBRARY_TYPE` = `group`
- [ ] Add `ZOTERO_LIBRARY_ID` = `5794905`
- [ ] Click **Save** on each

### GitHub Repository
- [ ] Go to [GitHub Settings](https://github.com/eeg101-costaction/eeg101-CF-catalog/settings/secrets/actions)
- [ ] Click **New repository secret**
- [ ] Add `CRON_SECRET`:
  - Name: `CRON_SECRET`
  - Value: `8fe8a987954ad9ff4d15653dba94e018c0a20e9b14d19ba81eb76bde789c8d17`
- [ ] Click **Add secret**

## Phase 2: Verify Configuration

### Check Vercel Deployment
- [ ] Visit [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Check your project - should show **"Ready"** status
- [ ] If showing "Building" or red X, wait a moment and refresh
- [ ] Click deployment to see build logs

### Check GitHub Actions
- [ ] Go to repository's **Actions** tab
- [ ] Select **"Poll Zotero Changes"** workflow
- [ ] Should show workflow runs appearing (may take 1-2 minutes)
- [ ] Each run should have a green checkmark ✓

### Test Manually
```bash
# From your local machine
curl -H "Authorization: Bearer 8fe8a987954ad9ff4d15653dba94e018c0a20e9b14d19ba81eb76bde789c8d17" \
  https://eeg101-zeta.vercel.app/api/cron/poll-zotero
```

Expected response:
```json
{
  "success": true,
  "checked": 3,
  "changed": 0,
  "timestamp": "2026-01-28T10:05:00.000Z",
  "collections": [...]
}
```

## Phase 3: Monitor and Test

### 1. Check Polling Endpoint

Visit in browser (or curl):
```
https://eeg101-zeta.vercel.app/api/cron/poll-zotero?Authorization=Bearer+YOUR_SECRET
```

Should return `success: true` and collection status.

### 2. Verify Cache Invalidation

When polling detects changes:
1. Check Vercel logs for: `"🔄 Invalidating cache for zotero-resources"`
2. Visit `/resources` page
3. New items should appear within seconds

### 3. Monitor Polling Frequency

In GitHub Actions tab:
- Should see new workflow runs every 5 minutes
- Each should take 1-5 seconds
- All should succeed (green ✓)

## Phase 4: Ongoing Maintenance

### Regular Checks

- [ ] Monitor GitHub Actions workflow for failures
- [ ] Check Vercel logs occasionally for errors
- [ ] Verify new Zotero items appear on /resources page

### If Something Fails

**Polling endpoint returns 401:**
- Verify `CRON_SECRET` matches in Vercel AND GitHub
- Redeploy after updating environment variables

**Polling endpoint returns 500:**
- Check Vercel logs for detailed error
- Verify Zotero credentials are correct

**GitHub Actions not running:**
- Confirm `.github/workflows/poll-zotero.yml` exists
- Confirm `CRON_SECRET` is set in GitHub secrets
- Wait 1-2 minutes, refresh Actions tab

**Cache not updating:**
- Manually call endpoint to verify it returns `"changed": 1+`
- Verify Vercel logs show "Invalidating cache"
- Check that new items were actually added to Zotero

## Phase 5: Customization (Optional)

### Change Polling Frequency

Edit `.github/workflows/poll-zotero.yml`:
```yaml
schedule:
  - cron: '*/10 * * * *'  # Change 5 to 10 for every 10 minutes
```

### Add More Zotero Collections

Edit `src/app/api/cron/poll-zotero/route.js`:
```javascript
const COLLECTION_KEYS = ["F9DNTXQA", "ZD2RV8H9", "L72L5WAP", "NEW_KEY"];
```

### Regenerate CRON_SECRET

If you suspect compromise:
1. Generate new: `openssl rand -hex 32`
2. Update Vercel environment variable
3. Update GitHub secret
4. Old secret immediately stops working

## Troubleshooting Quick Links

- **Polling Setup Details** → [ZOTERO_POLLING_SETUP.md](ZOTERO_POLLING_SETUP.md)
- **Project Overview** → [REPO_OVERVIEW.md](REPO_OVERVIEW.md)
- **Project Docs** → [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)
- **API Docs** → [BACKEND_DOCUMENTATION.md](BACKEND_DOCUMENTATION.md)

## Success Indicators

You'll know everything is working when:

✅ **GitHub Actions:** Shows workflow runs every 5 minutes, all passing  
✅ **Vercel Logs:** Show `GET /api/cron/poll-zotero 200` entries  
✅ **Manual Test:** Curl returns `"success": true`  
✅ **Cache:** Vercel logs show "Invalidating cache" when items change in Zotero  
✅ **Browser:** New Zotero items appear on `/resources` page automatically  

---

**Questions?** Check the documentation files linked above or review the commit messages in git history.
