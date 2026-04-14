// stores/salesStore.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { ProductType, Size, Color } from "./types";

export interface SaleVariation {
  size: Size;
  color: Color;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SaleProduct {
  id: string;
  name: string;
  type: ProductType;
  size: Size;
  color: Color;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderSale {
  id: string;
  orderNumber: string;
  type: string;
  status: string;
  clientName: string;
  totalAmount: number;
  items: SaleProduct[];
  createdAt: Date;
}

export interface AggregatedSale {
  id: string;
  name: string;
  type: ProductType;
  timesSold: number;
  totalQuantity: number;
  totalRevenue: number;
}

export interface DailySale {
  date: string;
  orderCount: number;
  itemsSold: number;
  dailyRevenue: number;
}

export const useSalesStore = defineStore("sales", () => {
  // ---- State -------------------------------------------------
  const dailySales = ref<DailySale[]>([]);
  const aggregatedSales = ref<AggregatedSale[]>([]);
  const orders = ref<OrderSale[]>([]);
  const salesBySize = ref<any[]>([]);
  const salesByColor = ref<any[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // ---- Constants for filters ------------------------------------------------
  const allTypes: { value: ProductType | "all"; label: string }[] = [
    { value: "all", label: "Tout" },
    { value: "homme", label: "Homme" },
    { value: "femme", label: "Femme" },
    { value: "accessoires", label: "Accessoires" },
  ];

  const allSizes: { value: Size | "all"; label: string }[] = [
    { value: "all", label: "Tout" },
    { value: "XXS", label: "XXS" },
    { value: "XS", label: "XS" },
    { value: "S", label: "S" },
    { value: "M", label: "M" },
    { value: "L", label: "L" },
    { value: "XL", label: "XL" },
    { value: "XXL", label: "XXL" },
    { value: "XXXL", label: "XXXL" },
  ];

  const allColors: { value: Color | "all"; label: string }[] = [
    { value: "all", label: "Tout" },
    { value: "Black", label: "Black" },
    { value: "Navy", label: "Navy" },
    { value: "Olive", label: "Olive" },
    { value: "Sage", label: "Sage" },
    { value: "Camel", label: "Camel" },
    { value: "Marron", label: "Marron" },
    { value: "Beige", label: "Beige" },
    { value: "Tartan", label: "Tartan" },
  ];

  const sizeOrder: Size[] = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  // ---- Getters ------------------------------------------------
  const getSalesInRange = (startDate: string, endDate: string): OrderSale[] => {
    return orders.value.filter(
      (sale) => sale.createdAt >= new Date(startDate) && sale.createdAt <= new Date(endDate)
    );
  };

  const getAggregatedSalesByType = (type: ProductType): AggregatedSale[] => {
    return aggregatedSales.value.filter((sale) => sale.type === type);
  };

  const getAggregatedSales = (sales: OrderSale[]): AggregatedSale[] => {
    const productMap = new Map<string, AggregatedSale>();
    
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const key = item.id || item.name;
        if (!productMap.has(key)) {
          productMap.set(key, {
            id: item.id,
            name: item.name,
            type: item.type,
            timesSold: 0,
            totalQuantity: 0,
            totalRevenue: 0,
          });
        }
        const product = productMap.get(key)!;
        product.timesSold += 1;
        product.totalQuantity += item.quantity;
        product.totalRevenue += item.total;
      });
    });
    
    return Array.from(productMap.values());
  };

  const getTopSellingProducts = (limit: number = 10): AggregatedSale[] => {
    return aggregatedSales.value.slice(0, limit);
  };

  const getTotalRevenue = computed(() => {
    return dailySales.value.reduce((sum, day) => sum + day.dailyRevenue, 0);
  });

  const getTotalItemsSold = computed(() => {
    return dailySales.value.reduce((sum, day) => sum + day.itemsSold, 0);
  });

  const getQuantityBySize = (product: AggregatedSale, size: Size): number => {
    const sizeData = salesBySize.value.find((s) => s.size === size);
    return sizeData ? parseInt(sizeData.total_quantity) : 0;
  };

