'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Script from 'next/script';
import { ArrowLeft, ShoppingCart, ShieldCheck, Truck, Package, CheckCircle2, Loader2 } from 'lucide-react';
import { useProducts, useCheckout } from '@/hooks/useShop';
import { toast } from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: products, isLoading } = useProducts();
  const checkoutMutation = useCheckout();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const product = products?.find((p) => p._id === id);

  const handleCheckout = async () => {
    if (!product || isProcessing) return;

    try {
      setIsProcessing(true);
      
      const { razorpayOrderId, amount, currency } = await checkoutMutation.mutateAsync({
        productId: product._id,
        quantity: 1,
        shippingAddress: 'User Address Placeholder', // In a real app, collect this via form
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'TG Fun Hub',
        description: `Purchase: ${product.name}`,
        order_id: razorpayOrderId,
        handler: function (response: any) {
          // In a real app, we would wait for the webhook or call a verification API
          // For the MVP, we'll show success after the checkout finishes
          setIsSuccess(true);
          toast.success('Payment successful!');
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#0a0a0a',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 aspect-square bg-[#e5e5e5] dark:bg-[#2a2a2a] rounded-2xl" />
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div className="h-8 bg-[#e5e5e5] dark:bg-[#2a2a2a] rounded w-3/4" />
            <div className="h-6 bg-[#e5e5e5] dark:bg-[#2a2a2a] rounded w-1/4" />
            <div className="h-32 bg-[#e5e5e5] dark:bg-[#2a2a2a] rounded w-full" />
            <div className="h-12 bg-[#e5e5e5] dark:bg-[#2a2a2a] rounded-xl w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold mb-2">Product not found</h2>
        <button onClick={() => router.push('/shop')} className="text-blue-500 hover:underline">
          Back to shop
        </button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto py-20 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-green-50 dark:bg-green-900/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-[#0a0a0a] dark:text-[#fafafa] mb-2">Order Confirmed!</h2>
        <p className="text-[#525252] dark:text-[#a3a3a3] mb-8">
          Your payment for <span className="font-semibold text-[#0a0a0a] dark:text-[#fafafa]">{product.name}</span> has been processed successfully.
        </p>
        <button 
          onClick={() => router.push('/shop')}
          className="w-full h-12 bg-[#0a0a0a] dark:bg-[#fafafa] text-white dark:text-black rounded-xl font-medium transition-opacity hover:opacity-90"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const displayPrice = (product.price / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  });

  return (
    <div className="max-w-5xl mx-auto">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-[#525252] hover:text-[#0a0a0a] dark:text-[#a3a3a3] dark:hover:text-[#fafafa] mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Shop
      </button>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Image Section */}
        <div className="w-full md:w-1/2">
          <div className="relative aspect-square bg-[#f9f9f9] dark:bg-[#111111] rounded-3xl overflow-hidden border border-[#e5e5e5] dark:border-[#2a2a2a] group">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-[#f0f0f0] dark:bg-[#1a1a1a] text-[#525252] dark:text-[#a3a3a3] text-[10px] font-bold uppercase tracking-widest rounded-full">
              {product.category}
            </span>
            {product.stock > 0 ? (
              <span className="text-xs text-green-500 font-medium">In Stock</span>
            ) : (
              <span className="text-xs text-red-500 font-medium">Out of Stock</span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-[#0a0a0a] dark:text-[#fafafa] mb-2 leading-tight">
            {product.name}
          </h1>
          
          <div className="text-2xl font-bold text-[#0a0a0a] dark:text-[#fafafa] mb-6">
            {displayPrice}
          </div>

          <div className="h-px bg-[#e5e5e5] dark:bg-[#2a2a2a] w-full mb-6" />

          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-semibold text-[#0a0a0a] dark:text-[#fafafa]">About this item</h3>
            <p className="text-[#525252] dark:text-[#a3a3a3] text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#f9f9f9] dark:bg-[#111111] border border-[#e5e5e5] dark:border-[#2a2a2a]">
              <Truck className="w-4 h-4 text-[#a3a3a3] mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase text-[#a3a3a3]">Delivery</p>
                <p className="text-xs font-medium text-[#0a0a0a] dark:text-[#fafafa]">3-5 Business Days</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#f9f9f9] dark:bg-[#111111] border border-[#e5e5e5] dark:border-[#2a2a2a]">
              <ShieldCheck className="w-4 h-4 text-[#a3a3a3] mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase text-[#a3a3a3]">Warranty</p>
                <p className="text-xs font-medium text-[#0a0a0a] dark:text-[#fafafa]">1 Year Hub Care</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={product.stock <= 0 || isProcessing}
            className="w-full h-14 bg-[#0a0a0a] dark:bg-[#fafafa] text-white dark:text-black rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Package className="w-5 h-5" />
                Buy Now
              </>
            )}
          </button>
          
          <p className="text-[10px] text-center text-[#a3a3a3] mt-4 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Secure transaction encrypted by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}
