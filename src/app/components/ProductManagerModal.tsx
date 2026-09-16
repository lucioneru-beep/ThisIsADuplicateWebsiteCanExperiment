import { useState } from 'react';
import { X, Edit3, Trash2, Package, AlertTriangle, Search, FolderX } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { Product } from '../types';
import { EditProductModal } from './EditProductModal';

interface ProductManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  apiBase: string;
  authToken: string;
  onProductsChanged: () => void;
}

export function ProductManagerModal({
  isOpen,
  onClose,
  products,
  apiBase,
  authToken,
  onProductsChanged
}: ProductManagerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteProduct = async (product: Product) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${apiBase}/inventory/delete-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          productId: product.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete product');
      }

      toast.success(`Product "${product.name}" deleted successfully!`);
      setProductToDelete(null);
      onProductsChanged();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCategory = async (category: string) => {
    setIsDeleting(true);
    try {
      // Get all products in this category
      const productsInCategory = products.filter(p => p.category === category);

      // Delete each product
      for (const product of productsInCategory) {
        const response = await fetch(`${apiBase}/inventory/delete-product`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            productId: product.id
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `Failed to delete product: ${product.name}`);
        }
      }

      toast.success(`Category "${category}" and all ${productsInCategory.length} product(s) deleted successfully!`);
      setCategoryToDelete(null);
      setSelectedCategory('All');
      onProductsChanged();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  // Get dynamic categories from products
  const uniqueCategories = Array.from(new Set(products.map(p => p.category))).sort();
  const categoriesWithCounts = uniqueCategories.map(cat => ({
    name: cat,
    count: products.filter(p => p.category === cat).length
  }));

  const allCategoriesWithCounts = [
    { name: 'All', count: products.length },
    ...categoriesWithCounts
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-[#2d2d2d] rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-700 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <Package className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Product Management</h2>
                <p className="text-sm text-gray-400">View, edit, and delete all products</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-700 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {allCategoriesWithCounts.map(cat => (
                <div key={cat.name} className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === cat.name
                        ? 'bg-[#2d8659] text-white'
                        : 'bg-[#1a1a1a] text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {cat.name}
                    <span className="ml-2 text-xs opacity-75">({cat.count})</span>
                  </button>
                  {cat.name !== 'All' && (
                    <button
                      onClick={() => setCategoryToDelete(cat.name)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                      title={`Delete ${cat.name} category`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Product List */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No products found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold">{product.name}</h3>
                          <span className="text-xs px-2 py-1 rounded bg-[#2d8659]/20 text-[#2d8659] border border-[#2d8659]/30">
                            {product.category}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {product.sizes.map((size, idx) => (
                            <div
                              key={idx}
                              className="bg-[#2d2d2d] border border-gray-600 rounded px-3 py-1.5 text-xs"
                            >
                              <span className="text-gray-400">{size.size}:</span>
                              <span className="text-white ml-1 font-medium">₱{size.price}</span>
                              <span className="text-gray-500 ml-2">Stock: {size.stock}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setProductToEdit(product)}
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(product)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Showing {filteredProducts.length} of {products.length} products
              </p>
              <Button
                onClick={onClose}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      {productToEdit && (
        <EditProductModal
          isOpen={!!productToEdit}
          onClose={() => setProductToEdit(null)}
          product={productToEdit}
          apiBase={apiBase}
          authToken={authToken}
          onProductUpdated={() => {
            setProductToEdit(null);
            onProductsChanged();
          }}
        />
      )}

      {/* Delete Product Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#2d2d2d] rounded-xl w-full max-w-md border border-red-500/30">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-red-500/20 p-3 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">Delete Product?</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Are you sure you want to delete "<strong className="text-white">{productToDelete.name}</strong>"?
                    This action cannot be undone and the product will be removed from both admin and client views.
                  </p>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                    <p className="text-red-400 text-xs">
                      ⚠️ <strong>Warning:</strong> This will permanently delete the product and all its size/pricing information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-700 p-4 flex gap-3">
              <Button
                onClick={() => setProductToDelete(null)}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteProduct(productToDelete)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Product'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#2d2d2d] rounded-xl w-full max-w-md border border-red-500/30">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-red-500/20 p-3 rounded-lg">
                  <FolderX className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">Delete Category?</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Are you sure you want to delete the "<strong className="text-white">{categoryToDelete}</strong>" category?
                  </p>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                    <p className="text-red-400 text-xs mb-2">
                      ⚠️ <strong>CRITICAL WARNING:</strong>
                    </p>
                    <ul className="text-red-400 text-xs space-y-1 ml-4 list-disc">
                      <li>This will delete <strong>ALL {products.filter(p => p.category === categoryToDelete).length} product(s)</strong> in this category</li>
                      <li>This action cannot be undone</li>
                      <li>Products will be removed from admin and client views</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-700 p-4 flex gap-3">
              <Button
                onClick={() => setCategoryToDelete(null)}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteCategory(categoryToDelete)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Category'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}