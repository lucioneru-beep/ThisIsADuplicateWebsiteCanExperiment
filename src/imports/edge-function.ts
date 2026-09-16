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
    console.log(`REQUEST EDITED: ${newRequest.id}, Changes: ${changes.join(', ')}`);
    if (!resendApiKey?.trim()) return true;
    resendApiKey = resendApiKey.trim();
    const emailDomain = Deno.env.get('EMAIL_DOMAIN') || 'onboarding@resend.dev';
    const fromAddress = emailDomain.includes('@') ? `Wonderzyme Notifications <${emailDomain}>` : `Wonderzyme Notifications <noreply@${emailDomain}>`;
    let itemsHtml = '';
    for (const item of newRequest.items) { itemsHtml += `<tr><td>${item.productName}</td><td>${item.size}</td><td>${item.quantity}</td><td>₱${item.total.toFixed(2)}</td></tr>`; }
    await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: fromAddress, to: 'wonderzymemarketing@infarmco.com', subject: `✏️ Sample Request Updated - ${newRequest.clientName || newRequest.submittedBy}`, html: `<p>Changes: ${changes.join(', ')}</p><table>${itemsHtml}</table><p>Total: ₱${newRequest.totalValue.toFixed(2)}</p>` }) });
    return true;
  } catch (e) { return false; }
}

async function sendRequestDeleteNotificationEmail(deletedRequest: any): Promise<boolean> {
  try {
    let resendApiKey = Deno.env.get('RESEND_API_KEY');
    console.log(`REQUEST DELETED: ${deletedRequest.id}`);
    if (!resendApiKey?.trim()) return true;
    resendApiKey = resendApiKey.trim();
    const emailDomain = Deno.env.get('EMAIL_DOMAIN') || 'onboarding@resend.dev';
    const fromAddress = emailDomain.includes('@') ? `Wonderzyme Notifications <${emailDomain}>` : `Wonderzyme Notifications <noreply@${emailDomain}>`;
    await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: fromAddress, to: 'wonderzymemarketing@infarmco.com', subject: `🗑️ Sample Request Deleted - ${deletedRequest.clientName || deletedRequest.submittedBy}`, html: `<p>Deleted request ID: ${deletedRequest.id}. Total: ₱${deletedRequest.totalValue.toFixed(2)}</p>` }) });
    return true;
  } catch (e) { return false; }
}

async function sendOTPEmail(email: string, otp: string, name?: string): Promise<boolean> {
  try {
    let resendApiKey = Deno.env.get('RESEND_API_KEY');
    console.log(`OTP for ${email}: ${otp}`);
    if (!resendApiKey?.trim()) return true;
    resendApiKey = resendApiKey.trim();
    const emailDomain = Deno.env.get('EMAIL_DOMAIN') || 'onboarding@resend.dev';
    const fromAddress = emailDomain.includes('@') ? `Wonderzyme <${emailDomain}>` : `Wonderzyme <noreply@${emailDomain}>`;
    await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: fromAddress, to: email, subject: 'Your Wonderzyme Verification Code', html: `<div style="font-family:sans-serif;padding:40px;background:#1a1a1a;color:#fff;border-radius:12px;max-width:600px;margin:auto"><h2 style="color:#2d8659">🧬 Wonderzyme</h2><p>Hi ${name || 'there'}! Your code:</p><div style="font-size:48px;font-weight:bold;color:#2d8659;letter-spacing:8px;text-align:center;padding:20px;border:2px solid #2d8659;border-radius:8px;margin:20px 0">${otp}</div><p style="color:#808080">Expires in 10 minutes.</p></div>` }) });
    return true;
  } catch (e) { return true; }
}

