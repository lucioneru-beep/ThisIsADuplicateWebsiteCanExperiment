import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import { sendRequestEditNotificationEmail, sendRequestDeleteNotificationEmail } from './email_helpers.tsx';

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize inventory data (this will run once on server start)
const initializeInventory = async () => {
  const inventoryExists = await kv.get("inventory_initialized");
  if (!inventoryExists) {
    const inventory = [
      // SMART HOME Products
      { id: "sh-sp-std", name: "Smart Plug (Standard)", category: "SMART HOME", sizes: [{ size: "Single", price: 350, stock: 80 }, { size: "4-Pack", price: 1200, stock: 40 }] },
      { id: "sh-led-1m", name: "LED Strip Light", category: "SMART HOME", sizes: [{ size: "1m", price: 250, stock: 100 }, { size: "3m", price: 650, stock: 60 }, { size: "5m", price: 980, stock: 40 }] },
      { id: "sh-bulb", name: "Smart Bulb", category: "SMART HOME", sizes: [{ size: "Single", price: 320, stock: 90 }, { size: "3-Pack", price: 880, stock: 45 }] },
      { id: "sh-motion", name: "Motion Sensor", category: "SMART HOME", sizes: [{ size: "Standard", price: 480, stock: 55 }, { size: "Pro", price: 750, stock: 30 }] },
      { id: "sh-doorbell", name: "Smart Doorbell", category: "SMART HOME", sizes: [{ size: "Standard", price: 1850, stock: 25 }] },
      { id: "sh-wifi-ext", name: "WiFi Extender", category: "SMART HOME", sizes: [{ size: "Standard", price: 1200, stock: 35 }, { size: "Pro (Mesh)", price: 2500, stock: 20 }] },
      { id: "sh-cam-indoor", name: "Smart Indoor Camera", category: "SMART HOME", sizes: [{ size: "1080p", price: 1500, stock: 30 }, { size: "4K", price: 2800, stock: 15 }] },
      { id: "sh-hub", name: "Smart Home Hub", category: "SMART HOME", sizes: [{ size: "Standard", price: 2200, stock: 20 }] },
      // AUDIO Products
      { id: "au-tws-std", name: "TWS Earbuds", category: "AUDIO", sizes: [{ size: "Standard", price: 890, stock: 60 }, { size: "Pro (ANC)", price: 1950, stock: 35 }] },
      { id: "au-bt-spk", name: "Bluetooth Speaker", category: "AUDIO", sizes: [{ size: "Mini", price: 750, stock: 55 }, { size: "Standard", price: 1400, stock: 40 }, { size: "XL", price: 2800, stock: 20 }] },
      { id: "au-hp-wired", name: "Wired Headphones", category: "AUDIO", sizes: [{ size: "Standard", price: 680, stock: 50 }, { size: "Noise Cancelling", price: 1800, stock: 25 }] },
      { id: "au-gaming-hs", name: "Gaming Headset", category: "AUDIO", sizes: [{ size: "Wired", price: 1200, stock: 35 }, { size: "Wireless", price: 2200, stock: 20 }] },
      { id: "au-soundbar", name: "Portable Soundbar", category: "AUDIO", sizes: [{ size: "2.0", price: 3200, stock: 15 }, { size: "2.1 (with Sub)", price: 5500, stock: 10 }] },
      { id: "au-earphones", name: "Wired Earphones", category: "AUDIO", sizes: [{ size: "Standard", price: 350, stock: 80 }, { size: "Hi-Fi", price: 980, stock: 40 }] },
      // PERIPHERALS Products
      { id: "per-mouse-wl", name: "Wireless Mouse", category: "PERIPHERALS", sizes: [{ size: "Standard", price: 580, stock: 65 }, { size: "Ergonomic", price: 1200, stock: 35 }] },
      { id: "per-kb-mech", name: "Mechanical Keyboard", category: "PERIPHERALS", sizes: [{ size: "TKL", price: 1800, stock: 30 }, { size: "Full Size", price: 2400, stock: 20 }] },
      { id: "per-usb-hub", name: "USB Hub", category: "PERIPHERALS", sizes: [{ size: "4-Port USB-A", price: 450, stock: 70 }, { size: "7-Port USB-A", price: 780, stock: 45 }, { size: "USB-C Hub (7-in-1)", price: 1200, stock: 35 }] },
      { id: "per-wl-charger", name: "Wireless Charger", category: "PERIPHERALS", sizes: [{ size: "Standard 10W", price: 520, stock: 60 }, { size: "Fast 15W", price: 850, stock: 40 }] },
      { id: "per-laptop-stand", name: "Laptop Stand", category: "PERIPHERALS", sizes: [{ size: "Fixed", price: 680, stock: 45 }, { size: "Adjustable", price: 1100, stock: 30 }] },
      { id: "per-webcam", name: "Webcam", category: "PERIPHERALS", sizes: [{ size: "1080p", price: 1200, stock: 35 }, { size: "4K", price: 2800, stock: 15 }] },
      { id: "per-mousepad", name: "Mouse Pad", category: "PERIPHERALS", sizes: [{ size: "Medium (30x25cm)", price: 180, stock: 90 }, { size: "XL (90x40cm)", price: 480, stock: 50 }] }
    ];
    
    await kv.set("inventory_initialized", "true");
    await kv.set("inventory_data", JSON.stringify(inventory));
    console.log("Inventory data initialized with complete product catalog");
  }
};

// Initialize on startup
await initializeInventory();

// Health check endpoint
app.get("/make-server-63cffc09/health", (c) => {
  return c.json({ status: "ok" });
});

// Get inventory data
app.get("/make-server-63cffc09/inventory", async (c) => {
  try {
    const inventoryData = await kv.get("inventory_data");
    if (!inventoryData) {
      return c.json({ error: "Inventory not found" }, 404);
    }
    return c.json(JSON.parse(inventoryData));
  } catch (error) {
    console.log("Error fetching inventory:", error);
    return c.json({ error: "Failed to fetch inventory" }, 500);
  }
});

