import { useState } from 'react';
import { X, Package2, Search, Save, Plus, Minus, DollarSign } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Product } from '../types';
import { toast } from 'sonner';

interface StockManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateStock: (productId: string, size: string, newStock: number) => Promise<void>;
  onUpdatePrice: (productId: string, size: string, newPrice: number) => Promise<void>;
}

export function StockManagementModal({
  isOpen,
  onClose,
  products,
  onUpdateStock,
  onUpdatePrice,
}: StockManagementModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [adjustments, setAdjustments] = useState<{
    [productId: string]: { [size: string]: number };
  }>({});
  const [priceAdjustments, setPriceAdjustments] = useState<{
    [productId: string]: { [size: string]: number };
  }>({});
  const [saving, setSaving] = useState(false);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCurrentStock = (productId: string, size: string, originalStock: number) => {
    return adjustments[productId]?.[size] ?? originalStock;
  };

  const getCurrentPrice = (productId: string, size: string, originalPrice: number) => {
    return priceAdjustments[productId]?.[size] ?? originalPrice;
  };

  const handleAdjustment = (
    productId: string,
    size: string,
    currentValue: number,
    change: number
  ) => {
    const newValue = Math.max(0, currentValue + change);
    setAdjustments((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [size]: newValue,
      },
    }));
  };

  const handleDirectInput = (productId: string, size: string, value: string) => {
    // Allow empty string for clearing
    if (value === '') {
      setAdjustments((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          [size]: 0,
        },
      }));
      return;
    }
    
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setAdjustments((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          [size]: numValue,
        },
      }));
    }
  };

  const handlePriceInput = (productId: string, size: string, value: string) => {
    // Allow empty string for clearing
    if (value === '') {
      setPriceAdjustments((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          [size]: 0,
        },
      }));
      return;
    }
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setPriceAdjustments((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          [size]: numValue,
        },
      }));
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Save stock adjustments
      for (const [productId, sizes] of Object.entries(adjustments)) {
        for (const [size, stock] of Object.entries(sizes)) {
          await onUpdateStock(productId, size, stock);
        }
      }

      // Save price adjustments
      for (const [productId, sizes] of Object.entries(priceAdjustments)) {
        for (const [size, price] of Object.entries(sizes)) {
          await onUpdatePrice(productId, size, price);
        }
      }

      toast.success('All changes saved successfully!');
      setAdjustments({});
      setPriceAdjustments({});
      onClose();
    } catch (error) {
      toast.error('Failed to save changes');
      console.error('Error saving changes:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const hasChanges = Object.keys(adjustments).length > 0 || Object.keys(priceAdjustments).length > 0;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-[#141824] rounded-lg w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#1e2433] flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Package2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#f97316]" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Stock Management</h2>
              <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Adjust inventory levels for all products</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:p-6 border-b border-[#1e2433]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 sm:pl-10 bg-[#08090e] border-gray-600 text-white placeholder-gray-500 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Products List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package2 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm sm:text-base">No products found</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#08090e] rounded-lg p-3 sm:p-4 border border-[#1e2433]"
                >
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div>
                      <h3 className="text-white font-semibold text-sm sm:text-base">{product.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-400">{product.category}</p>
                    </div>
                    {adjustments[product.id] && (
                      <span className="text-xs bg-[#f97316]/20 text-[#f97316] px-2 py-1 rounded">
                        Modified
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {product.sizes.map((sizeInfo) => {
                      const currentStock = getCurrentStock(
                        product.id,
                        sizeInfo.size,
                        sizeInfo.stock
                      );
                      const currentPrice = getCurrentPrice(
                        product.id,
                        sizeInfo.size,
                        sizeInfo.price
                      );
                      const hasStockChanged = adjustments[product.id]?.[sizeInfo.size] !== undefined;
                      const hasPriceChanged = priceAdjustments[product.id]?.[sizeInfo.size] !== undefined;

                      return (
                        <div
                          key={sizeInfo.size}
                          className={`flex flex-col gap-2 p-3 rounded ${
                            hasStockChanged || hasPriceChanged ? 'bg-[#f97316]/10 border border-[#f97316]/30' : 'bg-[#141824]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium text-sm sm:text-base">{sizeInfo.size}</span>
                            {(hasStockChanged || hasPriceChanged) && (
                              <span className="text-xs bg-[#f97316]/30 text-[#f97316] px-2 py-1 rounded">
                                Modified
                              </span>
                            )}
                          </div>

                          {/* Stock Management */}
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-xs w-16">Stock:</span>
                            <div className="flex items-center gap-1 sm:gap-2 flex-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleAdjustment(product.id, sizeInfo.size, currentStock, -10)
                                }
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 border-gray-600 hover:bg-red-500/20 hover:border-red-500"
                              >
                                <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleAdjustment(product.id, sizeInfo.size, currentStock, -1)
                                }
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 border-gray-600 hover:bg-red-500/20 hover:border-red-500 text-xs"
                              >
                                -1
                              </Button>

                              <Input
                                type="number"
                                min="0"
                                value={currentStock}
                                onChange={(e) =>
                                  handleDirectInput(product.id, sizeInfo.size, e.target.value)
                                }
                                className="w-16 sm:w-20 text-center bg-[#08090e] border-gray-600 text-white text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleAdjustment(product.id, sizeInfo.size, currentStock, 1)
                                }
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 border-gray-600 hover:bg-[#f97316]/30 hover:border-[#f97316] text-xs"
                              >
                                +1
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleAdjustment(product.id, sizeInfo.size, currentStock, 10)
                                }
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 border-gray-600 hover:bg-[#f97316]/30 hover:border-[#f97316]"
                              >
                                <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </Button>
                            </div>
                            {hasStockChanged && (
                              <div className="text-xs text-gray-400 ml-2">
                                <span className="line-through">{sizeInfo.stock}</span>
                                <span className="text-[#f97316] ml-1">→ {currentStock}</span>
                              </div>
                            )}
                          </div>

                          {/* Price Management */}
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-xs w-16">Price:</span>
                            <div className="relative flex-1 max-w-[200px]">
                              <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={currentPrice}
                                onChange={(e) =>
                                  handlePriceInput(product.id, sizeInfo.size, e.target.value)
                                }
                                className="pl-7 bg-[#08090e] border-gray-600 text-white text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                            {hasPriceChanged && (
                              <div className="text-xs text-gray-400 ml-2">
                                <span className="line-through">₱{sizeInfo.price.toFixed(2)}</span>
                                <span className="text-[#f97316] ml-1">→ ₱{currentPrice.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-[#1e2433] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
            {hasChanges ? (
              <span className="text-[#f97316]">
                {Object.values(adjustments).reduce((acc, sizes) => acc + Object.keys(sizes).length, 0)} item(s) modified
              </span>
            ) : (
              <span>No changes made</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-initial border-gray-600 text-gray-300 hover:bg-[#08090e]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAll}
              disabled={!hasChanges || saving}
              className="flex-1 sm:flex-initial bg-[#f97316] hover:bg-[#ea6a09] text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}