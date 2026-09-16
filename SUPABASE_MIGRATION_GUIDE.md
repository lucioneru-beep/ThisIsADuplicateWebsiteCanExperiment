# 🔄 Supabase Migration Guide - Move to Wonderzyme Account

## 🎯 Goal

Migrate the entire Wonderzyme Inventory System from your personal Supabase account to a new dedicated Wonderzyme Supabase account (wonderzymemarketing@infarmco.com).

**After migration:**
- ✅ New Supabase project owned by wonderzymemarketing@infarmco.com
- ✅ All data migrated (inventory, requests, settings)
- ✅ All functionality works exactly the same
- ✅ Company-owned infrastructure (not personal)

---

## 📋 Migration Overview (30 Minutes)

### Phase 1: Export Current Data (5 min)
- Download all data from current Supabase project
- Save database records, settings, configurations

### Phase 2: Create New Supabase Project (10 min)
- Sign up with wonderzymemarketing@infarmco.com
- Create new project for Wonderzyme
- Configure Edge Functions

### Phase 3: Deploy Backend & Import Data (10 min)
- Deploy server Edge Function to new project
- Import all data to new database
- Configure environment variables

### Phase 4: Update Frontend & Test (5 min)
- Update frontend with new credentials
- Test all features
- Verify everything works

---

## 🚀 PHASE 1: Export Current Data

### Step 1.1: Export Database Records

**Option A: Use Supabase Dashboard (Recommended)**

1. **Go to your current Supabase project**
   - https://supabase.com/dashboard

2. **Export KV Store Data:**
   - Go to: **Table Editor** → `kv_store_63cffc09`
   - Click **Export** button (top right)
   - Select: **CSV** format
   - Download: `kv_store_backup.csv`
   - Save this file safely!

3. **Document Current Settings:**
   - Go to: **Settings** → **API**
   - Copy and save:
     ```
     Project URL: [Your current URL]
     anon/public key: [Your current anon key]
     service_role key: [Your current service role key]
     ```

**Option B: Use API to Export (Alternative)**

Run this in your browser console on your app:

```javascript
// Export all data from current Supabase
const apiBase = 'https://[YOUR-PROJECT-ID].supabase.co/functions/v1/make-server-63cffc09';
const authToken = '[YOUR-ANON-KEY]';

async function exportAllData() {
  try {
    // Export inventory
    const invResp = await fetch(`${apiBase}/inventory`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const inventory = await invResp.json();
    console.log('Inventory:', inventory);
    
    // Export requests
    const reqResp = await fetch(`${apiBase}/requests`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const requests = await reqResp.json();
    console.log('Requests:', requests);
    
    // Save to file
    const data = { inventory, requests };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wonderzyme-data-backup.json';
    a.click();
  } catch (error) {
    console.error('Export error:', error);
  }
}

exportAllData();
```

**Save These Files:**
- ✅ `kv_store_backup.csv` or `wonderzyme-data-backup.json`
- ✅ Current Supabase credentials (in notes)

---

## 🆕 PHASE 2: Create New Supabase Project

### Step 2.1: Create Wonderzyme Supabase Account

1. **Sign Up for New Account:**
   - Go to: https://supabase.com/signup
   - Use email: `wonderzymemarketing@infarmco.com`
   - Password: Create a strong password (save it securely!)
   - Complete email verification

2. **Important:** 
   - Use a password manager or save credentials securely
   - This will be the company's Supabase account
   - Make sure management has access to these credentials

### Step 2.2: Create New Project

1. **After logging in, click "New Project"**

2. **Project Settings:**
   ```
   Name: Wonderzyme Inventory System
   Database Password: [Generate strong password - save it!]
   Region: Southeast Asia (Singapore) - or closest to your location
   Pricing Plan: Free (or Pro if needed)
   ```

3. **Click "Create new project"**
   - Wait 2-3 minutes for setup

4. **Save New Credentials:**
   - Go to: **Settings** → **API**
   - Save these somewhere safe:
     ```
     Project URL: https://[NEW-PROJECT-ID].supabase.co
     anon public key: [NEW-ANON-KEY]
     service_role key: [NEW-SERVICE-ROLE-KEY]
     Project Reference ID: [NEW-PROJECT-ID]
     Database URL: [Copy from Settings → Database]
     ```

