import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';

const kvClient = () => createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
const kvSet = async (key: string, value: any) => { const { error } = await kvClient().from("kv_store_63cffc09").upsert({ key, value }); if (error) throw new Error(error.message); };
const kvGet = async (key: string) => { const { data, error } = await kvClient().from("kv_store_63cffc09").select("value").eq("key", key).maybeSingle(); if (error) throw new Error(error.message); return data?.value; };
const kvDel = async (key: string) => { const { error } = await kvClient().from("kv_store_63cffc09").delete().eq("key", key); if (error) throw new Error(error.message); };
const kvMdel = async (keys: string[]) => { const { error } = await kvClient().from("kv_store_63cffc09").delete().in("key", keys); if (error) throw new Error(error.message); };
const kvGetByPrefix = async (prefix: string) => { const { data, error } = await kvClient().from("kv_store_63cffc09").select("key, value").like("key", prefix + "%"); if (error) throw new Error(error.message); return data?.map((d) => d.value) ?? []; };

async function sendRequestEditNotificationEmail(oldRequest: any, newRequest: any, changes: string[]): Promise<boolean> {
  try {
    let resendApiKey = Deno.env.get('RESEND_API_KEY');
    console.log(`\n========== PURCHASE ORDER EDITED ==========`);
    console.log(`Request ID: ${newRequest.id}`);
    console.log(`Client: ${newRequest.clientName}`);
    console.log(`Changes Made: ${changes.join(', ')}`);
    console.log(`==========================================\n`);
    if (!resendApiKey?.trim()) { console.log('RESEND_API_KEY not configured - Edit notification logged to console only'); return true; }
    resendApiKey = resendApiKey.trim();
    const notificationEmail = 'admin@nexabox.tech';
    const emailDomain = Deno.env.get('EMAIL_DOMAIN') || 'onboarding@resend.dev';
    const fromAddress = emailDomain.includes('@') ? `NexaBox Notifications <${emailDomain}>` : `NexaBox Notifications <noreply@${emailDomain}>`;
    const editTime = new Date();
    const formattedDate = editTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = editTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    let changesHtml = '';
    for (const change of changes) { changesHtml += `<li style="color: #ffffff; margin-bottom: 8px;">✏️ ${change}</li>`; }
    let itemsTableHtml = '';
    for (const item of newRequest.items) {
      itemsTableHtml += `<tr style="border-bottom: 1px solid #404040;"><td style="padding: 12px 8px; color: #ffffff;">${item.productName}</td><td style="padding: 12px 8px; color: #b0b0b0;">${item.category}</td><td style="padding: 12px 8px; color: #b0b0b0;">${item.size}</td><td style="padding: 12px 8px; color: #ffffff; text-align: center;">${item.quantity}</td><td style="padding: 12px 8px; color: #b0b0b0; text-align: right;">₱${item.unitPrice.toFixed(2)}</td><td style="padding: 12px 8px; color: #2d8659; font-weight: bold; text-align: right;">₱${item.total.toFixed(2)}</td></tr>`;
    }
    const emailBody = {
      from: fromAddress, to: notificationEmail,
      subject: `✏️ Purchase Order Updated - ${newRequest.clientName || newRequest.submittedBy}`,
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:sans-serif;background:#1a1a1a;margin:0;padding:20px}.container{max-width:800px;margin:0 auto;background:#2d2d2d;border-radius:12px;padding:40px;border:1px solid #404040}.header{text-align:center;margin-bottom:30px;border-bottom:2px solid #ff9800;padding-bottom:20px}.logo-text{color:#2d8659;font-size:32px;font-weight:bold;margin:0}.badge{display:inline-block;background:#ff9800;color:#fff;padding:8px 16px;border-radius:20px;font-size:14px;font-weight:bold;margin-top:10px}h1{color:#fff;font-size:24px;margin:0 0 10px}h2{color:#ff9800;font-size:18px;margin:30px 0 15px;border-bottom:1px solid #404040;padding-bottom:8px}p{color:#b0b0b0;line-height:1.6;margin:0 0 15px}.info-box{background:#1a1a1a;border-left:4px solid #ff9800;padding:20px;margin:20px 0;border-radius:4px}.info-row{display:flex;margin-bottom:10px}.info-label{color:#808080;font-weight:bold;min-width:140px}.info-value{color:#fff}.changes-box{background:#3a2a1a;border-left:4px solid #ff9800;padding:20px;margin:20px 0;border-radius:4px}.changes-box h3{color:#ff9800;margin:0 0 15px;font-size:16px}.changes-box ul{margin:0;padding-left:20px;list-style:none}table{width:100%;border-collapse:collapse;margin:20px 0;background:#1a1a1a;border-radius:8px;overflow:hidden}th{background:#ff9800;color:#fff;padding:12px 8px;text-align:left;font-weight:bold}.total-row{background:#2d2d2d;border-top:2px solid #ff9800}.total-row td{padding:15px 8px;font-weight:bold;font-size:16px;color:#ff9800}.footer{text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #404040}.footer p{color:#808080;font-size:12px;margin:5px 0}</style></head><body><div class="container"><div class="header"><p class="logo-text">⚡ NexaBox</p><span class="badge">ORDER UPDATED</span></div><h1>✏️ Purchase Order Updated</h1><p>A purchase order has been modified in the NexaBox Electronics Distribution System.</p><div class="info-box"><div class="info-row"><span class="info-label">Submitted By:</span><span class="info-value">${newRequest.submittedBy}</span></div><div class="info-row"><span class="info-label">DR Number:</span><span class="info-value">${newRequest.drNumber || 'N/A'}</span></div><div class="info-row"><span class="info-label">Client Name:</span><span class="info-value">${newRequest.clientName || 'N/A'}</span></div><div class="info-row"><span class="info-label">Modified:</span><span class="info-value">${formattedDate} at ${formattedTime}</span></div><div class="info-row"><span class="info-label">Request ID:</span><span class="info-value">${newRequest.id}</span></div></div><div class="changes-box"><h3>📝 Changes Made:</h3><ul>${changesHtml}</ul></div><h2>📋 Current Items</h2><table><thead><tr><th>Product Name</th><th>Category</th><th>Size</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>${itemsTableHtml}<tr class="total-row"><td colspan="5" style="text-align:right">TOTAL ESTIMATED VALUE:</td><td style="text-align:right">₱${newRequest.totalValue.toFixed(2)}</td></tr></tbody></table><div class="footer"><p>© 2026 NexaBox. All rights reserved.</p><p>Electronics Distribution System</p><p style="font-size:11px;color:#666;margin-top:8px">Developed by Dale Catibog</p></div></div></body></html>`
    };
    console.log(`📧 Sending edit notification email to ${notificationEmail}...`);
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(emailBody) });
    if (!response.ok) { const errorData = await response.json().catch(() => ({ message: 'Unknown error' })); console.error('Failed to send edit notification email:', JSON.stringify(errorData)); return false; }
    const result = await response.json(); console.log(`✅ Edit notification email sent! ID: ${result.id}\n`); return true;
  } catch (error) { console.error('Error sending edit notification email:', error); return false; }
}

