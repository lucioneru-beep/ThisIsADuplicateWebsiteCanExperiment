# ✅ SUPABASE MIGRATION CHECKLIST

## 🎯 Goal
Move Wonderzyme system from your personal Supabase to company-owned Supabase account.

---

## 📋 Quick Steps (30 Minutes)

### ✅ STEP 1: Export Current Data (5 min)

1. **Open the export tool:**
   - Open file: `/data-export-tool.html` in your browser
   
2. **Get your OLD Supabase credentials:**
   - Go to: https://supabase.com/dashboard
   - Open your CURRENT Wonderzyme project
   - Go to: Settings → API
   - Copy: **Project URL** (https://xxxxx.supabase.co)
   - Copy: **anon public key** (long string starting with eyJ...)

3. **Export data:**
   - Paste credentials into the export tool
   - Click "Export All Data"
   - Save the JSON file: `wonderzyme-backup-[timestamp].json`
   - **Keep this file safe!**

✅ **Done when:** You have the backup JSON file downloaded

---

### ✅ STEP 2: Create New Supabase Account (5 min)

1. **Sign up for NEW account:**
   - Go to: https://supabase.com/signup
   - Email: `wonderzymemarketing@infarmco.com`
   - Password: [Create strong password]
   - Verify email in Outlook

2. **Save credentials securely:**
   - Use company password manager
   - Save: Email, Password, 2FA codes (if enabled)

✅ **Done when:** You can login to new Supabase with wonderzymemarketing@infarmco.com

---

### ✅ STEP 3: Create New Project (3 min)

1. **Click "New Project"**

2. **Project Settings:**
   ```
   Name: Wonderzyme Inventory System
   Database Password: [Generate strong - save it!]
   Region: Southeast Asia (Singapore)
   Pricing Plan: Free
   ```

3. **Click "Create new project"**
   - Wait 2-3 minutes

4. **Save NEW credentials:**
   - Go to: Settings → API
   - Copy and save:
     ```
     Project URL: https://[NEW-ID].supabase.co
     anon public key: [NEW-KEY]
     service_role key: [NEW-SERVICE-KEY]
     Project Reference ID: [NEW-ID]
     ```

✅ **Done when:** New project is created and you have all credentials saved

---

### ✅ STEP 4: Deploy Edge Function (10 min)

**You need Supabase CLI installed:**

```bash
# Install CLI (if not installed)
npm install -g supabase

# Login with NEW account
supabase login
# Browser opens → Login with wonderzymemarketing@infarmco.com

# Link to NEW project
supabase link --project-ref [NEW-PROJECT-ID]

# Deploy server function
supabase functions deploy server
```

**Expected output:**
```
✅ Deployed Function server
URL: https://[NEW-PROJECT-ID].supabase.co/functions/v1/server
```

✅ **Done when:** Function deploys successfully without errors

---

### ✅ STEP 5: Set Environment Variables (3 min)

1. **Go to NEW Supabase Dashboard**
   - Settings → Edge Functions → **Manage secrets**

2. **Add these 7 secrets:**

```
SUPABASE_URL = https://[NEW-PROJECT-ID].supabase.co
SUPABASE_ANON_KEY = [Your new anon key]
SUPABASE_SERVICE_ROLE_KEY = [Your new service role key]
SUPABASE_DB_URL = postgresql://postgres:[DB-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
RESEND_API_KEY = re_U5jxTRTo_5D9TSoC3EmRLMfTDvge9MfNy
ADMIN_EMAIL = wonderzymemarketing@infarmco.com
ADMIN_PASSWORD = admin123
```

3. **Click "Add secret" for each**

4. **Restart Edge Function:**
   - Go to: Edge Functions → server
   - Click **Deploy** button

✅ **Done when:** All 7 secrets are saved and function restarted

---

### ✅ STEP 6: Import Data (5 min)

1. **Open the import tool:**
   - Open file: `/data-import-tool.html` in your browser

2. **Enter NEW Supabase credentials:**
   - Project URL: [Your NEW URL]
   - Anon Key: [Your NEW anon key]

3. **Select backup file:**
   - Choose: `wonderzyme-backup-[timestamp].json`
   - Tool will show: Product count, Request count

4. **Click "Import Data to New Project"**
   - Wait for completion
   - See success message

✅ **Done when:** Tool shows "Migration Complete!" with imported counts

---

### ✅ STEP 7: Update Frontend (2 min)

**I need to update the code with your NEW credentials.**

Tell me:
1. Your NEW Project URL
2. Your NEW anon public key

I'll update `/utils/supabase/info.tsx` for you.

✅ **Done when:** Frontend code uses new Supabase credentials

---

### ✅ STEP 8: Test Everything (5 min)

**Test these features:**

- [ ] Landing page loads
- [ ] Client can submit sample request
- [ ] PDF download works
- [ ] Admin can login (email: wonderzymemarketing@infarmco.com, password: admin123)
- [ ] OTP email arrives
- [ ] Admin dashboard loads
- [ ] All 31 products show
- [ ] "All Submitted Requests" table shows old requests
- [ ] Database management works
- [ ] Can adjust stock
- [ ] Can export to Excel

✅ **Done when:** All features work perfectly

---

## 🚨 Common Issues & Solutions

### Issue: "Edge Function not found"
**Solution:** Deploy Edge Function again
```bash
supabase functions deploy server
```

### Issue: "Invalid API Key"
**Solution:** 
1. Verify all 7 secrets are saved
2. Restart Edge Function
3. Wait 30 seconds

### Issue: "Cannot connect to database"
**Solution:**
1. Check SUPABASE_DB_URL is correct
2. Verify database password
3. Check project is fully provisioned (wait 5 min)

### Issue: "No data imported"
**Solution:**
1. Check backup JSON file is valid
2. Verify Edge Function is deployed
3. Check browser console for errors

### Issue: "Frontend shows old data"
**Solution:**
1. Clear browser cache (Ctrl + Shift + Delete)
2. Hard refresh (Ctrl + Shift + R)
3. Verify `/utils/supabase/info.tsx` has new credentials

---

## 📊 Success Criteria

✅ Can login to Supabase with wonderzymemarketing@infarmco.com  
✅ Edge Function deployed and running  
✅ All 7 environment variables set  
✅ All old data imported successfully  
✅ Frontend updated with new credentials  
✅ Admin can login with OTP  
✅ All features work exactly like before  
✅ Old requests visible in database  
✅ Stock levels are correct  

---

## 💾 After Migration

### Keep Old Project for 30 Days
- Don't delete old Supabase project immediately
- Keep as backup for 1 month
- Only delete after confirming everything works

### Share Access
- Add team members to new Supabase project
- Go to: Settings → Team
- Invite relevant people

### Document
- Save all credentials in company password manager
- Document who has access
- Create handover notes

---

## 🆘 Need Help?

### Files to Use:
- `/SUPABASE_MIGRATION_GUIDE.md` - Complete detailed guide
- `/data-export-tool.html` - Export data from old project
- `/data-import-tool.html` - Import data to new project

### Check Logs:
```
Supabase Dashboard → Edge Functions → server → Logs
Look for errors or warnings
```

### Test API:
```bash
curl https://[NEW-PROJECT-ID].supabase.co/functions/v1/make-server-63cffc09/health
```

---

## 📅 Estimated Time: 30-45 Minutes

**Best time to migrate:**
- ✅ Outside business hours
- ✅ When system isn't being used
- ✅ When you have time to test thoroughly

---

## ✅ Ready to Start?

1. Open `/data-export-tool.html` in browser
2. Export your data
3. Follow steps above
4. Test everything
5. ✅ Migration complete!

**After Step 6, let me know your NEW Supabase credentials so I can update the frontend code!**

---

**Last Updated:** February 26, 2026  
**Purpose:** Simple checklist for Supabase migration  
**Status:** Ready to execute  
