import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit3, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Product } from '../types';

interface ProductSize {
  size: string;
  price: number;
  stock: number;
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  apiBase: string;
  authToken: string;
  onProductUpdated: () => void;
}

export function EditProductModal({
  isOpen,
  onClose,
  product,
  apiBase,
  authToken,
  onProductUpdated
}: EditProductModalProps) {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState<'NATUREZYME' | 'PETZYME' | 'BIOZYME'>('NATUREZYME');
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize form with product data
  useEffect(() => {
    if (product) {
      setProductName(product.name);
      setCategory(product.category as 'NATUREZYME' | 'PETZYME' | 'BIOZYME');
      setSizes([...product.sizes]);
    }
  }, [product]);

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

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/inventory/edit-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          productId: product.id,
          name: productName.trim(),
          category,
          sizes: sizes.map(s => ({
            size: s.size.trim(),
            price: parseFloat(s.price.toString()),
            stock: parseInt(s.stock.toString())
          }))
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update product');
      }

      toast.success(`Product "${productName}" updated successfully!`);
      
      // Notify parent to refresh inventory
      onProductUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2d2d2d] rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-gray-700 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Edit3 className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Edit Product</h2>
              <p className="text-sm text-gray-400">Update product information and availability</p>
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
              className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Category */}
          <div>
            <Label className="text-gray-300 text-sm mb-2 block">
              Category *
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {(['NATUREZYME', 'PETZYME', 'BIOZYME'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    category === cat
                      ? 'border-[#2d8659] bg-[#2d8659]/20 text-white'
                      : 'border-gray-600 bg-[#1a1a1a] text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <span className="font-medium">{cat}</span>
                </button>
              ))}
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
                className="bg-[#2d8659] hover:bg-[#238b4d] text-white text-sm px-3 py-1"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Size
              </Button>
            </div>

            <div className="space-y-3">
              {sizes.map((size, index) => (
                <div
                  key={index}
                  className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4"
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
                          className="bg-[#2d2d2d] border-gray-600 text-white placeholder:text-gray-600 text-sm"
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
                          className="bg-[#2d2d2d] border-gray-600 text-white placeholder:text-gray-600 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`size-stock-${index}`} className="text-gray-400 text-xs mb-1 block">
                          Current Stock
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
                          className="bg-[#2d2d2d] border-gray-600 text-white placeholder:text-gray-600 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
              💡 <strong>Note:</strong> Changes will be reflected immediately in both admin and client views.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-6 flex gap-3">
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
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 mr-2" />
                Update Product
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}