// Get all requests (for database management)
app.get("/make-server-63cffc09/requests/all", async (c) => {
  try {
    const requests = await kv.getByPrefix("request_");
    const allRequests = requests.map(r => JSON.parse(r));
    
    // Sort by timestamp (newest first)
    allRequests.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return c.json(allRequests);
  } catch (error) {
    console.log("Error fetching all requests:", error);
    return c.json({ error: "Failed to fetch all requests" }, 500);
  }
});

// Update a request
app.put("/make-server-63cffc09/requests/update", async (c) => {
  try {
    const body = await c.req.json();
    const { requestId, updates } = body;
    
    if (!requestId) {
      return c.json({ error: "Request ID is required" }, 400);
    }
    
    // Get existing request
    const existingData = await kv.get(requestId);
    if (!existingData) {
      return c.json({ error: "Request not found" }, 404);
    }
    
    const oldRequest = JSON.parse(existingData);
    const request = { ...oldRequest };
    
    // Track changes
    const changes: string[] = [];
    
    // Update allowed fields and track changes
    if (updates.submittedBy !== undefined && updates.submittedBy !== request.submittedBy) {
      changes.push(`Submitted By: "${request.submittedBy}" → "${updates.submittedBy}"`);
      request.submittedBy = updates.submittedBy;
    }
    if (updates.drNumber !== undefined && updates.drNumber !== request.drNumber) {
      changes.push(`DR Number: "${request.drNumber || 'N/A'}" → "${updates.drNumber}"`);
      request.drNumber = updates.drNumber;
    }
    if (updates.clientName !== undefined && updates.clientName !== request.clientName) {
      changes.push(`Client Name: "${request.clientName}" → "${updates.clientName}"`);
      request.clientName = updates.clientName;
    }
    if (updates.deliveryAddress !== undefined && updates.deliveryAddress !== request.deliveryAddress) {
      changes.push(`Delivery Address: "${request.deliveryAddress || 'N/A'}" → "${updates.deliveryAddress}"`);
      request.deliveryAddress = updates.deliveryAddress;
    }
    if (updates.deliveryDate !== undefined && updates.deliveryDate !== request.deliveryDate) {
      changes.push(`Delivery Date: "${request.deliveryDate || 'N/A'}" → "${updates.deliveryDate}"`);
      request.deliveryDate = updates.deliveryDate;
    }
    if (updates.notes !== undefined && updates.notes !== request.notes) {
      changes.push(`Notes updated`);
      request.notes = updates.notes;
    }
    if (updates.items !== undefined) {
      const oldItemCount = request.items.length;
      const newItemCount = updates.items.length;
      if (oldItemCount !== newItemCount) {
        changes.push(`Items changed: ${oldItemCount} items → ${newItemCount} items`);
      } else {
        changes.push(`Items modified`);
      }
      request.items = updates.items;
      // Recalculate total value
      request.totalValue = updates.items.reduce((sum, item) => sum + item.total, 0);
    }
    
    // Save updated request
    await kv.set(requestId, JSON.stringify(request));
    
    // Send email notification if there were changes (don't block response)
    if (changes.length > 0) {
      sendRequestEditNotificationEmail(oldRequest, request, changes).catch(err => {
        console.error('Failed to send edit notification email, but request was updated:', err);
      });
    }
    
    return c.json({ success: true, request });
  } catch (error) {
    console.log("Error updating request:", error);
    return c.json({ error: "Failed to update request" }, 500);
  }
});

// Delete a request
app.delete("/make-server-63cffc09/requests/delete", async (c) => {
  try {
    const body = await c.req.json();
    const { requestId } = body;
    
    if (!requestId) {
      return c.json({ error: "Request ID is required" }, 400);
    }
    
    // Check if request exists
    const existingData = await kv.get(requestId);
    if (!existingData) {
      return c.json({ error: "Request not found" }, 404);
    }
    
    const deletedRequest = JSON.parse(existingData);
    
    // Delete the request
    await kv.del(requestId);
    
    // Send email notification (don't block response)
    sendRequestDeleteNotificationEmail(deletedRequest).catch(err => {
      console.error('Failed to send deletion notification email, but request was deleted:', err);
    });
    
    return c.json({ success: true, message: "Request deleted successfully" });
  } catch (error) {
    console.log("Error deleting request:", error);
    return c.json({ error: "Failed to delete request" }, 500);
  }
});

// Bulk delete requests
app.delete("/make-server-63cffc09/requests/bulkDelete", async (c) => {
  try {
    const body = await c.req.json();
    const { requestIds } = body;
    
    if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
      return c.json({ error: "Request IDs array is required" }, 400);
    }
    
    // Delete all requests
    await kv.mdel(requestIds);
    
    return c.json({ success: true, message: `Deleted ${requestIds.length} requests successfully` });
  } catch (error) {
    console.log("Error bulk deleting requests:", error);
    return c.json({ error: "Failed to bulk delete requests" }, 500);
  }
});

// Delete ALL requests (dangerous operation!)
app.delete("/make-server-63cffc09/requests/deleteAll", async (c) => {
  try {
    // Get all requests
    const allData = await kv.getByPrefix("request_");
    
    if (allData.length === 0) {
      return c.json({ success: true, message: "No requests to delete" });
    }
    
    // Extract all request IDs
    const requestIds = allData.map(item => item.key);
    
    // Delete all requests
    await kv.mdel(requestIds);
    
    return c.json({ 
      success: true, 
      message: `Deleted all ${requestIds.length} requests successfully` 
    });
  } catch (error) {
    console.log("Error deleting all requests:", error);
    return c.json({ error: "Failed to delete all requests" }, 500);
  }
});