async function sendRequestNotificationEmail(request: any): Promise<boolean> {
  try {
    let resendApiKey = Deno.env.get('RESEND_API_KEY');
    console.log(`NEW REQUEST: ${request.id}`);
    if (!resendApiKey?.trim()) return true;
    resendApiKey = resendApiKey.trim();
    const emailDomain = Deno.env.get('EMAIL_DOMAIN') || 'onboarding@resend.dev';
    const fromAddress = emailDomain.includes('@') ? `Wonderzyme Notifications <${emailDomain}>` : `Wonderzyme Notifications <noreply@${emailDomain}>`;
    let itemsHtml = '';
    for (const item of request.items) { itemsHtml += `<tr><td>${item.productName}</td><td>${item.size}</td><td>${item.quantity}</td><td>₱${item.total.toFixed(2)}</td></tr>`; }
    await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: fromAddress, to: 'wonderzymemarketing@infarmco.com', subject: `🔔 New Sample Request from ${request.clientName || request.submittedBy}`, html: `<div style="font-family:sans-serif;padding:40px;background:#1a1a1a;color:#fff;border-radius:12px;max-width:800px;margin:auto"><h2 style="color:#2d8659">🧬 Wonderzyme — New Request</h2><p><b>Client:</b> ${request.clientName || 'N/A'}</p><p><b>By:</b> ${request.submittedBy}</p><p><b>DR:</b> ${request.drNumber || 'N/A'}</p><table border="1" style="width:100%;border-collapse:collapse;margin-top:20px">${itemsHtml}</table><p><b>Total: ₱${request.totalValue.toFixed(2)}</b></p></div>` }) });
    return true;
  } catch (e) { return false; }
}

const app = new Hono();
app.use('*', logger(console.log));
app.use("/*", cors({ origin: "*", allowHeaders: ["Content-Type", "Authorization"], allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], exposeHeaders: ["Content-Length"], maxAge: 600 }));