async function sendRequestDeleteNotificationEmail(deletedRequest: any): Promise<boolean> {
  try {
    let resendApiKey = Deno.env.get('RESEND_API_KEY');
    console.log(`\n========== PURCHASE ORDER DELETED ==========`);
    console.log(`Request ID: ${deletedRequest.id}`);
    console.log(`Client: ${deletedRequest.clientName}`);
    console.log(`Total Value: ₱${deletedRequest.totalValue.toFixed(2)}`);
    console.log(`===========================================\n`);
    if (!resendApiKey?.trim()) { console.log('RESEND_API_KEY not configured - Delete notification logged to console only'); return true; }
    resendApiKey = resendApiKey.trim();
    const notificationEmail = 'admin@nexabox.tech';
    const emailDomain = Deno.env.get('EMAIL_DOMAIN') || 'onboarding@resend.dev';
    const fromAddress = emailDomain.includes('@') ? `NexaBox Notifications <${emailDomain}>` : `NexaBox Notifications <noreply@${emailDomain}>`;
    const deleteTime = new Date();
    const formattedDate = deleteTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = deleteTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const originalTime = new Date(deletedRequest.timestamp);
    const originalFormattedDate = originalTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    let itemsTableHtml = '';
    for (const item of deletedRequest.items) {
      itemsTableHtml += `<tr style="border-bottom: 1px solid #404040;"><td style="padding: 12px 8px; color: #ffffff;">${item.productName}</td><td style="padding: 12px 8px; color: #b0b0b0;">${item.category}</td><td style="padding: 12px 8px; color: #b0b0b0;">${item.size}</td><td style="padding: 12px 8px; color: #ffffff; text-align: center;">${item.quantity}</td><td style="padding: 12px 8px; color: #b0b0b0; text-align: right;">₱${item.unitPrice.toFixed(2)}</td><td style="padding: 12px 8px; color: #ff5252; font-weight: bold; text-align: right;">₱${item.total.toFixed(2)}</td></tr>`;
    }
    const emailBody = {
      from: fromAddress, to: notificationEmail,
      subject: `🗑️ Purchase Order Deleted - ${deletedRequest.clientName || deletedRequest.submittedBy}`,
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:sans-serif;background:#1a1a1a;margin:0;padding:20px}.container{max-width:800px;margin:0 auto;background:#2d2d2d;border-radius:12px;padding:40px;border:1px solid #404040}.header{text-align:center;margin-bottom:30px;border-bottom:2px solid #f44336;padding-bottom:20px}.logo-text{color:#2d8659;font-size:32px;font-weight:bold;margin:0}.badge{display:inline-block;background:#f44336;color:#fff;padding:8px 16px;border-radius:20px;font-size:14px;font-weight:bold;margin-top:10px}h1{color:#fff;font-size:24px;margin:0 0 10px}h2{color:#f44336;font-size:18px;margin:30px 0 15px;border-bottom:1px solid #404040;padding-bottom:8px}p{color:#b0b0b0;line-height:1.6;margin:0 0 15px}.info-box{background:#1a1a1a;border-left:4px solid #f44336;padding:20px;margin:20px 0;border-radius:4px}.info-row{display:flex;margin-bottom:10px}.info-label{color:#808080;font-weight:bold;min-width:140px}.info-value{color:#fff}.warning-box{background:#3a1a1a;border-left:4px solid #f44336;padding:15px;margin:20px 0;border-radius:4px}.warning-box p{color:#ff5252;margin:0;font-weight:bold}table{width:100%;border-collapse:collapse;margin:20px 0;background:#1a1a1a;border-radius:8px;overflow:hidden}th{background:#f44336;color:#fff;padding:12px 8px;text-align:left;font-weight:bold}.total-row{background:#2d2d2d;border-top:2px solid #f44336}.total-row td{padding:15px 8px;font-weight:bold;font-size:16px;color:#f44336}.footer{text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #404040}.footer p{color:#808080;font-size:12px;margin:5px 0}</style></head><body><div class="container"><div class="header"><p class="logo-text">⚡ NexaBox</p><span class="badge">ORDER DELETED</span></div><h1>🗑️ Purchase Order Deleted</h1><p>A purchase order has been permanently removed from the NexaBox Electronics Distribution System.</p><div class="warning-box"><p>⚠️ This action is permanent and cannot be undone.</p></div><div class="info-box"><div class="info-row"><span class="info-label">Submitted By:</span><span class="info-value">${deletedRequest.submittedBy}</span></div><div class="info-row"><span class="info-label">DR Number:</span><span class="info-value">${deletedRequest.drNumber || 'N/A'}</span></div><div class="info-row"><span class="info-label">Client Name:</span><span class="info-value">${deletedRequest.clientName || 'N/A'}</span></div><div class="info-row"><span class="info-label">Originally Created:</span><span class="info-value">${originalFormattedDate}</span></div><div class="info-row"><span class="info-label">Deleted:</span><span class="info-value">${formattedDate} at ${formattedTime}</span></div><div class="info-row"><span class="info-label">Request ID:</span><span class="info-value">${deletedRequest.id}</span></div></div><h2>📋 Deleted Items (For Record)</h2><table><thead><tr><th>Product Name</th><th>Category</th><th>Size</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>${itemsTableHtml}<tr class="total-row"><td colspan="5" style="text-align:right">TOTAL VALUE (DELETED):</td><td style="text-align:right">₱${deletedRequest.totalValue.toFixed(2)}</td></tr></tbody></table><div class="footer"><p>© 2026 NexaBox. All rights reserved.</p><p>Electronics Distribution System</p><p style="font-size:11px;color:#666;margin-top:8px">Developed by Dale Catibog</p></div></div></body></html>`
    };
    console.log(`📧 Sending delete notification email to ${notificationEmail}...`);
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(emailBody) });
    if (!response.ok) { const errorData = await response.json().catch(() => ({ message: 'Unknown error' })); console.error('Failed to send delete notification email:', JSON.stringify(errorData)); return false; }
    const result = await response.json(); console.log(`✅ Delete notification email sent! ID: ${result.id}\n`); return true;
  } catch (error) { console.error('Error sending delete notification email:', error); return false; }
}

