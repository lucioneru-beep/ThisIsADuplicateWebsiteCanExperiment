# 📧 Quick Email Notification Guide

## What Was Added?

**Automatic email notifications** are now sent to **wonderzymemarketing@infarmco.com** every time someone submits a sample request.

---

## 📬 When Are Emails Sent?

Emails are automatically sent when:

1. ✅ A **client** submits a request through the Client Portal
2. ✅ An **admin** creates a request through the Admin Dashboard
3. ✅ An **admin** manually adds a request to the system

---

## 📋 What's In The Email?

Each notification email includes:

- **Who submitted it** (name and email)
- **Client details** (name, delivery address, delivery date)
- **Request timestamp** and unique ID
- **Complete item list** with:
  - Product names
  - Categories (Naturezyme, Petzyme, Biozyme, etc.)
  - Sizes and quantities
  - Unit prices
  - Line totals
- **Total estimated value** of all items
- **Notes** (if provided)

---

## 🎨 Email Design

The email uses:
- Dark theme (#2d2d2d background)
- White text
- Forest green accents (#2d8659)
- Professional table layout
- Wonderzyme branding
- "Developed by Dale Catibog" footer

---

## ✅ No Setup Required!

The email system uses your existing **Resend API configuration** from the OTP authentication system.

**Just make sure:**
- ✓ `RESEND_API_KEY` is configured in Supabase
- ✓ Edge Functions are deployed

That's it! Emails will start sending automatically.

---

## 🧪 Test It Now

### Quick Test:

1. Go to your app
2. Click **Client Portal**
3. Add some sample products to your cart
4. Fill in the form and submit
5. **Check wonderzymemarketing@infarmco.com inbox!**

**Email Subject:** 🔔 New Sample Request from [Client Name]

---

## 🔍 Where To Check If Email Failed

If you don't receive an email:

1. **Check spam/junk folder first!**

2. **Check Supabase logs:**
   - Supabase Dashboard → Edge Functions → Logs
   - Look for: `========== SAMPLE REQUEST NOTIFICATION ==========`
   - The notification details are logged even if email fails

3. **Check Resend dashboard:**
   - https://resend.com/emails
   - View delivery status of sent emails

---

## 💡 Important Notes

### Email Failures Won't Break Requests

Even if the email fails to send:
- ✅ The request is STILL saved
- ✅ Inventory is STILL updated
- ✅ Client sees success message
- ⚠️ Just the email notification fails (logged in console)

This is by design - email is secondary to saving the request.

---

## 🎯 What If Email Goes To Spam?

### Using Test Domain

If you're using Resend's test domain (`onboarding@resend.dev`), emails can ONLY be sent to:
- The email you signed up with on Resend
- Emails verified in your Resend account at https://resend.com/settings/emails

### Solution: Add Your Own Domain

1. Go to https://resend.com/domains
2. Add your domain (e.g., `wonderzyme.com`)
3. Configure DNS records (SPF, DKIM, DMARC)
4. Emails will have better deliverability

---

## 📝 Changing The Notification Email

Currently hardcoded to: **wonderzymemarketing@infarmco.com**

To change it:
1. Open `/supabase/functions/server/index.tsx`
2. Find line ~1268: `const notificationEmail = 'wonderzymemarketing@infarmco.com';`
3. Change to your desired email
4. Deploy the Edge Function

---

## 📞 Need Help?

**Developer:** Dale Catibog

**Common Issues:**
- Email in spam? → Mark as "Not Spam" and add sender to contacts
- No email at all? → Check Supabase logs and Resend dashboard
- Wrong email address? → Edit the backend code as shown above
- Want multiple recipients? → Contact developer for multi-recipient setup

---

## ✨ Summary

✅ **Active:** Email notifications are now live  
📧 **Recipient:** wonderzymemarketing@infarmco.com  
🚀 **Automatic:** Sends on every sample request  
🎨 **Branded:** Professional Wonderzyme design  
📊 **Complete:** Full request details and pricing  
🔒 **Secure:** Server-side email sending  
📝 **Logged:** Always recorded in console  

**Ready to go!** Submit a test request to see it in action.

---

**System:** Wonderzyme Inventory & Sample Management  
**Developed by:** Dale Catibog  
**Date:** April 17, 2026