const initializeInventory = async () => {
  const exists = await kvGet("inventory_initialized");
  if (!exists) {
    const inventory = [
      { id: "nat-apc", name: "All Purpose Liquid Cleaner", category: "NATUREZYME", sizes: [{ size: "Gallon", price: 250, stock: 45 }, { size: "Carboy", price: 1100, stock: 18 }] },
      { id: "nat-appc", name: "All Purpose Powder Cleaner", category: "NATUREZYME", sizes: [{ size: "1 Kilo", price: 200, stock: 40 }] },
      { id: "nat-pld-fp", name: "Powder Laundry Detergent (Floral Passion)", category: "NATUREZYME", sizes: [{ size: "1 Kilo", price: 180, stock: 50 }] },
      { id: "nat-tbc", name: "Toilet Bowl Cleaner", category: "NATUREZYME", sizes: [{ size: "Gallon", price: 220, stock: 35 }] },
      { id: "nat-fc", name: "Fabric Conditioner", category: "NATUREZYME", sizes: [{ size: "Gallon", price: 200, stock: 42 }] },
      { id: "nat-ld-fp", name: "Laundry Detergent (Liquid - Floral Passion)", category: "NATUREZYME", sizes: [{ size: "Gallon", price: 240, stock: 38 }] },
      { id: "nat-wb", name: "Wonrox Bleach", category: "NATUREZYME", sizes: [{ size: "Gallon", price: 200, stock: 48 }] },
      { id: "nat-ac", name: "Alkaline Cleaner", category: "NATUREZYME", sizes: [{ size: "Gallon", price: 280, stock: 30 }] },
      { id: "nat-dc-lemon", name: "Dishwashing Concentrate - Lemon", category: "NATUREZYME", sizes: [{ size: "Gallon", price: 230, stock: 45 }, { size: "500mL", price: 130, stock: 60 }, { size: "250mL", price: 75, stock: 80 }] },
      { id: "nat-dc-kalamansi", name: "Dishwashing Concentrate - Kalamansi", category: "NATUREZYME", sizes: [{ size: "Gallon", price: 230, stock: 45 }, { size: "500mL", price: 130, stock: 60 }, { size: "250mL", price: 75, stock: 80 }] },
      { id: "nat-mpds-bamboo", name: "Multi-Protect Disinfectant Spray - Bamboo", category: "NATUREZYME", sizes: [{ size: "Carboy", price: 1250, stock: 15 }, { size: "Gallon", price: 280, stock: 35 }, { size: "Liter", price: 320, stock: 50 }, { size: "500mL", price: 180, stock: 65 }, { size: "100mL", price: 45, stock: 100 }] },
      { id: "nat-mpds-citrus", name: "Multi-Protect Disinfectant Spray - Citrus", category: "NATUREZYME", sizes: [{ size: "Carboy", price: 1250, stock: 15 }, { size: "Gallon", price: 280, stock: 35 }, { size: "Liter", price: 320, stock: 50 }, { size: "500mL", price: 180, stock: 65 }, { size: "100mL", price: 45, stock: 100 }] },
      { id: "nat-ndc", name: "Natural Disinfectant Concentrate", category: "NATUREZYME", sizes: [{ size: "Drum", price: 4500, stock: 8 }, { size: "Carboy", price: 1200, stock: 20 }, { size: "Gallon", price: 270, stock: 40 }, { size: "Liter", price: 300, stock: 55 }] },
      { id: "nat-ep-pfe", name: "Eliminator Plus (Plant Fiber Extract)", category: "NATUREZYME", sizes: [{ size: "Drum", price: 5000, stock: 6 }, { size: "Carboy", price: 1400, stock: 15 }, { size: "Gallon", price: 320, stock: 30 }, { size: "Liter", price: 350, stock: 45 }] },
      { id: "nat-hs-wild-ginger", name: "Helmet Spray - Wild Ginger", category: "NATUREZYME", sizes: [{ size: "50mL", price: 35, stock: 120 }] },
      { id: "nat-hs-sandalwood", name: "Helmet Spray - Sandalwood", category: "NATUREZYME", sizes: [{ size: "50mL", price: 35, stock: 120 }] },
      { id: "nat-cmos", name: "Citronella Mosquito-Off Spray", category: "NATUREZYME", sizes: [{ size: "Carboy", price: 1100, stock: 18 }, { size: "Gallon", price: 250, stock: 40 }, { size: "Liter", price: 280, stock: 60 }, { size: "250mL", price: 85, stock: 75 }, { size: "50mL", price: 30, stock: 110 }] },
      { id: "nat-cns-cinnamon", name: "Citronella Natural Spray - Cinnamon", category: "NATUREZYME", sizes: [{ size: "Carboy", price: 1150, stock: 16 }, { size: "Gallon", price: 260, stock: 38 }, { size: "Liter", price: 290, stock: 58 }, { size: "250mL", price: 90, stock: 72 }, { size: "50mL", price: 32, stock: 105 }] },
      { id: "nat-cns-lemon-eucalyptus", name: "Citronella Natural Spray - Lemon-Eucalyptus", category: "NATUREZYME", sizes: [{ size: "Carboy", price: 1150, stock: 16 }, { size: "Gallon", price: 260, stock: 38 }, { size: "Liter", price: 290, stock: 58 }, { size: "250mL", price: 90, stock: 72 }, { size: "50mL", price: 32, stock: 105 }] },
      { id: "nat-cns-lavender", name: "Citronella Natural Spray - Lavender", category: "NATUREZYME", sizes: [{ size: "Carboy", price: 1150, stock: 16 }, { size: "Gallon", price: 260, stock: 38 }, { size: "Liter", price: 290, stock: 58 }, { size: "250mL", price: 90, stock: 72 }, { size: "50mL", price: 32, stock: 105 }] },
      { id: "nat-mpc", name: "Multi-Purpose Cleaner", category: "NATUREZYME", sizes: [{ size: "Carboy", price: 1050, stock: 20 }, { size: "Gallon", price: 240, stock: 42 }, { size: "Liter", price: 270, stock: 62 }, { size: "500mL", price: 150, stock: 70 }] },
      { id: "nat-fs", name: "Fogging Solution", category: "NATUREZYME", sizes: [{ size: "Carboy", price: 1300, stock: 12 }, { size: "Gallon", price: 300, stock: 28 }] },
      { id: "pet-ssb-mdc", name: "Soap & Shampoo Bar (Madre de Cacao)", category: "PETZYME", sizes: [{ size: "100g", price: 50, stock: 130 }] },
      { id: "pet-ssb-orig", name: "Soap & Shampoo Bar (Original)", category: "PETZYME", sizes: [{ size: "100g", price: 45, stock: 140 }] },
      { id: "pet-bmsb", name: "Bergamot Medicated Soap Bar", category: "PETZYME", sizes: [{ size: "100g", price: 55, stock: 110 }] },
      { id: "pet-pas-vanilla", name: "Pet Area Spray - Vanilla", category: "PETZYME", sizes: [{ size: "Carboy", price: 1200, stock: 15 }, { size: "Gallon", price: 270, stock: 35 }, { size: "Liter", price: 300, stock: 50 }, { size: "500mL", price: 170, stock: 68 }] },
      { id: "pet-pas-bergamot", name: "Pet Area Spray - Bergamot", category: "PETZYME", sizes: [{ size: "Carboy", price: 1200, stock: 15 }, { size: "Gallon", price: 270, stock: 35 }, { size: "Liter", price: 300, stock: 50 }, { size: "500mL", price: 170, stock: 68 }] },
      { id: "pet-pacs-mdc", name: "Pet Area Cleaning Solution (Madre de Cacao)", category: "PETZYME", sizes: [{ size: "Gallon", price: 260, stock: 40 }] },
      { id: "pet-2in1-sc", name: "2-in-1 Pet Shampoo & Conditioner", category: "PETZYME", sizes: [{ size: "Gallon", price: 290, stock: 32 }, { size: "Liter", price: 320, stock: 48 }, { size: "500mL", price: 180, stock: 65 }] },
      { id: "pet-pbs", name: "Pet Breath Spray", category: "PETZYME", sizes: [{ size: "50mL", price: 40, stock: 95 }] },
      { id: "pet-pc", name: "Pet Cologne", category: "PETZYME", sizes: [{ size: "100mL", price: 90, stock: 85 }] },
      { id: "bio-alcogel", name: "Alcogel (Antibacterial Hand Sanitizer)", category: "BIOZYME", sizes: [{ size: "Gallon", price: 320, stock: 55 }] },
      { id: "bio-lhs-green-apple", name: "Liquid Hand Soap - Green Apple", category: "BIOZYME", sizes: [{ size: "Gallon", price: 240, stock: 48 }, { size: "500mL", price: 140, stock: 72 }] },
      { id: "bio-lhs-lavender", name: "Liquid Hand Soap - Lavender", category: "BIOZYME", sizes: [{ size: "Gallon", price: 240, stock: 48 }, { size: "500mL", price: 140, stock: 72 }] },
      { id: "bio-2in1-bws", name: "2-in-1 Body Wash and Shampoo", category: "BIOZYME", sizes: [{ size: "Gallon", price: 280, stock: 42 }] },
      { id: "bio-hes", name: "Herbal Essence Soap", category: "BIOZYME", sizes: [{ size: "100g", price: 55, stock: 105 }] },
      { id: "bio-ass", name: "Avocado Shea Soap", category: "BIOZYME", sizes: [{ size: "100g", price: 60, stock: 95 }] }
    ];
    await kvSet("inventory_initialized", "true");
    await kvSet("inventory_data", JSON.stringify(inventory));
  }
};