### Step 2.3: Verify KV Store Table Exists

1. **Go to: Table Editor**
2. **Check if `kv_store_63cffc09` table exists**
   - If it doesn't exist yet, don't worry - the Edge Function will create it

---

## 🔧 PHASE 3: Deploy Backend & Import Data

### Step 3.1: Deploy Edge Function to New Project

**You need the Supabase CLI for this. Install it first:**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to your NEW Supabase account
supabase login
# This will open browser - login with wonderzymemarketing@infarmco.com

# Link to your new project
supabase link --project-ref [NEW-PROJECT-ID]
# Find Project ID in: Settings → General → Reference ID
```

**Deploy the Edge Function:**

```bash
# Navigate to your project directory
cd [your-project-folder]

# Deploy the server function
supabase functions deploy server

# The function will be deployed to:
# https://[NEW-PROJECT-ID].supabase.co/functions/v1/server
```

### Step 3.2: Set Environment Variables (Secrets)

**In Supabase Dashboard:**

1. **Go to: Edge Functions → Manage secrets**

2. **Add these secrets:**

```
Name: SUPABASE_URL
Value: https://[NEW-PROJECT-ID].supabase.co

Name: SUPABASE_ANON_KEY  
Value: [Your new anon key]

Name: SUPABASE_SERVICE_ROLE_KEY
Value: [Your new service role key]

Name: SUPABASE_DB_URL
Value: postgresql://postgres:[DB-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres

Name: RESEND_API_KEY
Value: re_U5jxTRTo_5D9TSoC3EmRLMfTDvge9MfNy

Name: ADMIN_EMAIL
Value: wonderzymemarketing@infarmco.com

Name: ADMIN_PASSWORD
Value: admin123
```

3. **Click "Add secret" for each one**

4. **Restart Edge Function:**
   - Go to: Edge Functions → server
   - Click **Deploy** button

### Step 3.3: Test Edge Function

```bash
# Test the health endpoint
curl https://[NEW-PROJECT-ID].supabase.co/functions/v1/make-server-63cffc09/health

# Should return:
# {"status":"ok","message":"Wonderzyme Inventory API is running","timestamp":"..."}
```

### Step 3.4: Import Data to New Database

**Option A: Manual Import via Dashboard**

1. **Go to: Table Editor → kv_store_63cffc09**
2. **Click: "Insert" → "Import from CSV"**
3. **Select your backup file:** `kv_store_backup.csv`
4. **Map columns:** key → key, value → value
5. **Click "Import"**
6. ✅ Data imported!

**Option B: Import via API Script**

Create a file `import-data.js`:

```javascript
const OLD_API_BASE = 'https://[OLD-PROJECT-ID].supabase.co/functions/v1/make-server-63cffc09';
const OLD_AUTH_TOKEN = '[OLD-ANON-KEY]';

const NEW_API_BASE = 'https://[NEW-PROJECT-ID].supabase.co/functions/v1/make-server-63cffc09';
const NEW_AUTH_TOKEN = '[NEW-ANON-KEY]';

async function migrateData() {
  console.log('🔄 Starting data migration...');
  
  try {
    // Export from old
    console.log('📥 Fetching inventory from old project...');
    const invResp = await fetch(`${OLD_API_BASE}/inventory`, {
      headers: { Authorization: `Bearer ${OLD_AUTH_TOKEN}` }
    });
    const oldInventory = await invResp.json();
    console.log(`✅ Found ${oldInventory.length} products`);
    
    // Export requests
    console.log('📥 Fetching requests from old project...');
    const reqResp = await fetch(`${OLD_API_BASE}/requests`, {
      headers: { Authorization: `Bearer ${OLD_AUTH_TOKEN}` }
    });
    const oldRequests = await reqResp.json();
    console.log(`✅ Found ${oldRequests.length} requests`);
    
    // Import to new (it will auto-initialize)
    console.log('📤 Initializing new project...');
    const newInvResp = await fetch(`${NEW_API_BASE}/inventory`, {
      headers: { Authorization: `Bearer ${NEW_AUTH_TOKEN}` }
    });
    const newInventory = await newInvResp.json();
    console.log(`✅ New project initialized with ${newInventory.length} products`);
    
    // Import requests one by one
    console.log('📤 Importing requests to new project...');
    for (const request of oldRequests) {
      await fetch(`${NEW_API_BASE}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${NEW_AUTH_TOKEN}`
        },
        body: JSON.stringify(request)
      });
    }
    
    console.log('✅ Migration complete!');
    console.log(`📊 Migrated ${oldInventory.length} products and ${oldRequests.length} requests`);
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

