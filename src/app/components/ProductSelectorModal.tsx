import { useState } from 'react';
import { X, Package, Search, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Product } from '../types';

interface CartItem {
  productId: string;
  productName: string;
  category: string;
  size: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ProductSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelect: (productId: string, size: string, quantity: number) => void;
  onSelectMultiple?: (items: Array<{ productId: string; size: string; quantity: number }>) => void;
}

export function ProductSelectorModal({
  isOpen,
  onClose,
  products,
  onSelect,
  onSelectMultiple,
}: ProductSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [cart, setCart] = useState<CartItem[]>([]);

  if (!isOpen) return null;

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize('');
    setQuantity('');
  };

  const handleConfirm = () => {
    if (selectedProduct && selectedSize) {
      onSelect(selectedProduct.id, selectedSize, quantity as number);
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setSelectedProduct(null);
    setSelectedSize('');
    setQuantity('');
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const handleClose = () => {
    handleReset();
    setCart([]);
    onClose();
  };

  const addToCart = () => {
    if (!selectedProduct || !selectedSize) {
      return;
    }

    // Validate quantity
    if (quantity === '' || typeof quantity !== 'number' || quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    const existingItemIndex = cart.findIndex(item => item.productId === selectedProduct.id && item.size === selectedSize);
    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      updatedCart[existingItemIndex].total = updatedCart[existingItemIndex].quantity * updatedCart[existingItemIndex].unitPrice;
      setCart(updatedCart);
    } else {
      const sizeInfo = selectedProduct.sizes.find(s => s.size === selectedSize);
      if (sizeInfo) {
        setCart([...cart, {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          category: selectedProduct.category,
          size: selectedSize,
          quantity: quantity,
          unitPrice: sizeInfo.price,
          total: sizeInfo.price * quantity,
        }]);
      }
    }
    // Reset selection but keep cart
    setSelectedProduct(null);
    setSelectedSize('');
    setQuantity('');
  };

  const handleDone = () => {
    if (cart.length === 0) return;
    
    // If onSelectMultiple is provided, use it (more efficient)
    if (onSelectMultiple) {
      const items = cart.map(item => ({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
      }));
      onSelectMultiple(items);
    } else {
      // Otherwise, call onSelect for each item
      cart.forEach(item => {
        onSelect(item.productId, item.size, item.quantity);
      });
    }
    
    // Reset everything
    setCart([]);
    handleReset();
    onClose();
  };

  const removeFromCart = (index: number) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };

  const updateCartItemQuantity = (index: number, newQuantity: number) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity = newQuantity;
    updatedCart[index].total = updatedCart[index].quantity * updatedCart[index].unitPrice;
    setCart(updatedCart);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-2 sm:p-4">
      <div className="bg-[#2d2d2d] rounded-lg w-full h-full sm:h-[95vh] max-w-7xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-[#2d8659]" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Select Product</h2>
              <p className="text-sm text-gray-400">Choose a product and configure quantity</p>
            </div>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Search and Category Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300 text-sm mb-2 block">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#1a1a1a] border-gray-600 text-white"
                />
              </div>
            </div>
            <div>
              <Label className="text-gray-300 text-sm mb-2 block">Filter by Category</Label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#2d8659]"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product List */}
          <div>
            <Label className="text-gray-300 text-sm mb-2 block">
              Available Products ({filteredProducts.length})
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    selectedProduct?.id === product.id
                      ? 'bg-[#2d8659]/20 border-[#2d8659] ring-2 ring-[#2d8659]'
                      : 'bg-[#1a1a1a] border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="font-medium text-white">{product.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{product.category}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {product.sizes.length} size{product.sizes.length !== 1 ? 's' : ''} available
                  </div>
                </button>
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No products found matching your criteria
              </div>
            )}
          </div>

          {/* Size and Quantity Selection */}
          {selectedProduct && (
            <div className="border-t border-gray-700 pt-4 space-y-4">
              <div className="bg-[#1a1a1a] p-4 rounded-lg">
                <div className="text-white font-semibold mb-1">{selectedProduct.name}</div>
                <div className="text-gray-400 text-sm">{selectedProduct.category}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300 text-sm mb-2 block">Select Size</Label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#2d8659]"
                  >
                    <option value="">Choose a size...</option>
                    {selectedProduct.sizes.map(sizeInfo => (
                      <option key={sizeInfo.size} value={sizeInfo.size}>
                        {sizeInfo.size} - ₱{sizeInfo.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-gray-300 text-sm mb-2 block">Quantity</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min="1"
                    value={quantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Allow empty or only digits
                      if (val === '' || /^\d+$/.test(val)) {
                        if (val === '') {
                          setQuantity('');
                        } else {
                          const num = parseInt(val);
                          if (!isNaN(num) && num >= 1) {
                            setQuantity(num);
                          }
                        }
                      }
                    }}
                    className="bg-[#1a1a1a] border-gray-600 text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              {selectedSize && (
                <div className="bg-[#2d8659]/20 border border-[#2d8659] rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total:</span>
                    <span className="text-[#2d8659] text-lg font-bold">
                      ₱
                      {(
                        (selectedProduct.sizes.find(s => s.size === selectedSize)?.price || 0) *
                        (quantity as number)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cart */}
          {cart.length > 0 && (
            <div className="border-t border-gray-700 pt-4 space-y-3">
              <div className="flex items-center justify-between bg-[#1a1a1a] p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#2d8659]" />
                  <span className="text-white font-semibold">Cart ({cart.length} items)</span>
                </div>
              </div>

              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {cart.map((item, index) => (
                  <div key={index} className="bg-[#1a1a1a] p-3 rounded-lg flex flex-wrap sm:flex-nowrap items-center gap-3">
                    <div className="flex-1 min-w-[150px]">
                      <div className="text-white font-medium text-sm">{item.productName}</div>
                      <div className="text-gray-400 text-xs">{item.category} • {item.size}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => updateCartItemQuantity(index, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 disabled:opacity-50"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                      <Button
                        onClick={() => updateCartItemQuantity(index, item.quantity + 1)}
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="text-[#2d8659] font-semibold text-sm min-w-[80px] text-right">
                      ₱{item.total.toFixed(2)}
                    </div>
                    <Button
                      onClick={() => removeFromCart(index)}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="bg-[#2d8659]/20 border border-[#2d8659] rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-medium">Cart Total:</span>
                  <span className="text-[#2d8659] text-xl font-bold">
                    ₱{cart.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-700 flex justify-end gap-2">
          <Button
            onClick={handleClose}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={addToCart}
            disabled={!selectedProduct || !selectedSize}
            className="bg-[#2d8659] hover:bg-[#238b4d] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Cart
          </Button>
          <Button
            onClick={handleDone}
            disabled={cart.length === 0}
            className="bg-[#2d8659] hover:bg-[#238b4d] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Request
          </Button>
        </div>
      </div>
    </div>
  );
}