// Manually add a request (admin feature)
app.post("/make-server-63cffc09/requests/add", async (c) => {
  try {
    const body = await c.req.json();
    const { submittedBy, drNumber, clientName, deliveryAddress, deliveryDate, notes, items } = body;

    if (!submittedBy || !drNumber || !clientName) {
      return c.json({ error: "submittedBy, drNumber, and clientName are required" }, 400);
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return c.json({ error: "Items array is required and must not be empty" }, 400);
    }

    // Create request object
    const timestamp = new Date().toISOString();
    const requestId = `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const request = {
      id: requestId,
      timestamp,
      submittedBy,
      drNumber,
      clientName,
      deliveryAddress: deliveryAddress || '',
      deliveryDate: deliveryDate || '',
      notes: notes || '',
      items,
      totalValue: items.reduce((sum, item) => sum + item.total, 0)
    };
    
    // Save to KV store
    await kv.set(requestId, JSON.stringify(request));
    
    // Send email notification (don't block the response if email fails)
    sendRequestNotificationEmail(request).catch(err => {
      console.error('Failed to send notification email, but request was saved:', err);
    });
    
    return c.json({ success: true, request });
  } catch (error) {
    console.log("Error manually adding request:", error);
    return c.json({ error: "Failed to add request" }, 500);
  }
});

// Get requests with optional date filter
app.get("/make-server-63cffc09/requests", async (c) => {
  try {
    const startDate = c.req.query("startDate");
    const endDate = c.req.query("endDate");
    
    // Get all requests from KV store
    const requests = await kv.getByPrefix("request_");
    
    let filteredRequests = requests.map(r => JSON.parse(r));
    
    // Filter by date if provided
    if (startDate || endDate) {
      filteredRequests = filteredRequests.filter(request => {
        const requestDate = new Date(request.timestamp);
        if (startDate && requestDate < new Date(startDate)) return false;
        if (endDate && requestDate > new Date(endDate)) return false;
        return true;
      });
    }
    
    // Sort by timestamp (newest first)
    filteredRequests.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return c.json(filteredRequests);
  } catch (error) {
    console.log("Error fetching requests:", error);
    return c.json({ error: "Failed to fetch requests" }, 500);
  }
});

// Create a new purchase order
app.post("/make-server-63cffc09/requests", async (c) => {
  try {
    const body = await c.req.json();
    const { items, submittedBy, drNumber, clientName, deliveryAddress, deliveryDate, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return c.json({ error: "Items array is required" }, 400);
    }

    // Create request object
    const timestamp = new Date().toISOString();
    const requestId = `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const request = {
      id: requestId,
      timestamp,
      submittedBy: submittedBy || "Anonymous",
      drNumber: drNumber || "",
      clientName: clientName || "",
      deliveryAddress: deliveryAddress || "",
      deliveryDate: deliveryDate || "",
      notes: notes || "",
      items,
      totalValue: items.reduce((sum, item) => sum + item.total, 0)
    };
    
    // Save to KV store
    await kv.set(requestId, JSON.stringify(request));
    
    // Update inventory stock levels
    const inventoryData = await kv.get("inventory_data");
    if (inventoryData) {
      const inventory = JSON.parse(inventoryData);
      
      // Deduct stock for each requested item
      for (const item of items) {
        const product = inventory.find(p => p.name === item.productName);
        if (product) {
          const sizeInfo = product.sizes.find(s => s.size === item.size);
          if (sizeInfo) {
            sizeInfo.stock = Math.max(0, sizeInfo.stock - item.quantity);
          }
        }
      }
      
      await kv.set("inventory_data", JSON.stringify(inventory));
    }
    
    // Send email notification (don't block the response if email fails)
    sendRequestNotificationEmail(request).catch(err => {
      console.error('Failed to send notification email, but request was saved:', err);
    });
    
    return c.json({ success: true, request });
  } catch (error) {
    console.log("Error creating request:", error);
    return c.json({ error: "Failed to create request" }, 500);
  }
});