migrateData();
```

Run it:
```bash
node import-data.js
```

---

## 🎨 PHASE 4: Update Frontend & Test

### Step 4.1: Update Supabase Info File

I'll update the `/utils/supabase/info.tsx` file with new credentials.

**IMPORTANT:** After I update the file, you need to:
1. Go to Supabase Dashboard
2. Copy your NEW credentials
3. Update the file with YOUR actual values

### Step 4.2: Clear Browser Cache

```
1. Open your app
2. Press: Ctrl + Shift + Delete (Windows) or Cmd + Shift + Delete (Mac)
3. Clear: Cached images and files
4. Click: Clear data
5. Close and reopen browser
```

### Step 4.3: Test All Features

**Test Checklist:**

- [ ] **Landing Page Loads**
  - Open app
  - See homepage with logo and buttons
  
- [ ] **Client Request Form**
  - Click "Request Samples"
  - Search for products
  - Add to cart
  - Submit request
  - See confirmation page
  - Download PDF
  
- [ ] **Admin Login**
  - Click "Admin Dashboard"
  - Email: wonderzymemarketing@infarmco.com
  - Password: admin123
  - Receive OTP email
  - Enter OTP
  - Successfully login
  
- [ ] **Admin Dashboard**
  - See all 31 products
  - Search works
  - Product filtering works
  - See "All Submitted Requests" table
  - Requests are loading
  
- [ ] **Database Management**
  - Click "Manage Database"
  - See all requests
  - Filter by date works
  - Export to Excel works
  - Bulk operations work
  - Mark as fulfilled works
  
- [ ] **Stock Management**
  - Adjust stock levels
  - Changes are saved
  - Real-time updates work
  
- [ ] **Forgot Password**
  - Test "Forgot Password" flow
  - Receive OTP email
  - Reset password works

### Step 4.4: Verify Data Migration

```
1. Admin Dashboard → All Submitted Requests
2. Verify all old requests are there
3. Check if product stock levels are correct
4. Confirm everything matches your old system
```

---

## 🔍 Troubleshooting

### Issue: Edge Function Not Deploying

**Solution:**
```bash
# Make sure you're linked to the right project
supabase projects list

# Relink if needed
supabase link --project-ref [NEW-PROJECT-ID]