const app = new Hono();
app.use('*', logger(console.log));
app.use("/*", cors({ origin: "*", allowHeaders: ["Content-Type", "Authorization"], allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], exposeHeaders: ["Content-Length"], maxAge: 600 }));

const initializeInventory = async () => {
  const inventoryExists = await kvGet("inventory_initialized");
  if (!inventoryExists) {
    const inventory = [
      { id: "sh-sp-std", name: "Smart Plug (Standard)", category: "SMART HOME", sizes: [{ size: "Single", price: 350, stock: 80 }, { size: "4-Pack", price: 1200, stock: 40 }] },
      { id: "sh-led-1m", name: "LED Strip Light", category: "SMART HOME", sizes: [{ size: "1m", price: 250, stock: 100 }, { size: "3m", price: 650, stock: 60 }, { size: "5m", price: 980, stock: 40 }] },
      { id: "sh-bulb", name: "Smart Bulb", category: "SMART HOME", sizes: [{ size: "Single", price: 320, stock: 90 }, { size: "3-Pack", price: 880, stock: 45 }] },
      { id: "sh-motion", name: "Motion Sensor", category: "SMART HOME", sizes: [{ size: "Standard", price: 480, stock: 55 }, { size: "Pro", price: 750, stock: 30 }] },
      { id: "sh-doorbell", name: "Smart Doorbell", category: "SMART HOME", sizes: [{ size: "Standard", price: 1850, stock: 25 }] },
      { id: "sh-wifi-ext", name: "WiFi Extender", category: "SMART HOME", sizes: [{ size: "Standard", price: 1200, stock: 35 }, { size: "Pro (Mesh)", price: 2500, stock: 20 }] },
      { id: "sh-cam-indoor", name: "Smart Indoor Camera", category: "SMART HOME", sizes: [{ size: "1080p", price: 1500, stock: 30 }, { size: "4K", price: 2800, stock: 15 }] },
      { id: "sh-hub", name: "Smart Home Hub", category: "SMART HOME", sizes: [{ size: "Standard", price: 2200, stock: 20 }] },
      { id: "au-tws-std", name: "TWS Earbuds", category: "AUDIO", sizes: [{ size: "Standard", price: 890, stock: 60 }, { size: "Pro (ANC)", price: 1950, stock: 35 }] },
      { id: "au-bt-spk", name: "Bluetooth Speaker", category: "AUDIO", sizes: [{ size: "Mini", price: 750, stock: 55 }, { size: "Standard", price: 1400, stock: 40 }, { size: "XL", price: 2800, stock: 20 }] },
      { id: "au-hp-wired", name: "Wired Headphones", category: "AUDIO", sizes: [{ size: "Standard", price: 680, stock: 50 }, { size: "Noise Cancelling", price: 1800, stock: 25 }] },
      { id: "au-gaming-hs", name: "Gaming Headset", category: "AUDIO", sizes: [{ size: "Wired", price: 1200, stock: 35 }, { size: "Wireless", price: 2200, stock: 20 }] },
      { id: "au-soundbar", name: "Portable Soundbar", category: "AUDIO", sizes: [{ size: "2.0", price: 3200, stock: 15 }, { size: "2.1 (with Sub)", price: 5500, stock: 10 }] },
      { id: "au-earphones", name: "Wired Earphones", category: "AUDIO", sizes: [{ size: "Standard", price: 350, stock: 80 }, { size: "Hi-Fi", price: 980, stock: 40 }] },
      { id: "per-mouse-wl", name: "Wireless Mouse", category: "PERIPHERALS", sizes: [{ size: "Standard", price: 580, stock: 65 }, { size: "Ergonomic", price: 1200, stock: 35 }] },
      { id: "per-kb-mech", name: "Mechanical Keyboard", category: "PERIPHERALS", sizes: [{ size: "TKL", price: 1800, stock: 30 }, { size: "Full Size", price: 2400, stock: 20 }] },
      { id: "per-usb-hub", name: "USB Hub", category: "PERIPHERALS", sizes: [{ size: "4-Port USB-A", price: 450, stock: 70 }, { size: "7-Port USB-A", price: 780, stock: 45 }, { size: "USB-C Hub (7-in-1)", price: 1200, stock: 35 }] },
      { id: "per-wl-charger", name: "Wireless Charger", category: "PERIPHERALS", sizes: [{ size: "Standard 10W", price: 520, stock: 60 }, { size: "Fast 15W", price: 850, stock: 40 }] },
      { id: "per-laptop-stand", name: "Laptop Stand", category: "PERIPHERALS", sizes: [{ size: "Fixed", price: 680, stock: 45 }, { size: "Adjustable", price: 1100, stock: 30 }] },
      { id: "per-webcam", name: "Webcam", category: "PERIPHERALS", sizes: [{ size: "1080p", price: 1200, stock: 35 }, { size: "4K", price: 2800, stock: 15 }] },
      { id: "per-mousepad", name: "Mouse Pad", category: "PERIPHERALS", sizes: [{ size: "Medium (30x25cm)", price: 180, stock: 90 }, { size: "XL (90x40cm)", price: 480, stock: 50 }] }
    ];
    await kvSet("inventory_initialized", "true");
    await kvSet("inventory_data", JSON.stringify(inventory));
    console.log("NexaBox inventory initialized with electronics product catalog");
  }
};
await initializeInventory();

app.get("/make-server-63cffc09/health", (c) => c.json({ status: "ok" }));

app.get("/make-server-63cffc09/inventory", async (c) => {
  try {
    const inventoryData = await kvGet("inventory_data");
    if (!inventoryData) return c.json({ error: "Inventory not found" }, 404);
    return c.json(JSON.parse(inventoryData));
  } catch (error) { console.log("Error fetching inventory:", error); return c.json({ error: "Failed to fetch inventory" }, 500); }
});

