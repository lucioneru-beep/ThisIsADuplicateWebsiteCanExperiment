# 📧 Email OTP Setup Instructions

## How to Enable Real Email Sending with Resend

Your Wonderzyme authentication system is now configured to send OTP codes via email using **Resend**. Follow these steps to activate email functionality:

---

## Step 1: Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account (generous free tier: 3,000 emails/month)
3. Verify your email address

---

## Step 2: Get Your API Key

1. Once logged in, go to **API Keys** in the Resend dashboard
2. Click **Create API Key**
3. Give it a name (e.g., "Wonderzyme OTP")
4. Select **Sending access**
5. Copy the API key (it starts with `re_...`)

---

## Step 3: Add API Key to Your Project

You've already been prompted to add the `RESEND_API_KEY` secret. If you need to update it:

1. The API key is stored as an environment variable in your Supabase project
2. You should have entered it in the secret modal that appeared
3. The key is automatically used by the backend to send emails

---

## Step 4: Test the Email System

### For Admin Login:
1. Go to your app landing page
2. Click **Admin Dashboard**
3. Enter email: `wonderzymemarketing@infarmco.com`
4. Enter password: `admin123`
5. Check your Outlook inbox for the OTP

### For User Access:
1. Click **Client Portal**
2. Enter your name and email
3. Check your inbox for the OTP

---

## 📧 Email Details

**From Address:** `Wonderzyme <onboarding@resend.dev>`  
(This is Resend's test domain - perfect for testing)

**Email Content:**
- Beautiful HTML email with Wonderzyme branding
- Large 4-digit OTP code
- Dark theme matching your app
- 10-minute expiry warning

---

## 🔧 Troubleshooting

### OTP Not Received?

1. **Check spam/junk folder** - Resend's test domain might be filtered
2. **Check server logs** - OTP is always logged to console as backup:
   - Go to Supabase Dashboard → Edge Functions → Logs
   - Look for "OTP EMAIL SENT" messages
   - The OTP code is displayed there

3. **Verify API key** - Make sure you entered it correctly in the secret modal

### Want to Use Your Own Domain?

1. In Resend dashboard, go to **Domains**
2. Add your domain (e.g., `wonderzyme.com`)
3. Follow DNS setup instructions
4. Update the `from` field in `/supabase/functions/server/index.tsx`:
   ```typescript
   from: 'Wonderzyme <noreply@wonderzyme.com>'
   ```

---

## 🎯 Current Status

✅ Backend email integration complete  
✅ OTP generation working (4-digit codes)  
✅ Email templates designed (dark theme)  
✅ Admin email set to: `wonderzymemarketing@infarmco.com`  
✅ Fallback logging (OTP shown in console if email fails)  
✅ 10-minute OTP expiry  
✅ Session management  

**Ready to test!** 🚀

---

## 📝 Admin Credentials

**Email:** `wonderzymemarketing@infarmco.com`  
**Password:** `admin123`

To change these, set environment variables:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

---

## 🔐 Security Notes

- OTPs expire after 10 minutes
- Each OTP is single-use
- Sessions are securely stored in KV database
- Admin requires both password AND OTP (2FA)
- Users only need email + OTP

---

Need help? The OTP codes are **always** logged to the server console as a backup, so you can test the system even before setting up Resend!