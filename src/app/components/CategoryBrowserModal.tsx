import { useState } from 'react';
import { X, Package, Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Product, ProductSize, RequestItem } from '../types';
import { toast } from 'sonner';

interface CategoryBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  products: Product[];
  onAddToRequest: (item: RequestItem) => void;
}

export function CategoryBrowserModal({
  isOpen,
  onClose,
  category,
  products,
  onAddToRequest,
}: CategoryBrowserModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState<number | ''>('');

  if (!isOpen) return null;

  const categoryProducts = products.filter((p) => p.category === category);

  const getCategoryColor = () => {
    switch (category) {
      case 'SMART HOME':
        return { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-400' };
      case 'AUDIO':
        return { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400' };
      case 'PERIPHERALS':
        return { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-400' };
      default:
        return { bg: 'bg-gray-500/20', border: 'border-gray-500/50', text: 'text-gray-400' };
    }
  };

  const colors = getCategoryColor();

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes[0] || null);
    setQuantity('');
  };

  const handleAddToRequest = () => {
    if (!selectedProduct || !selectedSize) {
      toast.error('Please select a product and size');
      return;
    }

    if (quantity === '' || typeof quantity !== 'number' || quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (quantity > selectedSize.stock) {
      toast.error(`Only ${selectedSize.stock} units available in stock`);
      return;
    }

    const item: RequestItem = {
      productName: selectedProduct.name,
      category: selectedProduct.category,
      size: selectedSize.size,
      quantity: quantity,
      unitPrice: selectedSize.price,
      total: selectedSize.price * quantity,
    };

    onAddToRequest(item);
    toast.success(`${quantity}x ${selectedProduct.name} added to request`);

    // Reset selection
    setSelectedProduct(null);
    setSelectedSize(null);
    setQuantity('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-[#141824] rounded-lg w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className={`p-4 sm:p-6 border-b border-[#1e2433] ${colors.bg} ${colors.border} border-t-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className={`w-6 h-6 sm:w-8 sm:h-8 ${colors.text}`} />
              <div>
                <h2 className={`text-2xl sm:text-3xl font-bold ${colors.text}`}>{category}</h2>
                <p className="text-sm text-gray-400">
                  {categoryProducts.length} Product{categoryProducts.length !== 1 ? 's' : ''} Available
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Product List - Left Side */}
          <div className="lg:w-1/2 border-b lg:border-b-0 lg:border-r border-[#1e2433] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h3 className="text-white font-semibold mb-4 text-lg">Select Product</h3>
              <div className="space-y-2">
                {categoryProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedProduct?.id === product.id
                        ? `${colors.border} ${colors.bg}`
                        : 'border-[#1e2433] bg-[#08090e] hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-1 text-sm sm:text-base">
                          {product.name}
                        </h4>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                          {product.sizes.map((size) => (
                            <span key={size.size} className="bg-[#141824] px-2 py-1 rounded">
                              {size.size}
                            </span>
                          ))}
                        </div>
                      </div>
                      {selectedProduct?.id === product.id && (
                        <div className={`ml-2 w-2 h-2 rounded-full ${colors.text.replace('text-', 'bg-')}`} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details - Right Side */}
          <div className="lg:w-1/2 overflow-y-auto bg-[#08090e]">
            {selectedProduct ? (
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <h3 className="text-white font-bold text-xl sm:text-2xl mb-2">
                    {selectedProduct.name}
                  </h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
                    {selectedProduct.category}
                  </span>
                </div>

                <div className="border-t border-[#1e2433] pt-4 space-y-4">
                  <div>
                    <Label className="text-gray-300 text-sm mb-2 block">
                      Select Packaging Size
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedProduct.sizes.map((size) => (
                        <button
                          key={size.size}
                          onClick={() => {
                            setSelectedSize(size);
                            setQuantity(1);
                          }}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            selectedSize?.size === size.size
                              ? `${colors.border} ${colors.bg}`
                              : 'border-[#1e2433] bg-[#141824] hover:border-gray-600'
                          }`}
                        >
                          <div className="text-white font-semibold text-sm">{size.size}</div>
                          <div className="text-gray-400 text-xs">₱{size.price.toFixed(2)}</div>
                          <div className="text-gray-500 text-xs mt-1">
                            Stock: {size.stock} units
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedSize && (
                    <>
                      <div className={`rounded-lg p-4 border-2 ${colors.border} ${colors.bg}`}>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-300 text-xs mb-1 block">
                              Available Stock
                            </Label>
                            <div className={`text-2xl font-bold ${colors.text}`}>
                              {selectedSize.stock}
                              <span className="text-sm text-gray-400 ml-1">units</span>
                            </div>
                          </div>
                          <div>
                            <Label className="text-gray-300 text-xs mb-1 block">
                              Unit Price
                            </Label>
                            <div className="text-2xl font-bold text-white">
                              ₱{selectedSize.price.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="qty" className="text-gray-300 text-sm mb-2 block">
                          Quantity
                        </Label>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setQuantity(Math.max(1, (quantity as number) - 1))}
                            disabled={quantity === '' || quantity <= 1}
                            className="border-gray-600 hover:bg-[#141824]"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input
                            id="qty"
                            type="number"
                            min="1"
                            max={selectedSize.stock}
                            value={quantity}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                setQuantity('');
                              } else {
                                const num = parseInt(val);
                                if (!isNaN(num) && num >= 1) {
                                  setQuantity(Math.min(num, selectedSize.stock));
                                }
                              }
                            }}
                            className="bg-[#141824] border-gray-600 text-white text-center flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setQuantity(Math.min(selectedSize.stock, (quantity as number) + 1))}
                            disabled={quantity === '' || quantity >= selectedSize.stock}
                            className="border-gray-600 hover:bg-[#141824]"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="bg-[#141824] rounded-lg p-4 border border-[#1e2433]">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-400 text-sm">Total Value:</span>
                          <span className={`text-2xl font-bold ${colors.text}`}>
                            ₱{(selectedSize.price * quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={handleAddToRequest}
                        className="w-full bg-[#f97316] hover:bg-[#ea6a09] text-white font-semibold py-3"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add to Request
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center">
                  <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Select a product to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}