app.get("/make-server-63cffc09/requests/all", async (c) => {
  try {
    const requests = await kvGetByPrefix("request_");
    const allRequests = requests.map(r => JSON.parse(r));
    allRequests.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return c.json(allRequests);
  } catch (error) { console.log("Error fetching all requests:", error); return c.json({ error: "Failed to fetch all requests" }, 500); }
});

app.put("/make-server-63cffc09/requests/update", async (c) => {
  try {
    const body = await c.req.json();
    const { requestId, updates } = body;
    if (!requestId) return c.json({ error: "Request ID is required" }, 400);
    const existingData = await kvGet(requestId);
    if (!existingData) return c.json({ error: "Request not found" }, 404);
    const oldRequest = JSON.parse(existingData);
    const request = { ...oldRequest };
    const changes: string[] = [];
    if (updates.submittedBy !== undefined && updates.submittedBy !== request.submittedBy) { changes.push(`Submitted By: "${request.submittedBy}" → "${updates.submittedBy}"`); request.submittedBy = updates.submittedBy; }
    if (updates.drNumber !== undefined && updates.drNumber !== request.drNumber) { changes.push(`DR Number: "${request.drNumber || 'N/A'}" → "${updates.drNumber}"`); request.drNumber = updates.drNumber; }
    if (updates.clientName !== undefined && updates.clientName !== request.clientName) { changes.push(`Client Name: "${request.clientName}" → "${updates.clientName}"`); request.clientName = updates.clientName; }
    if (updates.deliveryAddress !== undefined && updates.deliveryAddress !== request.deliveryAddress) { changes.push(`Delivery Address updated`); request.deliveryAddress = updates.deliveryAddress; }
    if (updates.deliveryDate !== undefined && updates.deliveryDate !== request.deliveryDate) { changes.push(`Delivery Date: "${request.deliveryDate || 'N/A'}" → "${updates.deliveryDate}"`); request.deliveryDate = updates.deliveryDate; }
    if (updates.notes !== undefined && updates.notes !== request.notes) { changes.push(`Notes updated`); request.notes = updates.notes; }
    if (updates.items !== undefined) { const oldItemCount = request.items.length; const newItemCount = updates.items.length; changes.push(oldItemCount !== newItemCount ? `Items changed: ${oldItemCount} → ${newItemCount} items` : `Items modified`); request.items = updates.items; request.totalValue = updates.items.reduce((sum, item) => sum + item.total, 0); }
    await kvSet(requestId, JSON.stringify(request));
    if (changes.length > 0) { sendRequestEditNotificationEmail(oldRequest, request, changes).catch(err => console.error('Edit notification email failed:', err)); }
    return c.json({ success: true, request });
  } catch (error) { console.log("Error updating request:", error); return c.json({ error: "Failed to update request" }, 500); }
});

app.delete("/make-server-63cffc09/requests/delete", async (c) => {
  try {
    const body = await c.req.json();
    const { requestId } = body;
    if (!requestId) return c.json({ error: "Request ID is required" }, 400);
    const existingData = await kvGet(requestId);
    if (!existingData) return c.json({ error: "Request not found" }, 404);
    const deletedRequest = JSON.parse(existingData);
    await kvDel(requestId);
    sendRequestDeleteNotificationEmail(deletedRequest).catch(err => console.error('Delete notification email failed:', err));
    return c.json({ success: true, message: "Request deleted successfully" });
  } catch (error) { console.log("Error deleting request:", error); return c.json({ error: "Failed to delete request" }, 500); }
});

app.delete("/make-server-63cffc09/requests/bulkDelete", async (c) => {
  try {
    const body = await c.req.json();
    const { requestIds } = body;
    if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) return c.json({ error: "Request IDs array is required" }, 400);
    await kvMdel(requestIds);
    return c.json({ success: true, message: `Deleted ${requestIds.length} requests successfully` });
  } catch (error) { console.log("Error bulk deleting requests:", error); return c.json({ error: "Failed to bulk delete requests" }, 500); }
});

app.delete("/make-server-63cffc09/requests/deleteAll", async (c) => {
  try {
    const allData = await kvGetByPrefix("request_");
    if (allData.length === 0) return c.json({ success: true, message: "No requests to delete" });
    const requestIds = allData.map((item: any) => item.key);
    await kvMdel(requestIds);
    return c.json({ success: true, message: `Deleted all ${requestIds.length} requests successfully` });
  } catch (error) { console.log("Error deleting all requests:", error); return c.json({ error: "Failed to delete all requests" }, 500); }
});

app.post("/make-server-63cffc09/requests/add", async (c) => {
  try {
    const body = await c.req.json();
    const { submittedBy, drNumber, clientName, deliveryAddress, deliveryDate, notes, items } = body;
    if (!submittedBy || !drNumber || !clientName) return c.json({ error: "submittedBy, drNumber, and clientName are required" }, 400);
    if (!items || !Array.isArray(items) || items.length === 0) return c.json({ error: "Items array is required and must not be empty" }, 400);
    const timestamp = new Date().toISOString();
    const requestId = `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const request = { id: requestId, timestamp, submittedBy, drNumber, clientName, deliveryAddress: deliveryAddress || '', deliveryDate: deliveryDate || '', notes: notes || '', items, totalValue: items.reduce((sum, item) => sum + item.total, 0) };
    await kvSet(requestId, JSON.stringify(request));
    sendRequestNotificationEmail(request).catch(err => console.error('Notification email failed:', err));
    return c.json({ success: true, request });
  } catch (error) { console.log("Error manually adding request:", error); return c.json({ error: "Failed to add request" }, 500); }
});

app.get("/make-server-63cffc09/requests", async (c) => {
  try {
    const startDate = c.req.query("startDate");
    const endDate = c.req.query("endDate");
    const requests = await kvGetByPrefix("request_");
    let filteredRequests = requests.map(r => JSON.parse(r));
    if (startDate || endDate) {
      filteredRequests = filteredRequests.filter(request => {
        const requestDate = new Date(request.timestamp);
        if (startDate && requestDate < new Date(startDate)) return false;
        if (endDate && requestDate > new Date(endDate)) return false;
        return true;
      });
    }
    filteredRequests.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return c.json(filteredRequests);
  } catch (error) { console.log("Error fetching requests:", error); return c.json({ error: "Failed to fetch requests" }, 500); }
});

app.post("/make-server-63cffc09/requests", async (c) => {
  try {
    const body = await c.req.json();
    const { items, submittedBy, drNumber, clientName, deliveryAddress, deliveryDate, notes } = body;
    if (!items || !Array.isArray(items) || items.length === 0) return c.json({ error: "Items array is required" }, 400);
    const timestamp = new Date().toISOString();
    const requestId = `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const request = { id: requestId, timestamp, submittedBy: submittedBy || "Anonymous", drNumber: drNumber || "", clientName: clientName || "", deliveryAddress: deliveryAddress || "", deliveryDate: deliveryDate || "", notes: notes || "", items, totalValue: items.reduce((sum, item) => sum + item.total, 0) };
    await kvSet(requestId, JSON.stringify(request));
    const inventoryData = await kvGet("inventory_data");
    if (inventoryData) {
      const inventory = JSON.parse(inventoryData);
      for (const item of items) { const product = inventory.find(p => p.name === item.productName); if (product) { const sizeInfo = product.sizes.find(s => s.size === item.size); if (sizeInfo) sizeInfo.stock = Math.max(0, sizeInfo.stock - item.quantity); } }
      await kvSet("inventory_data", JSON.stringify(inventory));
    }
    sendRequestNotificationEmail(request).catch(err => console.error('Notification email failed:', err));
    return c.json({ success: true, request });
  } catch (error) { console.log("Error creating request:", error); return c.json({ error: "Failed to create request" }, 500); }
});

