# 🚀 QUICK START - Complete Migration

## 📧 Step 1: Resend Email (5 min)

```
API Key: re_U5jxTRTo_5D9TSoC3EmRLMfTDvge9MfNy

Where to Add:
→ Supabase Dashboard
→ Settings → Edge Functions → Manage secrets
→ Edit: RESEND_API_KEY
→ Paste key → Save → Deploy

Test:
→ Admin Dashboard
→ Email: wonderzymemarketing@infarmco.com
→ Password: admin123
→ Check Outlook for OTP
✅ Done!
```

---

## 🗄️ Step 2: Supabase Migration (45 min)

### Export Data (5 min)
```
1. Open: /data-export-tool.html
2. Enter OLD Supabase credentials
3. Click "Export All Data"
4. Save JSON file
```

### Create New Account (5 min)
```
1. Go to: supabase.com/signup
2. Email: wonderzymemarketing@infarmco.com
3. Password: [strong password]
4. Verify email in Outlook
```

### Create Project (3 min)
```
1. Click "New Project"
2. Name: Wonderzyme Inventory System
3. Region: Southeast Asia
4. Wait 2-3 minutes
5. Save new credentials
```

### Deploy Function (10 min)
```bash
npm install -g supabase
supabase login
supabase link --project-ref [NEW-ID]
supabase functions deploy server
```

### Set Variables (3 min)
```
Add 7 secrets in Supabase Dashboard:
• SUPABASE_URL
• SUPABASE_ANON_KEY
• SUPABASE_SERVICE_ROLE_KEY
• SUPABASE_DB_URL
• RESEND_API_KEY
• ADMIN_EMAIL
• ADMIN_PASSWORD
```

### Import Data (5 min)
```
1. Open: /data-import-tool.html
2. Enter NEW Supabase credentials
3. Select backup JSON file
4. Click "Import Data"
5. Wait for completion
```

### Update Frontend (2 min)
```
Share with me:
• New Project ID
• New Anon Key

I'll update /utils/supabase/info.tsx
```

### Test Everything (5 min)
```
✓ Landing page loads
✓ Client can submit requests
✓ Admin can login with OTP
✓ Dashboard shows all products
✓ Old requests are visible
✓ All features work
```

---

## 📚 Documentation

**Resend:**
- `/ACTION_CHECKLIST.md` ⭐
- `/QUICK_START_RESEND.md`
- `/WONDERZYME_RESEND_SETUP.md`

**Supabase:**
- `/SUPABASE_MIGRATION_CHECKLIST.md` ⭐
- `/SUPABASE_MIGRATION_GUIDE.md`
- `/data-export-tool.html`
- `/data-import-tool.html`

**Master:**
- `/MASTER_MIGRATION_GUIDE.md`

---

## 🎯 New Company Accounts

**Email System:**
```
Account: wonderzymemarketing@infarmco.com
API Key: re_U5jxTRTo_5D9TSoC3EmRLMfTDvge9MfNy
Dashboard: resend.com/dashboard
```

**Database:**
```
Account: wonderzymemarketing@infarmco.com
Project: [To be created]
Dashboard: supabase.com/dashboard
```

**Admin Login:**
```
Email: wonderzymemarketing@infarmco.com
Password: admin123
2FA: OTP via email
```

---

## ✅ Success Checklist

- [ ] Resend API key updated in Supabase
- [ ] Admin receives OTP emails in Outlook
- [ ] New Supabase account created
- [ ] New Supabase project created
- [ ] Edge Function deployed
- [ ] All 7 secrets configured
- [ ] Data exported from old project
- [ ] Data imported to new project
- [ ] Frontend updated with new credentials
- [ ] All features tested and working
- [ ] Company owns all accounts
- [ ] Team has access to credentials

---

## 🆘 Quick Help

**Email not arriving?**
→ Check spam folder
→ Check Supabase logs for OTP

**Supabase connection failed?**
→ Verify API key is correct
→ Restart Edge Function
→ Wait 30 seconds

**Data not importing?**
→ Check backup JSON is valid
→ Verify Edge Function deployed
→ Check browser console

**Frontend not connecting?**
→ Clear browser cache
→ Hard refresh (Ctrl+Shift+R)
→ Verify credentials updated

---

**Last Updated:** Feb 26, 2026  
**Total Time:** 50 minutes  
**Status:** Ready to start!  