  const getValueBySize = (product: AggregatedSale, size: Size): number => {
    const sizeData = salesBySize.value.find((s) => s.size === size);
    return sizeData ? parseFloat(sizeData.total_revenue) : 0;
  };

  const getQuantityBySizeAndColor = (
    product: AggregatedSale,
    size: Size,
    color: Color
  ): number => {
    const sizeColorData = salesBySize.value.find(
      (s) => s.size === size && s.color === color
    );
    return sizeColorData ? parseInt(sizeColorData.total_quantity) : 0;
  };

  const getValueBySizeAndColor = (
    product: AggregatedSale,
    size: Size,
    color: Color
  ): number => {
    const sizeColorData = salesBySize.value.find(
      (s) => s.size === size && s.color === color
    );
    return sizeColorData ? parseFloat(sizeColorData.total_revenue) : 0;
  };

  const getColorsForProduct = (sale: AggregatedSale): Color[] => {
    const colors = new Set<Color>();
    salesByColor.value.forEach((c) => colors.add(c.color));
    return Array.from(colors).sort();
  };

  const getTotalQuantityForProduct = (sale: AggregatedSale): number => {
    return sale.totalQuantity;
  };

  const getTotalValueForProduct = (sale: AggregatedSale): number => {
    return sale.totalRevenue;
  };

  const getTotalQuantityByColor = (color: Color): number => {
    const colorData = salesByColor.value.find((c) => c.color === color);
    return colorData ? parseInt(colorData.total_quantity) : 0;
  };

  const getTotalValueByColor = (color: Color): number => {
    const colorData = salesByColor.value.find((c) => c.color === color);
    return colorData ? parseFloat(colorData.total_revenue) : 0;
  };

  // ---- Actions ------------------------------------------------
  async function fetchSales(
    startDate?: string,
    endDate?: string,
    type?: string,
    productId?: string
  ) {
    isLoading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (type) params.append("type", type);
      if (productId) params.append("productId", productId);

      const response = await fetch(`/api/sales?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        orders.value = result.data.orders.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          type: order.type,
          status: order.status,
          clientName: order.customer?.name || 'N/A',
          totalAmount: parseFloat(order.totalAmount) || 0,
          items: order.items.map((item: any) => ({
            id: item.id,
            name: item.productName || item.product?.name || 'Unknown',
            type: item.product?.type || "homme",
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unitPrice) || 0,
            total: parseFloat(item.total) || 0,
          })),
          createdAt: new Date(order.createdAt || order.created_at),
        }));

        dailySales.value = result.data.salesByDay.map((day: any) => ({
          date: day.date,
          orderCount: parseInt(day.orderCount) || 0,
          itemsSold: parseInt(day.itemsSold) || 0,
          dailyRevenue: parseFloat(day.dailyRevenue) || 0,
        }));

        aggregatedSales.value = result.data.aggregatedSales.map((sale: any) => ({
          id: sale.id,
          name: sale.name,
          type: sale.type,
          timesSold: parseInt(sale.times_sold) || 0,
          totalQuantity: parseInt(sale.total_quantity) || 0,
          totalRevenue: parseFloat(sale.total_revenue) || 0,
        }));

        salesBySize.value = result.data.salesBySize;
        salesByColor.value = result.data.salesByColor;
      } else {
        throw new Error(result.error || "Failed to fetch sales");
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Erreur lors du chargement des ventes";
      console.error("Error fetching sales:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function refreshSales() {
    fetchSales();
  }

  return {
    dailySales,
    aggregatedSales,
    orders,
    salesBySize,
    salesByColor,
    isLoading,
    error,
    allTypes,
    allSizes,
    allColors,
    sizeOrder,
    getSalesInRange,
    getAggregatedSales,
    getAggregatedSalesByType,
    getTopSellingProducts,
    getTotalRevenue,
    getTotalItemsSold,
    getQuantityBySize,
    getValueBySize,
    getQuantityBySizeAndColor,
    getValueBySizeAndColor,
    getColorsForProduct,
    getTotalQuantityForProduct,
    getTotalValueForProduct,
    getTotalQuantityByColor,
    getTotalValueByColor,
    fetchSales,
    refreshSales,
  };
});