// Client submission endpoint (same as /requests but with explicit name)
app.post("/make-server-63cffc09/submit-request", async (c) => {
  try {
    const body = await c.req.json();
    const { items, submittedBy, drNumber, clientName, deliveryAddress, deliveryDate, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return c.json({ error: "Items array is required" }, 400);
    }

    // Create request object
    const timestamp = new Date().toISOString();
    const requestId = `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const request = {
      id: requestId,
      timestamp,
      submittedBy: submittedBy || "Anonymous",
      drNumber: drNumber || "",
      clientName: clientName || "",
      deliveryAddress: deliveryAddress || "",
      deliveryDate: deliveryDate || "",
      notes: notes || "",
      items,
      totalValue: items.reduce((sum, item) => sum + item.total, 0)
    };
    
    // Save to KV store
    await kv.set(requestId, JSON.stringify(request));
    
    // Update inventory stock levels
    const inventoryData = await kv.get("inventory_data");
    if (inventoryData) {
      const inventory = JSON.parse(inventoryData);
      
      // Deduct stock for each requested item
      for (const item of items) {
        const product = inventory.find(p => p.name === item.productName);
        if (product) {
          const sizeInfo = product.sizes.find(s => s.size === item.size);
          if (sizeInfo) {
            sizeInfo.stock = Math.max(0, sizeInfo.stock - item.quantity);
          }
        }
      }
      
      await kv.set("inventory_data", JSON.stringify(inventory));
    }
    
    // Send email notification (don't block the response if email fails)
    sendRequestNotificationEmail(request).catch(err => {
      console.error('Failed to send notification email, but request was saved:', err);
    });
    
    return c.json({ success: true, request });
  } catch (error) {
    console.log("Error creating request:", error);
    return c.json({ error: "Failed to create request" }, 500);
  }
});

// Export requests as JSON (can be converted to Excel on frontend)
app.get("/make-server-63cffc09/export", async (c) => {
  try {
    const startDate = c.req.query("startDate");
    
    const requests = await kv.getByPrefix("request_");
    let filteredRequests = requests.map(r => JSON.parse(r));
    
    // Filter by EXACT date if provided (only that specific day, not onwards)
    if (startDate) {
      const targetDate = new Date(startDate);
      const targetYear = targetDate.getFullYear();
      const targetMonth = targetDate.getMonth();
      const targetDay = targetDate.getDate();
      
      filteredRequests = filteredRequests.filter(request => {
        const requestDate = new Date(request.timestamp);
        return (
          requestDate.getFullYear() === targetYear &&
          requestDate.getMonth() === targetMonth &&
          requestDate.getDate() === targetDay
        );
      });
    }
    
    // Flatten requests for Excel export
    const exportData = [];
    for (const request of filteredRequests) {
      for (const item of request.items) {
        exportData.push({
          timestamp: request.timestamp,
          submittedBy: request.submittedBy,
          drNumber: request.drNumber || "",
          clientName: request.clientName || "",
          productName: item.productName,
          category: item.category,
          size: item.size,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalValue: item.total
        });
      }
    }
    
    return c.json(exportData);
  } catch (error) {
    console.log("Error exporting requests:", error);
    return c.json({ error: "Failed to export requests" }, 500);
  }
});

// Admin endpoint to reset inventory to initial values
app.post("/make-server-63cffc09/admin/reset-inventory", async (c) => {
  try {
    await kv.del("inventory_initialized");
    await initializeInventory();
    return c.json({ success: true, message: "Inventory reset successfully" });
  } catch (error) {
    console.log("Error resetting inventory:", error);
    return c.json({ error: "Failed to reset inventory" }, 500);
  }
});

// Update stock for a product
app.post("/make-server-63cffc09/inventory/update-stock", async (c) => {
  try {
    const body = await c.req.json();
    const { productId, size, newStock } = body;
    
    if (!productId || !size || newStock === undefined) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    const inventoryData = await kv.get("inventory_data");
    if (!inventoryData) {
      return c.json({ error: "Inventory data not found" }, 404);
    }
    
    const inventory = JSON.parse(inventoryData);
    const product = inventory.find(p => p.id === productId);
    
    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }
    
    const sizeInfo = product.sizes.find(s => s.size === size);
    if (!sizeInfo) {
      return c.json({ error: "Size not found" }, 404);
    }
    
    sizeInfo.stock = newStock;
    await kv.set("inventory_data", JSON.stringify(inventory));
    
    return c.json({ success: true, product });
  } catch (error) {
    console.log("Error updating stock:", error);
    return c.json({ error: "Failed to update stock" }, 500);
  }
});

// Update price for a product
app.post("/make-server-63cffc09/inventory/update-price", async (c) => {
  try {
    const body = await c.req.json();
    const { productId, size, newPrice } = body;
    
    if (!productId || !size || newPrice === undefined) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    const inventoryData = await kv.get("inventory_data");
    if (!inventoryData) {
      return c.json({ error: "Inventory data not found" }, 404);
    }
    
    const inventory = JSON.parse(inventoryData);
    const product = inventory.find(p => p.id === productId);
    
    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }
    
    const sizeInfo = product.sizes.find(s => s.size === size);
    if (!sizeInfo) {
      return c.json({ error: "Size not found" }, 404);
    }
    
    sizeInfo.price = newPrice;
    await kv.set("inventory_data", JSON.stringify(inventory));
    
    return c.json({ success: true, product });
  } catch (error) {
    console.log("Error updating price:", error);
    return c.json({ error: "Failed to update price" }, 500);
  }
});

// Add a new product to inventory
app.post("/make-server-63cffc09/inventory/add-product", async (c) => {
  try {
    const body = await c.req.json();
    const { name, category, sizes } = body;
    
    // Validation
    if (!name || !category || !sizes || !Array.isArray(sizes) || sizes.length === 0) {
      return c.json({ error: "Missing required fields: name, category, and sizes array" }, 400);
    }
    
    // Validate each size entry
    for (const size of sizes) {
      if (!size.size || size.price === undefined || size.stock === undefined) {
        return c.json({ error: "Each size must have size, price, and stock fields" }, 400);
      }
      if (typeof size.price !== 'number' || size.price < 0) {
        return c.json({ error: "Price must be a non-negative number" }, 400);
      }
      if (typeof size.stock !== 'number' || size.stock < 0 || !Number.isInteger(size.stock)) {
        return c.json({ error: "Stock must be a non-negative integer" }, 400);
      }
    }
    
    // Validate category (allow any non-empty string for custom categories)
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return c.json({ error: "Category must be a non-empty string" }, 400);
    }
    
    // Get current inventory
    const inventoryData = await kv.get("inventory_data");
    if (!inventoryData) {
      return c.json({ error: "Inventory data not found" }, 404);
    }
    
    const inventory = JSON.parse(inventoryData);
    
    // Generate a unique ID for the new product
    const productId = `${category.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    // Check if product with same name and category already exists
    const existingProduct = inventory.find(p => 
      p.name.toLowerCase() === name.toLowerCase() && 
      p.category === category
    );
    
    if (existingProduct) {
      return c.json({ error: "A product with this name already exists in this category" }, 400);
    }
    
    // Create new product
    const newProduct = {
      id: productId,
      name: name.trim(),
      category,
      sizes: sizes.map(size => ({
        size: size.size.trim(),
        price: parseFloat(size.price),
        stock: parseInt(size.stock)
      }))
    };
    
    // Add to inventory
    inventory.push(newProduct);
    
    // Save updated inventory
    await kv.set("inventory_data", JSON.stringify(inventory));
    
    console.log(`New product added: ${name} in ${category} category`);
    
    return c.json({ success: true, product: newProduct });
  } catch (error) {
    console.log("Error adding new product:", error);
    return c.json({ error: "Failed to add new product" }, 500);
  }
});

// Edit/Update an existing product
app.post("/make-server-63cffc09/inventory/edit-product", async (c) => {
  try {
    const body = await c.req.json();
    const { productId, name, category, sizes } = body;
    
    // Validation
    if (!productId) {
      return c.json({ error: "Product ID is required" }, 400);
    }
    
    if (!name || !category || !sizes || !Array.isArray(sizes) || sizes.length === 0) {
      return c.json({ error: "Missing required fields: name, category, and sizes array" }, 400);
    }
    
    // Validate each size entry
    for (const size of sizes) {
      if (!size.size || size.price === undefined || size.stock === undefined) {
        return c.json({ error: "Each size must have size, price, and stock fields" }, 400);
      }
      if (typeof size.price !== 'number' || size.price < 0) {
        return c.json({ error: "Price must be a non-negative number" }, 400);
      }
      if (typeof size.stock !== 'number' || size.stock < 0 || !Number.isInteger(size.stock)) {
        return c.json({ error: "Stock must be a non-negative integer" }, 400);
      }
    }
    
    // Validate category (allow any non-empty string for custom categories)
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return c.json({ error: "Category must be a non-empty string" }, 400);
    }
    
    // Get current inventory
    const inventoryData = await kv.get("inventory_data");
    if (!inventoryData) {
      return c.json({ error: "Inventory data not found" }, 404);
    }
    
    const inventory = JSON.parse(inventoryData);
    const productIndex = inventory.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return c.json({ error: "Product not found" }, 404);
    }
    
    // Check if another product with same name and category exists (excluding current product)
    const duplicateProduct = inventory.find(p => 
      p.id !== productId &&
      p.name.toLowerCase() === name.toLowerCase() && 
      p.category === category
    );
    
    if (duplicateProduct) {
      return c.json({ error: "A product with this name already exists in this category" }, 400);
    }
    
    // Update product
    inventory[productIndex] = {
      id: productId,
      name: name.trim(),
      category,
      sizes: sizes.map(size => ({
        size: size.size.trim(),
        price: parseFloat(size.price),
        stock: parseInt(size.stock)
      }))
    };
    
    // Save updated inventory
    await kv.set("inventory_data", JSON.stringify(inventory));
    
    console.log(`Product updated: ${name} (ID: ${productId})`);
    
    return c.json({ success: true, product: inventory[productIndex] });
  } catch (error) {
    console.log("Error editing product:", error);
    return c.json({ error: "Failed to edit product" }, 500);
  }
});