# Try deploy again
supabase functions deploy server
```

### Issue: "Invalid API Key" Error

**Solution:**
1. Check environment variables are correct
2. Make sure you saved all secrets
3. Restart Edge Function
4. Wait 30 seconds and try again

### Issue: KV Store Table Not Found

**Solution:**
1. The Edge Function creates it automatically on first request
2. Just make a request to the inventory endpoint:
   ```bash
   curl https://[NEW-PROJECT-ID].supabase.co/functions/v1/make-server-63cffc09/inventory
   ```
3. Table should be created now

### Issue: Data Not Migrating

**Solution:**
1. Check your backup files
2. Verify CSV format is correct
3. Try API import script instead
4. Check Edge Function logs for errors

### Issue: Frontend Shows Old Data

**Solution:**
1. Clear browser cache completely
2. Hard refresh: Ctrl + Shift + R
3. Check `/utils/supabase/info.tsx` has new credentials
4. Restart development server if running locally

---

## ✅ Post-Migration Checklist

- [ ] New Supabase account created: wonderzymemarketing@infarmco.com
- [ ] New project created and running
- [ ] Edge Function deployed successfully
- [ ] All environment variables set
- [ ] Data migrated from old project
- [ ] Frontend updated with new credentials
- [ ] All features tested and working
- [ ] Old requests visible in new system
- [ ] Product inventory correct
- [ ] Admin login works with OTP emails
- [ ] Client request form works
- [ ] PDF downloads work
- [ ] Database management works
- [ ] Stock adjustments work
- [ ] Notifications work

---

## 🔐 Security Checklist

- [ ] Save new Supabase credentials in company password manager
- [ ] Save database password securely
- [ ] Share access with relevant team members
- [ ] Remove your personal account access (after transition)
- [ ] Document who has access to Wonderzyme Supabase
- [ ] Set up 2FA on Supabase account (recommended)

---

## 📊 What Gets Migrated

### ✅ Automatically Migrated:
- All 31 products (3 categories)
- Product stock levels
- Product prices
- All submitted client requests
- Request timestamps
- Admin settings
- Password overrides
- Notification states

### ⚠️ Not Migrated (Not Needed):
- Old project settings
- Old API logs
- Old authentication sessions
- Personal account settings

---

## 🎯 Success Criteria

**Your migration is successful when:**

✅ You can login to new Supabase with wonderzymemarketing@infarmco.com  
✅ Admin can login to dashboard with OTP verification  
✅ All 31 products show in admin dashboard  
✅ All old client requests appear in database  
✅ Client can submit new sample requests  
✅ PDFs can be downloaded  
✅ Stock management works  
✅ Database management works  
✅ Email notifications work  
✅ Everything functions exactly like before  

---

## 💡 Pro Tips

1. **Keep Old Project Running**
   - Don't delete old Supabase project immediately
   - Keep it for 30 days as backup
   - Only delete after confirming new system works perfectly

2. **Test Thoroughly**
   - Spend 30 minutes testing ALL features
   - Have someone else test it too
   - Check on different devices/browsers

3. **Document Everything**
   - Save all credentials in company password manager
   - Document the migration for future reference
   - Share access with team leads

4. **Plan for Handover**
   - Create admin guide for next person
   - Document how to access Supabase
   - Show them how to check logs and monitor system

---

## 🆘 Need Help During Migration?

### Check Edge Function Logs:
```
Supabase Dashboard → Edge Functions → server → Logs
Look for errors or warnings
```

### Check Database:
```
Supabase Dashboard → Table Editor → kv_store_63cffc09
Verify data is there
```

### Test API Directly:
```bash
# Health check
curl https://[NEW-PROJECT-ID].supabase.co/functions/v1/make-server-63cffc09/health

# Get inventory
curl https://[NEW-PROJECT-ID].supabase.co/functions/v1/make-server-63cffc09/inventory

# Get requests
curl https://[NEW-PROJECT-ID].supabase.co/functions/v1/make-server-63cffc09/requests
```

---

## 📅 Migration Timeline

**Estimated Time: 30-45 minutes**

```
0:00 - 0:05   Export current data
0:05 - 0:15   Create new Supabase account & project
0:15 - 0:25   Deploy Edge Function & set secrets
0:25 - 0:30   Import data
0:30 - 0:35   Update frontend
0:35 - 0:45   Test all features
```

**Best Time to Migrate:**
- ✅ Outside business hours
- ✅ When no one is using the system
- ✅ When you have time to test thoroughly

---

## 🎉 After Migration

Once everything works:

1. **Notify Team:**
   - "We've migrated to company-owned Supabase"
   - Share new dashboard URL if it changed
   - Everything works the same

2. **Update Documentation:**
   - Update any internal docs with new credentials
   - Update runbooks or SOPs

3. **Monitor for 1 Week:**
   - Check system daily
   - Monitor Edge Function logs
   - Watch for any issues

4. **Decommission Old Project (After 30 Days):**
   - Delete old Supabase project
   - Remove old credentials
   - Archive backup files

---

**Last Updated:** February 26, 2026  
**Purpose:** Complete Supabase migration to Wonderzyme-owned infrastructure  
**Status:** Ready to execute  
