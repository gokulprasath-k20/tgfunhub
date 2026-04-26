'use client';

import { ShoppingBag, Loader2, Sparkles } from 'lucide-react';
import { useProducts } from '@/hooks/useShop';
import { ProductCard } from '@/components/shop/ProductCard';

export default function ShopPage() {
  const { data: products, isLoading, error } = useProducts();

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0a0a0a] dark:text-[#fafafa] flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" />
            Shop
          </h1>
          <p className="text-[#a3a3a3] text-sm mt-1">
            Premium items for the TG Fun Hub community.
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-full">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
            Secure Payments via Razorpay
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse flex flex-col gap-3">
              <div className="aspect-square bg-[#e5e5e5] dark:bg-[#2a2a2a] rounded-2xl w-full" />
              <div className="h-4 bg-[#e5e5e5] dark:bg-[#2a2a2a] rounded w-3/4" />
              <div className="h-4 bg-[#e5e5e5] dark:bg-[#2a2a2a] rounded w-1/4" />
              <div className="h-10 bg-[#e5e5e5] dark:bg-[#2a2a2a] rounded-xl w-full mt-2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 flex flex-col items-center">
          <p className="text-red-500 font-medium">Failed to load shop items.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 text-sm text-blue-500 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : products?.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#f0f0f0] dark:bg-[#1a1a1a] flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-[#a3a3a3]" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-[#0a0a0a] dark:text-[#fafafa]">The shop is empty</h2>
          <p className="text-[#a3a3a3]">Check back later for new exclusive items.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