// Delete a product from inventory
app.post("/make-server-63cffc09/inventory/delete-product", async (c) => {
  try {
    const body = await c.req.json();
    const { productId } = body;
    
    if (!productId) {
      return c.json({ error: "Product ID is required" }, 400);
    }
    
    // Get current inventory
    const inventoryData = await kv.get("inventory_data");
    if (!inventoryData) {
      return c.json({ error: "Inventory data not found" }, 404);
    }
    
    const inventory = JSON.parse(inventoryData);
    const productIndex = inventory.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return c.json({ error: "Product not found" }, 404);
    }
    
    const deletedProduct = inventory[productIndex];
    
    // Remove product from inventory
    inventory.splice(productIndex, 1);
    
    // Save updated inventory
    await kv.set("inventory_data", JSON.stringify(inventory));
    
    console.log(`Product deleted: ${deletedProduct.name} (ID: ${productId})`);
    
    return c.json({ success: true, deletedProduct });
  } catch (error) {
    console.log("Error deleting product:", error);
    return c.json({ error: "Failed to delete product" }, 500);
  }
});

// Helper function to generate 4-digit OTP
function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Helper function to send email via Resend
async function sendOTPEmail(email: string, otp: string, name?: string): Promise<boolean> {
  try {
    let resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    // Always log OTP to console for testing/debugging
    console.log(`\n========== OTP EMAIL ==========`);
    console.log(`To: ${email}`);
    console.log(`Name: ${name || 'User'}`);
    console.log(`OTP Code: ${otp}`);
    
    // Debug: Log API key status (DO NOT log the actual key for security)
    if (resendApiKey) {
      // Trim whitespace
      resendApiKey = resendApiKey.trim();
      
      console.log(`API Key Status: Found`);
      console.log(`API Key Length: ${resendApiKey.length} characters`);
      console.log(`API Key Prefix: ${resendApiKey.substring(0, 8)}...`);
      console.log(`API Key Format Valid: ${resendApiKey.startsWith('re_')}`);
      
      // Check for common issues
      if (resendApiKey.includes(' ')) {
        console.log(`⚠️  WARNING: API key contains spaces!`);
      }
      if (resendApiKey.includes('\n') || resendApiKey.includes('\r')) {
        console.log(`⚠️  WARNING: API key contains newline characters!`);
      }
    } else {
      console.log(`API Key Status: NOT FOUND in environment variables`);
    }
    console.log(`===============================\n`);
    
    if (!resendApiKey || resendApiKey.trim() === '') {
      console.log('⚠️  RESEND_API_KEY not configured - Using console logging only');
      console.log('📝 To enable email sending:');
      console.log('   1. Verify API key at https://resend.com/api-keys');
      console.log('   2. Copy the FULL key: re_fyjnLmJQ_G7D5H1sCMBae18CW76vDomnY');
      console.log('   3. Add to Supabase: Settings → Edge Functions → Manage secrets');
      console.log('   4. Name: RESEND_API_KEY');
      console.log('   5. Click "Deploy" on the Edge Function after saving\n');
      return true; // Return true so auth continues to work
    }

    console.log(`📧 Attempting to send OTP email to ${email}...`);

    // Get domain from environment or use test domain
    const emailDomain = Deno.env.get('EMAIL_DOMAIN') || 'onboarding@resend.dev';
    const fromAddress = emailDomain.includes('@') 
      ? `NexaBox <${emailDomain}>`
      : `NexaBox <noreply@${emailDomain}>`;

    const emailBody = {
      from: fromAddress,
      to: email,
      subject: 'Your NexaBox Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #1a1a1a; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background-color: #2d2d2d; border-radius: 12px; padding: 40px; border: 1px solid #404040; }
              .logo { text-align: center; margin-bottom: 30px; }
              .logo-text { color: #2d8659; font-size: 32px; font-weight: bold; margin: 0; }
              h1 { color: #ffffff; font-size: 24px; margin: 0 0 10px 0; }
              p { color: #b0b0b0; line-height: 1.6; margin: 0 0 20px 0; }
              .otp-box { background-color: #1a1a1a; border: 2px solid #2d8659; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }
              .otp-code { font-size: 48px; font-weight: bold; color: #2d8659; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace; }
              .otp-label { color: #808080; font-size: 14px; margin-top: 10px; }
              .warning { background-color: #3a2a1a; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .warning p { color: #ffb74d; margin: 0; font-size: 14px; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #404040; }
              .footer p { color: #808080; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">
                <p class="logo-text">⚡ NexaBox</p>
              </div>
              
              <h1>Hi ${name || 'there'}! 👋</h1>
              <p>We received a login request for the NexaBox Electronics Distribution System. Use the verification code below to complete your authentication:</p>
              
              <div class="otp-box">
                <p class="otp-code">${otp}</p>
                <p class="otp-label">Your 4-Digit Verification Code</p>
              </div>
              
              <div class="warning">
                <p>⏱️ This code will expire in 10 minutes</p>
              </div>
              
              <p>If you didn't request this code, please ignore this email. Your account security is important to us.</p>
              
              <div class="footer">
                <p>© 2026 NexaBox. All rights reserved.</p>
                <p>Electronics Distribution System</p>
                <p style="font-size: 11px; color: #666; margin-top: 8px;">Developed by Dale Catibog</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`❌ Failed to send email via Resend:`, errorData);
      console.log('⚠️  Email sending failed, but OTP is logged above');
      
      // Check if using test domain
      if (emailBody.from.includes('onboarding@resend.dev')) {
        console.log('');
        console.log('🚨 IMPORTANT: Test Domain Restrictions');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('You are using Resend\'s test domain: onboarding@resend.dev');
        console.log('');
        console.log('This domain can ONLY send to:');
        console.log('  ✓ The email you signed up with on Resend');
        console.log('  ✓ Emails verified in your Resend account settings');
        console.log('');
        console.log('To send to ANY email address, you must:');
        console.log('  1. Add your own domain at https://resend.com/domains');
        console.log('  2. Add DNS records (SPF, DKIM, DMARC)');
        console.log('  3. Wait 5-10 minutes for verification');
        console.log('  4. Update the code to use your domain:');
        console.log('     from: "NexaBox <noreply@yourdomain.com>"');
        console.log('');
        console.log('OR for testing, add each email at:');
        console.log('  https://resend.com/settings/emails');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
      }
      
      console.log('📝 Other common issues:');
      console.log('   - Invalid API key (get a new one from resend.com/api-keys)');
      console.log('   - API key not properly saved in environment variables');
      console.log('   - Rate limit exceeded (check your Resend dashboard)\n');
      
      // Return true so authentication can continue with console OTP
      return true;
    }

    const result = await response.json();
    console.log(`✅ Email sent successfully! Email ID: ${result.id}\n`);
    
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.log('⚠️  Email sending failed, but OTP is logged above');
    console.log('💡 Use the OTP from the console logs to complete authentication\n');
    
    // Return true so authentication can continue
    return true;
  }
}

// Helper function to send sample request notification email
async function sendRequestNotificationEmail(request: any): Promise<boolean> {
  try {
    let resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    // Always log request notification to console
    console.log(`\n========== SAMPLE REQUEST NOTIFICATION ==========`);
    console.log(`Request ID: ${request.id}`);
    console.log(`Submitted By: ${request.submittedBy}`);
    console.log(`Client: ${request.clientName}`);
    console.log(`Total Items: ${request.items.length}`);
    console.log(`Total Value: ₱${request.totalValue.toFixed(2)}`);
    console.log(`================================================\n`);
    
    if (!resendApiKey || resendApiKey.trim() === '') {
      console.log('⚠️  RESEND_API_KEY not configured - Notification logged to console only');
      console.log('📝 Set RESEND_API_KEY in Supabase Edge Functions settings to enable emails');
      return true;
    }

    resendApiKey = resendApiKey.trim();
    
    // Debug API key status
    console.log(`API Key Status: Found`);
    console.log(`API Key Length: ${resendApiKey.length} characters`);
    console.log(`API Key Prefix: ${resendApiKey.substring(0, 8)}...`);
    console.log(`API Key Format Valid: ${resendApiKey.startsWith('re_')}`);
    
    const notificationEmail = 'admin@nexabox.tech';
    
    // Get domain from environment or use test domain
    const emailDomain = Deno.env.get('EMAIL_DOMAIN') || 'onboarding@resend.dev';
    const fromAddress = emailDomain.includes('@') 
      ? `NexaBox Notifications <${emailDomain}>`
      : `NexaBox Notifications <noreply@${emailDomain}>`;

    // Format timestamp
    const timestamp = new Date(request.timestamp);
    const formattedDate = timestamp.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const formattedTime = timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Build items table HTML
    let itemsTableHtml = '';
    for (const item of request.items) {
      itemsTableHtml += `
        <tr style="border-bottom: 1px solid #404040;">
          <td style="padding: 12px 8px; color: #ffffff;">${item.productName}</td>
          <td style="padding: 12px 8px; color: #b0b0b0;">${item.category}</td>
          <td style="padding: 12px 8px; color: #b0b0b0;">${item.size}</td>
          <td style="padding: 12px 8px; color: #ffffff; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px 8px; color: #b0b0b0; text-align: right;">₱${item.unitPrice.toFixed(2)}</td>
          <td style="padding: 12px 8px; color: #2d8659; font-weight: bold; text-align: right;">₱${item.total.toFixed(2)}</td>
        </tr>
      `;
    }

    const emailBody = {
      from: fromAddress,
      to: notificationEmail,
      subject: `🔔 New Sample Request from ${request.clientName || request.submittedBy}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #1a1a1a; margin: 0; padding: 20px; }
              .container { max-width: 800px; margin: 0 auto; background-color: #2d2d2d; border-radius: 12px; padding: 40px; border: 1px solid #404040; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2d8659; padding-bottom: 20px; }
              .logo-text { color: #2d8659; font-size: 32px; font-weight: bold; margin: 0; }
              .badge { display: inline-block; background-color: #2d8659; color: #ffffff; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; margin-top: 10px; }
              h1 { color: #ffffff; font-size: 24px; margin: 0 0 10px 0; }
              h2 { color: #2d8659; font-size: 18px; margin: 30px 0 15px 0; border-bottom: 1px solid #404040; padding-bottom: 8px; }
              p { color: #b0b0b0; line-height: 1.6; margin: 0 0 15px 0; }
              .info-box { background-color: #1a1a1a; border-left: 4px solid #2d8659; padding: 20px; margin: 20px 0; border-radius: 4px; }
              .info-row { display: flex; margin-bottom: 10px; }
              .info-label { color: #808080; font-weight: bold; min-width: 140px; }
              .info-value { color: #ffffff; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #1a1a1a; border-radius: 8px; overflow: hidden; }
              th { background-color: #2d8659; color: #ffffff; padding: 12px 8px; text-align: left; font-weight: bold; }
              th.center { text-align: center; }
              th.right { text-align: right; }
              .total-row { background-color: #2d2d2d; border-top: 2px solid #2d8659; }
              .total-row td { padding: 15px 8px; font-weight: bold; font-size: 16px; color: #2d8659; }
              .notes-box { background-color: #3a2a1a; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .notes-box p { color: #ffb74d; margin: 0; }
              .notes-content { color: #ffffff; margin-top: 8px; font-style: italic; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #404040; }
              .footer p { color: #808080; font-size: 12px; margin: 5px 0; }
              .action-button { display: inline-block; background-color: #2d8659; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <p class="logo-text">⚡ NexaBox</p>
                <span class="badge">NEW SAMPLE REQUEST</span>
              </div>
              
              <h1>📦 New Sample Request Received</h1>
              <p>A new purchase order has been submitted to the NexaBox Electronics Distribution System.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Submitted By:</span>
                  <span class="info-value">${request.submittedBy}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Client Name:</span>
                  <span class="info-value">${request.clientName || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Delivery Address:</span>
                  <span class="info-value">${request.deliveryAddress || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Delivery Date:</span>
                  <span class="info-value">${request.deliveryDate || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Request Date:</span>
                  <span class="info-value">${formattedDate} at ${formattedTime}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Request ID:</span>
                  <span class="info-value">${request.id}</span>
                </div>
              </div>
              
              ${request.notes ? `
              <div class="notes-box">
                <p><strong>📝 Notes:</strong></p>
                <p class="notes-content">${request.notes}</p>
              </div>
              ` : ''}
              
              <h2>📋 Requested Items</h2>
              
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Size</th>
                    <th class="center">Qty</th>
                    <th class="right">Unit Price</th>
                    <th class="right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsTableHtml}
                  <tr class="total-row">
                    <td colspan="5" style="text-align: right;">TOTAL ESTIMATED VALUE:</td>
                    <td style="text-align: right;">₱${request.totalValue.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              
              <p style="color: #808080; font-size: 14px; margin-top: 20px;">
                💡 <strong>Next Steps:</strong> Log in to the Admin Dashboard to review and process this request. You can assign a DR number, update stock levels, and track fulfillment.
              </p>
              
              <div class="footer">
                <p>© 2026 NexaBox. All rights reserved.</p>
                <p>Electronics Distribution System</p>
                <p style="font-size: 11px; color: #666; margin-top: 8px;">Developed by Dale Catibog</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    console.log(`📧 Sending request notification email to ${notificationEmail}...`);
    console.log(`From: ${emailBody.from}`);
    console.log(`To: ${emailBody.to}`);
    console.log(`Subject: ${emailBody.subject}`);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailBody),
    });

    console.log(`Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`❌ Failed to send notification email:`, JSON.stringify(errorData, null, 2));
      
      // Check if using test domain
      if (emailBody.from.includes('onboarding@resend.dev')) {
        console.log('');
        console.log('🚨 IMPORTANT: Test Domain Restrictions');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('You are using Resend\'s test domain: onboarding@resend.dev');
        console.log('');
        console.log('This domain can ONLY send to:');
        console.log('  ✓ The email you signed up with on Resend');
        console.log('  ✓ Emails verified in your Resend account settings');
        console.log('');
        console.log(`Current recipient: ${notificationEmail}`);
        console.log('');
        console.log('QUICK FIX:');
        console.log(`  1. Go to https://resend.com/settings/emails`);
        console.log(`  2. Click "Add Email"`);
        console.log(`  3. Enter: ${notificationEmail}`);
        console.log(`  4. Check Outlook for verification email`);
        console.log(`  5. Click the verification link`);
        console.log(`  6. Try submitting a sample request again`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
      }
      
      return false;
    }

    const result = await response.json();
    console.log(`✅ Notification email sent successfully! Email ID: ${result.id}\n`);
    
    return true;
  } catch (error) {
    console.error('❌ Error sending notification email:', error);
    console.log('⚠️  Notification email failed, but request was saved successfully\n');
    return false;
  }
}

// User OTP Request
app.post("/make-server-63cffc09/auth/user/request-otp", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email } = body;
    
    if (!name || !email) {
      return c.json({ error: "Name and email are required" }, 400);
    }
    
    const otp = generateOTP();
    const sessionId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    await kv.set(sessionId, JSON.stringify({
      type: 'user',
      name,
      email,
      otp,
      expiry,
      verified: false
    }));
    
    await sendOTPEmail(email, otp, name);
    
    return c.json({ success: true, sessionId });
  } catch (error) {
    console.log("Error requesting user OTP:", error);
    return c.json({ error: "Failed to send OTP" }, 500);
  }
});

// User OTP Verification
app.post("/make-server-63cffc09/auth/user/verify-otp", async (c) => {
  try {
    const body = await c.req.json();
    const { sessionId, otp } = body;
    
    if (!sessionId || !otp) {
      return c.json({ error: "Session ID and OTP are required" }, 400);
    }
    
    const sessionData = await kv.get(sessionId);
    if (!sessionData) {
      return c.json({ error: "Invalid or expired session" }, 401);
    }
    
    const session = JSON.parse(sessionData);
    
    if (Date.now() > session.expiry) {
      await kv.del(sessionId);
      return c.json({ error: "OTP expired" }, 401);
    }
    
    if (session.otp !== otp) {
      return c.json({ error: "Invalid OTP" }, 401);
    }
    
    // Mark as verified
    session.verified = true;
    await kv.set(sessionId, JSON.stringify(session));
    
    return c.json({ success: true, name: session.name, email: session.email });
  } catch (error) {
    console.log("Error verifying user OTP:", error);
    return c.json({ error: "Failed to verify OTP" }, 500);
  }
});

// Admin Login (email + password check, then send OTP)
app.post("/make-server-63cffc09/auth/admin/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }
    
    // TODO: Replace with your actual admin credentials
    // For security, these should be environment variables
    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@nexabox.tech';
    const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD') || 'admin123';
    
    // Check for password override (from forgot password flow)
    const passwordOverride = await kv.get('admin_password_override');
    const actualPassword = passwordOverride || ADMIN_PASSWORD;
    
    console.log(`[AUTH] Login attempt for email: ${email}`);
    console.log(`[AUTH] Expected email: ${ADMIN_EMAIL}`);
    console.log(`[AUTH] Password match: ${password === actualPassword}`);
    
    if (email !== ADMIN_EMAIL || password !== actualPassword) {
      console.log(`[AUTH] Login failed - Invalid credentials`);
      return c.json({ error: "Invalid email or password" }, 401);
    }
    
    const otp = generateOTP();
    const sessionId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    await kv.set(sessionId, JSON.stringify({
      type: 'admin',
      email,
      otp,
      expiry,
      verified: false
    }));
    
    console.log(`[AUTH] Generated OTP for ${email}: ${otp}`);
    console.log(`[AUTH] Session ID: ${sessionId}`);
    console.log(``);
    console.log(`╔════════════════════════════════════════════╗`);
    console.log(`║     🔐 ADMIN LOGIN - OTP GENERATED       ║`);
    console.log(`╠════════════════════════════════════════════╣`);
    console.log(`║  Email: ${email.padEnd(34)}║`);
    console.log(`║  OTP Code: ${otp}                         ║`);
    console.log(`║  Valid for: 10 minutes                    ║`);
    console.log(`╚════════════════════════════════════════════╝`);
    console.log(``);
    
    await sendOTPEmail(email, otp, 'Admin');
    
    return c.json({ success: true, sessionId });
  } catch (error) {
    console.log("Error during admin login:", error);
    return c.json({ error: "Failed to process login" }, 500);
  }
});

// Admin OTP Verification
app.post("/make-server-63cffc09/auth/admin/verify-otp", async (c) => {
  try {
    const body = await c.req.json();
    const { sessionId, otp } = body;
    
    if (!sessionId || !otp) {
      return c.json({ error: "Session ID and OTP are required" }, 400);
    }
    
    const sessionData = await kv.get(sessionId);
    if (!sessionData) {
      return c.json({ error: "Invalid or expired session" }, 401);
    }
    
    const session = JSON.parse(sessionData);
    
    if (session.type !== 'admin' && session.type !== 'password-reset') {
      return c.json({ error: "Invalid session type" }, 401);
    }
    
    if (Date.now() > session.expiry) {
      await kv.del(sessionId);
      return c.json({ error: "OTP expired" }, 401);
    }
    
    if (session.otp !== otp) {
      return c.json({ error: "Invalid OTP" }, 401);
    }
    
    // Mark as verified
    session.verified = true;
    await kv.set(sessionId, JSON.stringify(session));
    
    return c.json({ success: true, email: session.email });
  } catch (error) {
    console.log("Error verifying admin OTP:", error);
    return c.json({ error: "Failed to verify OTP" }, 500);
  }
});

// Forgot Password - Send OTP for password reset
app.post("/make-server-63cffc09/auth/admin/forgot-password", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;
    
    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }
    
    // Verify it's the admin email
    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@nexabox.tech';
    
    if (email !== ADMIN_EMAIL) {
      return c.json({ error: "Invalid admin email" }, 401);
    }
    
    const otp = generateOTP();
    const sessionId = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    await kv.set(sessionId, JSON.stringify({
      type: 'password-reset',
      email,
      otp,
      expiry,
      verified: false
    }));
    
    await sendOTPEmail(email, otp, 'Admin');
    
    return c.json({ success: true, sessionId });
  } catch (error) {
    console.log("Error during password reset request:", error);
    return c.json({ error: "Failed to process password reset" }, 500);
  }
});

// Reset Password - Update password after OTP verification
app.post("/make-server-63cffc09/auth/admin/reset-password", async (c) => {
  try {
    const body = await c.req.json();
    const { sessionId, password } = body;
    
    if (!sessionId || !password) {
      return c.json({ error: "Session ID and password are required" }, 400);
    }
    
    const sessionData = await kv.get(sessionId);
    if (!sessionData) {
      return c.json({ error: "Invalid or expired session" }, 401);
    }
    
    const session = JSON.parse(sessionData);
    
    if (session.type !== 'password-reset') {
      return c.json({ error: "Invalid session type" }, 401);
    }
    
    if (!session.verified) {
      return c.json({ error: "Session not verified" }, 401);
    }
    
    if (Date.now() > session.expiry) {
      await kv.del(sessionId);
      return c.json({ error: "Session expired" }, 401);
    }
    
    // Update password in environment variable storage
    // Note: In production, you would update a database or secure secret manager
    // For now, we'll store it in KV store (temporary solution)
    await kv.set('admin_password_override', password);
    
    // Clean up session
    await kv.del(sessionId);
    
    return c.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log("Error resetting password:", error);
    return c.json({ error: "Failed to reset password" }, 500);
  }
});

Deno.serve(app.fetch);