await initializeInventory();

function generateOTP(): string { return Math.floor(1000 + Math.random() * 9000).toString(); }

app.get("/make-server-63cffc09/health", (c) => c.json({ status: "ok" }));

app.get("/make-server-63cffc09/inventory", async (c) => {
  try { const d = await kvGet("inventory_data"); if (!d) return c.json({ error: "Not found" }, 404); return c.json(JSON.parse(d)); }
  catch (e) { return c.json({ error: "Failed" }, 500); }
});

app.get("/make-server-63cffc09/requests/all", async (c) => {
  try { const r = await kvGetByPrefix("request_"); return c.json(r.map(x => JSON.parse(x)).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())); }
  catch (e) { return c.json({ error: "Failed" }, 500); }
});

app.put("/make-server-63cffc09/requests/update", async (c) => {
  try {
    const { requestId, updates } = await c.req.json();
    if (!requestId) return c.json({ error: "Request ID required" }, 400);
    const existing = await kvGet(requestId); if (!existing) return c.json({ error: "Not found" }, 404);
    const oldRequest = JSON.parse(existing); const request = { ...oldRequest }; const changes: string[] = [];
    if (updates.submittedBy !== undefined && updates.submittedBy !== request.submittedBy) { changes.push(`Submitted By updated`); request.submittedBy = updates.submittedBy; }
    if (updates.drNumber !== undefined && updates.drNumber !== request.drNumber) { changes.push(`DR Number updated`); request.drNumber = updates.drNumber; }
    if (updates.clientName !== undefined && updates.clientName !== request.clientName) { changes.push(`Client Name updated`); request.clientName = updates.clientName; }
    if (updates.deliveryAddress !== undefined && updates.deliveryAddress !== request.deliveryAddress) { changes.push(`Delivery Address updated`); request.deliveryAddress = updates.deliveryAddress; }
    if (updates.deliveryDate !== undefined && updates.deliveryDate !== request.deliveryDate) { changes.push(`Delivery Date updated`); request.deliveryDate = updates.deliveryDate; }
    if (updates.notes !== undefined && updates.notes !== request.notes) { changes.push(`Notes updated`); request.notes = updates.notes; }
    if (updates.items !== undefined) { changes.push(`Items modified`); request.items = updates.items; request.totalValue = updates.items.reduce((s, i) => s + i.total, 0); }
    await kvSet(requestId, JSON.stringify(request));
    if (changes.length > 0) sendRequestEditNotificationEmail(oldRequest, request, changes).catch(console.error);
    return c.json({ success: true, request });
  } catch (e) { return c.json({ error: "Failed" }, 500); }
});

