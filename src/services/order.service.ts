import { API_ENDPOINTS, PRICING } from '@/constants';
import { calculateSummary } from '@/lib/pricing';
import { generateId } from '@/lib/utils';
import type { CartItem } from '@/types/cart';
import type { Order, PaymentMethod, ShippingAddress } from '@/types/order';
import { apiClient } from './api/client';

interface FakeStoreCart {
  id: number;
}

export interface PlaceOrderInput {
  userId: string;
  items: CartItem[];
  address: ShippingAddress;
  paymentMethod: PaymentMethod;
}

export const orderService = {
  /** POST /carts on FakeStore, then build the order locally (FakeStore does not persist it). */
  async placeOrder({ userId, items, address, paymentMethod }: PlaceOrderInput): Promise<Order> {
    let remoteId: number | undefined;
    try {
      const cart = await apiClient.post<FakeStoreCart>(API_ENDPOINTS.carts, {
        userId: 1,
        date: new Date().toISOString(),
        products: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      });
      remoteId = cart?.id;
    } catch (error) {
      // The order is still valid locally; the remote mirror is best-effort.
      console.warn('[orders] FakeStore POST /carts failed:', error);
    }

    const placedAt = new Date();
    const estimatedDelivery = new Date(placedAt);
    estimatedDelivery.setDate(placedAt.getDate() + PRICING.deliveryDays);

    return {
      id: generateId(`SN${remoteId ?? ''}`).slice(0, 12),
      userId,
      items,
      summary: calculateSummary(items),
      address,
      paymentMethod,
      status: 'confirmed',
      placedAt: placedAt.toISOString(),
      estimatedDelivery: estimatedDelivery.toISOString(),
    };
  },

  /** DELETE /carts/:id on FakeStore to cancel. */
  async cancelOrder(orderId: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.cart(1), { params: { ref: orderId } });
    } catch (error) {
      console.warn('[orders] FakeStore DELETE /carts failed:', error);
    }
  },
};
