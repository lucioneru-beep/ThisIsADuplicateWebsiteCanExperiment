import { useState, useEffect } from 'react';
import { AlertCircle, Settings, Database, Plus, PackageSearch } from 'lucide-react';
import { LandingPage } from './components/LandingPage';
import { UserFormView } from './components/UserFormView';
import { ProductSearchForm } from './components/ProductSearchForm';
import { ProductCatalogInfo } from './components/ProductCatalogInfo';
import { StockManagementModal } from './components/StockManagementModal';
import { CategoryBrowserModal } from './components/CategoryBrowserModal';
import { DatabaseManagerModal } from './components/DatabaseManagerModal';
import { AddProductModal } from './components/AddProductModal';
import { ProductManagerModal } from './components/ProductManagerModal';
import { RequestsOverviewTable } from './components/RequestsOverviewTable';
import { AdminRequestCart } from './components/AdminRequestCart';
import { Product, RequestItem } from './types';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import * as XLSX from 'xlsx';
import { NexaBoxLogo } from './components/NexaBoxLogo';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-63cffc09`;

// Portfolio demo mode — submissions show a success UI but nothing is saved to the database
const DEMO_MODE = true;

type AppMode = 'landing' | 'user-view' | 'admin-view';

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('landing');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [currentRequest, setCurrentRequest] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isProductManagerOpen, setIsProductManagerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [requestCount, setRequestCount] = useState(0);
  const [lastCheckedTime, setLastCheckedTime] = useState<number>(Date.now());
  const [isResettingInventory, setIsResettingInventory] = useState(false);
  const [showDatabaseManager, setShowDatabaseManager] = useState(false);

  // Fetch inventory data
  useEffect(() => {
    if (appMode === 'admin-view' || appMode === 'user-view') {
      fetchInventory();
    }
  }, [appMode]);

  // Poll for new requests when admin is logged in
  useEffect(() => {
    if (appMode === 'admin-view') {
      // Initial fetch
      fetchRequestCount();
      
      // Poll every 10 seconds
      const interval = setInterval(() => {
        fetchRequestCount();
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [appMode]);

  const fetchRequestCount = async () => {
    try {
      const response = await fetch(`${API_BASE}/requests/all`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const previousCount = requestCount;
        setRequestCount(data.length);
        
        // Show notification if new requests arrived
        if (previousCount > 0 && data.length > previousCount) {
          const newCount = data.length - previousCount;
          toast.success(`${newCount} new request${newCount > 1 ? 's' : ''} received!`, {
            duration: 5000,
          });
        }
      }
    } catch (err) {
      console.error('Error fetching request count:', err);
    }
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/inventory`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inventory data');
      }

      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory data. Please refresh the page.');
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToRequest = (item: RequestItem) => {
    console.log('handleAddToRequest called with item:', item);
    console.log('Current request before:', currentRequest);
    setCurrentRequest([...currentRequest, item]);
    toast.success(`Added ${item.productName} to request`);
  };

  const handleRemoveItem = (index: number) => {
    const newRequest = [...currentRequest];
    const removedItem = newRequest.splice(index, 1)[0];
    setCurrentRequest(newRequest);
    toast.info(`Removed ${removedItem.productName} from request`);
  };

  const handleSubmit = async (submittedBy: string, drNumber: string, clientName: string, deliveryAddress: string, deliveryDate: string, notes?: string) => {
    if (DEMO_MODE) {
      toast.success('Request submitted! (Demo mode — nothing was saved)');
      setCurrentRequest([]);
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          items: currentRequest,
          submittedBy,
          drNumber,
          clientName,
          deliveryAddress,
          deliveryDate,
          notes: notes || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit request');
      }

      const result = await response.json();
      
      toast.success('Request submitted successfully!');
      setCurrentRequest([]);
      
      // Refresh inventory to show updated stock levels
      await fetchInventory();
      
      // Refresh request count to update the "All Submitted Requests" table
      await fetchRequestCount();
    } catch (err) {
      console.error('Error submitting request:', err);
      toast.error('Failed to submit request. Please try again.');
    }
  };

  const handleExport = async (startDate: string) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);

      const response = await fetch(`${API_BASE}/export?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const data = await response.json();

      if (data.length === 0) {
        toast.info('No data found for the selected date');
        return;
      }

      // Format data for Excel
      const excelData = data.map((row: any, index: number) => ({
        '#': index + 1,
        'Date': new Date(row.timestamp).toLocaleDateString(),
        'Time': new Date(row.timestamp).toLocaleTimeString(),
        'DR Number': row.drNumber || 'N/A',
        'Client Name': row.clientName || 'N/A',
        'Submitted By': row.submittedBy,
        'Product Name': row.productName,
        'Category': row.category,
        'Size': row.size,
        'Quantity': row.quantity,
        'Unit Price': `₱${row.unitPrice.toFixed(2)}`,
        'Total Value': `₱${row.totalValue.toFixed(2)}`,
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample Requests');

      const filename = `NexaBox_Requests_${startDate}.xlsx`;
      XLSX.writeFile(workbook, filename);

      toast.success(`Exported ${data.length} record(s) for ${startDate}`);
    } catch (err) {
      console.error('Error exporting data:', err);
      toast.error('Failed to export data. Please try again.');
    }
  };

  const handleUpdateStock = async (productId: string, size: string, newStock: number) => {
    if (DEMO_MODE) {
      // Update locally only — nothing persisted
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, sizes: p.sizes.map((s: any) => s.size === size ? { ...s, stock: newStock } : s) } : p));
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/inventory/update-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ productId, size, newStock }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update stock');
      }

      await fetchInventory();
    } catch (err) {
      console.error('Error updating stock:', err);
      throw err;
    }
  };

  const handleUpdatePrice = async (productId: string, size: string, newPrice: number) => {
    if (DEMO_MODE) {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, sizes: p.sizes.map((s: any) => s.size === size ? { ...s, price: newPrice } : s) } : p));
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/inventory/update-price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ productId, size, newPrice }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update price');
      }

      await fetchInventory();
    } catch (err) {
      console.error('Error updating price:', err);
      throw err;
    }
  };

  const handleResetInventory = async () => {
    if (DEMO_MODE) {
      toast.info('Demo mode — inventory reset is disabled');
      return;
    }
    if (!confirm('⚠️ WARNING: This will reset all products to their default values and overwrite any custom products you added. Are you sure you want to continue?')) {
      return;
    }

    try {
      setIsResettingInventory(true);
      toast.info('Resetting inventory to default products...');

      const response = await fetch(`${API_BASE}/admin/reset-inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset inventory');
      }

      toast.success('Inventory reset successfully! All separated products are now loaded.');
      await fetchInventory();
    } catch (err) {
      console.error('Error resetting inventory:', err);
      toast.error('Failed to reset inventory. Please try again.');
    } finally {
      setIsResettingInventory(false);
    }
  };

  // Calculate category statistics
  const categoryStats = products.reduce((acc, product) => {
    const existing = acc.find(c => c.name === product.category);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ name: product.category, count: 1 });
    }
    return acc;
  }, [] as { name: string; count: number }[]);

  // Landing Page
  if (appMode === 'landing') {
    return (
      <>
        <Toaster position="top-right" />
        <LandingPage
          onSelectUserMode={() => setAppMode('user-view')}
          onSelectAdminMode={() => setAppMode('admin-view')}
        />
      </>
    );
  }

  // User View (Form Only)
  if (appMode === 'user-view') {
    return (
      <>
        <Toaster position="top-right" />
        <UserFormView
          userName={userName}
          userEmail={userEmail}
          onLogout={() => {
            setAppMode('landing');
            setUserName('');
            setUserEmail('');
            setCurrentRequest([]);
          }}
          apiBase={API_BASE}
          authToken={publicAnonKey}
          demoMode={DEMO_MODE}
        />
      </>
    );
  }

  // Admin View (Full Dashboard)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090e] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f97316] mx-auto"></div>
          <p className="text-gray-400">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#08090e] flex items-center justify-center">
        <div className="bg-[#141824] rounded-lg p-8 max-w-md text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Error Loading Data</h2>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={fetchInventory}
            className="bg-[#f97316] hover:bg-[#ea6a09] text-white px-6 py-2 rounded-md font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090e] text-white">
      <Toaster position="top-right" />
      {DEMO_MODE && (
        <div className="bg-violet-600 text-white text-center text-sm font-medium py-2 px-4" style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>
          PORTFOLIO DEMO — reads are live, all writes are blocked
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <header className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <NexaBoxLogo size="md" />
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              onClick={() => setIsStockModalOpen(true)}
              className="bg-[#f97316] hover:bg-[#ea6a09] text-white flex-1 sm:flex-initial"
            >
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Manage Stock</span>
              <span className="sm:hidden">Stock</span>
            </Button>
            <Button
              onClick={() => setIsDatabaseModalOpen(true)}
              className="bg-[#f97316] hover:bg-[#fb923c] text-white flex-1 sm:flex-initial relative transition-all duration-200"
            >
              <Database className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Manage Database</span>
              <span className="sm:hidden">Database</span>
              {requestCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                  {requestCount}
                </span>
              )}
            </Button>
            <Button
              onClick={() => {
                toast.info('You have been logged out');
                setAppMode('landing');
                setCurrentRequest([]);
              }}
              variant="outline"
              className="border-[#f97316] text-[#f97316] hover:bg-[#f97316]/20 flex-1 sm:flex-initial font-semibold"
            >
              Logout
            </Button>
          </div>
        </div>
        <p className="text-[#475569] text-xs tracking-[0.2em] uppercase mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Admin Dashboard · Electronics Distribution</p>
      </header>

      {/* Stock Management Modal */}
      <StockManagementModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        products={products}
        onUpdateStock={handleUpdateStock}
        onUpdatePrice={handleUpdatePrice}
      />

      {/* Category Browser Modal */}
      <CategoryBrowserModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        category={selectedCategory}
        products={products}
        onAddToRequest={handleAddToRequest}
      />

      {/* Database Manager Modal */}
      <DatabaseManagerModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
        apiBase={API_BASE}
        authToken={publicAnonKey}
        onDataChange={() => {
          fetchInventory();
          fetchRequestCount();
        }}
        products={products}
        demoMode={DEMO_MODE}
      />

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        apiBase={API_BASE}
        authToken={publicAnonKey}
        onProductAdded={fetchInventory}
        existingCategories={[...new Set(products.map(p => p.category))]}
        demoMode={DEMO_MODE}
      />

      {/* Product Manager Modal */}
      <ProductManagerModal
        isOpen={isProductManagerOpen}
        onClose={() => setIsProductManagerOpen(false)}
        apiBase={API_BASE}
        authToken={publicAnonKey}
        products={products}
        onProductsChanged={fetchInventory}
        demoMode={DEMO_MODE}
      />

      {/* Main Dashboard */}
      <div className="space-y-6 sm:space-y-8">
        {/* Top Section - Product Catalog and Search */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductCatalogInfo 
            totalProducts={products.length} 
            categories={categoryStats}
            onCategoryClick={(category) => {
              setSelectedCategory(category);
              setIsCategoryModalOpen(true);
            }}
            onAddProductClick={() => setIsAddProductModalOpen(true)}
            onManageProductsClick={() => setIsProductManagerOpen(true)}
            onResetInventory={handleResetInventory}
            isResetting={isResettingInventory}
          />
          <ProductSearchForm products={products} onAddToRequest={handleAddToRequest} />
        </div>

        {/* Middle Section - Current Request Cart */}
        <AdminRequestCart
          items={currentRequest}
          onRemoveItem={handleRemoveItem}
          onSubmit={handleSubmit}
        />

        {/* Bottom Section - All Submitted Requests (Full Width) */}
        <RequestsOverviewTable
          apiBase={API_BASE}
          authToken={publicAnonKey}
          refreshTrigger={requestCount}
          onManageDatabase={() => setIsDatabaseModalOpen(true)}
        />
      </div>
    </div>
    </div>
  );
}