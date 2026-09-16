# 📧 Sample Request Email Notification System

## Overview

The Wonderzyme Inventory System now automatically sends email notifications to **wonderzymemarketing@infarmco.com** whenever a sample request is created or submitted.

---

## ✅ What's Implemented

### Automatic Notifications For:

1. **Client Portal Submissions** (`/submit-request`)
   - When clients submit sample requests through the client portal
   
2. **Admin Dashboard Requests** (`/requests`)
   - When admins create requests through the admin dashboard
   
3. **Manual Request Addition** (`/requests/add`)
   - When admins manually add requests to the system

### Email Contains:

- 🔔 **Request Details**
  - Who submitted the request
  - Client name and delivery information
  - Delivery date
  - Request timestamp and ID
  
- 📋 **Complete Item List**
  - Product names and categories
  - Sizes and quantities
  - Unit prices and line totals
  - **Total estimated value** of all items
  
- 📝 **Notes** (if provided)
  - Any special instructions or notes from the requester
  
- 🎨 **Professional Design**
  - Dark theme matching Wonderzyme branding
  - Forest green accents (#2d8659)
  - Clean, organized table format
  - Mobile-responsive HTML email

---

## 🚀 How It Works

### Email Service: Resend API

The system uses the same **Resend** email service that powers your OTP authentication system.

### Configuration

The email notification system uses the existing `RESEND_API_KEY` environment variable. No additional configuration is needed!

**Notification Email:** `wonderzymemarketing@infarmco.com` (hardcoded in the backend)

**From Address:** `Wonderzyme Notifications <onboarding@resend.dev>` (or your custom domain if configured)

---

## 📬 Email Example

**Subject:** 🔔 New Sample Request from [Client Name]

**Content Includes:**
- Header with "NEW SAMPLE REQUEST" badge
- Request information box with all details
- Notes section (if applicable)
- Full item table with categories, sizes, quantities, and prices
- Total estimated value
- Next steps guidance for admin
- Developer credit footer

---

## 🔧 Testing the System

### Test a Client Submission:

1. Go to the **Client Portal**
2. Add items to your request cart
3. Fill in the submission form:
   - Your name
   - Client name
   - Delivery address
   - Delivery date
   - Notes (optional)
4. Submit the request
5. Check **wonderzymemarketing@infarmco.com** inbox

### Test an Admin Submission:

1. Log in to the **Admin Dashboard**
2. Click "Submit New Request" or manually add a request
3. Fill in all required information
4. Submit
5. Check **wonderzymemarketing@infarmco.com** inbox

---

## 🛠️ Troubleshooting

### Email Not Received?

1. **Check Spam/Junk Folder**
   - Resend's test domain (`onboarding@resend.dev`) might be filtered
   - Mark as "Not Spam" if found there

2. **Check Server Logs**
   - Go to Supabase Dashboard → Edge Functions → Logs
   - Look for "SAMPLE REQUEST NOTIFICATION" messages
   - The system always logs notifications to console

3. **Verify Resend API Key**
   - Make sure `RESEND_API_KEY` is properly configured
   - Check Supabase: Settings → Edge Functions → Manage secrets
   - The key should start with `re_`

4. **Test Domain Restrictions**
   - If using `onboarding@resend.dev`, emails only go to:
     - The email you signed up with on Resend
     - Verified emails in your Resend account
   - To send to ANY email, add your own domain at https://resend.com/domains

### Email Failure Won't Block Requests

**Important:** If email sending fails, the sample request is STILL saved successfully. Email notifications are non-blocking, meaning:

✅ Request is saved to database  
✅ Inventory stock is updated  
✅ Client sees success confirmation  
⚠️ Email might fail (but it's logged in console)

---

## 🎯 Email Domain Setup (Optional)

### Using Your Own Domain:

To send emails from your own domain instead of Resend's test domain:

1. **Add Domain to Resend**
   - Go to https://resend.com/domains
   - Click "Add Domain"
   - Enter your domain (e.g., `wonderzyme.com`)

2. **Configure DNS Records**
   - Add the SPF, DKIM, and DMARC records Resend provides
   - Wait 5-10 minutes for verification

3. **Update Environment Variable** (Optional)
   - In Supabase Edge Functions settings
   - Add: `EMAIL_DOMAIN` = `noreply@wonderzyme.com`
   - Or modify the code directly in `/supabase/functions/server/index.tsx`

---

## 📊 Monitoring Email Delivery

### View Email Logs in Resend:

1. Go to https://resend.com/emails
2. View all sent emails
3. Check delivery status, open rates, etc.
4. Debug any failed deliveries

### View Server Logs in Supabase:

1. Go to Supabase Dashboard
2. Navigate to Edge Functions → Logs
3. Filter by function: `make-server-63cffc09`
4. Look for notification logs with request details

---

## 🔐 Security Notes

- Email notifications are sent server-side (secure)
- No API keys exposed to frontend
- Request details only sent to the configured admin email
- All notifications logged for audit purposes
- Non-blocking implementation prevents request failures

---

## 📝 Technical Details

### Email Function Location:
`/supabase/functions/server/index.tsx`

### Function Name:
`sendRequestNotificationEmail(request)`

### Triggered From:
- Line ~586: `/requests/add` (admin manual addition)
- Line ~672: `/requests` (general request creation)
- Line ~732: `/submit-request` (client submissions)

### Email API:
Resend REST API (`https://api.resend.com/emails`)

### Notification Email:
Hardcoded as `wonderzymemarketing@infarmco.com`

---

## 🎨 Customization

### Change Notification Email:

Edit `/supabase/functions/server/index.tsx` at line ~1268:

```typescript
const notificationEmail = 'wonderzymemarketing@infarmco.com';
```

### Change Email Design:

Modify the HTML template in `sendRequestNotificationEmail()` function starting at line ~1310

### Change Email Subject:

Edit line ~1352:

```typescript
subject: `🔔 New Sample Request from ${request.clientName || request.submittedBy}`
```

---

## ✨ Features

✅ Automatic email notifications for all sample requests  
✅ Beautiful dark-themed HTML emails  
✅ Complete request details and item breakdown  
✅ Total estimated value calculation  
✅ Notes support  
✅ Non-blocking (won't fail requests if email fails)  
✅ Console logging for debugging  
✅ Professional branding with Wonderzyme colors  
✅ Mobile-responsive email design  
✅ Developer credit included  

---

## 📧 Support

If you need to:
- Change the notification email address
- Customize the email template
- Add multiple notification recipients
- Set up email forwarding rules
- Configure email filters

Contact: **Dale Catibog** (Developer)

---

**Last Updated:** April 17, 2026  
**Developed by:** Dale Catibog  
**System:** Wonderzyme Inventory & Sample Management System