app.post("/make-server-63cffc09/submit-request", async (c) => {
  try {
    const body = await c.req.json();
    const { items, submittedBy, drNumber, clientName, deliveryAddress, deliveryDate, notes } = body;
    if (!items || !Array.isArray(items) || items.length === 0) return c.json({ error: "Items array is required" }, 400);
    const timestamp = new Date().toISOString();
    const requestId = `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const request = { id: requestId, timestamp, submittedBy: submittedBy || "Anonymous", drNumber: drNumber || "", clientName: clientName || "", deliveryAddress: deliveryAddress || "", deliveryDate: deliveryDate || "", notes: notes || "", items, totalValue: items.reduce((sum, item) => sum + item.total, 0) };
    await kvSet(requestId, JSON.stringify(request));
    const inventoryData = await kvGet("inventory_data");
    if (inventoryData) {
      const inventory = JSON.parse(inventoryData);
      for (const item of items) { const product = inventory.find(p => p.name === item.productName); if (product) { const sizeInfo = product.sizes.find(s => s.size === item.size); if (sizeInfo) sizeInfo.stock = Math.max(0, sizeInfo.stock - item.quantity); } }
      await kvSet("inventory_data", JSON.stringify(inventory));
    }
    sendRequestNotificationEmail(request).catch(err => console.error('Notification email failed:', err));
    return c.json({ success: true, request });
  } catch (error) { console.log("Error creating request:", error); return c.json({ error: "Failed to create request" }, 500); }
});

app.get("/make-server-63cffc09/export", async (c) => {
  try {
    const startDate = c.req.query("startDate");
    const requests = await kvGetByPrefix("request_");
    let filteredRequests = requests.map(r => JSON.parse(r));
    if (startDate) {
      const targetDate = new Date(startDate);
      filteredRequests = filteredRequests.filter(request => { const d = new Date(request.timestamp); return d.getFullYear() === targetDate.getFullYear() && d.getMonth() === targetDate.getMonth() && d.getDate() === targetDate.getDate(); });
    }
    const exportData = [];
    for (const request of filteredRequests) {
      for (const item of request.items) { exportData.push({ timestamp: request.timestamp, submittedBy: request.submittedBy, drNumber: request.drNumber || "", clientName: request.clientName || "", productName: item.productName, category: item.category, size: item.size, quantity: item.quantity, unitPrice: item.unitPrice, totalValue: item.total }); }
    }
    return c.json(exportData);
  } catch (error) { console.log("Error exporting requests:", error); return c.json({ error: "Failed to export requests" }, 500); }
});

app.post("/make-server-63cffc09/admin/reset-inventory", async (c) => {
  try {
    await kvDel("inventory_initialized");
    await initializeInventory();
    return c.json({ success: true, message: "Inventory reset successfully" });
  } catch (error) { console.log("Error resetting inventory:", error); return c.json({ error: "Failed to reset inventory" }, 500); }
});

app.post("/make-server-63cffc09/inventory/update-stock", async (c) => {
  try {
    const body = await c.req.json();
    const { productId, size, newStock } = body;
    if (!productId || !size || newStock === undefined) return c.json({ error: "Missing required fields" }, 400);
    const inventoryData = await kvGet("inventory_data");
    if (!inventoryData) return c.json({ error: "Inventory data not found" }, 404);
    const inventory = JSON.parse(inventoryData);
    const product = inventory.find(p => p.id === productId);
    if (!product) return c.json({ error: "Product not found" }, 404);
    const sizeInfo = product.sizes.find(s => s.size === size);
    if (!sizeInfo) return c.json({ error: "Size not found" }, 404);
    sizeInfo.stock = newStock;
    await kvSet("inventory_data", JSON.stringify(inventory));
    return c.json({ success: true, product });
  } catch (error) { console.log("Error updating stock:", error); return c.json({ error: "Failed to update stock" }, 500); }
});

app.post("/make-server-63cffc09/inventory/update-price", async (c) => {
  try {
    const body = await c.req.json();
    const { productId, size, newPrice } = body;
    if (!productId || !size || newPrice === undefined) return c.json({ error: "Missing required fields" }, 400);
    const inventoryData = await kvGet("inventory_data");
    if (!inventoryData) return c.json({ error: "Inventory data not found" }, 404);
    const inventory = JSON.parse(inventoryData);
    const product = inventory.find(p => p.id === productId);
    if (!product) return c.json({ error: "Product not found" }, 404);
    const sizeInfo = product.sizes.find(s => s.size === size);
    if (!sizeInfo) return c.json({ error: "Size not found" }, 404);
    sizeInfo.price = newPrice;
    await kvSet("inventory_data", JSON.stringify(inventory));
    return c.json({ success: true, product });
  } catch (error) { console.log("Error updating price:", error); return c.json({ error: "Failed to update price" }, 500); }
});

app.post("/make-server-63cffc09/inventory/add-product", async (c) => {
  try {
    const body = await c.req.json();
    const { name, category, sizes } = body;
    if (!name || !category || !sizes || !Array.isArray(sizes) || sizes.length === 0) return c.json({ error: "Missing required fields: name, category, and sizes array" }, 400);
    for (const size of sizes) {
      if (!size.size || size.price === undefined || size.stock === undefined) return c.json({ error: "Each size must have size, price, and stock fields" }, 400);
      if (typeof size.price !== 'number' || size.price < 0) return c.json({ error: "Price must be a non-negative number" }, 400);
      if (typeof size.stock !== 'number' || size.stock < 0 || !Number.isInteger(size.stock)) return c.json({ error: "Stock must be a non-negative integer" }, 400);
    }
    if (!category || typeof category !== 'string' || category.trim().length === 0) return c.json({ error: "Category must be a non-empty string" }, 400);
    const inventoryData = await kvGet("inventory_data");
    if (!inventoryData) return c.json({ error: "Inventory data not found" }, 404);
    const inventory = JSON.parse(inventoryData);
    const productId = `${category.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const existingProduct = inventory.find(p => p.name.toLowerCase() === name.toLowerCase() && p.category === category);
    if (existingProduct) return c.json({ error: "A product with this name already exists in this category" }, 400);
    const newProduct = { id: productId, name: name.trim(), category, sizes: sizes.map(size => ({ size: size.size.trim(), price: parseFloat(size.price), stock: parseInt(size.stock) })) };
    inventory.push(newProduct);
    await kvSet("inventory_data", JSON.stringify(inventory));
    console.log(`New product added: ${name} in ${category} category`);
    return c.json({ success: true, product: newProduct });
  } catch (error) { console.log("Error adding new product:", error); return c.json({ error: "Failed to add new product" }, 500); }
});

app.post("/make-server-63cffc09/inventory/edit-product", async (c) => {
  try {
    const body = await c.req.json();
    const { productId, name, category, sizes } = body;
    if (!productId) return c.json({ error: "Product ID is required" }, 400);
    if (!name || !category || !sizes || !Array.isArray(sizes) || sizes.length === 0) return c.json({ error: "Missing required fields: name, category, and sizes array" }, 400);
    for (const size of sizes) {
      if (!size.size || size.price === undefined || size.stock === undefined) return c.json({ error: "Each size must have size, price, and stock fields" }, 400);
      if (typeof size.price !== 'number' || size.price < 0) return c.json({ error: "Price must be a non-negative number" }, 400);
      if (typeof size.stock !== 'number' || size.stock < 0 || !Number.isInteger(size.stock)) return c.json({ error: "Stock must be a non-negative integer" }, 400);
    }
    const inventoryData = await kvGet("inventory_data");
    if (!inventoryData) return c.json({ error: "Inventory data not found" }, 404);
    const inventory = JSON.parse(inventoryData);
    const productIndex = inventory.findIndex(p => p.id === productId);
    if (productIndex === -1) return c.json({ error: "Product not found" }, 404);
    const duplicateProduct = inventory.find(p => p.id !== productId && p.name.toLowerCase() === name.toLowerCase() && p.category === category);
    if (duplicateProduct) return c.json({ error: "A product with this name already exists in this category" }, 400);
    inventory[productIndex] = { id: productId, name: name.trim(), category, sizes: sizes.map(size => ({ size: size.size.trim(), price: parseFloat(size.price), stock: parseInt(size.stock) })) };
    await kvSet("inventory_data", JSON.stringify(inventory));
    console.log(`Product updated: ${name} (ID: ${productId})`);
    return c.json({ success: true, product: inventory[productIndex] });
  } catch (error) { console.log("Error editing product:", error); return c.json({ error: "Failed to edit product" }, 500); }
});

app.post("/make-server-63cffc09/inventory/delete-product", async (c) => {
  try {
    const body = await c.req.json();
    const { productId } = body;
    if (!productId) return c.json({ error: "Product ID is required" }, 400);
    const inventoryData = await kvGet("inventory_data");
    if (!inventoryData) return c.json({ error: "Inventory data not found" }, 404);
    const inventory = JSON.parse(inventoryData);
    const productIndex = inventory.findIndex(p => p.id === productId);
    if (productIndex === -1) return c.json({ error: "Product not found" }, 404);
    const deletedProduct = inventory[productIndex];
    inventory.splice(productIndex, 1);
    await kvSet("inventory_data", JSON.stringify(inventory));
    console.log(`Product deleted: ${deletedProduct.name} (ID: ${productId})`);
    return c.json({ success: true, deletedProduct });
  } catch (error) { console.log("Error deleting product:", error); return c.json({ error: "Failed to delete product" }, 500); }
});

function generateOTP(): string { return Math.floor(1000 + Math.random() * 9000).toString(); }

async function sendOTPEmail(email: string, otp: string, name?: string): Promise<boolean> {
  try {
    let resendApiKey = Deno.env.get('RESEND_API_KEY');
    console.log(`\n========== OTP EMAIL ==========`);
    console.log(`To: ${email}`);
    console.log(`Name: ${name || 'User'}`);
    console.log(`OTP Code: ${otp}`);
    if (resendApiKey) { resendApiKey = resendApiKey.trim(); console.log(`API Key Status: Found (${resendApiKey.length} chars)`); }
    else { console.log(`API Key Status: NOT FOUND`); }
    console.log(`===============================\n`);
    if (!resendApiKey?.trim()) { console.log('RESEND_API_KEY not configured - Using console logging only'); return true; }
    const emailDomain = Deno.env.get('EMAIL_DOMAIN') || 'onboarding@resend.dev';
    const fromAddress = emailDomain.includes('@') ? `NexaBox <${emailDomain}>` : `NexaBox <noreply@${emailDomain}>`;
    const emailBody = {
      from: fromAddress, to: email, subject: 'Your NexaBox Verification Code',
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:sans-serif;background:#1a1a1a;margin:0;padding:20px}.container{max-width:600px;margin:0 auto;background:#2d2d2d;border-radius:12px;padding:40px;border:1px solid #404040}.logo{text-align:center;margin-bottom:30px}.logo-text{color:#2d8659;font-size:32px;font-weight:bold;margin:0}h1{color:#fff;font-size:24px;margin:0 0 10px}p{color:#b0b0b0;line-height:1.6;margin:0 0 20px}.otp-box{background:#1a1a1a;border:2px solid #2d8659;border-radius:8px;padding:30px;text-align:center;margin:30px 0}.otp-code{font-size:48px;font-weight:bold;color:#2d8659;letter-spacing:8px;margin:0;font-family:monospace}.otp-label{color:#808080;font-size:14px;margin-top:10px}.warning{background:#3a2a1a;border-left:4px solid #ff9800;padding:15px;margin:20px 0;border-radius:4px}.warning p{color:#ffb74d;margin:0;font-size:14px}.footer{text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #404040}.footer p{color:#808080;font-size:12px}</style></head><body><div class="container"><div class="logo"><p class="logo-text">⚡ NexaBox</p></div><h1>Hi ${name || 'there'}! 👋</h1><p>We received a login request for the NexaBox Electronics Distribution System. Use the verification code below to complete your authentication:</p><div class="otp-box"><p class="otp-code">${otp}</p><p class="otp-label">Your 4-Digit Verification Code</p></div><div class="warning"><p>⏱️ This code will expire in 10 minutes</p></div><p>If you didn't request this code, please ignore this email.</p><div class="footer"><p>© 2026 NexaBox. All rights reserved.</p><p>Electronics Distribution System</p><p style="font-size:11px;color:#666;margin-top:8px">Developed by Dale Catibog</p></div></div></body></html>`
    };
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(emailBody) });
    if (!response.ok) { const errorData = await response.json().catch(() => ({ message: 'Unknown error' })); console.error('Failed to send OTP email:', errorData); return true; }
    const result = await response.json(); console.log(`✅ OTP email sent! ID: ${result.id}\n`); return true;
  } catch (error) { console.error('Error sending OTP email:', error); return true; }
}

