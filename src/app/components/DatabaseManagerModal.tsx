import { useState, useEffect } from 'react';
import { X, Search, Edit2, Trash2, Save, XCircle, Database, Calendar, User, FileText, Package, Plus, CheckSquare, Square, Minus, List, FilePlus, Download, AlertTriangle, HardDrive } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { Product } from '../types';
import { ProductSelectorModal } from './ProductSelectorModal';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RequestRecord {
  id: string;
  timestamp: string;
  submittedBy: string;
  drNumber: string;
  clientName: string;
  deliveryAddress?: string;
  deliveryDate?: string;
  notes?: string;
  items: Array<{
    productName: string;
    category: string;
    size: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totalValue: number;
}

interface DatabaseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
  authToken: string;
  onDataChange: () => void;
  products: Product[];
  demoMode?: boolean;
}

type ViewTab = 'browse' | 'add';

export function DatabaseManagerModal({
  isOpen,
  onClose,
  apiBase,
  authToken,
  onDataChange,
  products,
  demoMode = false,
}: DatabaseManagerModalProps) {
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<RequestRecord>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<ViewTab>('browse');
  const [newRequestForm, setNewRequestForm] = useState({
    submittedBy: '',
    drNumber: '',
    clientName: '',
    deliveryAddress: '',
    deliveryDate: '',
    notes: '',
    items: [] as Array<{
      productName: string;
      category: string;
      size: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>,
  });
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [productSelectorMode, setProductSelectorMode] = useState<'add' | 'edit'>('add');

  useEffect(() => {
    if (isOpen) {
      fetchAllRequests();
    }
  }, [isOpen]);

  useEffect(() => {
    filterRequests();
  }, [searchQuery, dateFilter, requests]);

  const fetchAllRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/requests/all`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data);
      setFilteredRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load database records');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.submittedBy.toLowerCase().includes(query) ||
          req.drNumber.toLowerCase().includes(query) ||
          req.clientName.toLowerCase().includes(query) ||
          req.items.some((item) =>
            item.productName.toLowerCase().includes(query)
          )
      );
    }

    if (dateFilter) {
      const targetDate = new Date(dateFilter);
      filtered = filtered.filter((req) => {
        const reqDate = new Date(req.timestamp);
        return (
          reqDate.getFullYear() === targetDate.getFullYear() &&
          reqDate.getMonth() === targetDate.getMonth() &&
          reqDate.getDate() === targetDate.getDate()
        );
      });
    }

    setFilteredRequests(filtered);
  };

  const handleEdit = (request: RequestRecord) => {
    setEditingId(request.id);
    setEditForm({
      submittedBy: request.submittedBy,
      drNumber: request.drNumber,
      clientName: request.clientName,
      deliveryAddress: request.deliveryAddress,
      deliveryDate: request.deliveryDate,
      notes: request.notes,
      items: [...request.items],
    });
  };

  const handleSaveEdit = async (requestId: string) => {
    if (demoMode) { toast.success('Demo mode — changes not saved'); setEditingId(null); setEditForm({}); return; }
    try {
      const response = await fetch(`${apiBase}/requests/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          requestId,
          updates: editForm,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update request');
      }

      toast.success('Request updated successfully');
      setEditingId(null);
      setEditForm({});
      await fetchAllRequests();
      onDataChange();
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (requestId: string, drNumber: string) => {
    if (demoMode) { toast.info('Demo mode — deletion disabled'); return; }
    if (!confirm(`Are you sure you want to delete request DR# ${drNumber}?`)) {
      return;
    }

    try {
      const response = await fetch(`${apiBase}/requests/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ requestId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete request');
      }

      toast.success('Request deleted successfully');
      await fetchAllRequests();
      onDataChange();
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    }
  };

  const handleBulkDelete = async () => {
    if (demoMode) { toast.info('Demo mode — deletion disabled'); return; }
    if (!confirm(`Delete ${selectedIds.size} selected requests? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${apiBase}/requests/bulkDelete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ requestIds: Array.from(selectedIds) }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete selected requests');
      }

      toast.success(`${selectedIds.size} requests deleted successfully`);
      setSelectedIds(new Set());
      await fetchAllRequests();
      onDataChange();
    } catch (error) {
      console.error('Error deleting selected requests:', error);
      toast.error('Failed to delete selected requests');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter('');
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(filteredRequests.map(req => req.id)));
  };

  const handleSelectNone = () => {
    setSelectedIds(new Set());
  };

  const handleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleAddRequest = async () => {
    if (demoMode) { toast.info('Demo mode — adding records is disabled'); return; }
    if (!newRequestForm.submittedBy || !newRequestForm.drNumber || newRequestForm.items.length === 0) {
      toast.error('Please fill in all required fields and add at least one item');
      return;
    }

    try {
      const response = await fetch(`${apiBase}/requests/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(newRequestForm),
      });

      if (!response.ok) {
        throw new Error('Failed to add request');
      }

      toast.success('Request added successfully');
      setNewRequestForm({
        submittedBy: '',
        drNumber: '',
        clientName: '',
        deliveryAddress: '',
        deliveryDate: '',
        notes: '',
        items: [],
      });
      setActiveTab('browse');
      await fetchAllRequests();
      onDataChange();
    } catch (error) {
      console.error('Error adding request:', error);
      toast.error('Failed to add request');
    }
  };

  const handleEditItemQuantity = (index: number, quantity: number | string) => {
    if (!editForm.items) return;
    const updatedItems = [...editForm.items];
    // Allow empty string temporarily, default to 1
    const qty = typeof quantity === 'string' && quantity === '' ? 1 : Math.max(1, Number(quantity) || 1);
    updatedItems[index].quantity = qty;
    updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
    setEditForm({ ...editForm, items: updatedItems });
  };

  const handleRemoveEditItem = (index: number) => {
    if (!editForm.items) return;
    const updatedItems = editForm.items.filter((_, i) => i !== index);
    setEditForm({ ...editForm, items: updatedItems });
  };

  const handleRemoveNewRequestItem = (index: number) => {
    const updatedItems = newRequestForm.items.filter((_, i) => i !== index);
    setNewRequestForm({ ...newRequestForm, items: updatedItems });
  };

  const getEditTotalValue = () => {
    if (!editForm.items) return 0;
    return editForm.items.reduce((sum, item) => sum + item.total, 0);
  };

  const getNewRequestTotalValue = () => {
    return newRequestForm.items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleProductSelectorSelect = (productId: string, size: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const sizeInfo = product.sizes.find(s => s.size === size);
    if (!sizeInfo) return;
    
    const newItem = {
      productName: product.name,
      category: product.category,
      size: size,
      quantity: quantity,
      unitPrice: sizeInfo.price,
      total: quantity * sizeInfo.price,
    };
    
    if (productSelectorMode === 'edit') {
      setEditForm(prev => ({
        ...prev,
        items: [...(prev.items || []), newItem],
      }));
    } else {
      setNewRequestForm(prev => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
    }
    
    toast.success('Item added to request');
  };

  const handleProductSelectorSelectMultiple = (items: Array<{ productId: string; size: string; quantity: number }>) => {
    const newItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return null;
      
      const sizeInfo = product.sizes.find(s => s.size === item.size);
      if (!sizeInfo) return null;
      
      return {
        productName: product.name,
        category: product.category,
        size: item.size,
        quantity: item.quantity,
        unitPrice: sizeInfo.price,
        total: item.quantity * sizeInfo.price,
      };
    }).filter(item => item !== null);

    if (newItems.length === 0) return;
    
    if (productSelectorMode === 'edit') {
      setEditForm(prev => ({
        ...prev,
        items: [...(prev.items || []), ...newItems],
      }));
    } else {
      setNewRequestForm(prev => ({
        ...prev,
        items: [...prev.items, ...newItems],
      }));
    }
    
    toast.success(`${newItems.length} items added to request`);
  };

  const exportToExcel = () => {
    // Create detailed worksheet with items
    const worksheetData: any[] = [
      ['Request ID', 'Timestamp', 'Submitted By', 'DR Number', 'Client Name', 'Delivery Address', 'Delivery Date', 'Notes', 'Product Name', 'Category', 'Size', 'Quantity', 'Unit Price', 'Item Total', 'Request Total Value'],
    ];

    requests.forEach(req => {
      if (req.items.length === 0) {
        // If no items, show the request info with empty item columns
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
          req.totalValue,
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
          req.items[0].unitPrice,
          req.items[0].total,
          req.totalValue,
        ]);

        // Add remaining items with empty request info columns (merged visually)
        for (let i = 1; i < req.items.length; i++) {
          const item = req.items[i];
          worksheetData.push([
            '', // Request ID (empty for continuation)
            '', // Timestamp
            '', // Submitted By
            '', // DR Number
            '', // Client Name
            '', // Delivery Address
            '', // Delivery Date
            '', // Notes
            item.productName,
            item.category,
            item.size,
            item.quantity,
            item.unitPrice,
            item.total,
            '', // Request Total (empty for continuation)
          ]);
        }
      }
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
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
    XLSX.writeFile(workbook, 'nexabox_requests.xlsx');
    toast.success('Excel file downloaded successfully');
  };

  const exportToPDF = () => {
    const doc = new jsPDF('landscape'); // Use landscape for more columns
    
    // Title
    doc.setFontSize(18);
    doc.text('NexaBox Purchase Orders', 14, 15);
    
    // Summary info
    doc.setFontSize(11);
    doc.text(`Total Requests: ${requests.length}`, 14, 23);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 29);

    // Prepare table data with items
    const tableData: any[] = [];
    
    requests.forEach(req => {
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
          '₱' + req.totalValue.toFixed(2),
        ]);
      } else {
        // First item row with full request info
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
          '₱' + firstItem.total.toFixed(2),
          '₱' + req.totalValue.toFixed(2),
        ]);

        // Additional items (continuation rows)
        for (let i = 1; i < req.items.length; i++) {
          const item = req.items[i];
          tableData.push([
            '', // Empty ID
            '', // Empty timestamp
            '', // Empty submitted by
            '', // Empty DR number
            '', // Empty client name
            '', // Empty delivery address
            '', // Empty delivery date
            '', // Empty notes
            item.productName,
            item.size,
            item.quantity,
            '₱' + item.total.toFixed(2),
            '', // Empty total
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
        0: { cellWidth: 22 }, // Request ID
        1: { cellWidth: 22 }, // Date/Time
        2: { cellWidth: 20 }, // Submitted By
        3: { cellWidth: 15 }, // DR#
        4: { cellWidth: 20 }, // Client
        5: { cellWidth: 35 }, // Delivery Address
        6: { cellWidth: 18 }, // Delivery Date
        7: { cellWidth: 40 }, // Product
        8: { cellWidth: 15 }, // Size
        9: { cellWidth: 10 }, // Qty
        10: { cellWidth: 18 }, // Item Total
        11: { cellWidth: 20 }, // Request Total
      },
      margin: { top: 10, bottom: 10, left: 10, right: 10 },
      didDrawPage: function (data) {
        // Footer
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

    doc.save('nexabox_requests.pdf');
    toast.success('PDF file downloaded successfully');
  };

  const handleDeleteAll = async () => {
    if (demoMode) { toast.info('Demo mode — deletion disabled'); return; }
    const confirmation = window.prompt(
      `⚠️ WARNING: This will permanently delete ALL ${requests.length} requests from the database!\n\n` +
      'This action CANNOT be undone!\n\n' +
      'Type "DELETE ALL" to confirm:',
      ''
    );

    if (confirmation !== 'DELETE ALL') {
      if (confirmation !== null) {
        toast.error('Deletion cancelled - confirmation text did not match');
      }
      return;
    }

    try {
      const response = await fetch(`${apiBase}/requests/deleteAll`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete all requests');
      }

      toast.success('All requests deleted successfully');
      setSelectedIds(new Set());
      await fetchAllRequests();
      onDataChange();
    } catch (error) {
      console.error('Error deleting all requests:', error);
      toast.error('Failed to delete all requests');
    }
  };

  // Calculate estimated database storage usage
  const calculateStorageSize = () => {
    // Estimate size: each request = ~1KB base + items
    const estimatedSize = requests.reduce((total, req) => {
      const baseSize = 1000; // 1KB per request metadata
      const itemsSize = req.items.length * 200; // ~200 bytes per item
      return total + baseSize + itemsSize;
    }, 0);
    return estimatedSize;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const storageUsed = calculateStorageSize();
  const storageLimit = 500 * 1024 * 1024; // 500MB free tier limit (conservative estimate)
  const storagePercentage = (storageUsed / storageLimit) * 100;
  
  // Determine storage indicator color
  const storageColor = storagePercentage > 75 
    ? 'text-red-400' 
    : storagePercentage > 50 
    ? 'text-yellow-400' 
    : 'text-[#f97316]';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-[#141824] rounded-lg w-full max-w-7xl h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#1e2433]/50">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-[#f97316]" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Database Manager</h2>
              <p className="text-xs sm:text-sm text-gray-400">Manage all purchase orders</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Storage Indicator */}
            <div className="hidden md:flex items-center gap-2 bg-[#08090e] px-3 py-2 rounded-lg border border-[#1e2433]/50">
              <HardDrive className={`w-4 h-4 ${storageColor}`} />
              <div className="text-xs">
                <div className="text-gray-400">Storage</div>
                <div className="text-white font-semibold">
                  {formatBytes(storageUsed)} / {formatBytes(storageLimit)}
                </div>
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
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1e2433]/50 px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 sm:px-6 py-3 flex items-center gap-2 font-medium transition-all border-b-2 ${
              activeTab === 'browse'
                ? 'text-[#f97316] border-[#f97316]'
                : 'text-gray-400 border-transparent hover:text-gray-300'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Browse Records</span>
            <span className="sm:hidden">Browse</span>
            <span className="bg-gray-700/50 px-2 py-0.5 rounded-full text-xs">{requests.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 sm:px-6 py-3 flex items-center gap-2 font-medium transition-all border-b-2 ${
              activeTab === 'add'
                ? 'text-[#f97316] border-[#f97316]'
                : 'text-gray-400 border-transparent hover:text-gray-300'
            }`}
          >
            <FilePlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add New Request</span>
            <span className="sm:hidden">Add New</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'browse' ? (
            <>
              {/* Browse Tab - Filters */}
              <div className="p-4 sm:p-6 border-b border-[#1e2433]/50 bg-[#08090e]/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search by name, DR#, client, or product..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-[#08090e] border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-[#08090e] border-gray-600 text-white"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-400">
                      Showing <span className="text-white font-medium">{filteredRequests.length}</span> of {requests.length}
                    </span>
                    {selectedIds.size > 0 && (
                      <span className="text-[#f97316] font-semibold">
                        ({selectedIds.size} selected)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedIds.size > 0 && (
                      <>
                        <Button
                          onClick={handleSelectNone}
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs sm:text-sm"
                        >
                          Clear
                        </Button>
                        <Button
                          onClick={handleBulkDelete}
                          size="sm"
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500 text-xs sm:text-sm"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                          <span className="hidden sm:inline">Delete ({selectedIds.size})</span>
                          <span className="sm:hidden">Delete</span>
                        </Button>
                      </>
                    )}
                    {!selectedIds.size && filteredRequests.length > 0 && (
                      <Button
                        onClick={handleSelectAll}
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs sm:text-sm"
                      >
                        Select All
                      </Button>
                    )}
                    {(searchQuery || dateFilter) && (
                      <Button
                        onClick={clearFilters}
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs sm:text-sm"
                      >
                        Clear Filters
                      </Button>
                    )}
                    {requests.length > 0 && (
                      <Button
                        onClick={handleDeleteAll}
                        size="sm"
                        variant="outline"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/30 hover:border-red-500 text-xs sm:text-sm"
                      >
                        <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Delete All</span>
                        <span className="sm:hidden">Del All</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Browse Tab - Records List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f97316]"></div>
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Database className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">
                      {requests.length === 0 ? 'No requests in database' : 'No matching records found'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredRequests.map((request) => (
                      <div
                        key={request.id}
                        className="bg-[#08090e] rounded-lg border border-[#1e2433]/50 hover:border-gray-600 transition-all"
                      >
                        {editingId === request.id ? (
                          // Edit Mode
                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              <div>
                                <Label className="text-gray-400 text-xs mb-1 block">Submitted By *</Label>
                                <Input
                                  value={editForm.submittedBy || ''}
                                  onChange={(e) => setEditForm({ ...editForm, submittedBy: e.target.value })}
                                  className="bg-[#141824] border-gray-600 text-white text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-400 text-xs mb-1 block">DR Number *</Label>
                                <Input
                                  value={editForm.drNumber || ''}
                                  onChange={(e) => setEditForm({ ...editForm, drNumber: e.target.value })}
                                  className="bg-[#141824] border-gray-600 text-white text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-400 text-xs mb-1 block">Client Name</Label>
                                <Input
                                  value={editForm.clientName || ''}
                                  onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })}
                                  className="bg-[#141824] border-gray-600 text-white text-sm"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <Label className="text-gray-400 text-xs mb-1 block">Delivery Address</Label>
                                <Input
                                  value={editForm.deliveryAddress || ''}
                                  onChange={(e) => setEditForm({ ...editForm, deliveryAddress: e.target.value })}
                                  placeholder="Enter delivery address..."
                                  className="bg-[#141824] border-gray-600 text-white text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-400 text-xs mb-1 block">Delivery Date</Label>
                                <Input
                                  type="date"
                                  value={editForm.deliveryDate || ''}
                                  onChange={(e) => setEditForm({ ...editForm, deliveryDate: e.target.value })}
                                  className="bg-[#141824] border-gray-600 text-white text-sm"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-gray-400 text-xs mb-1 block">Additional Notes</Label>
                              <Textarea
                                value={editForm.notes || ''}
                                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                placeholder="Add special instructions or comments..."
                                className="bg-[#141824] border-gray-600 text-white text-sm min-h-[80px] resize-y"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-gray-300 text-sm">Items ({editForm.items?.length || 0})</Label>
                                <Button
                                  onClick={() => {
                                    setProductSelectorMode('edit');
                                    setShowProductSelector(true);
                                  }}
                                  size="sm"
                                  className="bg-[#f97316] hover:bg-[#ea6a09] text-white h-7 text-xs"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Products
                                </Button>
                              </div>
                              {editForm.items && editForm.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3 bg-[#141824] p-2 rounded text-sm"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="text-white font-medium truncate">{item.productName}</div>
                                    <div className="text-gray-400 text-xs">{item.category} • {item.size}</div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) => handleEditItemQuantity(idx, e.target.value)}
                                      className="bg-[#08090e] border-gray-600 text-white text-sm w-16 h-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      min="1"
                                    />
                                    <span className="text-[#f97316] font-semibold text-sm min-w-[70px] text-right">
                                      ₱{item.total.toFixed(2)}
                                    </span>
                                    <Button
                                      onClick={() => handleRemoveEditItem(idx)}
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-[#1e2433]">
                              <div className="text-sm">
                                <span className="text-gray-400">Total: </span>
                                <span className="text-[#f97316] text-lg font-bold">₱{getEditTotalValue().toFixed(2)}</span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={handleCancelEdit}
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleSaveEdit(request.id)}
                                  size="sm"
                                  className="bg-[#f97316] hover:bg-[#ea6a09] text-white"
                                >
                                  <Save className="w-3 h-3 mr-1" />
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <div className="p-4">
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => handleSelect(request.id)}
                                className="mt-1 flex-shrink-0"
                              >
                                {selectedIds.has(request.id) ? (
                                  <CheckSquare className="w-5 h-5 text-[#f97316]" />
                                ) : (
                                  <Square className="w-5 h-5 text-gray-600 hover:text-gray-400" />
                                )}
                              </button>

                              <div className="flex-1 min-w-0 space-y-3">
                                {/* Header Info */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
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
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[#f97316]" />
                                    <span className="text-[#f97316] text-sm font-semibold">
                                      DR# {request.drNumber || 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-400 text-sm">{request.submittedBy}</span>
                                  </div>
                                  {request.clientName && (
                                    <div className="text-gray-400 text-sm">
                                      Client: <span className="text-white">{request.clientName}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Delivery Information */}
                                {(request.deliveryAddress || request.deliveryDate || request.notes) && (
                                  <div className="bg-[#141824]/30 rounded p-3 space-y-2">
                                    {request.deliveryAddress && (
                                      <div className="flex items-start gap-2">
                                        <span className="text-gray-400 text-xs font-medium min-w-[100px]">Delivery Address:</span>
                                        <span className="text-white text-xs flex-1">{request.deliveryAddress}</span>
                                      </div>
                                    )}
                                    {request.deliveryDate && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-400 text-xs font-medium min-w-[100px]">Delivery Date:</span>
                                        <span className="text-white text-xs">
                                          {new Date(request.deliveryDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                          })}
                                        </span>
                                      </div>
                                    )}
                                    {request.notes && (
                                      <div className="flex items-start gap-2">
                                        <span className="text-gray-400 text-xs font-medium min-w-[100px]">Notes:</span>
                                        <span className="text-white text-xs flex-1 italic">{request.notes}</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Items Summary */}
                                <div className="bg-[#141824]/50 rounded p-3 space-y-1.5">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Package className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-400 text-xs font-medium">
                                      {request.items.length} {request.items.length === 1 ? 'Item' : 'Items'}
                                    </span>
                                  </div>
                                  {request.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                      <div className="flex-1 min-w-0">
                                        <span className="text-white font-medium">{item.productName}</span>
                                        <span className="text-gray-500 text-xs ml-2">
                                          {item.size} × {item.quantity}
                                        </span>
                                      </div>
                                      <span className="text-[#f97316] font-semibold ml-2">₱{item.total.toFixed(2)}</span>
                                    </div>
                                  ))}
                                  <div className="flex justify-between items-center pt-2 border-t border-[#1e2433] mt-2">
                                    <span className="text-gray-400 text-sm">Total Value</span>
                                    <span className="text-[#f97316] text-lg font-bold">₱{request.totalValue.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <Button
                                  onClick={() => handleEdit(request)}
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-600 text-gray-300 hover:bg-gray-700 h-8"
                                >
                                  <Edit2 className="w-3 h-3 sm:mr-1" />
                                  <span className="hidden sm:inline">Edit</span>
                                </Button>
                                <Button
                                  onClick={() => handleDelete(request.id, request.drNumber)}
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500 h-8"
                                >
                                  <Trash2 className="w-3 h-3 sm:mr-1" />
                                  <span className="hidden sm:inline">Delete</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            // Add New Request Tab
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-[#08090e]/30 rounded-lg p-4 sm:p-6 border border-[#1e2433]/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#f97316]" />
                    Request Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        Submitted By <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        value={newRequestForm.submittedBy}
                        onChange={(e) => setNewRequestForm({ ...newRequestForm, submittedBy: e.target.value })}
                        placeholder="Enter name..."
                        className="bg-[#141824] border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">
                        DR Number <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        value={newRequestForm.drNumber}
                        onChange={(e) => setNewRequestForm({ ...newRequestForm, drNumber: e.target.value })}
                        placeholder="Enter DR#..."
                        className="bg-[#141824] border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">Client Name</Label>
                      <Input
                        value={newRequestForm.clientName}
                        onChange={(e) => setNewRequestForm({ ...newRequestForm, clientName: e.target.value })}
                        placeholder="Optional..."
                        className="bg-[#141824] border-gray-600 text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-gray-300 text-sm mb-2 block">Delivery Address</Label>
                      <Input
                        value={newRequestForm.deliveryAddress}
                        onChange={(e) => setNewRequestForm({ ...newRequestForm, deliveryAddress: e.target.value })}
                        placeholder="Enter delivery address..."
                        className="bg-[#141824] border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-sm mb-2 block">Delivery Date</Label>
                      <Input
                        type="date"
                        value={newRequestForm.deliveryDate}
                        onChange={(e) => setNewRequestForm({ ...newRequestForm, deliveryDate: e.target.value })}
                        className="bg-[#141824] border-gray-600 text-white"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Label className="text-gray-300 text-sm mb-2 block">Additional Notes (Optional)</Label>
                      <Textarea
                        value={newRequestForm.notes}
                        onChange={(e) => setNewRequestForm({ ...newRequestForm, notes: e.target.value })}
                        placeholder="Add special instructions, preferences, or comments..."
                        className="bg-[#141824] border-gray-600 text-white min-h-[100px] resize-y"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#08090e]/30 rounded-lg p-4 sm:p-6 border border-[#1e2433]/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#f97316]" />
                      Products ({newRequestForm.items.length})
                    </h3>
                    <Button
                      onClick={() => {
                        setProductSelectorMode('add');
                        setShowProductSelector(true);
                      }}
                      className="bg-[#f97316] hover:bg-[#ea6a09] text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Products
                    </Button>
                  </div>

                  {newRequestForm.items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No items added yet. Click "Add Products" to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {newRequestForm.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 bg-[#141824] p-3 rounded"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium">{item.productName}</div>
                            <div className="text-gray-400 text-sm">
                              {item.category} • {item.size} × {item.quantity}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-gray-400 text-xs">₱{item.unitPrice.toFixed(2)} each</div>
                            <div className="text-[#f97316] font-semibold">₱{item.total.toFixed(2)}</div>
                          </div>
                          <Button
                            onClick={() => handleRemoveNewRequestItem(idx)}
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-3 border-t border-[#1e2433]">
                        <span className="text-gray-300 font-medium">Total Value</span>
                        <span className="text-[#f97316] text-2xl font-bold">
                          ₱{getNewRequestTotalValue().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    onClick={() => {
                      setNewRequestForm({
                        submittedBy: '',
                        drNumber: '',
                        clientName: '',
                        deliveryAddress: '',
                        deliveryDate: '',
                        notes: '',
                        items: [],
                      });
                      setActiveTab('browse');
                    }}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddRequest}
                    disabled={!newRequestForm.submittedBy || !newRequestForm.drNumber || newRequestForm.items.length === 0}
                    className="bg-[#f97316] hover:bg-[#ea6a09] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Request
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Selector Modal */}
      <ProductSelectorModal
        isOpen={showProductSelector}
        onClose={() => setShowProductSelector(false)}
        products={products}
        onSelect={handleProductSelectorSelect}
        onSelectMultiple={handleProductSelectorSelectMultiple}
      />
    </div>
  );
}