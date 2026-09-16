import { Info, Package, Plus, Settings, RotateCcw } from 'lucide-react';

interface ProductCatalogInfoProps {
  totalProducts: number;
  categories: { name: string; count: number }[];
  onCategoryClick: (category: string) => void;
  onAddProductClick: () => void;
  onManageProductsClick: () => void;
  onResetInventory?: () => void;
  isResetting?: boolean;
}

export function ProductCatalogInfo({ totalProducts, categories, onCategoryClick, onAddProductClick, onManageProductsClick, onResetInventory, isResetting }: ProductCatalogInfoProps) {
  const getCategoryColor = (categoryName: string) => {
    switch (categoryName) {
      case 'NATUREZYME':
        return 'hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-400';
      case 'PETZYME':
        return 'hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-400';
      case 'BIOZYME':
        return 'hover:bg-purple-500/10 hover:border-purple-500/50 hover:text-purple-400';
      default:
        return 'hover:bg-gray-500/10 hover:border-gray-500/50';
    }
  };

  return (
    <div className="bg-[#2d2d2d] rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-[#2d8659]/30">
      <div className="flex items-start gap-2 sm:gap-3">
        <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#2d8659] mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-3 text-sm sm:text-base">
            Product Catalog - Browse by Category
          </h3>
          <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 bg-[#1a1a1a] px-3 py-2 rounded-lg border border-gray-700">
              <Package className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              <span className="text-gray-300">
                <span className="font-semibold text-[#2d8659]">{totalProducts}</span> Products
              </span>
            </div>
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => onCategoryClick(category.name)}
                className={`bg-[#1a1a1a] px-3 py-2 rounded-lg border-2 border-gray-700 transition-all cursor-pointer ${getCategoryColor(
                  category.name
                )}`}
              >
                <span className="font-semibold text-white">{category.name}</span>
                <span className="text-gray-400 ml-1.5">({category.count})</span>
              </button>
            ))}
            <button
              onClick={onAddProductClick}
              className="bg-[#1a1a1a] px-3 py-2 rounded-lg border-2 border-[#2d8659] transition-all cursor-pointer hover:bg-[#2d8659]/20 hover:border-[#2d8659] flex items-center gap-2"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-[#2d8659]" />
              <span className="text-white font-semibold">Add Product/Catalog</span>
            </button>
            <button
              onClick={onManageProductsClick}
              className="bg-[#1a1a1a] px-3 py-2 rounded-lg border-2 border-[#2d8659] transition-all cursor-pointer hover:bg-[#2d8659]/20 hover:border-[#2d8659] flex items-center gap-2"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 text-[#2d8659]" />
              <span className="text-white font-semibold">Manage Products</span>
            </button>
            {onResetInventory && (
              <button
                onClick={onResetInventory}
                disabled={isResetting}
                className={`bg-[#1a1a1a] px-3 py-2 rounded-lg border-2 border-[#2d8659] transition-all cursor-pointer hover:bg-[#2d8659]/20 hover:border-[#2d8659] flex items-center gap-2 ${
                  isResetting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <RotateCcw className={`w-3 h-3 sm:w-4 sm:h-4 text-[#2d8659] ${isResetting ? 'animate-spin' : ''}`} />
                <span className="text-white font-semibold">
                  {isResetting ? 'Resetting...' : 'Reset Inventory'}
                </span>
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Click on a category to browse products
          </p>
        </div>
      </div>
    </div>
  );
}