async function sendRequestNotificationEmail(request: any): Promise<boolean> {
  try {
    let resendApiKey = Deno.env.get('RESEND_API_KEY');
    console.log(`\n========== PURCHASE ORDER NOTIFICATION ==========`);
    console.log(`Request ID: ${request.id}`);
    console.log(`Submitted By: ${request.submittedBy}`);
    console.log(`Client: ${request.clientName}`);
    console.log(`Total Items: ${request.items.length}`);
    console.log(`Total Value: ₱${request.totalValue.toFixed(2)}`);
    console.log(`================================================\n`);
    if (!resendApiKey?.trim()) { console.log('RESEND_API_KEY not configured - Notification logged to console only'); return true; }
    resendApiKey = resendApiKey.trim();
    const notificationEmail = 'admin@nexabox.tech';
    const emailDomain = Deno.env.get('EMAIL_DOMAIN') || 'onboarding@resend.dev';
    const fromAddress = emailDomain.includes('@') ? `NexaBox Notifications <${emailDomain}>` : `NexaBox Notifications <noreply@${emailDomain}>`;
    const timestamp = new Date(request.timestamp);
    const formattedDate = timestamp.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    let itemsTableHtml = '';
    for (const item of request.items) {
      itemsTableHtml += `<tr style="border-bottom:1px solid #404040"><td style="padding:12px 8px;color:#fff">${item.productName}</td><td style="padding:12px 8px;color:#b0b0b0">${item.category}</td><td style="padding:12px 8px;color:#b0b0b0">${item.size}</td><td style="padding:12px 8px;color:#fff;text-align:center">${item.quantity}</td><td style="padding:12px 8px;color:#b0b0b0;text-align:right">₱${item.unitPrice.toFixed(2)}</td><td style="padding:12px 8px;color:#2d8659;font-weight:bold;text-align:right">₱${item.total.toFixed(2)}</td></tr>`;
    }
    const emailBody = {
      from: fromAddress, to: notificationEmail,
      subject: `🔔 New Purchase Order from ${request.clientName || request.submittedBy}`,
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:sans-serif;background:#1a1a1a;margin:0;padding:20px}.container{max-width:800px;margin:0 auto;background:#2d2d2d;border-radius:12px;padding:40px;border:1px solid #404040}.header{text-align:center;margin-bottom:30px;border-bottom:2px solid #2d8659;padding-bottom:20px}.logo-text{color:#2d8659;font-size:32px;font-weight:bold;margin:0}.badge{display:inline-block;background:#2d8659;color:#fff;padding:8px 16px;border-radius:20px;font-size:14px;font-weight:bold;margin-top:10px}h1{color:#fff;font-size:24px;margin:0 0 10px}h2{color:#2d8659;font-size:18px;margin:30px 0 15px;border-bottom:1px solid #404040;padding-bottom:8px}p{color:#b0b0b0;line-height:1.6;margin:0 0 15px}.info-box{background:#1a1a1a;border-left:4px solid #2d8659;padding:20px;margin:20px 0;border-radius:4px}.info-row{display:flex;margin-bottom:10px}.info-label{color:#808080;font-weight:bold;min-width:140px}.info-value{color:#fff}table{width:100%;border-collapse:collapse;margin:20px 0;background:#1a1a1a;border-radius:8px;overflow:hidden}th{background:#2d8659;color:#fff;padding:12px 8px;text-align:left;font-weight:bold}.total-row{background:#2d2d2d;border-top:2px solid #2d8659}.total-row td{padding:15px 8px;font-weight:bold;font-size:16px;color:#2d8659}.footer{text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #404040}.footer p{color:#808080;font-size:12px;margin:5px 0}</style></head><body><div class="container"><div class="header"><p class="logo-text">⚡ NexaBox</p><span class="badge">NEW PURCHASE ORDER</span></div><h1>📦 New Purchase Order Received</h1><p>A new purchase order has been submitted to the NexaBox Electronics Distribution System.</p><div class="info-box"><div class="info-row"><span class="info-label">Submitted By:</span><span class="info-value">${request.submittedBy}</span></div><div class="info-row"><span class="info-label">Client Name:</span><span class="info-value">${request.clientName || 'N/A'}</span></div><div class="info-row"><span class="info-label">Delivery Address:</span><span class="info-value">${request.deliveryAddress || 'N/A'}</span></div><div class="info-row"><span class="info-label">Delivery Date:</span><span class="info-value">${request.deliveryDate || 'N/A'}</span></div><div class="info-row"><span class="info-label">Request Date:</span><span class="info-value">${formattedDate} at ${formattedTime}</span></div><div class="info-row"><span class="info-label">Request ID:</span><span class="info-value">${request.id}</span></div></div>${request.notes ? `<div style="background:#3a2a1a;border-left:4px solid #ff9800;padding:15px;margin:20px 0;border-radius:4px"><p style="color:#ffb74d;margin:0"><strong>📝 Notes:</strong></p><p style="color:#fff;margin-top:8px;font-style:italic">${request.notes}</p></div>` : ''}<h2>📋 Requested Items</h2><table><thead><tr><th>Product Name</th><th>Category</th><th>Size</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>${itemsTableHtml}<tr class="total-row"><td colspan="5" style="text-align:right">TOTAL ESTIMATED VALUE:</td><td style="text-align:right">₱${request.totalValue.toFixed(2)}</td></tr></tbody></table><div class="footer"><p>© 2026 NexaBox. All rights reserved.</p><p>Electronics Distribution System</p><p style="font-size:11px;color:#666;margin-top:8px">Developed by Dale Catibog</p></div></div></body></html>`
    };
    console.log(`📧 Sending purchase order notification to ${notificationEmail}...`);
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(emailBody) });
    if (!response.ok) { const errorData = await response.json().catch(() => ({ message: 'Unknown error' })); console.error('Failed to send notification email:', JSON.stringify(errorData)); return false; }
    const result = await response.json(); console.log(`✅ Notification email sent! ID: ${result.id}\n`); return true;
  } catch (error) { console.error('Error sending notification email:', error); return false; }
}