app.delete("/make-server-63cffc09/requests/delete", async (c) => {
  try {
    const { requestId } = await c.req.json(); if (!requestId) return c.json({ error: "Required" }, 400);
    const existing = await kvGet(requestId); if (!existing) return c.json({ error: "Not found" }, 404);
    const deleted = JSON.parse(existing); await kvDel(requestId);
    sendRequestDeleteNotificationEmail(deleted).catch(console.error);
    return c.json({ success: true });
  } catch (e) { return c.json({ error: "Failed" }, 500); }
});

app.delete("/make-server-63cffc09/requests/bulkDelete", async (c) => {
  try { const { requestIds } = await c.req.json(); if (!requestIds?.length) return c.json({ error: "Required" }, 400); await kvMdel(requestIds); return c.json({ success: true }); }
  catch (e) { return c.json({ error: "Failed" }, 500); }
});

app.delete("/make-server-63cffc09/requests/deleteAll", async (c) => {
  try { const all = await kvGetByPrefix("request_"); if (!all.length) return c.json({ success: true }); await kvMdel(all.map((x: any) => x.key)); return c.json({ success: true }); }
  catch (e) { return c.json({ error: "Failed" }, 500); }
});

app.get("/make-server-63cffc09/requests", async (c) => {
  try {
    const startDate = c.req.query("startDate"); const endDate = c.req.query("endDate");
    let reqs = (await kvGetByPrefix("request_")).map(r => JSON.parse(r));
    if (startDate || endDate) reqs = reqs.filter(r => { const d = new Date(r.timestamp); if (startDate && d < new Date(startDate)) return false; if (endDate && d > new Date(endDate)) return false; return true; });
    return c.json(reqs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  } catch (e) { return c.json({ error: "Failed" }, 500); }
});

const createRequest = async (body: any) => {
  const { items, submittedBy, drNumber, clientName, deliveryAddress, deliveryDate, notes } = body;
  const requestId = `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const request = { id: requestId, timestamp: new Date().toISOString(), submittedBy: submittedBy || "Anonymous", drNumber: drNumber || "", clientName: clientName || "", deliveryAddress: deliveryAddress || "", deliveryDate: deliveryDate || "", notes: notes || "", items, totalValue: items.reduce((s, i) => s + i.total, 0) };
  await kvSet(requestId, JSON.stringify(request));
  const inv = await kvGet("inventory_data");
  if (inv) { const inventory = JSON.parse(inv); for (const item of items) { const p = inventory.find(x => x.name === item.productName); if (p) { const s = p.sizes.find(x => x.size === item.size); if (s) s.stock = Math.max(0, s.stock - item.quantity); } } await kvSet("inventory_data", JSON.stringify(inventory)); }
  sendRequestNotificationEmail(request).catch(console.error);
  return request;
};

app.post("/make-server-63cffc09/requests", async (c) => {
  try { const body = await c.req.json(); if (!body.items?.length) return c.json({ error: "Items required" }, 400); return c.json({ success: true, request: await createRequest(body) }); }
  catch (e) { return c.json({ error: "Failed" }, 500); }
});

app.post("/make-server-63cffc09/submit-request", async (c) => {
  try { const body = await c.req.json(); if (!body.items?.length) return c.json({ error: "Items required" }, 400); return c.json({ success: true, request: await createRequest(body) }); }
  catch (e) { return c.json({ error: "Failed" }, 500); }
});

app.post("/make-server-63cffc09/requests/add", async (c) => {
  try { const body = await c.req.json(); if (!body.submittedBy || !body.drNumber || !body.clientName || !body.items?.length) return c.json({ error: "Required fields missing" }, 400); return c.json({ success: true, request: await createRequest(body) }); }
  catch (e) { return c.json({ error: "Failed" }, 500); }
});

app.get("/make-server-63cffc09/export", async (c) => {
  try {
    const startDate = c.req.query("startDate");
    let reqs = (await kvGetByPrefix("request_")).map(r => JSON.parse(r));
    if (startDate) { const t = new Date(startDate); reqs = reqs.filter(r => { const d = new Date(r.timestamp); return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate(); }); }
    const exportData = [];
    for (const r of reqs) for (const item of r.items) exportData.push({ timestamp: r.timestamp, submittedBy: r.submittedBy, drNumber: r.drNumber || "", clientName: r.clientName || "", productName: item.productName, category: item.category, size: item.size, quantity: item.quantity, unitPrice: item.unitPrice, totalValue: item.total });
    return c.json(exportData);
  } catch (e) { return c.json({ error: "Failed" }, 500); }
});

app.post("/make-server-63cffc09/admin/reset-inventory", async (c) => {
  try { await kvDel("inventory_initialized"); await initializeInventory(); return c.json({ success: true }); }
  catch (e) { return c.json({ error: "Failed" }, 500); }
});

app.post("/make-server-63cffc09/inventory/update-stock", async (c) => {
  try {
    const { productId, size, newStock } = await c.req.json();
    if (!productId || !size || newStock === undefined) return c.json({ error: "Missing fields" }, 400);
    const inv = await kvGet("inventory_data"); if (!inv) return c.json({ error: "Not found" }, 404);
    const inventory = JSON.parse(inv); const p = inventory.find(x => x.id === productId); if (!p) return c.json({ error: "Not found" }, 404);
    const s = p.sizes.find(x => x.size === size); if (!s) return c.json({ error: "Not found" }, 404);
    s.stock = newStock; await kvSet("inventory_data", JSON.stringify(inventory)); return c.json({ success: true, product: p });
  } catch (e) { return c.json({ error: "Failed" }, 500); }
});

app.post("/make-server-63cffc09/inventory/update-price", async (c) => {
  try {
    const { productId, size, newPrice } = await c.req.json();
    if (!productId || !size || newPrice === undefined) return c.json({ error: "Missing fields" }, 400);
    const inv = await kvGet("inventory_data"); if (!inv) return c.json({ error: "Not found" }, 404);
    const inventory = JSON.parse(inv); const p = inventory.find(x => x.id === productId); if (!p) return c.json({ error: "Not found" }, 404);
    const s = p.sizes.find(x => x.size === size); if (!s) return c.json({ error: "Not found" }, 404);
    s.price = newPrice; await kvSet("inventory_data", JSON.stringify(inventory)); return c.json({ success: true, product: p });
  } catch (e) { return c.json({ error: "Failed" }, 500); }
});

app.post("/make-server-63cffc09/inventory/add-product", async (c) => {
  try {
    const { name, category, sizes } = await c.req.json();
    if (!name || !category || !sizes?.length) return c.json({ error: "Missing fields" }, 400);
    const inv = await kvGet("inventory_data"); if (!inv) return c.json({ error: "Not found" }, 404);
    const inventory = JSON.parse(inv);
    if (inventory.find(p => p.name.toLowerCase() === name.toLowerCase() && p.category === category)) return c.json({ error: "Already exists" }, 400);
    const newProduct = { id: `${category.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`, name: name.trim(), category, sizes: sizes.map(s => ({ size: s.size.trim(), price: parseFloat(s.price), stock: parseInt(s.stock) })) };
    inventory.push(newProduct); await kvSet("inventory_data", JSON.stringify(inventory)); return c.json({ success: true, product: newProduct });
  } catch (e) { return c.json({ error: "Failed" }, 500); }
});

app.post("/make-server-63cffc09/inventory/edit-product", async (c) => {
  try {
    const { productId, name, category, sizes } = await c.req.json();
    if (!productId || !name || !category || !sizes?.length) return c.json({ error: "Missing fields" }, 400);
    const inv = await kvGet("inventory_data"); if (!inv) return c.json({ error: "Not found" }, 404);
    const inventory = JSON.parse(inv); const idx = inventory.findIndex(p => p.id === productId); if (idx === -1) return c.json({ error: "Not found" }, 404);
    if (inventory.find(p => p.id !== productId && p.name.toLowerCase() === name.toLowerCase() && p.category === category)) return c.json({ error: "Already exists" }, 400);
    inventory[idx] = { id: productId, name: name.trim(), category, sizes: sizes.map(s => ({ size: s.size.trim(), price: parseFloat(s.price), stock: parseInt(s.stock) })) };
    await kvSet("inventory_data", JSON.stringify(inventory)); return c.json({ success: true, product: inventory[idx] });
  } catch (e) { return c.json({ error: "Failed" }, 500); }
});

app.post("/make-server-63cffc09/inventory/delete-product", async (c) => {
  try {
    const { productId } = await c.req.json(); if (!productId) return c.json({ error: "Required" }, 400);
    const inv = await kvGet("inventory_data"); if (!inv) return c.json({ error: "Not found" }, 404);
    const inventory = JSON.parse(inv); const idx = inventory.findIndex(p => p.id === productId); if (idx === -1) return c.json({ error: "Not found" }, 404);
    const deleted = inventory.splice(idx, 1)[0]; await kvSet("inventory_data", JSON.stringify(inventory)); return c.json({ success: true, deletedProduct: deleted });
  } catch (e) { return c.json({ error: "Failed" }, 500); }
});

app.post("/make-server-63cffc09/auth/admin/login", async (c) => {
  try {
    const { email, password } = await c.req.json(); if (!email || !password) return c.json({ error: "Required" }, 400);
    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'wonderzymemarketing@infarmco.com';
    const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD') || 'admin12345';
    const override = await kvGet('admin_password_override');
    if (email !== ADMIN_EMAIL || password !== (override || ADMIN_PASSWORD)) return c.json({ error: "Invalid credentials" }, 401);
    const otp = generateOTP(); const sessionId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await kvSet(sessionId, JSON.stringify({ type: 'admin', email, otp, expiry: Date.now() + 600000, verified: false }));
    await sendOTPEmail(email, otp, 'Admin'); return c.json({ success: true, sessionId });
  } catch (e) { return c.json({ error: "Failed" }, 500); }
});

app.post("/make-server-63cffc09/auth/admin/verify-otp", async (c) => {
  try {
    const { sessionId, otp } = await c.req.json(); if (!sessionId || !otp) return c.json({ error: "Required" }, 400);
    const sd = await kvGet(sessionId); if (!sd) return c.json({ error: "Invalid session" }, 401);
    const session = JSON.parse(sd);
    if (Date.now() > session.expiry) { await kvDel(sessionId); return c.json({ error: "Expired" }, 401); }
    if (session.otp !== otp) return c.json({ error: "Invalid OTP" }, 401);
    session.verified = true; await kvSet(sessionId, JSON.stringify(session)); return c.json({ success: true, email: session.email });
  } catch (e) { return c.json({ error: "Failed" }, 500); }
});

app.post("/make-server-63cffc09/auth/admin/forgot-password", async (c) => {
  try {
    const { email } = await c.req.json();
    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'wonderzymemarketing@infarmco.com';
    if (email !== ADMIN_EMAIL) return c.json({ error: "Invalid" }, 401);
    const otp = generateOTP(); const sessionId = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await kvSet(sessionId, JSON.stringify({ type: 'password-reset', email, otp, expiry: Date.now() + 600000, verified: false }));
    await sendOTPEmail(email, otp, 'Admin'); return c.json({ success: true, sessionId });
  } catch (e) { return c.json({ error: "Failed" }, 500); }
});

app.post("/make-server-63cffc09/auth/admin/reset-password", async (c) => {
  try {
    const { sessionId, password } = await c.req.json();
    const sd = await kvGet(sessionId); if (!sd) return c.json({ error: "Invalid" }, 401);
    const session = JSON.parse(sd);
    if (session.type !== 'password-reset' || !session.verified || Date.now() > session.expiry) return c.json({ error: "Invalid" }, 401);
    await kvSet('admin_password_override', password); await kvDel(sessionId); return c.json({ success: true });
  } catch (e) { return c.json({ error: "Failed" }, 500); }
});

app.post("/make-server-63cffc09/auth/user/request-otp", async (c) => {
  try {
    const { name, email } = await c.req.json(); if (!name || !email) return c.json({ error: "Required" }, 400);
    const otp = generateOTP(); const sessionId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await kvSet(sessionId, JSON.stringify({ type: 'user', name, email, otp, expiry: Date.now() + 600000, verified: false }));
    await sendOTPEmail(email, otp, name); return c.json({ success: true, sessionId });
  } catch (e) { return c.json({ error: "Failed" }, 500); }
});

app.post("/make-server-63cffc09/auth/user/verify-otp", async (c) => {
  try {
    const { sessionId, otp } = await c.req.json();
    const sd = await kvGet(sessionId); if (!sd) return c.json({ error: "Invalid" }, 401);
    const session = JSON.parse(sd);
    if (Date.now() > session.expiry) { await kvDel(sessionId); return c.json({ error: "Expired" }, 401); }
    if (session.otp !== otp) return c.json({ error: "Invalid OTP" }, 401);
    session.verified = true; await kvSet(sessionId, JSON.stringify(session)); return c.json({ success: true, name: session.name, email: session.email });
  } catch (e) { return c.json({ error: "Failed" }, 500); }
});

Deno.serve(app.fetch);
