// stores/vadStore.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export type OrderType = "ecommerce" | "phone";
export type OrderStatus = 
  | "pending" 
  | "processing" 
  | "shipped" 
  | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "card" | "cash" | "bank_transfer" | "pending_link";

export interface OrderItem {
  sku: string;
  name: string;
  productName?: string;
  quantity: number;
  price: number;
  unitPrice?: number;
  total?: number;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  clientName: string;
  clientTitle?: string;
  clientFirstName?: string;
  clientLastName?: string;
  clientPhone?: string;
  clientEmail?: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  totalAmount: number;
  shippingStreet?: string;
  shippingPostalCode?: string;
  shippingCity?: string;
  billingDifferent?: boolean;
  billingName?: string;
  billingCompany?: string;
  billingStreet?: string;
  billingPostalCode?: string;
  billingCity?: string;
  notes?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  lastNotificationSent?: string | Date;
}

export const useVADStore = defineStore("vad", () => {
  // ---- State -------------------------------------------------
  const orders = ref<Order[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // ---- Getters ------------------------------------------------
  const pendingCount = computed(() => 
    orders.value.filter(o => o.status === "pending").length
  );
  
  const processingCount = computed(() => 
    orders.value.filter(o => o.status === "processing").length
  );

  const shippedCount = computed(() => 
    orders.value.filter(o => o.status === "shipped").length
  );

  const ecommerceCount = computed(() => 
    orders.value.filter(o => o.type === "ecommerce").length
  );

  const phoneCount = computed(() => 
    orders.value.filter(o => o.type === "phone").length
  );

  const pendingPaymentCount = computed(() => 
    orders.value.filter(o => o.paymentStatus === "pending").length
  );

  const ordersByStatus = computed(() => {
    const grouped: Record<OrderStatus, Order[]> = {
      pending: [],
      processing: [],
      shipped: [],
      cancelled: [],
    };
    orders.value.forEach(o => {
      grouped[o.status].push(o);
    });
    return grouped;
  });

  // ---- Actions ------------------------------------------------
  async function fetchOrders(type?: OrderType, status?: OrderStatus) {
    isLoading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (status) params.append('status', status);
      
      const response = await fetch(`/api/orders?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        orders.value = result.data.map((o: any) => ({
          ...o,
          createdAt: new Date(o.createdAt),
          updatedAt: new Date(o.updatedAt),
          totalAmount: parseFloat(o.totalAmount),
        }));
      } else {
        throw new Error(result.error || 'Failed to fetch orders');
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching orders:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function createOrder(data: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">) {
    isLoading.value = true;
    error.value = null;

    try {
      console.log('[VAD Store] Creating order with data:', JSON.stringify(data, null, 2));
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      console.log('[VAD Store] API response:', result);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.error || response.statusText}`);
      }
      
      if (result.success) {
        const newOrder = {
          ...result.data,
          createdAt: new Date(result.data.createdAt),
          updatedAt: new Date(result.data.updatedAt),
          totalAmount: parseFloat(result.data.totalAmount),
        };
        orders.value.push(newOrder);
        return newOrder;
      } else {
        const errorMsg = result.error || 'Failed to create order';
        console.error('[VAD Store] API returned error:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('[VAD Store] Error creating order:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateOrderStatus(id: string, status: OrderStatus) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        const order = orders.value.find(o => o.id === id);
        if (order) {
          order.status = status;
          order.updatedAt = new Date();
        }
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to update order');
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error updating order:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updatePaymentStatus(id: string, paymentStatus: PaymentStatus, paymentMethod?: PaymentMethod) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus, paymentMethod }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        const order = orders.value.find(o => o.id === id);
        if (order) {
          order.paymentStatus = paymentStatus;
          if (paymentMethod) {
            order.paymentMethod = paymentMethod;
          }
          order.updatedAt = new Date();
        }
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to update payment status');
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error updating payment status:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateOrder(id: string, data: Partial<Order>) {
    isLoading.value = true;
    error.value = null;

    try {
      console.log(`[VAD Store] Updating order ${id} with data:`, JSON.stringify(data, null, 2));
      
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      console.log(`[VAD Store] API response for ${id}:`, result);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.error || response.statusText}`);
      }
      
      if (result.success) {
        const index = orders.value.findIndex(o => o.id === id);
        if (index !== -1) {
          orders.value[index] = {
            ...orders.value[index],
            ...data,
            updatedAt: new Date(),
          };
        }
        return result.data;
      } else {
        const errorMsg = result.error || 'Failed to update order';
        console.error('[VAD Store] API returned error:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('[VAD Store] Error updating order:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteOrder(id: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        orders.value = orders.value.filter(o => o.id !== id);
        return true;
      } else {
        throw new Error(result.error || 'Failed to delete order');
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error deleting order:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function sendNotification(orderId: string, type: 'SMS' | 'EMAIL', content: string, subject?: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const order = orders.value.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          recipient: type === 'SMS' ? order.clientPhone : order.clientEmail,
          subject,
          content,
          orderId,
          customerId: order.id,
          status: 'PENDING'
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update order's lastNotificationSent
        const orderIndex = orders.value.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          orders.value[orderIndex].lastNotificationSent = new Date();
        }
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to send notification');
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error sending notification:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function getOrderById(id: string) {
    return orders.value.find(o => o.id === id);
  }

  return {
    orders,
    isLoading,
    error,
    pendingCount,
    processingCount,
    shippedCount,
    ecommerceCount,
    phoneCount,
    pendingPaymentCount,
    ordersByStatus,
    fetchOrders,
    createOrder,
    updateOrderStatus,
    updatePaymentStatus,
    updateOrder,
    deleteOrder,
    getOrderById,
    sendNotification,
  };
});
