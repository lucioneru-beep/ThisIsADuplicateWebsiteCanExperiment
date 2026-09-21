import { useState } from 'react';
import { X, Download, CheckSquare, Square, FileSpreadsheet, FileText, Calendar, User, Package } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RequestItem {
  productName: string;
  category: string;
  size: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface RequestRecord {
  id: string;
  timestamp: string;
  submittedBy: string;
  drNumber: string;
  clientName: string;
  deliveryAddress: string;
  deliveryDate: string;
  notes?: string;
  items: RequestItem[];
  totalValue: number;
}

interface DownloadManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: RequestRecord[];
}

type DownloadFormat = 'excel' | 'pdf' | 'both';

export function DownloadManagerModal({ isOpen, onClose, requests }: DownloadManagerModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(requests.map(r => r.id)));
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>('both');

  const handleSelectAll = () => {
    setSelectedIds(new Set(requests.map(r => r.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleToggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const getSelectedRequests = () => {
    return requests.filter(req => selectedIds.has(req.id));
  };

  const exportToExcel = (selectedRequests: RequestRecord[]) => {
    const worksheetData: any[] = [
      ['Request ID', 'Timestamp', 'Submitted By', 'DR Number', 'Client Name', 'Delivery Address', 'Delivery Date', 'Notes', 'Product Name', 'Category', 'Size', 'Quantity', 'Unit Price', 'Item Total', 'Request Total Value'],
    ];

    selectedRequests.forEach(req => {
      if (req.items.length === 0) {
        worksheetData.push([
          req.id,
          new Date(req.timestamp).toLocaleString(),
          req.submittedBy,
          req.drNumber,
          req.clientName,
          req.deliveryAddress || '',
          req.deliveryDate || '',
          req.notes || '',
          '',
          '',
          '',
          '',
          '',
          '',
          req.totalValue.toFixed(2),
        ]);
      } else {
        // Add first item with full request info
        worksheetData.push([
          req.id,
          new Date(req.timestamp).toLocaleString(),
          req.submittedBy,
          req.drNumber,
          req.clientName,
          req.deliveryAddress || '',
          req.deliveryDate || '',
          req.notes || '',
          req.items[0].productName,
          req.items[0].category,
          req.items[0].size,
          req.items[0].quantity,
          req.items[0].unitPrice.toFixed(2),
          req.items[0].total.toFixed(2),
          req.totalValue.toFixed(2),
        ]);

        // Add remaining items
        for (let i = 1; i < req.items.length; i++) {
          const item = req.items[i];
          worksheetData.push([
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            item.productName,
            item.category,
            item.size,
            item.quantity,
            item.unitPrice.toFixed(2),
            item.total.toFixed(2),
            '',
          ]);
        }
      }
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    worksheet['!cols'] = [
      { wch: 30 }, // Request ID
      { wch: 20 }, // Timestamp
      { wch: 20 }, // Submitted By
      { wch: 15 }, // DR Number
      { wch: 20 }, // Client Name
      { wch: 35 }, // Delivery Address
      { wch: 15 }, // Delivery Date
      { wch: 40 }, // Notes
      { wch: 35 }, // Product Name
      { wch: 15 }, // Category
      { wch: 12 }, // Size
      { wch: 10 }, // Quantity
      { wch: 12 }, // Unit Price
      { wch: 12 }, // Item Total
      { wch: 15 }, // Request Total Value
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Requests');
    XLSX.writeFile(workbook, `nexabox_requests_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = (selectedRequests: RequestRecord[]) => {
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(18);
    doc.text('NexaBox Purchase Orders', 14, 15);
    
    doc.setFontSize(11);
    doc.text(`Total Requests: ${selectedRequests.length}`, 14, 23);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 29);

    const tableData: any[] = [];
    
    selectedRequests.forEach(req => {
      if (req.items.length === 0) {
        tableData.push([
          req.id.substring(0, 20) + '...',
          new Date(req.timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          req.submittedBy,
          req.drNumber,
          req.clientName || 'N/A',
          req.deliveryAddress || '',
          req.deliveryDate ? new Date(req.deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
          req.notes || '',
          '',
          '',
          '',
          '',
          'PHP ' + req.totalValue.toFixed(2),
        ]);
      } else {
        const firstItem = req.items[0];
        tableData.push([
          req.id.substring(0, 20) + '...',
          new Date(req.timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          req.submittedBy,
          req.drNumber,
          req.clientName || 'N/A',
          req.deliveryAddress || '',
          req.deliveryDate ? new Date(req.deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
          req.notes || '',
          firstItem.productName,
          firstItem.size,
          firstItem.quantity,
          'PHP ' + firstItem.total.toFixed(2),
          'PHP ' + req.totalValue.toFixed(2),
        ]);

        for (let i = 1; i < req.items.length; i++) {
          const item = req.items[i];
          tableData.push([
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            item.productName,
            item.size,
            item.quantity,
            'PHP ' + item.total.toFixed(2),
            '',
          ]);
        }
      }
    });

    autoTable(doc, {
      head: [[
        'Request ID',
        'Date/Time',
        'Submitted By',
        'DR#',
        'Client',
        'Delivery Address',
        'Delivery Date',
        'Notes',
        'Product',
        'Size',
        'Qty',
        'Item Total',
        'Request Total'
      ]],
      body: tableData,
      startY: 35,
      styles: {
        fontSize: 7,
        cellPadding: 1.5,
      },
      headStyles: { 
        fillColor: [45, 134, 89], 
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: { 
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
      },
      alternateRowStyles: { 
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 20 }, // Request ID
        1: { cellWidth: 20 }, // Date/Time
        2: { cellWidth: 18 }, // Submitted By
        3: { cellWidth: 13 }, // DR#
        4: { cellWidth: 18 }, // Client
        5: { cellWidth: 30 }, // Delivery Address
        6: { cellWidth: 16 }, // Delivery Date
        7: { cellWidth: 25 }, // Notes
        8: { cellWidth: 30 }, // Product
        9: { cellWidth: 12 }, // Size
        10: { cellWidth: 8 }, // Qty
        11: { cellWidth: 16 }, // Item Total
        12: { cellWidth: 18 }, // Request Total
      },
      margin: { top: 10, bottom: 10, left: 10, right: 10 },
      didDrawPage: function (data) {
        doc.setFontSize(8);
        doc.setTextColor(128);
        doc.text(
          `Page ${data.pageNumber}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      },
    });

    doc.save(`nexabox_requests_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleDownload = () => {
    const selectedRequests = getSelectedRequests();
    
    if (selectedRequests.length === 0) {
      toast.error('Please select at least one request to download');
      return;
    }

    try {
      if (downloadFormat === 'excel') {
        exportToExcel(selectedRequests);
        toast.success(`Excel file downloaded (${selectedRequests.length} requests)`);
      } else if (downloadFormat === 'pdf') {
        exportToPDF(selectedRequests);
        toast.success(`PDF file downloaded (${selectedRequests.length} requests)`);
      } else {
        exportToExcel(selectedRequests);
        exportToPDF(selectedRequests);
        toast.success(`Excel and PDF files downloaded (${selectedRequests.length} requests)`);
      }
      onClose();
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download files');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#141824] rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-[#1e2433]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1e2433]/50">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6 text-[#f97316]" />
            <div>
              <h2 className="text-2xl font-bold text-white">Download Requests</h2>
              <p className="text-sm text-gray-400">Select requests and choose download format</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-gray-700/50"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Selection Controls */}
        <div className="p-6 border-b border-[#1e2433]/50 bg-[#08090e]/30">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm">
              <span className="text-gray-400">Selected: </span>
              <span className="text-[#f97316] font-semibold text-lg">{selectedIds.size}</span>
              <span className="text-gray-400"> of {requests.length}</span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSelectAll}
                size="sm"
                variant="outline"
                className="border-[#f97316] text-[#f97316] hover:bg-[#f97316]/20"
              >
                Select All
              </Button>
              <Button
                onClick={handleDeselectAll}
                size="sm"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Deselect All
              </Button>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Download Format:</label>
            <div className="flex gap-3">
              <button
                onClick={() => setDownloadFormat('excel')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  downloadFormat === 'excel'
                    ? 'border-[#f97316] bg-[#f97316]/20'
                    : 'border-[#1e2433] bg-[#08090e] hover:border-gray-600'
                }`}
              >
                <FileSpreadsheet className={`w-6 h-6 mx-auto mb-2 ${
                  downloadFormat === 'excel' ? 'text-[#f97316]' : 'text-gray-400'
                }`} />
                <div className={`text-sm font-medium ${
                  downloadFormat === 'excel' ? 'text-[#f97316]' : 'text-gray-300'
                }`}>
                  Excel Only
                </div>
              </button>
              <button
                onClick={() => setDownloadFormat('pdf')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  downloadFormat === 'pdf'
                    ? 'border-[#f97316] bg-[#f97316]/20'
                    : 'border-[#1e2433] bg-[#08090e] hover:border-gray-600'
                }`}
              >
                <FileText className={`w-6 h-6 mx-auto mb-2 ${
                  downloadFormat === 'pdf' ? 'text-[#f97316]' : 'text-gray-400'
                }`} />
                <div className={`text-sm font-medium ${
                  downloadFormat === 'pdf' ? 'text-[#f97316]' : 'text-gray-300'
                }`}>
                  PDF Only
                </div>
              </button>
              <button
                onClick={() => setDownloadFormat('both')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  downloadFormat === 'both'
                    ? 'border-[#f97316] bg-[#f97316]/20'
                    : 'border-[#1e2433] bg-[#08090e] hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-2">
                  <FileSpreadsheet className={`w-5 h-5 ${
                    downloadFormat === 'both' ? 'text-[#f97316]' : 'text-gray-400'
                  }`} />
                  <FileText className={`w-5 h-5 ${
                    downloadFormat === 'both' ? 'text-[#f97316]' : 'text-gray-400'
                  }`} />
                </div>
                <div className={`text-sm font-medium ${
                  downloadFormat === 'both' ? 'text-[#f97316]' : 'text-gray-300'
                }`}>
                  Both Formats
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            {requests.map((request) => (
              <button
                key={request.id}
                onClick={() => handleToggleSelect(request.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedIds.has(request.id)
                    ? 'border-[#f97316] bg-[#f97316]/10'
                    : 'border-[#1e2433] bg-[#08090e] hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {selectedIds.has(request.id) ? (
                      <CheckSquare className="w-5 h-5 text-[#f97316]" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-white text-sm font-medium">
                          {new Date(request.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <span className="text-[#f97316] text-sm font-semibold">
                        DR# {request.drNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {request.submittedBy}
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {request.items.length} items
                      </div>
                      <div className="text-[#f97316] font-semibold">
                        ₱{request.totalValue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#1e2433]/50 bg-[#08090e]/30">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {selectedIds.size === 0 && 'Select at least one request to download'}
              {selectedIds.size > 0 && (
                <>
                  Ready to download <span className="text-[#f97316] font-semibold">{selectedIds.size}</span> {selectedIds.size === 1 ? 'request' : 'requests'} as{' '}
                  <span className="text-[#f97316] font-semibold">
                    {downloadFormat === 'excel' ? 'Excel' : downloadFormat === 'pdf' ? 'PDF' : 'Excel & PDF'}
                  </span>
                </>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDownload}
                disabled={selectedIds.size === 0}
                className="bg-[#f97316] hover:bg-[#ea6a09] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-2" />
                Download {selectedIds.size > 0 && `(${selectedIds.size})`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}