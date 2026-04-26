'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { IProduct } from '@/hooks/useShop';

interface ProductCardProps {
  product: IProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const displayPrice = (product.price / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  });

  return (
    <div className="group bg-white dark:bg-[#111111] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <Link href={`/shop/${product._id}`} className="block relative aspect-square overflow-hidden bg-[#f9f9f9] dark:bg-[#1a1a1a]">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </Link>
      
      <div className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <Link href={`/shop/${product._id}`} className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#0a0a0a] dark:text-[#fafafa] truncate group-hover:text-blue-500 transition-colors">
              {product.name}
            </h3>
          </Link>
          <span className="font-bold text-[#0a0a0a] dark:text-[#fafafa]">
            {displayPrice}
          </span>
        </div>
        
        <p className="text-xs text-[#a3a3a3] line-clamp-1">
          {product.category}
        </p>
        
        <Link 
          href={`/shop/${product._id}`}
          className="mt-2 w-full h-10 bg-[#0a0a0a] dark:bg-[#fafafa] text-white dark:text-black rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <ShoppingCart className="w-4 h-4" />
          View Details
        </Link>
      </div>
    </div>
  );
}
