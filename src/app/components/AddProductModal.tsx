import { useState } from 'react';
import { X, Plus, Trash2, Package, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface ProductSize {
  size: string;
  price: number;
  stock: number;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
  authToken: string;
  onProductAdded: () => void;
  existingCategories?: string[];
  demoMode?: boolean;
}

export function AddProductModal({
  isOpen,
  onClose,
  apiBase,
  authToken,
  onProductAdded,
  existingCategories = [],
  demoMode = false,
}: AddProductModalProps) {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState<string>('SMART HOME');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [sizes, setSizes] = useState<ProductSize[]>([
    { size: '', price: 0, stock: 0 }
  ]);
  const [loading, setLoading] = useState(false);

  // Default categories + existing categories from products
  const defaultCategories = ['SMART HOME', 'AUDIO', 'PERIPHERALS'];
  const allCategories = [...new Set([...defaultCategories, ...existingCategories])];

  const finalCategory = isCustomCategory ? customCategory : category;

  if (!isOpen) return null;

  const handleAddSize = () => {
    setSizes([...sizes, { size: '', price: 0, stock: 0 }]);
  };

  const handleRemoveSize = (index: number) => {
    if (sizes.length === 1) {
      toast.error('Product must have at least one size');
      return;
    }
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const handleSizeChange = (index: number, field: keyof ProductSize, value: string | number) => {
    const newSizes = [...sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setSizes(newSizes);
  };

  const handleSubmit = async () => {
    // Validation
    if (!productName.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    if (isCustomCategory && !customCategory.trim()) {
      toast.error('Please enter a custom category name');
      return;
    }

    if (!isCustomCategory && !category.trim()) {
      toast.error('Please select a category');
      return;
    }

    if (sizes.length === 0) {
      toast.error('Please add at least one size');
      return;
    }

    for (const size of sizes) {
      if (!size.size.trim()) {
        toast.error('All sizes must have a size name');
        return;
      }
      if (size.price <= 0) {
        toast.error('All prices must be greater than 0');
        return;
      }
      if (size.stock < 0) {
        toast.error('Stock cannot be negative');
        return;
      }
    }

    if (demoMode) { toast.info('Demo mode — adding products is disabled'); return; }
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/inventory/add-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: productName.trim(),
          category: finalCategory.trim().toUpperCase(),
          sizes: sizes.map(s => ({
            size: s.size.trim(),
            price: parseFloat(s.price.toString()),
            stock: parseInt(s.stock.toString())
          }))
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add product');
      }

      toast.success(`Product "${productName}" added successfully!`);

      // Reset form
      setProductName('');
      setCategory('SMART HOME');
      setCustomCategory('');
      setIsCustomCategory(false);
      setSizes([{ size: '', price: 0, stock: 0 }]);
      
      // Notify parent to refresh inventory
      onProductAdded();
      onClose();
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast.error(error.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#141824] rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-[#1e2433] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1e2433]">
          <div className="flex items-center gap-3">
            <div className="bg-[#f97316]/20 p-2 rounded-lg">
              <Package className="w-6 h-6 text-[#f97316]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Add New Product</h2>
              <p className="text-sm text-gray-400">Create a new product entry in the inventory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Product Name */}
          <div>
            <Label htmlFor="product-name" className="text-gray-300 text-sm mb-2 block">
              Product Name *
            </Label>
            <Input
              id="product-name"
              type="text"
              placeholder="e.g., All Purpose Liquid Cleaner"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="bg-[#08090e] border-gray-600 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Category */}
          <div>
            <Label className="text-gray-300 text-sm mb-2 block">
              Category *
            </Label>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {allCategories.slice(0, 6).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setIsCustomCategory(false);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      !isCustomCategory && category === cat
                        ? 'border-[#f97316] bg-[#f97316]/20 text-white'
                        : 'border-gray-600 bg-[#08090e] text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <span className="font-medium text-sm">{cat}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsCustomCategory(!isCustomCategory)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                    isCustomCategory
                      ? 'border-[#f97316] bg-[#f97316]/20 text-white'
                      : 'border-gray-600 bg-[#08090e] text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {isCustomCategory ? '✓ Custom Category' : '+ Add New Category'}
                </button>
                {isCustomCategory && (
                  <Input
                    type="text"
                    placeholder="Enter new category name"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="bg-[#08090e] border-gray-600 text-white placeholder:text-gray-500 flex-1"
                  />
                )}
              </div>

              {isCustomCategory && (
                <p className="text-xs text-gray-500">
                  💡 The new category will be available for future products once created
                </p>
              )}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-gray-300 text-sm">
                Product Sizes *
              </Label>
              <Button
                onClick={handleAddSize}
                className="bg-[#f97316] hover:bg-[#ea6a09] text-white text-sm px-3 py-1"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Size
              </Button>
            </div>

            <div className="space-y-3">
              {sizes.map((size, index) => (
                <div
                  key={index}
                  className="bg-[#08090e] border border-[#1e2433] rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor={`size-name-${index}`} className="text-gray-400 text-xs mb-1 block">
                          Size Name
                        </Label>
                        <Input
                          id={`size-name-${index}`}
                          type="text"
                          placeholder="e.g., Gallon"
                          value={size.size}
                          onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                          className="bg-[#141824] border-gray-600 text-white placeholder:text-gray-600 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`size-price-${index}`} className="text-gray-400 text-xs mb-1 block">
                          Unit Price (₱)
                        </Label>
                        <Input
                          id={`size-price-${index}`}
                          type="number"
                          placeholder="250"
                          min="0"
                          step="0.01"
                          value={size.price || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') {
                              handleSizeChange(index, 'price', 0);
                            } else {
                              const num = parseFloat(val);
                              if (!isNaN(num)) {
                                handleSizeChange(index, 'price', num);
                              }
                            }
                          }}
                          className="bg-[#141824] border-gray-600 text-white placeholder:text-gray-600 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`size-stock-${index}`} className="text-gray-400 text-xs mb-1 block">
                          Initial Stock
                        </Label>
                        <Input
                          id={`size-stock-${index}`}
                          type="number"
                          placeholder="50"
                          min="0"
                          step="1"
                          value={size.stock || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') {
                              handleSizeChange(index, 'stock', 0);
                            } else {
                              const num = parseInt(val);
                              if (!isNaN(num)) {
                                handleSizeChange(index, 'stock', num);
                              }
                            }
                          }}
                          className="bg-[#141824] border-gray-600 text-white placeholder:text-gray-600 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                    {sizes.length > 1 && (
                      <button
                        onClick={() => handleRemoveSize(index)}
                        className="text-red-400 hover:text-red-300 transition-colors mt-5"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 text-sm">
              💡 <strong>Tip:</strong> After adding this product, it will automatically appear in both the admin inventory management and the client product selection portal.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#1e2433] p-6 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-[#f97316] hover:bg-[#ea6a09] text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding Product...
              </>
            ) : (
              <>
                <Package className="w-4 h-4 mr-2" />
                Add Product
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}