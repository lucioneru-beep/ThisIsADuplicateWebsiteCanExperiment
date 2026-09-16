// Helper function to send request edit notification email
export async function sendRequestEditNotificationEmail(oldRequest: any, newRequest: any, changes: string[]): Promise<boolean> {
  try {
    let resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    // Always log request edit to console
    console.log(`\n========== SAMPLE REQUEST EDITED ==========`);
    console.log(`Request ID: ${newRequest.id}`);
    console.log(`Client: ${newRequest.clientName}`);
    console.log(`Changes Made: ${changes.join(', ')}`);
    console.log(`==========================================\n`);
    
    if (!resendApiKey || resendApiKey.trim() === '') {
      console.log('⚠️  RESEND_API_KEY not configured - Edit notification logged to console only');
      return true;
    }

    resendApiKey = resendApiKey.trim();
    
    const notificationEmail = 'wonderzymemarketing@infarmco.com';
    
    // Get domain from environment or use test domain
    const emailDomain = Deno.env.get('EMAIL_DOMAIN') || 'onboarding@resend.dev';
    const fromAddress = emailDomain.includes('@') 
      ? `Wonderzyme Notifications <${emailDomain}>`
      : `Wonderzyme Notifications <noreply@${emailDomain}>`;

    // Format timestamp
    const editTime = new Date();
    const formattedDate = editTime.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const formattedTime = editTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Build changes HTML
    let changesHtml = '';
    for (const change of changes) {
      changesHtml += `<li style="color: #ffffff; margin-bottom: 8px;">✏️ ${change}</li>`;
    }

    // Build items table HTML
    let itemsTableHtml = '';
    for (const item of newRequest.items) {
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
      subject: `✏️ Sample Request Updated - ${newRequest.clientName || newRequest.submittedBy}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #1a1a1a; margin: 0; padding: 20px; }
              .container { max-width: 800px; margin: 0 auto; background-color: #2d2d2d; border-radius: 12px; padding: 40px; border: 1px solid #404040; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ff9800; padding-bottom: 20px; }
              .logo-text { color: #2d8659; font-size: 32px; font-weight: bold; margin: 0; }
              .badge { display: inline-block; background-color: #ff9800; color: #ffffff; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; margin-top: 10px; }
              h1 { color: #ffffff; font-size: 24px; margin: 0 0 10px 0; }
              h2 { color: #ff9800; font-size: 18px; margin: 30px 0 15px 0; border-bottom: 1px solid #404040; padding-bottom: 8px; }
              p { color: #b0b0b0; line-height: 1.6; margin: 0 0 15px 0; }
              .info-box { background-color: #1a1a1a; border-left: 4px solid #ff9800; padding: 20px; margin: 20px 0; border-radius: 4px; }
              .info-row { display: flex; margin-bottom: 10px; }
              .info-label { color: #808080; font-weight: bold; min-width: 140px; }
              .info-value { color: #ffffff; }
              .changes-box { background-color: #3a2a1a; border-left: 4px solid #ff9800; padding: 20px; margin: 20px 0; border-radius: 4px; }
              .changes-box h3 { color: #ff9800; margin: 0 0 15px 0; font-size: 16px; }
              .changes-box ul { margin: 0; padding-left: 20px; list-style: none; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #1a1a1a; border-radius: 8px; overflow: hidden; }
              th { background-color: #ff9800; color: #ffffff; padding: 12px 8px; text-align: left; font-weight: bold; }
              th.center { text-align: center; }
              th.right { text-align: right; }
              .total-row { background-color: #2d2d2d; border-top: 2px solid #ff9800; }
              .total-row td { padding: 15px 8px; font-weight: bold; font-size: 16px; color: #ff9800; }
              .notes-box { background-color: #1a2a3a; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .notes-box p { color: #64b5f6; margin: 0; }
              .notes-content { color: #ffffff; margin-top: 8px; font-style: italic; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #404040; }
              .footer p { color: #808080; font-size: 12px; margin: 5px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <p class="logo-text">🧬 Wonderzyme</p>
                <span class="badge">REQUEST UPDATED</span>
              </div>
              
              <h1>✏️ Sample Request Updated</h1>
              <p>A sample request has been modified in the Wonderzyme Inventory System.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Submitted By:</span>
                  <span class="info-value">${newRequest.submittedBy}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">DR Number:</span>
                  <span class="info-value">${newRequest.drNumber || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Client Name:</span>
                  <span class="info-value">${newRequest.clientName || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Delivery Address:</span>
                  <span class="info-value">${newRequest.deliveryAddress || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Delivery Date:</span>
                  <span class="info-value">${newRequest.deliveryDate || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Modified:</span>
                  <span class="info-value">${formattedDate} at ${formattedTime}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Request ID:</span>
                  <span class="info-value">${newRequest.id}</span>
                </div>
              </div>
              
              <div class="changes-box">
                <h3>📝 Changes Made:</h3>
                <ul>
                  ${changesHtml}
                </ul>
              </div>
              
              ${newRequest.notes ? `
              <div class="notes-box">
                <p><strong>📝 Notes:</strong></p>
                <p class="notes-content">${newRequest.notes}</p>
              </div>
              ` : ''}
              
              <h2>📋 Current Items</h2>
              
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
                    <td style="text-align: right;">₱${newRequest.totalValue.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              
              <p style="color: #808080; font-size: 14px; margin-top: 20px;">
                💡 <strong>Note:</strong> This is an automated notification for request modifications. Review the changes in your Admin Dashboard.
              </p>
              
              <div class="footer">
                <p>© 2026 Wonderzyme. All rights reserved.</p>
                <p>Inventory & Sample Management System</p>
                <p style="font-size: 11px; color: #666; margin-top: 8px;">Developed by Dale Catibog</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    console.log(`📧 Sending request edit notification email to ${notificationEmail}...`);

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
      console.error(`❌ Failed to send edit notification email:`, JSON.stringify(errorData, null, 2));
      return false;
    }

    const result = await response.json();
    console.log(`✅ Edit notification email sent successfully! Email ID: ${result.id}\n`);
    
    return true;
  } catch (error) {
    console.error('❌ Error sending edit notification email:', error);
    console.log('⚠️  Edit notification email failed\n');
    return false;
  }
}

// Helper function to send request deletion notification email
export async function sendRequestDeleteNotificationEmail(deletedRequest: any): Promise<boolean> {
  try {
    let resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    // Always log request deletion to console
    console.log(`\n========== SAMPLE REQUEST DELETED ==========`);
    console.log(`Request ID: ${deletedRequest.id}`);
    console.log(`Client: ${deletedRequest.clientName}`);
    console.log(`Total Value: ₱${deletedRequest.totalValue.toFixed(2)}`);
    console.log(`===========================================\n`);
    
    if (!resendApiKey || resendApiKey.trim() === '') {
      console.log('⚠️  RESEND_API_KEY not configured - Delete notification logged to console only');
      return true;
    }

    resendApiKey = resendApiKey.trim();
    
    const notificationEmail = 'wonderzymemarketing@infarmco.com';
    
    // Get domain from environment or use test domain
    const emailDomain = Deno.env.get('EMAIL_DOMAIN') || 'onboarding@resend.dev';
    const fromAddress = emailDomain.includes('@') 
      ? `Wonderzyme Notifications <${emailDomain}>`
      : `Wonderzyme Notifications <noreply@${emailDomain}>`;

    // Format timestamp
    const deleteTime = new Date();
    const formattedDate = deleteTime.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const formattedTime = deleteTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Format original timestamp
    const originalTime = new Date(deletedRequest.timestamp);
    const originalFormattedDate = originalTime.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Build items table HTML
    let itemsTableHtml = '';
    for (const item of deletedRequest.items) {
      itemsTableHtml += `
        <tr style="border-bottom: 1px solid #404040;">
          <td style="padding: 12px 8px; color: #ffffff;">${item.productName}</td>
          <td style="padding: 12px 8px; color: #b0b0b0;">${item.category}</td>
          <td style="padding: 12px 8px; color: #b0b0b0;">${item.size}</td>
          <td style="padding: 12px 8px; color: #ffffff; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px 8px; color: #b0b0b0; text-align: right;">₱${item.unitPrice.toFixed(2)}</td>
          <td style="padding: 12px 8px; color: #ff5252; font-weight: bold; text-align: right;">₱${item.total.toFixed(2)}</td>
        </tr>
      `;
    }

    const emailBody = {
      from: fromAddress,
      to: notificationEmail,
      subject: `🗑️ Sample Request Deleted - ${deletedRequest.clientName || deletedRequest.submittedBy}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #1a1a1a; margin: 0; padding: 20px; }
              .container { max-width: 800px; margin: 0 auto; background-color: #2d2d2d; border-radius: 12px; padding: 40px; border: 1px solid #404040; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f44336; padding-bottom: 20px; }
              .logo-text { color: #2d8659; font-size: 32px; font-weight: bold; margin: 0; }
              .badge { display: inline-block; background-color: #f44336; color: #ffffff; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; margin-top: 10px; }
              h1 { color: #ffffff; font-size: 24px; margin: 0 0 10px 0; }
              h2 { color: #f44336; font-size: 18px; margin: 30px 0 15px 0; border-bottom: 1px solid #404040; padding-bottom: 8px; }
              p { color: #b0b0b0; line-height: 1.6; margin: 0 0 15px 0; }
              .info-box { background-color: #1a1a1a; border-left: 4px solid #f44336; padding: 20px; margin: 20px 0; border-radius: 4px; }
              .info-row { display: flex; margin-bottom: 10px; }
              .info-label { color: #808080; font-weight: bold; min-width: 140px; }
              .info-value { color: #ffffff; }
              .warning-box { background-color: #3a1a1a; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .warning-box p { color: #ff5252; margin: 0; font-weight: bold; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #1a1a1a; border-radius: 8px; overflow: hidden; }
              th { background-color: #f44336; color: #ffffff; padding: 12px 8px; text-align: left; font-weight: bold; }
              th.center { text-align: center; }
              th.right { text-align: right; }
              .total-row { background-color: #2d2d2d; border-top: 2px solid #f44336; }
              .total-row td { padding: 15px 8px; font-weight: bold; font-size: 16px; color: #f44336; }
              .notes-box { background-color: #1a2a3a; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .notes-box p { color: #64b5f6; margin: 0; }
              .notes-content { color: #ffffff; margin-top: 8px; font-style: italic; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #404040; }
              .footer p { color: #808080; font-size: 12px; margin: 5px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <p class="logo-text">🧬 Wonderzyme</p>
                <span class="badge">REQUEST DELETED</span>
              </div>
              
              <h1>🗑️ Sample Request Deleted</h1>
              <p>A sample request has been permanently removed from the Wonderzyme Inventory System.</p>
              
              <div class="warning-box">
                <p>⚠️ This action is permanent and cannot be undone.</p>
              </div>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Submitted By:</span>
                  <span class="info-value">${deletedRequest.submittedBy}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">DR Number:</span>
                  <span class="info-value">${deletedRequest.drNumber || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Client Name:</span>
                  <span class="info-value">${deletedRequest.clientName || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Delivery Address:</span>
                  <span class="info-value">${deletedRequest.deliveryAddress || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Delivery Date:</span>
                  <span class="info-value">${deletedRequest.deliveryDate || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Originally Created:</span>
                  <span class="info-value">${originalFormattedDate}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Deleted:</span>
                  <span class="info-value">${formattedDate} at ${formattedTime}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Request ID:</span>
                  <span class="info-value">${deletedRequest.id}</span>
                </div>
              </div>
              
              ${deletedRequest.notes ? `
              <div class="notes-box">
                <p><strong>📝 Notes:</strong></p>
                <p class="notes-content">${deletedRequest.notes}</p>
              </div>
              ` : ''}
              
              <h2>📋 Deleted Items (For Record)</h2>
              
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
                    <td colspan="5" style="text-align: right;">TOTAL VALUE (DELETED):</td>
                    <td style="text-align: right;">₱${deletedRequest.totalValue.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              
              <p style="color: #808080; font-size: 14px; margin-top: 20px;">
                💡 <strong>Note:</strong> This notification is for record-keeping purposes. The request has been permanently deleted from the system.
              </p>
              
              <div class="footer">
                <p>© 2026 Wonderzyme. All rights reserved.</p>
                <p>Inventory & Sample Management System</p>
                <p style="font-size: 11px; color: #666; margin-top: 8px;">Developed by Dale Catibog</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    console.log(`📧 Sending request deletion notification email to ${notificationEmail}...`);

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
      console.error(`❌ Failed to send deletion notification email:`, JSON.stringify(errorData, null, 2));
      return false;
    }

    const result = await response.json();
    console.log(`✅ Deletion notification email sent successfully! Email ID: ${result.id}\n`);
    
    return true;
  } catch (error) {
    console.error('❌ Error sending deletion notification email:', error);
    console.log('⚠️  Deletion notification email failed\n');
    return false;
  }
}
