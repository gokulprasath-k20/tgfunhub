'use client';

import { useQuery, useMutation } from '@tanstack/react-query';

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      return data.products as IProduct[];
    },
  });
}

export function useCheckout() {
  return useMutation({
    mutationFn: async (data: { productId: string; quantity: number; shippingAddress: string }) => {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to initiate checkout');
      }
      return res.json() as Promise<{
        orderId: string;
        razorpayOrderId: string;
        amount: number;
        currency: string;
      }>;
    },
  });
}
