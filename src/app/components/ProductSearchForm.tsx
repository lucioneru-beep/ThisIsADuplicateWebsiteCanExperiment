import { useState, useEffect } from 'react';
import { Search, Plus, Package } from 'lucide-react';
import { Product, ProductSize, RequestItem } from '../types';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';

interface ProductSearchFormProps {
  products: Product[];
  onAddToRequest: (item: RequestItem) => void;
}

export function ProductSearchForm({ products, onAddToRequest }: ProductSearchFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState<number | ''>('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'NATUREZYME', 'BIOZYME', 'PETZYME'];

  useEffect(() => {
    let filtered = products;

    // Filter by category first
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(
        (product) => product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Then filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setShowSuggestions(true);
    } else {
      // If no search query, show all products in selected category
      setShowSuggestions(selectedCategory !== 'All' || false);
    }

    setFilteredProducts(filtered);
  }, [searchQuery, products, selectedCategory]);

  const handleSelectProduct = (product: Product, fromSearch: boolean = true) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes[0] || null);
    // Only fill search query if selected from search dropdown, not from category browse
    if (fromSearch) {
      setSearchQuery(product.name);
    }
    setShowSuggestions(false);
    setQuantity('');
  };

  const handleAddToRequest = () => {
    if (!selectedProduct || !selectedSize) {
      alert('Please select a product and size');
      return;
    }

    console.log('ProductSearchForm - quantity value:', quantity, 'type:', typeof quantity);

    if (quantity === '' || typeof quantity !== 'number' || quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    if (quantity > selectedSize.stock) {
      alert(`Only ${selectedSize.stock} units available in stock`);
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

    console.log('ProductSearchForm - calling onAddToRequest with:', item);
    onAddToRequest(item);

    // Reset form
    setSearchQuery('');
    setSelectedProduct(null);
    setSelectedSize(null);
    setQuantity('');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Search & Stock Entry</h2>

      {/* Smart Search Box */}
      <div className="bg-[#2d2d2d] rounded-lg p-4 sm:p-6 border border-gray-700">
        <div className="relative">
          <Label htmlFor="search" className="text-gray-300 text-sm mb-2 block">
            🔍 Smart Search
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              id="search"
              type="text"
              placeholder="Type product name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowSuggestions(true)}
              className="pl-9 sm:pl-10 bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500 focus:border-[#2d8659] text-sm sm:text-base"
            />
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && searchQuery.trim() && filteredProducts.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-[#1a1a1a] border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-[#2d2d2d] text-white border-b border-gray-700 last:border-b-0"
                >
                  <div className="font-medium text-sm sm:text-base">{product.name}</div>
                  <div className="text-xs sm:text-sm text-gray-400">{product.category}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Browse Box */}
      <div className="bg-[#2d2d2d] rounded-lg p-4 sm:p-6 border border-gray-700">
        <div className="space-y-4">
          <Label className="text-gray-300 text-sm block">
            📦 Browse by Category
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setSearchQuery('');
                  setSelectedProduct(null);
                  setSelectedSize(null);
                  setShowSuggestions(false);
                }}
                className={`px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  selectedCategory === category
                    ? 'bg-[#2d8659] text-white border-2 border-[#2d8659]'
                    : 'bg-[#1a1a1a] text-gray-300 border-2 border-gray-600 hover:border-[#2d8659]'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  <span>{category}</span>
                </div>
              </button>
            ))}
          </div>
          {selectedCategory !== 'All' && filteredProducts.length > 0 && (
            <div className="text-sm text-gray-400">
              Showing {filteredProducts.length} product(s) in {selectedCategory}
            </div>
          )}

          {/* Browse Products in Category */}
          {selectedCategory !== 'All' && !selectedProduct && filteredProducts.length > 0 && (
            <div className="bg-[#1a1a1a] border border-gray-600 rounded-lg p-4 max-h-64 overflow-y-auto mt-4">
              <Label className="text-gray-300 text-sm mb-3 block">
                {selectedCategory} Products - Click to Select
              </Label>
              <div className="space-y-2">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product, false)}
                    className="w-full text-left px-4 py-3 bg-[#2d2d2d] hover:bg-[#2d8659]/20 border border-gray-700 hover:border-[#2d8659] rounded-lg transition-all"
                  >
                    <div className="font-medium text-white text-sm sm:text-base">{product.name}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {product.sizes.length} size(s) available
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Details */}
      {selectedProduct && (
        <div className="bg-[#2d2d2d] rounded-lg p-4 sm:p-6 border border-gray-700">
          <Label className="text-white text-lg font-semibold mb-4 block">
            ✏️ Product Details
          </Label>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 text-sm mb-1 block">Category</Label>
                <div className="bg-[#1a1a1a] border border-gray-600 rounded-md px-3 py-2 text-white text-sm sm:text-base">
                  {selectedProduct.category}
                </div>
              </div>
              <div>
                <Label className="text-gray-300 text-sm mb-1 block">Packaging Size</Label>
                <select
                  value={selectedSize?.size || ''}
                  onChange={(e) => {
                    const size = selectedProduct.sizes.find((s) => s.size === e.target.value);
                    setSelectedSize(size || null);
                  }}
                  className="w-full bg-[#1a1a1a] border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#2d8659] text-sm sm:text-base"
                >
                  {selectedProduct.sizes.map((size) => (
                    <option key={size.size} value={size.size}>
                      {size.size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedSize && (
              <>
                <div className="bg-[#1a1a1a] border-2 border-[#2d8659] rounded-lg p-3 sm:p-4">
                  <Label className="text-gray-300 text-sm mb-1 block">Available Stock</Label>
                  <div className="text-2xl sm:text-3xl font-bold text-[#2d8659]">
                    {selectedSize.stock} <span className="text-base sm:text-lg text-gray-400">units</span>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300 text-sm mb-1 block">Unit Price</Label>
                  <div className="bg-[#1a1a1a] border border-gray-600 rounded-md px-3 py-2 text-white text-base sm:text-lg font-semibold">
                    ₱{selectedSize.price.toFixed(2)}
                  </div>
                </div>

                <div>
                  <Label htmlFor="quantity" className="text-gray-300 text-sm mb-1 block">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
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
                    className="bg-[#1a1a1a] border-gray-600 text-white focus:border-[#2d8659] text-sm sm:text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <Button
                  onClick={handleAddToRequest}
                  className="w-full bg-[#2d8659] hover:bg-[#238b4d] text-white font-semibold py-3 text-base sm:text-lg"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Add to Request
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}