app.post("/make-server-63cffc09/auth/user/request-otp", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email } = body;
    if (!name || !email) return c.json({ error: "Name and email are required" }, 400);
    const otp = generateOTP();
    const sessionId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiry = Date.now() + 10 * 60 * 1000;
    await kvSet(sessionId, JSON.stringify({ type: 'user', name, email, otp, expiry, verified: false }));
    await sendOTPEmail(email, otp, name);
    return c.json({ success: true, sessionId });
  } catch (error) { console.log("Error requesting user OTP:", error); return c.json({ error: "Failed to send OTP" }, 500); }
});

app.post("/make-server-63cffc09/auth/user/verify-otp", async (c) => {
  try {
    const body = await c.req.json();
    const { sessionId, otp } = body;
    if (!sessionId || !otp) return c.json({ error: "Session ID and OTP are required" }, 400);
    const sessionData = await kvGet(sessionId);
    if (!sessionData) return c.json({ error: "Invalid or expired session" }, 401);
    const session = JSON.parse(sessionData);
    if (Date.now() > session.expiry) { await kvDel(sessionId); return c.json({ error: "OTP expired" }, 401); }
    if (session.otp !== otp) return c.json({ error: "Invalid OTP" }, 401);
    session.verified = true;
    await kvSet(sessionId, JSON.stringify(session));
    return c.json({ success: true, name: session.name, email: session.email });
  } catch (error) { console.log("Error verifying user OTP:", error); return c.json({ error: "Failed to verify OTP" }, 500); }
});

