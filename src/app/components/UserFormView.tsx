import { useState, useEffect } from 'react';
import { ArrowLeft, Send, Download, CheckCircle, FileText, Calendar } from 'lucide-react';
import { ProductSearchForm } from './ProductSearchForm';
import { ClientRequestTable } from './ClientRequestTable';
import { Product, RequestItem } from '../types';
import { toast } from 'sonner';
import { Button } from './ui/button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NexaBoxLogo } from './NexaBoxLogo';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import * as XLSX from 'xlsx';

interface UserFormViewProps {
  userName: string;
  userEmail: string;
  onLogout: () => void;
  apiBase: string;
  authToken: string;
  demoMode?: boolean;
}

export function UserFormView({ userName, userEmail, onLogout, apiBase, authToken, demoMode = false }: UserFormViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentRequest, setCurrentRequest] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSubmittedRequest, setLastSubmittedRequest] = useState<{
    items: RequestItem[];
    submittedBy: string;
    drNumber: string;
    clientName: string;
    deliveryAddress: string;
    deliveryDate: string;
    notes?: string;
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/inventory`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (item: RequestItem) => {
    setCurrentRequest((prev) => [...prev, item]);
    toast.success(`${item.productName} added to request`);
  };

  const handleRemoveItem = (index: number) => {
    setCurrentRequest((prev) => prev.filter((_, i) => i !== index));
    toast.success('Item removed from request');
  };

  const handleClearRequest = () => {
    setCurrentRequest([]);
    toast.success('Request cleared');
  };

  const handleSubmitRequest = async (submittedBy: string, clientName: string, deliveryAddress: string, deliveryDate: string, notes?: string) => {
    if (currentRequest.length === 0) return;

    const timestamp = new Date();

    const submission = {
      drNumber: '',
      submittedBy,
      clientName,
      deliveryAddress,
      deliveryDate,
      notes: notes || '',
      items: currentRequest,
      timestamp: timestamp.toISOString(),
    };

    if (demoMode) {
      // Simulate success without hitting the backend
      const updatedProducts = products.map((product) => {
        const requestItem = currentRequest.find((item) => item.productName === product.name);
        if (requestItem) {
          return { ...product, stock: Math.max(0, product.stock - requestItem.quantity) };
        }
        return product;
      });
      setProducts(updatedProducts);
      setLastSubmittedRequest(submission);
      setCurrentRequest([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success('Order submitted! (Demo mode — nothing was saved)');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-63cffc09/submit-request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(submission),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to submit request: ${errorText}`);
      }

      const updatedProducts = products.map((product) => {
        const requestItem = currentRequest.find((item) => item.productName === product.name);
        if (requestItem) {
          return { ...product, stock: Math.max(0, product.stock - requestItem.quantity) };
        }
        return product;
      });

      setProducts(updatedProducts);
      setLastSubmittedRequest(submission);
      setCurrentRequest([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success('Request submitted successfully!');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request. Please try again.');
    }
  };

  const handleDownloadPDFRequest = () => {
    if (!lastSubmittedRequest) return;

    const timestamp = new Date(lastSubmittedRequest.timestamp);
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('WONDERZYME', 14, 20);
    
    doc.setFontSize(16);
    doc.text('Sample Request Form', 14, 28);
    
    // Divider
    doc.setDrawColor(45, 134, 89);
    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);

    // Request Details
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Client Name: ${lastSubmittedRequest.clientName}`, 14, 42);
    doc.text(`Submitted By: ${lastSubmittedRequest.submittedBy}`, 14, 49);
    doc.text(`Date: ${timestamp.toLocaleDateString()}`, 14, 56);
    doc.text(`Time: ${timestamp.toLocaleTimeString()}`, 14, 63);

    let currentY = 70;

    // Note about DR Number
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('(DR Number will be assigned by admin)', 14, currentY);
    currentY += 7;

    // Notes if present
    if (lastSubmittedRequest.notes) {
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('Notes:', 14, currentY);
      currentY += 5;
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const splitNotes = doc.splitTextToSize(lastSubmittedRequest.notes, 180);
      doc.text(splitNotes, 14, currentY);
      currentY += (splitNotes.length * 4) + 3;
    }

    // Table
    const tableData = lastSubmittedRequest.items.map((item, index) => [
      index + 1,
      item.productName,
      item.category,
      item.size,
      item.quantity,
      `PHP ${item.unitPrice.toFixed(2)}`,
      `PHP ${item.total.toFixed(2)}`,
    ]);

    autoTable(doc, {
      head: [
        ['#', 'Product Name', 'Category', 'Size', 'Qty', 'Unit Price', 'Total Value'],
      ],
      body: tableData,
      startY: currentY + 5,
      theme: 'striped',
      headStyles: { 
        fillColor: [45, 134, 89],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: { 
        fontSize: 9,
        textColor: [50, 50, 50]
      },
      alternateRowStyles: { 
        fillColor: [245, 245, 245] 
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 15, halign: 'center' },
        5: { cellWidth: 28, halign: 'right' },
        6: { cellWidth: 28, halign: 'right' }
      }
    });

    // Calculate total
    const totalValue = lastSubmittedRequest.items.reduce((sum, item) => sum + item.total, 0);
    
    // @ts-ignore - autoTable adds finalY property
    const finalY = doc.lastAutoTable.finalY || 78;

    // Total box
    doc.setFillColor(45, 134, 89);
    doc.rect(14, finalY + 5, 182, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL ESTIMATED VALUE:', 16, finalY + 11);
    doc.text(`PHP ${totalValue.toFixed(2)}`, 194, finalY + 11, { align: 'right' });

    // Footer
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('© 2026 NexaBox. All rights reserved.', 105, 285, { align: 'center' });
    doc.text('Developed by Dale Catibog', 105, 290, { align: 'center' });

    const filename = `NexaBox_Request_${lastSubmittedRequest.clientName.replace(/\s+/g, '_')}_${timestamp.toISOString().split('T')[0]}.pdf`;
    doc.save(filename);

    toast.success('PDF downloaded successfully!');
  };

  const handleDownloadExcelRequest = () => {
    if (!lastSubmittedRequest) return;

    const timestamp = new Date(lastSubmittedRequest.timestamp);
    const workbook = XLSX.utils.book_new();

    // Create a worksheet
    const worksheetData = [
      ['Client Name', lastSubmittedRequest.clientName],
      ['Submitted By', lastSubmittedRequest.submittedBy],
      ['Date', timestamp.toLocaleDateString()],
      ['Time', timestamp.toLocaleTimeString()],
      ['DR Number', 'Pending (Admin will assign)'],
      ...(lastSubmittedRequest.notes ? [['Notes', lastSubmittedRequest.notes]] : []),
      ['Total Estimated Value', `PHP ${lastSubmittedRequest.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}`],
      [''],
      ['Product Name', 'Category', 'Size', 'Qty', 'Unit Price', 'Total Value'],
      ...lastSubmittedRequest.items.map(item => [
        item.productName,
        item.category,
        item.size,
        item.quantity,
        `PHP ${item.unitPrice.toFixed(2)}`,
        `PHP ${item.total.toFixed(2)}`
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Request');

    const filename = `NexaBox_Request_${lastSubmittedRequest.clientName.replace(/\s+/g, '_')}_${timestamp.toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);

    toast.success('Excel file downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-[#08090e]">
      {/* Demo Mode Banner */}
      {demoMode && (
        <div className="bg-violet-600 text-white text-center text-sm font-medium py-2 px-4 sticky top-0 z-20" style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>
          PORTFOLIO DEMO — browsing is live, submissions are not saved
        </div>
      )}
      {/* Header */}
      <header className="bg-[#141824] border-b border-[#1e2433] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <NexaBoxLogo size="sm" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Sample Request Form
                </h1>
                <p className="text-sm text-gray-400">Select products and submit your request</p>
              </div>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Banner with Download */}
        {lastSubmittedRequest && (
          <div className="mb-6 bg-gradient-to-r from-[#f97316] to-[#ea6a09] rounded-lg p-6 border border-[#f97316] shadow-lg">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  Request Submitted Successfully! ✅
                </h3>
                <div className="text-white/90 text-sm space-y-1 mb-4">
                  <p>📋 DR Number: <span className="font-semibold text-yellow-200">Pending (Admin will assign)</span></p>
                  <p>👤 Client: <span className="font-semibold">{lastSubmittedRequest.clientName}</span></p>
                  <p>✍️ Submitted By: <span className="font-semibold">{lastSubmittedRequest.submittedBy}</span></p>
                  <p>📦 Items: <span className="font-semibold">{lastSubmittedRequest.items.length} product(s)</span></p>
                  <p>🕐 Submitted: <span className="font-semibold">{new Date(lastSubmittedRequest.timestamp).toLocaleString()}</span></p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleDownloadPDFRequest}
                    className="bg-white text-[#f97316] hover:bg-gray-100 font-semibold"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={() => setLastSubmittedRequest(null)}
                    className="bg-gray-800 text-white hover:bg-gray-700 font-semibold border border-gray-600"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f97316]"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Step 1: Search & Add Products */}
            <div className="bg-[#141824] rounded-lg border border-[#1e2433]">
              <div className="bg-gradient-to-r from-[#f97316]/20 to-[#ea6a09]/20 border-b border-[#1e2433] p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-[#f97316] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <h2 className="text-2xl font-bold text-white">Search & Add Products</h2>
                </div>
                <p className="text-gray-300 text-sm ml-11">
                  Use the search bar below to find products and add them to your request
                </p>
              </div>
              <div className="p-6">
                <ProductSearchForm products={products} onAddToRequest={handleAddItem} />
              </div>
            </div>

            {/* Step 2: Review Your Request */}
            <div className="bg-[#141824] rounded-lg border border-[#1e2433]">
              <div className="bg-gradient-to-r from-[#f97316]/20 to-[#ea6a09]/20 border-b border-[#1e2433] p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-[#f97316] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <h2 className="text-2xl font-bold text-white">Review Your Request</h2>
                </div>
                <p className="text-gray-300 text-sm ml-11">
                  {currentRequest.length === 0 
                    ? 'No items added yet. Add products from the search above.' 
                    : `${currentRequest.length} product(s) added to your request`}
                </p>
              </div>
              <div className="p-6">
                <ClientRequestTable
                  items={currentRequest}
                  onRemoveItem={handleRemoveItem}
                  onSubmit={handleSubmitRequest}
                />
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-[#141824]/50 border border-[#1e2433] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span> Quick Guide
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex gap-3">
                  <span className="text-2xl">🔍</span>
                  <div>
                    <p className="font-medium text-white mb-1">Step 1: Find Products</p>
                    <p className="text-gray-400">Search by name or browse by category</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">➕</span>
                  <div>
                    <p className="font-medium text-white mb-1">Step 2: Add to Request</p>
                    <p className="text-gray-400">Select quantity and click "Add to Request"</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <p className="font-medium text-white mb-1">Step 3: Fill Details</p>
                    <p className="text-gray-400">Enter your name and client company name</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="font-medium text-white mb-1">Step 4: Download PDF</p>
                    <p className="text-gray-400">Submit and get your receipt instantly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#141824] border-t border-[#1e2433] mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-gray-500 text-sm text-center">
            © 2026 NexaBox. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs text-center mt-1">
            Developed by Dale Catibog
          </p>
        </div>
      </footer>
    </div>
  );
}