app.post("/make-server-63cffc09/auth/admin/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;
    if (!email || !password) return c.json({ error: "Email and password are required" }, 400);
    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@nexabox.tech';
    const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD') || 'admin123';
    const passwordOverride = await kvGet('admin_password_override');
    const actualPassword = passwordOverride || ADMIN_PASSWORD;
    console.log(`[AUTH] Login attempt for email: ${email}`);
    if (email !== ADMIN_EMAIL || password !== actualPassword) { console.log(`[AUTH] Login failed - Invalid credentials`); return c.json({ error: "Invalid email or password" }, 401); }
    const otp = generateOTP();
    const sessionId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiry = Date.now() + 10 * 60 * 1000;
    await kvSet(sessionId, JSON.stringify({ type: 'admin', email, otp, expiry, verified: false }));
    console.log(`[AUTH] Generated OTP for ${email}: ${otp}`);
    await sendOTPEmail(email, otp, 'Admin');
    return c.json({ success: true, sessionId });
  } catch (error) { console.log("Error during admin login:", error); return c.json({ error: "Failed to process login" }, 500); }
});

app.post("/make-server-63cffc09/auth/admin/verify-otp", async (c) => {
  try {
    const body = await c.req.json();
    const { sessionId, otp } = body;
    if (!sessionId || !otp) return c.json({ error: "Session ID and OTP are required" }, 400);
    const sessionData = await kvGet(sessionId);
    if (!sessionData) return c.json({ error: "Invalid or expired session" }, 401);
    const session = JSON.parse(sessionData);
    if (session.type !== 'admin' && session.type !== 'password-reset') return c.json({ error: "Invalid session type" }, 401);
    if (Date.now() > session.expiry) { await kvDel(sessionId); return c.json({ error: "OTP expired" }, 401); }
    if (session.otp !== otp) return c.json({ error: "Invalid OTP" }, 401);
    session.verified = true;
    await kvSet(sessionId, JSON.stringify(session));
    return c.json({ success: true, email: session.email });
  } catch (error) { console.log("Error verifying admin OTP:", error); return c.json({ error: "Failed to verify OTP" }, 500); }
});

app.post("/make-server-63cffc09/auth/admin/forgot-password", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;
    if (!email) return c.json({ error: "Email is required" }, 400);
    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@nexabox.tech';
    if (email !== ADMIN_EMAIL) return c.json({ error: "Invalid admin email" }, 401);
    const otp = generateOTP();
    const sessionId = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiry = Date.now() + 10 * 60 * 1000;
    await kvSet(sessionId, JSON.stringify({ type: 'password-reset', email, otp, expiry, verified: false }));
    await sendOTPEmail(email, otp, 'Admin');
    return c.json({ success: true, sessionId });
  } catch (error) { console.log("Error during password reset request:", error); return c.json({ error: "Failed to process password reset" }, 500); }
});

app.post("/make-server-63cffc09/auth/admin/reset-password", async (c) => {
  try {
    const body = await c.req.json();
    const { sessionId, password } = body;
    if (!sessionId || !password) return c.json({ error: "Session ID and password are required" }, 400);
    const sessionData = await kvGet(sessionId);
    if (!sessionData) return c.json({ error: "Invalid or expired session" }, 401);
    const session = JSON.parse(sessionData);
    if (session.type !== 'password-reset') return c.json({ error: "Invalid session type" }, 401);
    if (!session.verified) return c.json({ error: "Session not verified" }, 401);
    if (Date.now() > session.expiry) { await kvDel(sessionId); return c.json({ error: "Session expired" }, 401); }
    await kvSet('admin_password_override', password);
    await kvDel(sessionId);
    return c.json({ success: true, message: "Password reset successful" });
  } catch (error) { console.log("Error resetting password:", error); return c.json({ error: "Failed to reset password" }, 500); }
});

Deno.serve(app.fetch);
